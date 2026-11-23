-- Two participants the admin has paired up so that neither draws the other, such as a couple.
create table public.excluded_pairs (
  first_id uuid not null references public.participants (id) on delete cascade,
  second_id uuid not null references public.participants (id) on delete cascade,
  draw_id uuid not null references public.draws (id) on delete cascade,
  primary key (first_id, second_id),
  check (first_id < second_id)
);

create index excluded_pairs_draw_id_idx on public.excluded_pairs (draw_id);

alter table public.excluded_pairs enable row level security;

revoke all on public.excluded_pairs from anon, authenticated;
grant select on public.excluded_pairs to authenticated;

create policy "The admin sees excluded pairs" on public.excluded_pairs
  for select to authenticated
  using ((select public.is_admin()));

create function public.is_excluded(draw_id uuid, giver_id uuid, recipient_id uuid)
returns boolean
language sql
stable
set search_path = ''
as $$
  select exists (
    select 1 from public.excluded_pairs
    where excluded_pairs.draw_id = is_excluded.draw_id
      and excluded_pairs.first_id = least(is_excluded.giver_id, is_excluded.recipient_id)
      and excluded_pairs.second_id = greatest(is_excluded.giver_id, is_excluded.recipient_id)
  );
$$;

revoke execute on function public.is_excluded(uuid, uuid, uuid) from public, anon, authenticated;

-- Shuffles until nobody draws themselves or the one they are paired with. Pairs can leave no draw at
-- all, which no number of shuffles finds, so it gives up after enough of them to find any draw a
-- family-sized group allows.
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
  delete from public.purchases where purchases.draw_id = run_draw.draw_id;

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

drop function public.save_draw(uuid, text, date, integer, text[]);

-- Creates a draw when id is null, otherwise updates it. Changing who takes part in a draw already
-- drawn, or who must not draw whom, draws it again: the old assignments could break the new rules.
-- Each excluded pair is two of the addresses in emails.
create function public.save_draw(
  id uuid,
  name text,
  event_date date,
  budget integer,
  emails text[],
  excluded_pairs jsonb
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
begin
  if not public.is_admin() then
    raise exception 'Only the admin edits a draw' using errcode = '42501';
  end if;

  select coalesce(array_agg(distinct lower(trim(email))), '{}') into normalized
  from unnest(save_draw.emails) as email
  where trim(email) <> '';

  if saved_id is null then
    insert into public.draws (name, event_date, budget)
    values (trim(save_draw.name), save_draw.event_date, save_draw.budget)
    returning draws.id into saved_id;
  else
    update public.draws
    set name = trim(save_draw.name), event_date = save_draw.event_date, budget = save_draw.budget
    where draws.id = saved_id
    returning draws.drawn_at is not null into was_drawn;

    if not found then
      raise exception 'No such draw' using errcode = 'P0002';
    end if;
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

  if coalesce(was_drawn, false) and (changed or pairs_changed) then
    perform public.run_draw(saved_id);
  end if;

  return saved_id;
end;
$$;

revoke execute on function public.save_draw(uuid, text, date, integer, text[], jsonb)
  from public, anon;
grant execute on function public.save_draw(uuid, text, date, integer, text[], jsonb)
  to authenticated;
