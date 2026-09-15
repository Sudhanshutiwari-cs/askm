-- Migration: Create public.reels table for admin-controlled gallery reel section
create table if not exists public.reels (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  image_url text not null,
  link_url text,
  order_index integer not null default 0,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Indexes for fast querying
create index if not exists reels_order_idx on public.reels (order_index asc);
create index if not exists reels_active_idx on public.reels (is_active);

-- Enable Row Level Security (RLS)
alter table public.reels enable row level security;

-- Policy: Allow service role full access
create policy "Allow service role full access to reels"
  on public.reels
  for all
  using (auth.role() = 'service_role');

-- Policy: Allow public read access to active reels
create policy "Allow public read access to active reels"
  on public.reels
  for select
  using (is_active = true);

-- Seed initial 6 default reels
insert into public.reels (title, image_url, order_index, is_active)
values
  ('Therapy & Counseling', 'https://images.unsplash.com/photo-1527689368864-3a821dbccc34?auto=format&fit=crop&w=600&q=80', 1, true),
  ('Yoga for Mental Health', 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=600&q=80', 2, true),
  ('Chakra Healing', 'https://images.unsplash.com/photo-1600618528240-fb9fc964b853?auto=format&fit=crop&w=600&q=80', 3, true),
  ('Mindfulness & Meditation', 'https://images.unsplash.com/photo-1508672019048-805c876b67e2?auto=format&fit=crop&w=600&q=80', 4, true),
  ('Breathwork & Energy Alignment', 'https://images.unsplash.com/photo-1518611012118-696072aa579a?auto=format&fit=crop&w=600&q=80', 5, true),
  ('Holistic Wellness Journey', 'https://images.unsplash.com/photo-1499209974431-9dddcece7f88?auto=format&fit=crop&w=600&q=80', 6, true);
