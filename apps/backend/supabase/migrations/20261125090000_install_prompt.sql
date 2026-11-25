-- Set once someone installs the app or declines it, so no browser they sign in to asks again. Kept on
-- the account because Safari and an in-app browser on the same phone share no storage.
alter table public.profiles
  add column install_prompt_settled boolean not null default false;

create function public.settle_install_prompt()
returns void
language sql
security definer
set search_path = ''
as $$
  update public.profiles
  set install_prompt_settled = true
  where profiles.id = (select auth.uid());
$$;

revoke execute on function public.settle_install_prompt() from public, anon;
grant execute on function public.settle_install_prompt() to authenticated;
