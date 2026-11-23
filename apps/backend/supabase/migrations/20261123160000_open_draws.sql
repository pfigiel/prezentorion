-- How a draw hands out gifts. In a secret draw each participant draws one other to buy for; an open
-- draw draws nobody, and once it starts every participant may buy for any other.
alter table public.draws
  add column mode text not null default 'secret' check (mode in ('secret', 'open'));

-- Starting an open draw only opens everyone's lists to each other, so there is nothing to shuffle.
create or replace function public.run_draw(draw_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  givers uuid[];
  recipients uuid[];
  is_valid boolean;
  attempts integer := 0;
  draw_mode text;
begin
  if not public.is_admin() then
    raise exception 'Only the admin runs a draw' using errcode = '42501';
  end if;

  select array_agg(participants.id order by participants.id) into givers
  from public.participants
  where participants.draw_id = run_draw.draw_id;

  if coalesce(cardinality(givers), 0) < 2 then
    raise exception 'A draw needs at least two participants' using errcode = '22023';
  end if;

  select draws.mode into draw_mode from public.draws where draws.id = run_draw.draw_id;

  if draw_mode = 'open' then
    update public.draws
    set drawn_at = now()
    where draws.id = run_draw.draw_id and draws.drawn_at is null;

    if not found then
      raise exception 'An open draw starts only once' using errcode = '22023';
    end if;

    return;
  end if;

  loop
    attempts := attempts + 1;

    if attempts > 10000 then
      raise exception 'The excluded pairs leave no draw' using errcode = '22023';
    end if;

    select array_agg(giver order by random()) into recipients from unnest(givers) as giver;

    select bool_and(
      givers[i] <> recipients[i]
      and not public.is_excluded(run_draw.draw_id, givers[i], recipients[i])
    ) into is_valid
    from generate_subscripts(givers, 1) as i;

    exit when is_valid;
  end loop;

  delete from public.assignments where assignments.draw_id = run_draw.draw_id;
  delete from public.purchases
  where purchases.draw_id = run_draw.draw_id and purchases.buyer_id is not null;

  insert into public.assignments (giver_id, recipient_id, draw_id)
  select givers[i], recipients[i], run_draw.draw_id
  from generate_subscripts(givers, 1) as i;

  update public.participants
  set revealed_at = null
  where participants.draw_id = run_draw.draw_id;

  update public.draws
  set drawn_at = now()
  where draws.id = run_draw.draw_id;
end;
$$;

drop function public.save_draw(uuid, text, date, integer, text[], jsonb);

-- Creates a draw when id is null, otherwise updates it. Changing who takes part in a secret draw
-- already drawn, or who must not draw whom, draws it again: the old assignments could break the new
-- rules. An open draw has no assignments to break, so someone added later simply joins in. A draw
-- keeps its mode once it has started, since what was bought under one mode may not fit the other.
-- The mode defaults to secret only for the API deployed before this migration, which never sends it,
-- in the moment between the migration and the new API going live.
create function public.save_draw(
  id uuid,
  name text,
  event_date date,
  budget integer,
  emails text[],
  excluded_pairs jsonb,
  mode text default 'secret'
)
returns uuid
language plpgsql
security definer
set search_path = ''
as $$
declare
  saved_id uuid := save_draw.id;
  normalized text[];
  changed boolean;
  pairs_changed boolean;
  was_drawn boolean;
  old_mode text;
begin
  if not public.is_admin() then
    raise exception 'Only the admin edits a draw' using errcode = '42501';
  end if;

  select coalesce(array_agg(distinct lower(trim(email))), '{}') into normalized
  from unnest(save_draw.emails) as email
  where trim(email) <> '';

  if saved_id is null then
    insert into public.draws (name, event_date, budget, mode)
    values (trim(save_draw.name), save_draw.event_date, save_draw.budget, save_draw.mode)
    returning draws.id into saved_id;
  else
    select draws.drawn_at is not null, draws.mode into was_drawn, old_mode
    from public.draws
    where draws.id = saved_id
    for update;

    if not found then
      raise exception 'No such draw' using errcode = 'P0002';
    end if;

    if was_drawn and old_mode <> save_draw.mode then
      raise exception 'A started draw keeps its mode' using errcode = '22023';
    end if;

    update public.draws
    set
      name = trim(save_draw.name),
      event_date = save_draw.event_date,
      budget = save_draw.budget,
      mode = save_draw.mode
    where draws.id = saved_id;
  end if;

  with removed as (
    delete from public.participants
    where participants.draw_id = saved_id and participants.email <> all (normalized)
    returning 1
  ),
  added as (
    insert into public.participants (draw_id, email, user_id)
    select saved_id, wanted.email, profiles.id
    from unnest(normalized) as wanted (email)
    left join public.profiles on profiles.email = wanted.email
    on conflict do nothing
    returning 1
  )
  select exists (select 1 from removed) or exists (select 1 from added) into changed;

  with wanted as (
    select distinct
      least(first.id, second.id) as first_id,
      greatest(first.id, second.id) as second_id
    from jsonb_array_elements(save_draw.excluded_pairs) as pair
    join public.participants as first
      on first.draw_id = saved_id and first.email = lower(trim(pair ->> 0))
    join public.participants as second
      on second.draw_id = saved_id and second.email = lower(trim(pair ->> 1))
    where first.id <> second.id
  ),
  removed as (
    delete from public.excluded_pairs
    where excluded_pairs.draw_id = saved_id
      and (excluded_pairs.first_id, excluded_pairs.second_id) not in (
        select wanted.first_id, wanted.second_id from wanted
      )
    returning 1
  ),
  added as (
    insert into public.excluded_pairs (first_id, second_id, draw_id)
    select wanted.first_id, wanted.second_id, saved_id
    from wanted
    on conflict do nothing
    returning 1
  )
  select exists (select 1 from removed) or exists (select 1 from added) into pairs_changed;

  if coalesce(was_drawn, false) and save_draw.mode = 'secret' and (changed or pairs_changed) then
    perform public.run_draw(saved_id);
  end if;

  return saved_id;
end;
$$;

revoke execute on function public.save_draw(uuid, text, date, integer, text[], jsonb, text)
  from public, anon;
grant execute on function public.save_draw(uuid, text, date, integer, text[], jsonb, text)
  to authenticated;

-- In a started open draw, the caller's participant row and the account of a fellow participant:
-- what revealed_giver_in is to a secret draw.
create function public.open_giver_in(draw_id uuid, participant_id uuid)
returns table (giver_id uuid, recipient_user_id uuid)
language sql
stable
security definer
set search_path = ''
as $$
  select givers.id, recipients.user_id
  from public.draws
  join public.participants as givers on givers.draw_id = draws.id
  join public.participants as recipients on recipients.draw_id = draws.id
  where draws.id = open_giver_in.draw_id
    and draws.mode = 'open'
    and draws.drawn_at is not null
    and givers.user_id = (select auth.uid())
    and recipients.id = open_giver_in.participant_id
    and recipients.id <> givers.id;
$$;

revoke execute on function public.open_giver_in(uuid, uuid) from public, anon, authenticated;

-- A fellow participant's list in an open draw, as recipient_wishlist shows a recipient's.
create function public.participant_wishlist(draw_id uuid, participant_id uuid)
returns table (
  id uuid,
  name text,
  url text,
  price integer,
  note text,
  priority smallint,
  photo_path text,
  purchased_by text
)
language sql
stable
security definer
set search_path = ''
as $$
  select
    wish_items.id,
    wish_items.name,
    wish_items.url,
    wish_items.price,
    wish_items.note,
    wish_items.priority,
    wish_items.photo_path,
    (
      select case when bool_or(purchases.buyer_id = giver.giver_id) then 'me' else 'other' end
      from public.purchases
      where purchases.item_id = wish_items.id
      having count(*) > 0
    )
  from public.open_giver_in(participant_wishlist.draw_id, participant_wishlist.participant_id)
    as giver
  join public.draws on draws.id = participant_wishlist.draw_id
  join public.wish_items on wish_items.owner_id = giver.recipient_user_id
  where not public.is_settled(wish_items.id, participant_wishlist.draw_id)
    and (draws.budget is null or wish_items.price is null or wish_items.price <= draws.budget)
  order by wish_items.priority desc, wish_items.created_at;
$$;

revoke execute on function public.participant_wishlist(uuid, uuid) from public, anon;
grant execute on function public.participant_wishlist(uuid, uuid) to authenticated;

create function public.set_open_purchase(
  draw_id uuid,
  participant_id uuid,
  item_id uuid,
  purchased boolean
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  giver record;
begin
  select * into giver
  from public.open_giver_in(set_open_purchase.draw_id, set_open_purchase.participant_id);

  if giver.giver_id is null or not exists (
    select 1 from public.wish_items
    where wish_items.id = set_open_purchase.item_id
      and wish_items.owner_id = giver.recipient_user_id
  ) then
    raise exception 'Not an item of a fellow participant''s' using errcode = '42501';
  end if;

  if not set_open_purchase.purchased then
    delete from public.purchases
    where purchases.item_id = set_open_purchase.item_id and purchases.buyer_id = giver.giver_id;
  elsif exists (
    select 1 from public.purchases
    where purchases.item_id = set_open_purchase.item_id
      and purchases.buyer_id is distinct from giver.giver_id
  ) then
    raise exception 'Someone else bought it already' using errcode = '23505';
  else
    insert into public.purchases (item_id, draw_id, buyer_id)
    values (set_open_purchase.item_id, set_open_purchase.draw_id, giver.giver_id)
    on conflict do nothing;
  end if;
end;
$$;

revoke execute on function public.set_open_purchase(uuid, uuid, uuid, boolean) from public, anon;
grant execute on function public.set_open_purchase(uuid, uuid, uuid, boolean) to authenticated;

-- A participant of a started open draw reads the photos of everyone else in it, as a giver reads
-- those of whoever they revealed.
create or replace function public.gives_to(owner_id text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.participants as givers
    join public.assignments on assignments.giver_id = givers.id
    join public.participants as recipients on recipients.id = assignments.recipient_id
    where givers.user_id = (select auth.uid())
      and givers.revealed_at is not null
      and recipients.user_id::text = gives_to.owner_id
  )
  or exists (
    select 1
    from public.participants as givers
    join public.draws on draws.id = givers.draw_id
    join public.participants as recipients on recipients.draw_id = givers.draw_id
    where givers.user_id = (select auth.uid())
      and draws.mode = 'open'
      and draws.drawn_at is not null
      and recipients.user_id::text = gives_to.owner_id
  );
$$;
