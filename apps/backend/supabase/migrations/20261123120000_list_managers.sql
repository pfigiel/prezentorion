-- Someone an owner trusts with their list, such as a spouse: they see it as a giver would and mark
-- what is bought. Like a participant, a manager is an address first, and the account signed in
-- under that address is the manager.
create table public.list_managers (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  email text not null check (email = lower(email)),
  created_at timestamptz not null default now(),
  unique (owner_id, email)
);

create index list_managers_email_idx on public.list_managers (email);

alter table public.list_managers enable row level security;

revoke all on public.list_managers from anon, authenticated;
grant select, insert, delete on public.list_managers to authenticated;

create policy "Owners choose who manages their list" on public.list_managers
  for all to authenticated
  using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));

-- Takes the owner as text, since the photos policy passes a folder name that may not be a uuid.
create function public.manages(owner_id text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.list_managers
    join public.profiles on profiles.email = list_managers.email
    where profiles.id = (select auth.uid())
      and list_managers.owner_id::text = manages.owner_id
  );
$$;

revoke execute on function public.manages(text) from public, anon;
grant execute on function public.manages(text) to authenticated;

drop policy "Owners and their givers read photos" on storage.objects;

create policy "Owners, their givers and their managers read photos" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'wish-photos'
    and (
      (storage.foldername(name))[1] = (select auth.uid())::text
      or public.gives_to((storage.foldername(name))[1])
      or public.manages((storage.foldername(name))[1])
    )
  );

-- A manager buys outside any assignment. They file the purchase under one of the owner's draws,
-- which decides when the owner sees it as a giver's purchase would; with no draw to file it under,
-- the owner sees it straight away.
alter table public.purchases drop constraint purchases_pkey;

alter table public.purchases
  alter column draw_id drop not null,
  alter column buyer_id drop not null,
  add column manager_id uuid references public.profiles (id) on delete cascade,
  add constraint purchases_one_buyer check (num_nonnulls(buyer_id, manager_id) = 1),
  add constraint purchases_giver_draw check (buyer_id is null or draw_id is not null),
  add constraint purchases_item_id_draw_id_key unique nulls not distinct (item_id, draw_id);

create or replace function public.is_settled(item_id uuid, except_draw_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.purchases
    join public.draws on draws.id = purchases.draw_id
    where purchases.item_id = is_settled.item_id
      and purchases.draw_id is distinct from is_settled.except_draw_id
      and draws.event_date < public.today()
  );
$$;

