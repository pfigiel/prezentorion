-- Everyone the admin can add to a draw: each account, then each address still waiting for one.
create function public.admin_users()
returns table (
  id uuid,
  email text,
  name text,
  picture_url text,
  signs_in_with_password boolean,
  signs_in_with_google boolean,
  draw_count integer
)
language plpgsql
stable
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'Only the admin lists users' using errcode = '42501';
  end if;

  return query
  select
    profiles.id,
    profiles.email,
    profiles.name,
    profiles.picture_url,
    coalesce(users.raw_app_meta_data -> 'providers' ? 'email', false),
    coalesce(users.raw_app_meta_data -> 'providers' ? 'google', false),
    (select count(*)::integer from public.participants where participants.user_id = profiles.id)
  from public.profiles
  join auth.users on users.id = profiles.id
  union all
  select null, pending.email, null, null, false, false, count(*)::integer
  from public.participants as pending
  where pending.user_id is null
  group by pending.email
  order by 3 nulls last, 2;
end;
$$;

revoke execute on function public.admin_users() from public, anon;
grant execute on function public.admin_users() to authenticated;

-- There is no password reset by e-mail: the admin sets a temporary password and hands it over.
-- Auth checks passwords against this bcrypt hash, so writing it here is a password change.
create function public.set_user_password(user_id uuid, password text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'Only the admin sets passwords' using errcode = '42501';
  end if;

  if char_length(set_user_password.password) < 8 then
    raise exception 'A password needs at least 8 characters' using errcode = '22023';
  end if;

  update auth.users
  set encrypted_password = extensions.crypt(set_user_password.password, extensions.gen_salt('bf')),
    updated_at = now()
  where users.id = set_user_password.user_id
    and users.raw_app_meta_data -> 'providers' ? 'email';

  if not found then
    raise exception 'No account signs in with a password under that id' using errcode = 'P0002';
  end if;
end;
$$;

revoke execute on function public.set_user_password(uuid, text) from public, anon;
grant execute on function public.set_user_password(uuid, text) to authenticated;
