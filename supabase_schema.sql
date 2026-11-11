-- ==========================================================
-- ELYSSA DEV BOARD - CUSTOMER PRE-ORDER DATABASE SCHEMA
-- Paste the WHOLE script in the Supabase SQL Editor and run it.
--
-- * Safe to run more than once.
-- * Works on a brand new project AND on your existing table:
--   every old row is copied into the new layout (nothing is lost).
-- * Column order in the table: customer -> order -> money -> status, notes (last).
-- ==========================================================

create extension if not exists pgcrypto;

-- 1. Drop the dashboard view first (it is re-created at the end)
drop view if exists public.preorders_summary;

-- 2. If the table exists in an older layout (different columns or order), move it aside.
--    Postgres cannot reorder columns of an existing table, so we rebuild it.
do $$
declare
  wanted text := 'id,created_at,first_name,family_name,age,email,phone,is_student,college,quantity,offered_price,actual_price,offered_price_dt,unit_price_dt,total_price_dt,amount_paid_dt,balance_due_dt,paid_percent,payment_status,payment_method,paid_at,status,notes';
  have   text;
  extra  text;
begin
  if to_regclass('public.preorders') is null then
    return;
  end if;

  select string_agg(column_name, ',' order by ordinal_position)
    into have
    from information_schema.columns
   where table_schema = 'public' and table_name = 'preorders';

  if have = wanted then
    return; -- already in the right layout
  end if;

  -- Safety: refuse to rebuild if the table has columns we do not know about (they would be lost)
  select string_agg(column_name, ', ')
    into extra
    from information_schema.columns
   where table_schema = 'public' and table_name = 'preorders'
     and column_name <> all (string_to_array(wanted, ',') || array['desired_vs_price_percent']);
  if extra is not null then
    raise exception 'public.preorders has extra columns (%). Nothing was changed. Ask for them to be added to the script first.', extra;
  end if;

  drop table if exists public.preorders_old;
  alter table public.preorders rename to preorders_old;
  alter index if exists public.preorders_pkey rename to preorders_old_pkey;
  drop index if exists public.preorders_email_idx;
  drop index if exists public.preorders_created_at_idx;
  drop index if exists public.preorders_payment_status_idx;
end $$;

-- 3. The table (created only when it does not exist, i.e. fresh project or just moved aside)
create table if not exists public.preorders (
  id            uuid default gen_random_uuid() primary key,
  created_at    timestamp with time zone default timezone('utc'::text, now()) not null,

  -- Customer
  first_name    text not null,
  family_name   text not null,
  age           integer not null,
  email         text not null,
  phone         text not null,
  is_student    boolean not null default false,
  college       text default '' not null,

  -- Order
  quantity      integer not null default 1,
  offered_price text not null,                                    -- desired price chosen by the customer, as text (e.g. '95 DT')
  actual_price  text default '70 DT' not null,                    -- official price, as text

  -- Money, in Tunisian dinars (DT)
  offered_price_dt numeric(10,2),                                 -- desired price per board (number)
  unit_price_dt    numeric(10,2) not null default 70,             -- official price per board
  total_price_dt   numeric(12,2) generated always as (unit_price_dt * quantity) stored,
  amount_paid_dt   numeric(10,2) not null default 0,              -- money received so far: update this when a customer pays
  balance_due_dt   numeric(12,2) generated always as (unit_price_dt * quantity - amount_paid_dt) stored,
  paid_percent     numeric(6,1)  generated always as (round(amount_paid_dt / nullif(unit_price_dt * quantity, 0) * 100, 1)) stored,
  payment_status   text not null default 'unpaid',                -- unpaid | partial | paid | refunded (kept in sync automatically)
  payment_method   text,                                          -- cash, bank transfer, d17, ...
  paid_at          timestamp with time zone,

  -- Workflow (always last)
  status        text default 'pending' not null,
  notes         text,

  constraint preorders_quantity_range        check (quantity between 1 and 10),
  constraint preorders_payment_status_values check (payment_status in ('unpaid', 'partial', 'paid', 'refunded')),
  constraint preorders_amount_paid_positive  check (amount_paid_dt >= 0)
);

-- 4. Automatic bookkeeping (created BEFORE the copy so old rows get the right payment status too)
--    * fills offered_price_dt from the text price when the website did not send it
--    * keeps payment_status in sync with amount_paid_dt (set it to 'refunded' yourself when needed)
--    * stamps paid_at the first time the order is fully paid
create or replace function public.preorders_before_write()
returns trigger
language plpgsql
as $$
declare
  total numeric;
begin
  if new.offered_price_dt is null then
    new.offered_price_dt := nullif(regexp_replace(coalesce(new.offered_price, ''), '[^0-9.]', '', 'g'), '')::numeric;
  end if;

  total := new.unit_price_dt * new.quantity;

  if new.payment_status is distinct from 'refunded' then
    if new.amount_paid_dt <= 0 then
      new.payment_status := 'unpaid';
    elsif new.amount_paid_dt >= total then
      new.payment_status := 'paid';
    else
      new.payment_status := 'partial';
    end if;
  end if;

  if new.payment_status = 'paid' and new.paid_at is null then
    new.paid_at := now();
  end if;

  return new;
