-- Participants, assignments and purchases go with the draw; wish lists belong to people, not draws.
create function public.delete_draw(draw_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  if not public.is_admin() then
    raise exception 'Only the admin deletes a draw' using errcode = '42501';
  end if;

  delete from public.draws where draws.id = delete_draw.draw_id;

  if not found then
    raise exception 'No such draw' using errcode = 'P0002';
  end if;
end;
$$;

revoke execute on function public.delete_draw(uuid) from public, anon;
grant execute on function public.delete_draw(uuid) to authenticated;
