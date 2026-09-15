-- Migration: Create public.contact_messages table
create table if not exists public.contact_messages (
  id uuid primary key default gen_random_uuid(),

  first_name text not null,
  last_name text not null,
  email text not null,

  newsletter_opt_in boolean not null default false,

  subject text not null,
  message text not null,

  created_at timestamptz not null default now(),
  is_read boolean not null default false
);

-- Indexes for performance
create index if not exists contact_messages_email_idx on public.contact_messages (email);
create index if not exists contact_messages_created_at_idx on public.contact_messages (created_at desc);
create index if not exists contact_messages_is_read_idx on public.contact_messages (is_read);

-- Enable Row Level Security (RLS)
alter table public.contact_messages enable row level security;

-- Policy: Allow service role full access
create policy "Allow service role full access to contact_messages"
  on public.contact_messages
  for all
  using (auth.role() = 'service_role');

-- Policy: Allow public to insert contact messages
create policy "Allow public insert to contact_messages"
  on public.contact_messages
  for insert
  with check (true);
