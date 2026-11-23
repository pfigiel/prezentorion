-- An item several people may buy, such as socks or a gift card: someone else buying it neither takes
-- it off offer nor stops anyone else from buying it too.
alter table public.wish_items
  add column repeatable boolean not null default false;

-- A repeatable item takes a purchase from each of its buyers, so the one purchase an item had per draw
-- becomes one per buyer. An item that is not repeatable still takes a single purchase in all: the
-- functions below check for it while holding the item's row.
alter table public.purchases
  drop constraint purchases_item_id_draw_id_key,
  add constraint purchases_item_id_buyer_id_key unique (item_id, buyer_id),
  add constraint purchases_item_id_manager_id_key unique (item_id, manager_id);

-- The purchases of an item its givers are told about. A repeatable item is bought anew for every
-- event, so what was bought under a draw already past no longer counts against it.
create function public.current_purchases(item_id uuid)
returns setof public.purchases
language sql
stable
security definer
set search_path = ''
as $$
  select purchases.*
  from public.purchases
  join public.wish_items on wish_items.id = purchases.item_id
  left join public.draws on draws.id = purchases.draw_id
  where purchases.item_id = current_purchases.item_id
    and (
      not wish_items.repeatable
      or purchases.draw_id is null
      or draws.event_date >= public.today()
    );
$$;

revoke execute on function public.current_purchases(uuid) from public, anon, authenticated;

-- A repeatable item is never settled: it stays on offer whatever was bought before.
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
    join public.wish_items on wish_items.id = purchases.item_id
    where purchases.item_id = is_settled.item_id
      and purchases.draw_id is distinct from is_settled.except_draw_id
      and draws.event_date < public.today()
      and not wish_items.repeatable
  );
$$;

drop function public.my_wishlist();

