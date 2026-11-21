-- Who may run draws. No policy, so only security definer functions read it.
create table public.admins (
  email text primary key check (email = lower(email))
);

alter table public.admins enable row level security;
revoke all on public.admins from anon, authenticated;

insert into public.admins (email) values ('pawel.figiel8@gmail.com');

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text not null unique check (email = lower(email)),
  name text not null,
  picture_url text,
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
revoke all on public.profiles from anon, authenticated;
grant select on public.profiles to authenticated;

-- E-mail addresses are never confirmed, so anyone could sign up with the admin's address before
-- the admin does. Only a Google sign-in proves the address, so only that one counts.
create function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from auth.users
    join public.admins on admins.email = lower(users.email)
    where users.id = (select auth.uid())
      and users.raw_app_meta_data -> 'providers' ? 'google'
  );
$$;

revoke execute on function public.is_admin() from public, anon;
grant execute on function public.is_admin() to authenticated;

-- The date the app runs on, wherever the server is: an event day starts at midnight in Poland.
create function public.today()
returns date
language sql
stable
set search_path = ''
as $$
  select (now() at time zone 'Europe/Warsaw')::date;
$$;

-- What the keep-alive cron calls, so the free project sees database activity and is not paused.
create function public.ping()
returns boolean
language sql
stable
set search_path = ''
as $$
  select true;
$$;

grant execute on function public.ping() to anon;
