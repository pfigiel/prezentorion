-- A draw ends the day after its event, not on it: the party may be in the evening, and nobody
-- should see what they are getting that morning. Finishing early therefore moves the day to
-- yesterday.
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
      join public.draws on draws.id = purchases.draw_id
      where purchases.item_id = wish_items.id and draws.event_date < public.today()
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
  using public.wish_items, public.draws
  where purchases.item_id = mark_available.item_id
    and wish_items.id = purchases.item_id
    and wish_items.owner_id = (select auth.uid())
    and draws.id = purchases.draw_id
    and draws.event_date < public.today();
$$;

create or replace function public.finish_draw(draw_id uuid)
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
  set event_date = least(draws.event_date, public.today() - 1)
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
