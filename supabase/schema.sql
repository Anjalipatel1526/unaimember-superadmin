-- ============================================================
--  UNAI MEMBER — Super Admin Dashboard
--  Supabase SQL Schema
--  Run this entire file in: Supabase Dashboard → SQL Editor
-- ============================================================

-- ────────────────────────────────────────────────────────────
--  EXTENSIONS
-- ────────────────────────────────────────────────────────────
create extension if not exists "uuid-ossp";
create extension if not exists "pgcrypto";

-- ────────────────────────────────────────────────────────────
--  ENUM TYPES
-- ────────────────────────────────────────────────────────────
create type company_status    as enum ('Active', 'Trial', 'Suspended', 'Cancelled');
create type payment_status    as enum ('Paid', 'Pending', 'Failed', 'Refunded');
create type ticket_priority   as enum ('Low', 'Medium', 'High', 'Critical');
create type ticket_status     as enum ('Open', 'In Progress', 'Resolved', 'Closed');
create type log_type          as enum ('billing', 'system', 'user', 'security', 'auth');
create type plan_name         as enum ('Basic', 'Professional', 'Enterprise');

-- ────────────────────────────────────────────────────────────
--  SUBSCRIPTION PLANS
-- ────────────────────────────────────────────────────────────
create table if not exists subscription_plans (
  id              uuid primary key default uuid_generate_v4(),
  name            plan_name    not null unique,
  price           numeric(10,2) not null,
  employee_limit  int,                         -- null = unlimited
  storage_gb      int          not null,
  support_level   text         not null,
  features        text[]       not null default '{}',
  enabled         boolean      not null default true,
  created_at      timestamptz  not null default now(),
  updated_at      timestamptz  not null default now()
);

-- ────────────────────────────────────────────────────────────
--  COMPANIES
-- ────────────────────────────────────────────────────────────
create table if not exists companies (
  id                uuid primary key default uuid_generate_v4(),
  name              text         not null,
  email             text         not null unique,
  phone             text,
  address           text,
  logo_url          text,
  plan_id           uuid         references subscription_plans(id) on delete set null,
  employee_count    int          not null default 0,
  employee_limit    int          not null default 50,
  status            company_status not null default 'Trial',
  payment_status    payment_status not null default 'Pending',
  trial_expiry      date,
  payroll_enabled   boolean      not null default false,
  performance_enabled boolean    not null default false,
  created_at        timestamptz  not null default now(),
  updated_at        timestamptz  not null default now()
);

-- ────────────────────────────────────────────────────────────
--  INVOICES
-- ────────────────────────────────────────────────────────────
create table if not exists invoices (
  id              uuid primary key default uuid_generate_v4(),
  invoice_number  text         not null unique,
  company_id      uuid         not null references companies(id) on delete cascade,
  amount          numeric(10,2) not null,
  due_date        date         not null,
  paid_at         timestamptz,
  status          payment_status not null default 'Pending',
  notes           text,
  created_at      timestamptz  not null default now(),
  updated_at      timestamptz  not null default now()
);

-- ────────────────────────────────────────────────────────────
--  SUPPORT TICKETS
-- ────────────────────────────────────────────────────────────
create table if not exists support_tickets (
  id              uuid primary key default uuid_generate_v4(),
  ticket_number   text         not null unique,
  company_id      uuid         not null references companies(id) on delete cascade,
  subject         text         not null,
  priority        ticket_priority not null default 'Medium',
  status          ticket_status   not null default 'Open',
  assigned_agent  text,
  created_at      timestamptz  not null default now(),
  updated_at      timestamptz  not null default now()
);

create table if not exists ticket_messages (
  id          uuid primary key default uuid_generate_v4(),
  ticket_id   uuid         not null references support_tickets(id) on delete cascade,
  sender_name text         not null,
  sender_role text         not null default 'client',   -- 'client' | 'agent'
  body        text         not null,
  created_at  timestamptz  not null default now()
);

-- ────────────────────────────────────────────────────────────
--  FEATURE FLAGS
-- ────────────────────────────────────────────────────────────
create table if not exists features (
  id          uuid primary key default uuid_generate_v4(),
  key         text         not null unique,
  title       text         not null,
  description text,
  enabled     boolean      not null default true,
  usage_count int          not null default 0,
  icon        text,
  created_at  timestamptz  not null default now(),
  updated_at  timestamptz  not null default now()
);

-- ────────────────────────────────────────────────────────────
--  AUDIT LOGS
-- ────────────────────────────────────────────────────────────
create table if not exists audit_logs (
  id          uuid primary key default uuid_generate_v4(),
  type        log_type     not null default 'system',
  user_name   text         not null,
  user_role   text         not null,
  action      text         not null,
  target      text,
  outcome     text         not null default 'Success',
  metadata    jsonb,
  created_at  timestamptz  not null default now()
);

