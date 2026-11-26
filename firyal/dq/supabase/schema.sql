-- =====================================================================
-- DQ (Digital Queue) — skema database Supabase
-- Cara pakai: buka Supabase → SQL Editor → New query → tempel seluruh
-- isi file ini → Run. Aman dijalankan ulang (idempotent).
-- =====================================================================

-- ---------- Tabel toko ----------
create table if not exists public.shops (
  id                   uuid primary key default gen_random_uuid(),
  owner_id             uuid not null references auth.users (id) on delete cascade,
  slug                 text not null unique
                         check (slug ~ '^[a-z0-9]+(-[a-z0-9]+)*$' and char_length(slug) between 3 and 40),
  name                 text not null check (char_length(name) between 2 and 80),
  avg_service_minutes  int  not null default 20 check (avg_service_minutes between 1 and 240),
  staff_count          int  not null default 1  check (staff_count between 1 and 20),
  is_open              boolean not null default true,
  created_at           timestamptz not null default now()
);

create index if not exists shops_owner_idx on public.shops (owner_id);

-- ---------- Tabel antrean ----------
create table if not exists public.queue_entries (
  id             uuid primary key default gen_random_uuid(),
  shop_id        uuid not null references public.shops (id) on delete cascade,
  queue_date     date not null default (now() at time zone 'Asia/Jakarta')::date,
  number         int  not null,
  customer_name  text not null check (char_length(customer_name) between 1 and 40),
  status         text not null default 'waiting'
                   check (status in ('waiting', 'serving', 'done', 'skipped', 'cancelled')),
  created_at     timestamptz not null default now(),
  called_at      timestamptz,
  finished_at    timestamptz,
  unique (shop_id, queue_date, number)
);

create index if not exists queue_shop_date_idx on public.queue_entries (shop_id, queue_date, status);

-- ---------- Row Level Security ----------
alter table public.shops         enable row level security;
alter table public.queue_entries enable row level security;

-- Pemilik hanya bisa melihat & mengubah tokonya sendiri.
drop policy if exists "owner select shop" on public.shops;
create policy "owner select shop" on public.shops
  for select to authenticated using (owner_id = auth.uid());

drop policy if exists "owner insert shop" on public.shops;
create policy "owner insert shop" on public.shops
  for insert to authenticated with check (owner_id = auth.uid());

drop policy if exists "owner update shop" on public.shops;
create policy "owner update shop" on public.shops
  for update to authenticated using (owner_id = auth.uid()) with check (owner_id = auth.uid());

-- Pemilik hanya bisa melihat & mengubah antrean di tokonya sendiri.
drop policy if exists "owner select queue" on public.queue_entries;
create policy "owner select queue" on public.queue_entries
  for select to authenticated
  using (exists (select 1 from public.shops s where s.id = shop_id and s.owner_id = auth.uid()));

drop policy if exists "owner update queue" on public.queue_entries;
create policy "owner update queue" on public.queue_entries
  for update to authenticated
  using (exists (select 1 from public.shops s where s.id = shop_id and s.owner_id = auth.uid()))
  with check (exists (select 1 from public.shops s where s.id = shop_id and s.owner_id = auth.uid()));

-- Pelanggan (tanpa login) TIDAK punya akses langsung ke tabel.
-- Mereka hanya lewat fungsi-fungsi di bawah, sehingga nama pelanggan lain tidak bocor.

-- ---------- Fungsi publik: info toko ----------
create or replace function public.get_shop_public(p_slug text)
returns table (
  shop_id uuid, name text, is_open boolean, avg_service_minutes int, staff_count int,
  now_serving int[], waiting_count int, estimated_wait_minutes int
)
language sql stable security definer set search_path = public as $$
  with s as (select * from shops where slug = p_slug),
       q as (
         select e.* from queue_entries e join s on e.shop_id = s.id
         where e.queue_date = (now() at time zone 'Asia/Jakarta')::date
       )
  select s.id, s.name, s.is_open, s.avg_service_minutes, s.staff_count,
         coalesce((select array_agg(number order by number) from q where status = 'serving'), '{}'),
         (select count(*)::int from q where status = 'waiting'),
         -- Perkiraan waktu sampai dipanggil bagi pelanggan yang ambil nomor sekarang:
         -- (orang menunggu + orang sedang dilayani) dibagi jumlah kapster, dibulatkan ke bawah.
         -- Toko kosong → 0 (langsung dilayani).
         (floor(((select count(*) from q where status = 'waiting')
                 + (select count(*) from q where status = 'serving'))::numeric / s.staff_count)
           * s.avg_service_minutes)::int
  from s;
