-- Migration: Create public.blogs table
-- Generated based on required schema

create table if not exists public.blogs (
  id uuid primary key default gen_random_uuid(),

  title text not null,

  slug text not null unique,

  category text not null,

  read_time integer not null default 1,

  excerpt text,

  content text not null,

  author_name text not null,

  author_image text,

  published_at timestamptz not null,

  featured_image text,

  status text not null default 'draft'
    check (status in ('draft', 'published', 'archived')),

  created_at timestamptz not null default now(),

  updated_at timestamptz not null default now()
);

-- Indexes for performance
create index if not exists blogs_slug_idx on public.blogs (slug);
create index if not exists blogs_category_idx on public.blogs (category);
create index if not exists blogs_status_published_at_idx on public.blogs (status, published_at desc);

-- Enable Row Level Security (RLS)
alter table public.blogs enable row level security;

-- Policy: Allow public read access to published blogs
create policy "Allow public read access for published blogs"
  on public.blogs
  for select
  using (status = 'published');

-- Policy: Allow service role full access
create policy "Allow service role full access to blogs"
  on public.blogs
  for all
  using (auth.role() = 'service_role');
