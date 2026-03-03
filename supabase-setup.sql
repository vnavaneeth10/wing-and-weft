-- ═══════════════════════════════════════════════════════════════════════════
-- WING & WEFT — Supabase Database Setup Script
-- Run this entire file in: Supabase Dashboard → SQL Editor → New Query → Run
-- ═══════════════════════════════════════════════════════════════════════════

-- ─── 1. PRODUCTS TABLE ────────────────────────────────────────────────────────
create table if not exists products (
  id            text primary key default 'WW-' || floor(random() * 900000 + 100000)::text,
  name          text not null,
  category      text not null,
  fabric        text not null,
  price         numeric(10,2) not null check (price > 0),
  discount_price numeric(10,2) check (discount_price is null or discount_price < price),
  stock         integer not null default 10 check (stock >= 0),
  colors        text[] not null default array['#bc3d3e'],
  images        text[] not null default array[]::text[],
  description   text default '',
  saree_fabric  text default '',
  saree_length  text default '6.0 meters',
  blouse_length text default '0.8 meters',
  blouse_fabric text default '',
  is_best_seller boolean not null default false,
  is_new_arrival boolean not null default true,
  is_featured   boolean not null default false,
  rating        numeric(3,1) not null default 4.5 check (rating >= 0 and rating <= 5),
  review_count  integer not null default 0,
  created_at    timestamptz not null default now()
);

-- ─── 2. BANNERS TABLE ─────────────────────────────────────────────────────────
create table if not exists banners (
  id         uuid primary key default gen_random_uuid(),
  title      text not null default 'New Collection',
  subtitle   text not null default 'Discover our latest sarees',
  cta_text   text not null default 'Explore Now',
  cta_link   text not null default '/category/silk-sarees',
  image_url  text not null default '',
  sort_order integer not null default 1,
  is_active  boolean not null default true,
  created_at timestamptz not null default now()
);

-- Seed 3 default banner rows
insert into banners (title, subtitle, cta_text, cta_link, sort_order, image_url) values
  ('Threads of Tradition', 'Discover our exquisite collection of handwoven silk sarees', 'Explore Silk', '/category/silk-sarees', 1, ''),
  ('Draped in Elegance', 'Premium cotton sarees for every occasion', 'Shop Cotton', '/category/cotton-sarees', 2, ''),
  ('Woven with Love', 'Timeless sarees crafted with uncompromising quality', 'View Collection', '/category/silk-sarees', 3, '')
on conflict do nothing;

-- ─── 3. INQUIRIES TABLE ───────────────────────────────────────────────────────
create table if not exists inquiries (
  id             uuid primary key default gen_random_uuid(),
  customer_name  text not null,
  customer_phone text not null,
  customer_email text default '',
  product_id     text references products(id) on delete set null,
  product_name   text,
  message        text not null,
  status         text not null default 'new' check (status in ('new', 'seen', 'replied')),
  created_at     timestamptz not null default now()
);

-- ─── 4. SETTINGS TABLE ────────────────────────────────────────────────────────
create table if not exists settings (
  id    uuid primary key default gen_random_uuid(),
  key   text unique not null,
  value text not null default ''
);

-- Seed default settings
insert into settings (key, value) values
  ('whatsapp_number', '919999999999'),
  ('instagram_url', 'https://www.instagram.com/wingandweft/'),
  ('facebook_url', 'https://www.facebook.com/wingandweft'),
  ('contact_phone', '+91 99999 99999'),
  ('contact_email', 'support@wingandweft.com'),
  ('ribbon_text', 'Timeless sarees crafted with uncompromising quality, elegance, and attention to every detail  ✦  Pure fabrics, authentic weaves, heritage craftsmanship  ✦  Free shipping on orders above ₹2000')
on conflict (key) do nothing;

-- ─── 5. ROW LEVEL SECURITY (RLS) ─────────────────────────────────────────────
-- Enable RLS on all tables
alter table products enable row level security;
alter table banners enable row level security;
alter table inquiries enable row level security;
alter table settings enable row level security;

-- PUBLIC can READ products, banners, settings (your website reads these)
create policy "Public read products" on products for select using (true);
create policy "Public read banners" on banners for select using (true);
create policy "Public read settings" on settings for select using (true);

-- PUBLIC can INSERT inquiries (contact form submissions)
create policy "Public insert inquiries" on inquiries for insert with check (true);

-- AUTHENTICATED (admin) can do everything
create policy "Admin full access products" on products for all using (auth.role() = 'authenticated');
create policy "Admin full access banners" on banners for all using (auth.role() = 'authenticated');
create policy "Admin full access inquiries" on inquiries for all using (auth.role() = 'authenticated');
create policy "Admin full access settings" on settings for all using (auth.role() = 'authenticated');

-- ─── 6. STORAGE BUCKETS ──────────────────────────────────────────────────────
-- Run these separately in the Storage tab OR via Supabase dashboard Storage UI
-- Bucket 1: product-images (public)
-- Bucket 2: banner-images (public)

-- ─── 7. INDEXES ───────────────────────────────────────────────────────────────
create index if not exists idx_products_category on products (category);
create index if not exists idx_products_created on products (created_at desc);
create index if not exists idx_inquiries_status on inquiries (status);
create index if not exists idx_inquiries_created on inquiries (created_at desc);

-- ─── DONE ─────────────────────────────────────────────────────────────────────
-- Your tables are ready!
-- Next: Create admin user in Authentication → Users → Invite user
