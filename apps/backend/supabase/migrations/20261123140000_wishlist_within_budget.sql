-- A giver no longer sees what the recipient wants beyond the draw's budget; an item with no price,
-- or a draw with no budget, filters nothing.
create or replace function public.recipient_wishlist(draw_id uuid)
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
  from public.revealed_giver_in(recipient_wishlist.draw_id) as giver
  join public.draws on draws.id = recipient_wishlist.draw_id
  join public.wish_items on wish_items.owner_id = giver.recipient_user_id
  where not public.is_settled(wish_items.id, recipient_wishlist.draw_id)
    and (draws.budget is null or wish_items.price is null or wish_items.price <= draws.budget)
  order by wish_items.priority desc, wish_items.created_at;
$$;
