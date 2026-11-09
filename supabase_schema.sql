-- ==========================================================
-- ELYSSA DEV BOARD - CUSTOMER PRE-ORDER DATABASE SCHEMA
-- Execute this script in your Supabase SQL Editor
-- ==========================================================

-- 0. Enable pgcrypto extension for gen_random_uuid()
create extension if not exists pgcrypto;

-- 1. Create the preorders table (if not exists)
create table if not exists public.preorders (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  first_name text not null,
  family_name text not null,
  age integer not null,
  email text not null,
  phone text not null,
  is_student boolean not null default false,
  college text default '' not null,
  offered_price text not null,
  actual_price text default '70 DT' not null,
  status text default 'pending' not null,
  notes text
);

-- 1b. Add college column if table already existed without it
alter table public.preorders
  add column if not exists college text default '' not null;

-- 2. Add indexes for faster lookups
create index if not exists preorders_email_idx on public.preorders (email);
create index if not exists preorders_created_at_idx on public.preorders (created_at desc);

-- 3. Enable Row Level Security (RLS)
alter table public.preorders enable row level security;

-- 4. Policies: Allow anonymous inserts (from website pre-order form)
-- Postgres does not support CREATE POLICY IF NOT EXISTS, so drop first if exists
drop policy if exists "Allow public anonymous preorders insertion" on public.preorders;
create policy "Allow public anonymous preorders insertion"
  on public.preorders
  for insert
  to anon
  with check (true);

-- 5. Policies: Only authenticated service role can read/manage all orders
drop policy if exists "Allow service role full access" on public.preorders;
create policy "Allow service role full access"
  on public.preorders
  for all
  to service_role
  using (true)
  with check (true);

-- 6. Comment on table and columns
comment on table public.preorders is 'Pre-order registrations for Elyssa ESP32-S3 development board';
comment on column public.preorders.first_name is 'Customer first name';
comment on column public.preorders.family_name is 'Customer last/family name';
comment on column public.preorders.age is 'Customer age';
comment on column public.preorders.email is 'Customer email address for order notifications';
comment on column public.preorders.phone is 'Customer phone number for confirmation call';
comment on column public.preorders.is_student is 'Flag indicating if the customer is a student (selected via iOS switch)';
comment on column public.preorders.college is 'Customer college or university (if student)';
comment on column public.preorders.offered_price is 'The best price choice selected by the customer (80 to 150 DT)';
comment on column public.preorders.actual_price is 'The revealed official price: 70 DT';
