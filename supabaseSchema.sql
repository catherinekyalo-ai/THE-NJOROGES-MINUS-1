-- Run this in your Supabase project's SQL editor (Dashboard > SQL Editor > New query)

create extension if not exists "pgcrypto"; -- for gen_random_uuid()

create table if not exists members (
  id uuid primary key default gen_random_uuid(),
  chama_id text not null default 'default',
  name text not null,
  phone text,
  created_at timestamptz not null default now()
);

create table if not exists transactions (
  id uuid primary key default gen_random_uuid(),
  member_id uuid not null references members(id) on delete cascade,
  account text not null check (account in ('savings', 'loans')),
  type text not null check (
    type in ('payment', 'interest', 'deduction', 'disbursed', 'repayment')
  ),
  amount numeric not null check (amount > 0),
  note text,
  date date not null,
  created_at timestamptz not null default now()
);

create index if not exists idx_transactions_member on transactions(member_id);
create index if not exists idx_members_chama on members(chama_id);

-- Row Level Security
alter table members enable row level security;
alter table transactions enable row level security;

-- STARTER POLICY: fully open, keyed only by the app's anon key.
-- Fine for a private link you share with your chama; tighten later with
-- Supabase Auth (e.g. restrict by auth.uid() once members have logins).
create policy "allow all on members" on members
  for all using (true) with check (true);

create policy "allow all on transactions" on transactions
  for all using (true) with check (true);