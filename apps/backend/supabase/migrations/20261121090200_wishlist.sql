create table public.wish_items (
  id uuid primary key default gen_random_uuid(),
  owner_id uuid not null default auth.uid() references public.profiles (id) on delete cascade,
  name text not null check (char_length(trim(name)) between 1 and 120),
  url text check (char_length(url) <= 2000),
  price integer check (price >= 0),
  note text check (char_length(note) <= 1000),
  priority smallint not null default 2 check (priority between 1 and 3),
  photo_path text,
  created_at timestamptz not null default now()
);

create index wish_items_owner_id_idx on public.wish_items (owner_id);

-- One purchase per item per draw: within a draw a recipient has a single giver.
create table public.purchases (
  item_id uuid not null references public.wish_items (id) on delete cascade,
  draw_id uuid not null references public.draws (id) on delete cascade,
  buyer_id uuid not null references public.participants (id) on delete cascade,
  purchased_at timestamptz not null default now(),
  primary key (item_id, draw_id)
);

alter table public.wish_items enable row level security;
alter table public.purchases enable row level security;

-- An owner manages their items directly, but never reads purchases: what is bought stays hidden
-- from them until the event, so every read that involves purchases goes through a function below.
revoke all on public.wish_items, public.purchases from anon, authenticated;
grant select, insert, update, delete on public.wish_items to authenticated;

create policy "Owners manage their items" on public.wish_items
  for all to authenticated
  using (owner_id = (select auth.uid()))
  with check (owner_id = (select auth.uid()));

-- A giver's participant row in a draw, once they have revealed whom they buy for.
create function public.revealed_giver_in(draw_id uuid)
returns table (giver_id uuid, recipient_user_id uuid)
language sql
stable
security definer
set search_path = ''
as $$
  select givers.id, recipients.user_id
  from public.participants as givers
  join public.assignments on assignments.giver_id = givers.id
  join public.participants as recipients on recipients.id = assignments.recipient_id
  where givers.draw_id = revealed_giver_in.draw_id
    and givers.user_id = (select auth.uid())
    and givers.revealed_at is not null;
$$;

revoke execute on function public.revealed_giver_in(uuid) from public, anon, authenticated;

-- Bought under a draw whose event has passed, so it is no longer on offer to anyone else.
create function public.is_settled(item_id uuid, except_draw_id uuid)
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

revoke execute on function public.is_settled(uuid, uuid) from public, anon, authenticated;

create function public.my_wishlist()
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
      where purchases.item_id = wish_items.id and draws.event_date <= public.today()
    )
  from public.wish_items
  where wish_items.owner_id = (select auth.uid())
  order by wish_items.created_at;
$$;

revoke execute on function public.my_wishlist() from public, anon;
grant execute on function public.my_wishlist() to authenticated;

-- Back on offer: forgets the purchases the owner has already been shown.
create function public.mark_available(item_id uuid)
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
    and draws.event_date <= public.today();
$$;

revoke execute on function public.mark_available(uuid) from public, anon;
grant execute on function public.mark_available(uuid) to authenticated;

-- What a giver sees of their recipient's list: everything not already settled in another draw, and
-- for each item whether they bought it, someone else did, or nobody yet.
create function public.recipient_wishlist(draw_id uuid)
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
  join public.wish_items on wish_items.owner_id = giver.recipient_user_id
  where not public.is_settled(wish_items.id, recipient_wishlist.draw_id)
  order by wish_items.priority desc, wish_items.created_at;
$$;

revoke execute on function public.recipient_wishlist(uuid) from public, anon;
grant execute on function public.recipient_wishlist(uuid) to authenticated;

create function public.set_purchased(draw_id uuid, item_id uuid, purchased boolean)
returns void
language plpgsql
security definer
set search_path = ''
as $$
declare
  giver record;
begin
  select * into giver from public.revealed_giver_in(set_purchased.draw_id);

  if giver is null or not exists (
    select 1 from public.wish_items
    where wish_items.id = set_purchased.item_id and wish_items.owner_id = giver.recipient_user_id
  ) then
    raise exception 'Not your recipient''s item' using errcode = '42501';
  end if;

  if not set_purchased.purchased then
    delete from public.purchases
    where purchases.item_id = set_purchased.item_id and purchases.buyer_id = giver.giver_id;
  elsif exists (
    select 1 from public.purchases
    where purchases.item_id = set_purchased.item_id and purchases.buyer_id <> giver.giver_id
  ) then
    raise exception 'Someone else bought it already' using errcode = '23505';
  else
    insert into public.purchases (item_id, draw_id, buyer_id)
    values (set_purchased.item_id, set_purchased.draw_id, giver.giver_id)
    on conflict do nothing;
  end if;
end;
$$;

revoke execute on function public.set_purchased(uuid, uuid, boolean) from public, anon;
grant execute on function public.set_purchased(uuid, uuid, boolean) to authenticated;

-- Photos are private: an owner reaches their own folder, and a giver the folder of whoever they
-- revealed, in any draw.
insert into storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
values ('wish-photos', 'wish-photos', false, 5242880, array['image/jpeg', 'image/png', 'image/webp']);

-- Takes the folder name as text, since a path that is not a uuid must fail the check, not the query.
create function public.gives_to(owner_id text)
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1
    from public.participants as givers
    join public.assignments on assignments.giver_id = givers.id
    join public.participants as recipients on recipients.id = assignments.recipient_id
    where givers.user_id = (select auth.uid())
      and givers.revealed_at is not null
      and recipients.user_id::text = gives_to.owner_id
  );
$$;

revoke execute on function public.gives_to(text) from public, anon;
grant execute on function public.gives_to(text) to authenticated;

create policy "Owners and their givers read photos" on storage.objects
  for select to authenticated
  using (
    bucket_id = 'wish-photos'
    and (
      (storage.foldername(name))[1] = (select auth.uid())::text
      or public.gives_to((storage.foldername(name))[1])
    )
  );

create policy "Owners upload their photos" on storage.objects
  for insert to authenticated
  with check (
    bucket_id = 'wish-photos' and (storage.foldername(name))[1] = (select auth.uid())::text
  );

create policy "Owners delete their photos" on storage.objects
  for delete to authenticated
  using (bucket_id = 'wish-photos' and (storage.foldername(name))[1] = (select auth.uid())::text);