$$;

-- ---------- Fungsi publik: ambil nomor antrean ----------
create or replace function public.take_ticket(p_slug text, p_name text)
returns uuid
language plpgsql volatile security definer set search_path = public as $$
declare
  v_shop   shops%rowtype;
  v_today  date := (now() at time zone 'Asia/Jakarta')::date;
  v_number int;
  v_id     uuid;
  v_name   text := btrim(coalesce(p_name, ''));
begin
  if char_length(v_name) < 1 or char_length(v_name) > 40 then
    raise exception 'Nama harus 1–40 karakter';
  end if;

  -- Kunci baris toko supaya dua pelanggan tidak mendapat nomor yang sama.
  select * into v_shop from shops where slug = p_slug for update;
  if not found then raise exception 'Toko tidak ditemukan'; end if;
  if not v_shop.is_open then raise exception 'Antrean sedang ditutup'; end if;

  select coalesce(max(number), 0) + 1 into v_number
  from queue_entries where shop_id = v_shop.id and queue_date = v_today;

  insert into queue_entries (shop_id, queue_date, number, customer_name)
  values (v_shop.id, v_today, v_number, v_name)
  returning id into v_id;

  return v_id;
end;
$$;

-- ---------- Fungsi publik: status tiket ----------
create or replace function public.get_ticket_status(p_ticket_id uuid)
returns table (
  number int, customer_name text, status text, shop_name text, shop_slug text,
  people_ahead int, estimated_wait_minutes int, now_serving int[]
)
language sql stable security definer set search_path = public as $$
  with t as (select * from queue_entries where id = p_ticket_id),
       s as (select sh.* from shops sh join t on sh.id = t.shop_id)
  select t.number, t.customer_name, t.status, s.name, s.slug,
         (select count(*)::int from queue_entries e
            where e.shop_id = t.shop_id and e.queue_date = t.queue_date
              and e.status = 'waiting' and e.number < t.number),
         case when t.status = 'waiting' then
           (floor(((select count(*) from queue_entries e
                      where e.shop_id = t.shop_id and e.queue_date = t.queue_date
                        and e.status = 'waiting' and e.number < t.number)
                   + (select count(*) from queue_entries e
                      where e.shop_id = t.shop_id and e.queue_date = t.queue_date
                        and e.status = 'serving'))::numeric
                  / s.staff_count) * s.avg_service_minutes)::int
         else 0 end,
         coalesce((select array_agg(e.number order by e.number) from queue_entries e
                    where e.shop_id = t.shop_id and e.queue_date = t.queue_date
                      and e.status = 'serving'), '{}')
  from t, s;
$$;

-- ---------- Fungsi publik: batalkan tiket sendiri ----------
create or replace function public.cancel_ticket(p_ticket_id uuid)
returns void
language sql volatile security definer set search_path = public as $$
  update queue_entries set status = 'cancelled', finished_at = now()
  where id = p_ticket_id and status = 'waiting';
$$;

-- ---------- Fungsi pemilik: panggil antrean berikutnya ----------
create or replace function public.call_next(p_shop_id uuid)
returns int
language plpgsql volatile security definer set search_path = public as $$
declare
  v_today date := (now() at time zone 'Asia/Jakarta')::date;
  v_id uuid;
  v_number int;
begin
  if not exists (select 1 from shops where id = p_shop_id and owner_id = auth.uid()) then
    raise exception 'Bukan toko Anda';
  end if;

  select id, number into v_id, v_number from queue_entries
  where shop_id = p_shop_id and queue_date = v_today and status = 'waiting'
  order by number limit 1
  for update skip locked;

  if v_id is null then return null; end if;

  update queue_entries set status = 'serving', called_at = now() where id = v_id;
  return v_number;
end;
$$;

-- ---------- Hak akses fungsi ----------
revoke all on function public.get_shop_public(text)      from public;
revoke all on function public.take_ticket(text, text)    from public;
revoke all on function public.get_ticket_status(uuid)    from public;
revoke all on function public.cancel_ticket(uuid)        from public;
revoke all on function public.call_next(uuid)            from public;

grant execute on function public.get_shop_public(text)   to anon, authenticated;
grant execute on function public.take_ticket(text, text) to anon, authenticated;
grant execute on function public.get_ticket_status(uuid) to anon, authenticated;
grant execute on function public.cancel_ticket(uuid)     to anon, authenticated;
grant execute on function public.call_next(uuid)         to authenticated;

-- ---------- Realtime untuk dashboard pemilik ----------
do $$
begin
  alter publication supabase_realtime add table public.queue_entries;
exception when duplicate_object then null;
end $$;
