-- Migration: Create public.newsletter_subscribers table
create table if not exists public.newsletter_subscribers (
  id uuid primary key default gen_random_uuid(),

  email text not null unique,

  is_subscribed boolean not null default true,

  subscribed_at timestamptz not null default now(),
  unsubscribed_at timestamptz,

  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Index for fast lookup by email and status
create index if not exists newsletter_subscribers_email_idx on public.newsletter_subscribers (email);
create index if not exists newsletter_subscribers_status_idx on public.newsletter_subscribers (is_subscribed);

-- Enable Row Level Security (RLS)
alter table public.newsletter_subscribers enable row level security;

-- Policy: Allow service role full access
create policy "Allow service role full access to newsletter_subscribers"
  on public.newsletter_subscribers
  for all
  using (auth.role() = 'service_role');

-- Policy: Allow public to insert subscription
create policy "Allow public insert to newsletter_subscribers"
  on public.newsletter_subscribers
  for insert
  with check (true);
