create table public.draws (
  id uuid primary key default gen_random_uuid(),
  name text not null check (char_length(trim(name)) between 1 and 80),
  event_date date not null,
  budget integer check (budget >= 0),
  drawn_at timestamptz,
  created_at timestamptz not null default now()
);

-- A participant is an e-mail address first: one with no account yet is pending, and gains its user
-- when that address first signs in.
create table public.participants (
  id uuid primary key default gen_random_uuid(),
  draw_id uuid not null references public.draws (id) on delete cascade,
  email text not null check (email = lower(email)),
  user_id uuid references public.profiles (id) on delete set null,
  revealed_at timestamptz,
  unique (draw_id, email)
);

create index participants_user_id_idx on public.participants (user_id);

create table public.assignments (
  giver_id uuid primary key references public.participants (id) on delete cascade,
  recipient_id uuid not null unique references public.participants (id) on delete cascade,
  draw_id uuid not null references public.draws (id) on delete cascade,
  check (giver_id <> recipient_id)
);

create index assignments_draw_id_idx on public.assignments (draw_id);

alter table public.draws enable row level security;
alter table public.participants enable row level security;
alter table public.assignments enable row level security;

-- Draws change only through save_draw and run_draw, which keep participants and assignments in step.
revoke all on public.draws, public.participants, public.assignments from anon, authenticated;
grant select on public.draws, public.participants, public.assignments to authenticated;

-- Security definer, so the participants policy can ask without reading itself.
create function public.takes_part_in(draw_id uuid)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.participants
    where participants.draw_id = takes_part_in.draw_id
      and participants.user_id = (select auth.uid())
  );
$$;

revoke execute on function public.takes_part_in(uuid) from public, anon;
grant execute on function public.takes_part_in(uuid) to authenticated;

create policy "Participants and the admin see draws" on public.draws
  for select to authenticated
  using ((select public.is_admin()) or public.takes_part_in(id));

create policy "Participants and the admin see who takes part" on public.participants
  for select to authenticated
  using ((select public.is_admin()) or public.takes_part_in(draw_id));

-- A giver sees their own assignment only once they have chosen to reveal it.
create policy "Givers see whom they revealed" on public.assignments
  for select to authenticated
  using (
    (select public.is_admin())
    or exists (
      select 1 from public.participants
      where participants.id = assignments.giver_id
        and participants.user_id = (select auth.uid())
        and participants.revealed_at is not null
    )
  );

create policy "People see themselves, fellow participants and, for the admin, everyone"
  on public.profiles
  for select to authenticated
  using (
    id = (select auth.uid())
    or (select public.is_admin())
    or exists (
      select 1 from public.participants
      where participants.user_id = profiles.id and public.takes_part_in(participants.draw_id)
    )
  );

create function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, email, name, picture_url)
  values (
    new.id,
    lower(new.email),
    coalesce(
      nullif(trim(new.raw_user_meta_data ->> 'full_name'), ''),
      nullif(trim(new.raw_user_meta_data ->> 'name'), ''),
      split_part(new.email, '@', 1)
    ),
    coalesce(new.raw_user_meta_data ->> 'avatar_url', new.raw_user_meta_data ->> 'picture')
  );

  update public.participants
  set user_id = new.id
  where participants.email = lower(new.email) and participants.user_id is null;

  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- Shuffles until nobody draws themselves; for any group of two or more that takes e tries on average.
-- A new draw wipes what the previous one left: who revealed, and what was bought under it.
create function public.run_draw(draw_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  givers uuid[];
  recipients uuid[];
  is_derangement boolean;
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
    select array_agg(giver order by random()) into recipients from unnest(givers) as giver;

    select bool_and(givers[i] <> recipients[i]) into is_derangement
    from generate_subscripts(givers, 1) as i;

    exit when is_derangement;
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

revoke execute on function public.run_draw(uuid) from public, anon;
grant execute on function public.run_draw(uuid) to authenticated;

-- Creates a draw when id is null, otherwise updates it. Changing who takes part in a draw already
-- drawn draws it again, since the old assignments would leave someone out or point at nobody.
create function public.save_draw(
  id uuid,
  name text,
  event_date date,
  budget integer,
  emails text[]
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

  if coalesce(was_drawn, false) and changed then
    perform public.run_draw(saved_id);
  end if;

  return saved_id;
end;
$$;

revoke execute on function public.save_draw(uuid, text, date, integer, text[]) from public, anon;
grant execute on function public.save_draw(uuid, text, date, integer, text[]) to authenticated;

-- Revealing is one-way and recorded, so the admin can see who has looked.
create function public.reveal_recipient(draw_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.participants
  set revealed_at = coalesce(participants.revealed_at, now())
  where participants.draw_id = reveal_recipient.draw_id
    and participants.user_id = (select auth.uid())
    and exists (select 1 from public.assignments where assignments.giver_id = participants.id);

  if not found then
    raise exception 'Nothing to reveal' using errcode = 'P0002';
  end if;
end;
$$;

revoke execute on function public.reveal_recipient(uuid) from public, anon;
grant execute on function public.reveal_recipient(uuid) to authenticated;
