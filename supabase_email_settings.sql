-- ==========================================================
-- MOOVMA - EMAIL SETTINGS (pre-order alerts + daily report)
-- Paste this script in the Supabase SQL Editor and run it. Safe to run more than once.
--
-- After that, change the switches in Supabase: Table Editor > email_settings (one row).
--   notify_each_preorder  true  = an email arrives after EVERY new pre-order (so you can call the customer)
--   daily_report          true  = one report email every day at about 20:00 (Tunis time)
--   send_to               where both emails go (one address)
-- Changes apply immediately: no redeploy needed.
-- ==========================================================

create table if not exists public.email_settings (
  id                    integer primary key default 1,
  notify_each_preorder  boolean not null default true,
  daily_report          boolean not null default true,
  send_to               text    not null default 'moovmabh@gmail.com',
  last_daily_sent_at    timestamp with time zone,          -- filled in by the site, do not edit
  updated_at            timestamp with time zone not null default now(),
  constraint email_settings_single_row check (id = 1)
);

-- The one and only settings row
insert into public.email_settings (id) values (1) on conflict (id) do nothing;

-- Keep updated_at fresh when you flip a switch
create or replace function public.email_settings_touch()
returns trigger language plpgsql as $$
begin
  new.updated_at := now();
  return new;
end $$;

drop trigger if exists email_settings_touch on public.email_settings;
create trigger email_settings_touch
  before update on public.email_settings
  for each row execute function public.email_settings_touch();

-- Only the server (service role) and you in the dashboard can read or change it
alter table public.email_settings enable row level security;
drop policy if exists "Service role manages email settings" on public.email_settings;
create policy "Service role manages email settings"
  on public.email_settings for all to service_role using (true) with check (true);

comment on table  public.email_settings is 'Email switches for the Moovma site (one row). Edit the values here, no redeploy needed.';
comment on column public.email_settings.notify_each_preorder is 'true = email after every new pre-order';
comment on column public.email_settings.daily_report         is 'true = daily report email at about 20:00 Tunis time';
comment on column public.email_settings.send_to              is 'Address that receives both emails';
comment on column public.email_settings.last_daily_sent_at   is 'Set automatically when the daily report is sent';
