-- Migration: Create public.hero_images table for admin-controlled hero section images
create table if not exists public.hero_images (
  id uuid primary key default gen_random_uuid(),
  page_key text not null unique,
  page_name text not null,
  image_url text not null,
  secondary_image_url text,
  alt_text text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Index for lookup
create index if not exists hero_images_page_key_idx on public.hero_images (page_key);

-- Enable Row Level Security (RLS)
alter table public.hero_images enable row level security;

-- Policy: Allow service role full access
create policy "Allow service role full access to hero_images"
  on public.hero_images
  for all
  using (auth.role() = 'service_role');

-- Policy: Allow public read access to hero_images
create policy "Allow public read access to hero_images"
  on public.hero_images
  for select
  using (true);

-- Seed with initial default images
insert into public.hero_images (page_key, page_name, image_url, secondary_image_url, alt_text)
values
  ('home', 'Home Page', 'https://images.unsplash.com/photo-1544717302-de2939b7ef71?auto=format&fit=crop&w=1200&q=80', null, 'Astsankhlam - Holistic Wellness & Healing'),
  ('about', 'About Page', 'https://res.cloudinary.com/doficc2yl/image/upload/v1789452549/20260814_182755_0000.jpg_mv7oq3.jpg', null, 'Astsankhlam - Find the right support for your healing journey'),
  ('services', 'Services Page', 'https://images.unsplash.com/photo-1573497019940-1c28c88b4f3e?auto=format&fit=crop&w=1000&q=80', null, 'Therapy and compassionate counseling session'),
  ('careers', 'Careers Page', 'https://images.unsplash.com/photo-1544717302-de2939b7ef71?auto=format&fit=crop&w=800&q=80', 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80', 'Mindful Therapy Session'),
  ('contact', 'Contact Page', 'https://images.unsplash.com/photo-1497366216548-37526070297c?auto=format&fit=crop&w=1600&q=80', null, 'Astsankhlam sanctuary')
on conflict (page_key) do update set
  image_url = excluded.image_url,
  secondary_image_url = excluded.secondary_image_url,
  alt_text = excluded.alt_text,
  updated_at = now();