end;
$$;

drop trigger if exists preorders_before_write on public.preorders;
create trigger preorders_before_write
  before insert or update on public.preorders
  for each row execute function public.preorders_before_write();

-- 5. Copy the rows of the old table into the new one, then remove the old table
do $$
begin
  if to_regclass('public.preorders_old') is null then
    return;
  end if;

  insert into public.preorders (
    id, created_at, first_name, family_name, age, email, phone, is_student, college,
    quantity, offered_price, actual_price,
    offered_price_dt, unit_price_dt, amount_paid_dt, payment_status, payment_method, paid_at,
    status, notes
  )
  select
    o.id, o.created_at, o.first_name, o.family_name, o.age, o.email, o.phone, o.is_student,
    coalesce(o.college, ''),
    coalesce((to_jsonb(o) ->> 'quantity')::integer, 1),
    o.offered_price, o.actual_price,
    coalesce((to_jsonb(o) ->> 'offered_price_dt')::numeric,
             nullif(regexp_replace(o.offered_price, '[^0-9.]', '', 'g'), '')::numeric),
    coalesce((to_jsonb(o) ->> 'unit_price_dt')::numeric, 70),
    coalesce((to_jsonb(o) ->> 'amount_paid_dt')::numeric, 0),
    coalesce(to_jsonb(o) ->> 'payment_status', 'unpaid'),
    to_jsonb(o) ->> 'payment_method',
    (to_jsonb(o) ->> 'paid_at')::timestamp with time zone,
    o.status, o.notes
  from public.preorders_old o;

  drop table public.preorders_old;
end $$;

-- 6. Indexes
create index if not exists preorders_email_idx          on public.preorders (email);
create index if not exists preorders_created_at_idx     on public.preorders (created_at desc);
create index if not exists preorders_payment_status_idx on public.preorders (payment_status);

-- 7. Row Level Security
alter table public.preorders enable row level security;

-- The website form may insert a new, unpaid, pending order. It can NOT mark an order as paid.
drop policy if exists "Allow public anonymous preorders insertion" on public.preorders;
create policy "Allow public anonymous preorders insertion"
  on public.preorders
  for insert
  to anon
  with check (
    amount_paid_dt = 0
    and payment_status = 'unpaid'
    and status = 'pending'
  );

-- Only the service role (your server / the dashboard) can read and manage orders
drop policy if exists "Allow service role full access" on public.preorders;
create policy "Allow service role full access"
  on public.preorders
  for all
  to service_role
  using (true)
  with check (true);

-- 8. Handy summary for the dashboard (one row, totals across all orders)
create view public.preorders_summary with (security_invoker = true) as
select
  count(*)                                              as orders,
  coalesce(sum(quantity), 0)                            as boards,
  count(*) filter (where is_student)                    as student_orders,
  coalesce(sum(total_price_dt), 0)                      as total_due_dt,
  coalesce(sum(amount_paid_dt), 0)                      as total_paid_dt,
  coalesce(sum(balance_due_dt), 0)                      as total_balance_dt,
  round(coalesce(sum(amount_paid_dt), 0) / nullif(sum(total_price_dt), 0) * 100, 1) as paid_percent,
  round(avg(offered_price_dt), 2)                       as avg_desired_price_dt
from public.preorders
where payment_status <> 'refunded';

-- 9. Documentation
comment on table  public.preorders is 'Pre-order registrations for Elyssa ESP32-S3 development board';
comment on column public.preorders.first_name  is 'Customer first name';
comment on column public.preorders.family_name is 'Customer last/family name';
comment on column public.preorders.age         is 'Customer age';
comment on column public.preorders.email       is 'Customer email address for order notifications';
comment on column public.preorders.phone       is 'Customer phone number for confirmation call';
comment on column public.preorders.is_student  is 'True if the customer is a student';
comment on column public.preorders.college     is 'Customer college or university (if student)';
comment on column public.preorders.quantity    is 'Number of Elyssa boards ordered (1 to 10)';
comment on column public.preorders.offered_price     is 'Desired price chosen by the customer, as text (e.g. 95 DT)';
comment on column public.preorders.actual_price      is 'Official price, as text (70 DT)';
comment on column public.preorders.offered_price_dt  is 'Desired price per board in DT (number)';
comment on column public.preorders.unit_price_dt     is 'Official price per board in DT';
comment on column public.preorders.total_price_dt    is 'unit price x quantity (computed)';
comment on column public.preorders.amount_paid_dt    is 'Money received so far in DT: update this when a customer pays';
comment on column public.preorders.balance_due_dt    is 'Total minus amount paid (computed)';
comment on column public.preorders.paid_percent      is 'Percentage of the total already paid (computed)';
comment on column public.preorders.payment_status    is 'unpaid | partial | paid | refunded (kept in sync automatically)';
comment on column public.preorders.status            is 'Order workflow: pending, confirmed, shipped, ...';