create or replace function public.my_wishlist()
returns table (
  id uuid,
  name text,
  url text,
  price integer,
  note text,
  priority smallint,
  photo_path text,
  is_purchased boolean
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
    exists (
      select 1
      from public.purchases
      left join public.draws on draws.id = purchases.draw_id
      where purchases.item_id = wish_items.id
        and (purchases.draw_id is null or draws.event_date < public.today())
    )
  from public.wish_items
  where wish_items.owner_id = (select auth.uid())
  order by wish_items.created_at;
$$;

create or replace function public.mark_available(item_id uuid)
returns void
language sql
security definer
set search_path = ''
as $$
  delete from public.purchases
  using public.wish_items
  where purchases.item_id = mark_available.item_id
    and wish_items.id = purchases.item_id
    and wish_items.owner_id = (select auth.uid())
    and (
      purchases.draw_id is null
      or exists (
        select 1 from public.draws
        where draws.id = purchases.draw_id and draws.event_date < public.today()
      )
    );
$$;

create or replace function public.set_purchased(draw_id uuid, item_id uuid, purchased boolean)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  giver record;
begin
  select * into giver from public.revealed_giver_in(set_purchased.draw_id);

  if giver is null or not exists (
    select 1 from public.wish_items
    where wish_items.id = set_purchased.item_id and wish_items.owner_id = giver.recipient_user_id
  ) then
    raise exception 'Not your recipient''s item' using errcode = '42501';
  end if;

  if not set_purchased.purchased then
    delete from public.purchases
    where purchases.item_id = set_purchased.item_id and purchases.buyer_id = giver.giver_id;
  elsif exists (
    select 1 from public.purchases
    where purchases.item_id = set_purchased.item_id
      and purchases.buyer_id is distinct from giver.giver_id
  ) then
    raise exception 'Someone else bought it already' using errcode = '23505';
  else
    insert into public.purchases (item_id, draw_id, buyer_id)
    values (set_purchased.item_id, set_purchased.draw_id, giver.giver_id)
    on conflict do nothing;
  end if;
end;
$$;

-- A new draw now forgets only what givers bought: a manager's purchase never depended on who
-- drew whom.
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

create function public.managed_lists()
returns table (id uuid, name text, picture_url text)
language sql
stable
security definer
set search_path = ''
as $$
  select owners.id, owners.name, owners.picture_url
  from public.list_managers
  join public.profiles as managers on managers.email = list_managers.email
  join public.profiles as owners on owners.id = list_managers.owner_id
  where managers.id = (select auth.uid())
  order by owners.name;
$$;

revoke execute on function public.managed_lists() from public, anon;
grant execute on function public.managed_lists() to authenticated;

-- The owner's draws a manager can file a purchase under: those whose event has not passed yet.
create function public.managed_draws(owner_id uuid)
returns table (id uuid, name text, event_date date)
language sql
stable
security definer
set search_path = ''
as $$
  select draws.id, draws.name, draws.event_date
  from public.draws
  join public.participants on participants.draw_id = draws.id
  where participants.user_id = managed_draws.owner_id
    and public.manages(managed_draws.owner_id::text)
    and draws.event_date >= public.today()
  order by draws.event_date, draws.name;
$$;

revoke execute on function public.managed_draws(uuid) from public, anon;
grant execute on function public.managed_draws(uuid) to authenticated;

-- The list as a giver sees it, with 'me' meaning this manager's own purchase.
create function public.managed_wishlist(owner_id uuid)
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
      select
        case when bool_or(purchases.manager_id = (select auth.uid())) then 'me' else 'other' end
      from public.purchases
      where purchases.item_id = wish_items.id
      having count(*) > 0
    )
  from public.wish_items
  where wish_items.owner_id = managed_wishlist.owner_id
    and public.manages(managed_wishlist.owner_id::text)
    and not public.is_settled(wish_items.id, null)
  order by wish_items.priority desc, wish_items.created_at;
$$;

revoke execute on function public.managed_wishlist(uuid) from public, anon;
grant execute on function public.managed_wishlist(uuid) to authenticated;

-- Marking again files the purchase under the draw now given.
create function public.set_managed_purchase(item_id uuid, draw_id uuid, purchased boolean)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  list_owner_id uuid;
begin
  select wish_items.owner_id into list_owner_id
  from public.wish_items
  where wish_items.id = set_managed_purchase.item_id;

  if list_owner_id is null or not public.manages(list_owner_id::text) then
    raise exception 'Not an item of a list you manage' using errcode = '42501';
  end if;

  if not set_managed_purchase.purchased then
    delete from public.purchases
    where purchases.item_id = set_managed_purchase.item_id
      and purchases.manager_id = (select auth.uid());

    return;
  end if;

  if exists (
    select 1 from public.purchases
    where purchases.item_id = set_managed_purchase.item_id
      and purchases.manager_id is distinct from (select auth.uid())
  ) then
    raise exception 'Someone else bought it already' using errcode = '23505';
  end if;

  if set_managed_purchase.draw_id is null then
    if exists (select 1 from public.managed_draws(list_owner_id)) then
      raise exception 'A purchase is filed under one of the owner''s draws' using errcode = '22023';
    end if;
  elsif not exists (
    select 1 from public.managed_draws(list_owner_id) as draws
    where draws.id = set_managed_purchase.draw_id
  ) then
    raise exception 'Not a current draw of the owner''s' using errcode = '22023';
  end if;

  delete from public.purchases
  where purchases.item_id = set_managed_purchase.item_id
    and purchases.manager_id = (select auth.uid());

  insert into public.purchases (item_id, draw_id, manager_id)
  values (set_managed_purchase.item_id, set_managed_purchase.draw_id, (select auth.uid()));
end;
$$;

revoke execute on function public.set_managed_purchase(uuid, uuid, boolean) from public, anon;
grant execute on function public.set_managed_purchase(uuid, uuid, boolean) to authenticated;