-- ────────────────────────────────────────────────────────────
--  SYSTEM METRICS  (time-series snapshots)
-- ────────────────────────────────────────────────────────────
create table if not exists system_metrics (
  id              uuid primary key default uuid_generate_v4(),
  server_status   text         not null default 'Online',
  api_response_ms int          not null default 0,
  active_sessions int          not null default 0,
  error_count_24h int          not null default 0,
  cpu_load        numeric(5,2) not null default 0,
  recorded_at     timestamptz  not null default now()
);

-- ────────────────────────────────────────────────────────────
--  REVENUE SNAPSHOTS  (monthly aggregates for charts)
-- ────────────────────────────────────────────────────────────
create table if not exists revenue_snapshots (
  id          uuid primary key default uuid_generate_v4(),
  month       date         not null unique,  -- first day of the month
  mrr         numeric(12,2) not null default 0,
  new_companies int         not null default 0,
  created_at  timestamptz  not null default now()
);

-- ────────────────────────────────────────────────────────────
--  UPDATED_AT TRIGGER
-- ────────────────────────────────────────────────────────────
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

do $$
declare t text;
begin
  foreach t in array array[
    'subscription_plans','companies','invoices',
    'support_tickets','features'
  ] loop
    execute format(
      'create trigger trg_%I_updated_at
       before update on %I
       for each row execute procedure set_updated_at()',
      t, t
    );
  end loop;
end;
$$;

-- ────────────────────────────────────────────────────────────
--  ROW LEVEL SECURITY
-- ────────────────────────────────────────────────────────────
-- Enable RLS on all tables (Super Admin bypasses via service role)
alter table subscription_plans  enable row level security;
alter table companies            enable row level security;
alter table invoices             enable row level security;
alter table support_tickets      enable row level security;
alter table ticket_messages      enable row level security;
alter table features             enable row level security;
alter table audit_logs           enable row level security;
alter table system_metrics       enable row level security;
alter table revenue_snapshots    enable row level security;

-- Allow anon/authenticated full access for this admin dashboard
-- (tighten these policies once you add auth)
create policy "allow_all_companies"         on companies          for all using (true) with check (true);
create policy "allow_all_plans"             on subscription_plans for all using (true) with check (true);
create policy "allow_all_invoices"          on invoices           for all using (true) with check (true);
create policy "allow_all_tickets"           on support_tickets    for all using (true) with check (true);
create policy "allow_all_ticket_messages"   on ticket_messages    for all using (true) with check (true);
create policy "allow_all_features"          on features           for all using (true) with check (true);
create policy "allow_all_audit_logs"        on audit_logs         for all using (true) with check (true);
create policy "allow_all_system_metrics"    on system_metrics     for all using (true) with check (true);
create policy "allow_all_revenue_snapshots" on revenue_snapshots  for all using (true) with check (true);

-- ────────────────────────────────────────────────────────────
--  SEED — Subscription Plans
-- ────────────────────────────────────────────────────────────
insert into subscription_plans (name, price, employee_limit, storage_gb, support_level, features) values
  ('Basic',        99,   50,   10,   'Email',                    array['Payroll','Attendance','Employee Management']),
  ('Professional', 299,  250,  100,  'Priority Email & Chat',    array['All Basic','Performance','Recruitment','AI Analytics']),
  ('Enterprise',   999,  null, 1000, '24/7 Dedicated Support',   array['All Professional','Custom Integration','Mobile App','Advanced Security'])
on conflict (name) do nothing;

-- ────────────────────────────────────────────────────────────
--  SEED — Feature Flags
-- ────────────────────────────────────────────────────────────
insert into features (key, title, description, enabled, usage_count, icon) values
  ('payroll',    'Payroll Module',    'Automated salary calculations, tax compliance, and direct deposit.',   true,  0, 'CreditCard'),
  ('attendance', 'Attendance Module', 'Biometric, GPS, and manual clock-in tracking.',                       true,  0, 'Activity'),
  ('ai',         'AI Performance',   'AI-driven performance reviews and predictive attrition analytics.',    true,  0, 'Cpu'),
  ('mobile',     'Mobile App Access','Native iOS & Android application for employees and managers.',         true,  0, 'Smartphone'),
  ('api',        'API Access',       'Full REST API for custom integrations and third-party tools.',         false, 0, 'Globe'),
  ('reports',    'Advanced Reports', 'Custom report builder with scheduled exports and data visualization.', true,  0, 'Database')
on conflict (key) do nothing;
