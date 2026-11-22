-- The event day itself now counts as the end, so the admin can finish a draw early by moving its
-- day to today. A gift is settled from the day its owner is shown it, as my_wishlist already does.
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
      and purchases.draw_id <> is_settled.except_draw_id
      and draws.event_date <= public.today()
  );
$$;

create function public.finish_draw(draw_id uuid)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  was_drawn boolean;
begin
  if not public.is_admin() then
    raise exception 'Only the admin finishes a draw' using errcode = '42501';
  end if;

  update public.draws
  set event_date = least(draws.event_date, public.today())
  where draws.id = finish_draw.draw_id
  returning draws.drawn_at is not null into was_drawn;

  if not found then
    raise exception 'No such draw' using errcode = 'P0002';
  end if;

  if not was_drawn then
    raise exception 'Only a drawn draw can finish' using errcode = '22023';
  end if;
end;
$$;

revoke execute on function public.finish_draw(uuid) from public, anon;
grant execute on function public.finish_draw(uuid) to authenticated;