create function public.my_wishlist()
returns table (
  id uuid,
  name text,
  url text,
  price integer,
  note text,
  priority smallint,
  photo_path text,
  repeatable boolean,
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
    wish_items.repeatable,
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

revoke execute on function public.my_wishlist() from public, anon;
grant execute on function public.my_wishlist() to authenticated;

-- Each list a giver reads now also says whether an item is repeatable and how many others have
-- bought it, so a repeatable item can show its buyers and stay on offer.
drop function public.recipient_wishlist(uuid);

create function public.recipient_wishlist(draw_id uuid)
returns table (
  id uuid,
  name text,
  url text,
  price integer,
  note text,
  priority smallint,
  photo_path text,
  repeatable boolean,
  purchased_by text,
  other_buyers integer
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
    wish_items.repeatable,
    (
      select case when bool_or(bought.buyer_id = giver.giver_id) then 'me' else 'other' end
      from public.current_purchases(wish_items.id) as bought
      having count(*) > 0
    ),
    (
      select count(*)::integer
      from public.current_purchases(wish_items.id) as bought
      where bought.buyer_id is distinct from giver.giver_id
    )
  from public.revealed_giver_in(recipient_wishlist.draw_id) as giver
  join public.draws on draws.id = recipient_wishlist.draw_id
  join public.wish_items on wish_items.owner_id = giver.recipient_user_id
  where not public.is_settled(wish_items.id, recipient_wishlist.draw_id)
    and (draws.budget is null or wish_items.price is null or wish_items.price <= draws.budget)
  order by wish_items.priority desc, wish_items.created_at;
$$;

revoke execute on function public.recipient_wishlist(uuid) from public, anon;
grant execute on function public.recipient_wishlist(uuid) to authenticated;

drop function public.participant_wishlist(uuid, uuid);

create function public.participant_wishlist(draw_id uuid, participant_id uuid)
returns table (
  id uuid,
  name text,
  url text,
  price integer,
  note text,
  priority smallint,
  photo_path text,
  repeatable boolean,
  purchased_by text,
  other_buyers integer
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
    wish_items.repeatable,
    (
      select case when bool_or(bought.buyer_id = giver.giver_id) then 'me' else 'other' end
      from public.current_purchases(wish_items.id) as bought
      having count(*) > 0
    ),
    (
      select count(*)::integer
      from public.current_purchases(wish_items.id) as bought
      where bought.buyer_id is distinct from giver.giver_id
    )
  from public.open_giver_in(participant_wishlist.draw_id, participant_wishlist.participant_id)
    as giver
  join public.draws on draws.id = participant_wishlist.draw_id
  join public.wish_items on wish_items.owner_id = giver.recipient_user_id
  where not public.is_settled(wish_items.id, participant_wishlist.draw_id)
    and (draws.budget is null or wish_items.price is null or wish_items.price <= draws.budget)
  order by wish_items.priority desc, wish_items.created_at;
$$;

revoke execute on function public.participant_wishlist(uuid, uuid) from public, anon;
grant execute on function public.participant_wishlist(uuid, uuid) to authenticated;

drop function public.managed_wishlist(uuid);

create function public.managed_wishlist(owner_id uuid)
returns table (
  id uuid,
  name text,
  url text,
  price integer,
  note text,
  priority smallint,
  photo_path text,
  repeatable boolean,
  purchased_by text,
  other_buyers integer
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
    wish_items.repeatable,
    (
      select
        case when bool_or(bought.manager_id = (select auth.uid())) then 'me' else 'other' end
      from public.current_purchases(wish_items.id) as bought
      having count(*) > 0
    ),
    (
      select count(*)::integer
      from public.current_purchases(wish_items.id) as bought
      where bought.manager_id is distinct from (select auth.uid())
    )
  from public.wish_items
  where wish_items.owner_id = managed_wishlist.owner_id
    and public.manages(managed_wishlist.owner_id::text)
    and not public.is_settled(wish_items.id, null)
  order by wish_items.priority desc, wish_items.created_at;
$$;

revoke execute on function public.managed_wishlist(uuid) from public, anon;
grant execute on function public.managed_wishlist(uuid) to authenticated;

create or replace function public.set_purchased(draw_id uuid, item_id uuid, purchased boolean)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  giver record;
  is_repeatable boolean;
begin
  select * into giver from public.revealed_giver_in(set_purchased.draw_id);

  select wish_items.repeatable into is_repeatable
  from public.wish_items
  where wish_items.id = set_purchased.item_id
    and wish_items.owner_id = giver.recipient_user_id
  for update;

  if not found then
    raise exception 'Not your recipient''s item' using errcode = '42501';
  end if;

  if not set_purchased.purchased then
    delete from public.purchases
    where purchases.item_id = set_purchased.item_id and purchases.buyer_id = giver.giver_id;
  elsif not is_repeatable and exists (
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

create or replace function public.set_open_purchase(
  draw_id uuid,
  participant_id uuid,
  item_id uuid,
  purchased boolean
)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  giver record;
  is_repeatable boolean;
begin
  select * into giver
  from public.open_giver_in(set_open_purchase.draw_id, set_open_purchase.participant_id);

  select wish_items.repeatable into is_repeatable
  from public.wish_items
  where wish_items.id = set_open_purchase.item_id
    and wish_items.owner_id = giver.recipient_user_id
  for update;

  if not found then
    raise exception 'Not an item of a fellow participant''s' using errcode = '42501';
  end if;

  if not set_open_purchase.purchased then
    delete from public.purchases
    where purchases.item_id = set_open_purchase.item_id and purchases.buyer_id = giver.giver_id;
  elsif not is_repeatable and exists (
    select 1 from public.purchases
    where purchases.item_id = set_open_purchase.item_id
      and purchases.buyer_id is distinct from giver.giver_id
  ) then
    raise exception 'Someone else bought it already' using errcode = '23505';
  else
    insert into public.purchases (item_id, draw_id, buyer_id)
    values (set_open_purchase.item_id, set_open_purchase.draw_id, giver.giver_id)
    on conflict do nothing;
  end if;
end;
$$;

create or replace function public.set_managed_purchase(item_id uuid, draw_id uuid, purchased boolean)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  list_owner_id uuid;
  is_repeatable boolean;
begin
  select wish_items.owner_id, wish_items.repeatable into list_owner_id, is_repeatable
  from public.wish_items
  where wish_items.id = set_managed_purchase.item_id
  for update;

  if list_owner_id is null or not public.manages(list_owner_id::text) then
    raise exception 'Not an item of a list you manage' using errcode = '42501';
  end if;

  if not set_managed_purchase.purchased then
    delete from public.purchases
    where purchases.item_id = set_managed_purchase.item_id
      and purchases.manager_id = (select auth.uid());

    return;
  end if;

  if not is_repeatable and exists (
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
