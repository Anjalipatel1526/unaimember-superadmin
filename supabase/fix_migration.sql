-- ============================================================
--  UNAI MEMBER — Fix / Migration SQL
--  Run this in: Supabase Dashboard → SQL Editor
--  This adds missing columns and fixes RLS policies
-- ============================================================

-- ── 1. Fix companies table — add missing columns ─────────────
ALTER TABLE companies
  ADD COLUMN IF NOT EXISTS email           text,
  ADD COLUMN IF NOT EXISTS phone           text,
  ADD COLUMN IF NOT EXISTS address         text,
  ADD COLUMN IF NOT EXISTS logo_url        text,
  ADD COLUMN IF NOT EXISTS payment_status  text NOT NULL DEFAULT 'Pending',
  ADD COLUMN IF NOT EXISTS trial_expiry    date,
  ADD COLUMN IF NOT EXISTS payroll_enabled boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS performance_enabled boolean NOT NULL DEFAULT false;

-- ── 2. Fix invoices table ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS invoices (
  id             uuid primary key default gen_random_uuid(),
  invoice_number text         not null unique,
  company_id     uuid         references companies(id) on delete cascade,
  amount         numeric(10,2) not null,
  due_date       date         not null,
  paid_at        timestamptz,
  status         text         not null default 'Pending',
  notes          text,
  created_at     timestamptz  not null default now(),
  updated_at     timestamptz  not null default now()
);

-- ── 3. Fix subscription_plans table ──────────────────────────
CREATE TABLE IF NOT EXISTS subscription_plans (
  id             uuid primary key default gen_random_uuid(),
  name           text         not null unique,
  price          numeric(10,2) not null,
  employee_limit int,
  storage_gb     int          not null default 10,
  support_level  text         not null default 'Email',
  features       text[]       not null default '{}',
  enabled        boolean      not null default true,
  created_at     timestamptz  not null default now(),
  updated_at     timestamptz  not null default now()
);

-- ── 4. Fix features table ─────────────────────────────────────
CREATE TABLE IF NOT EXISTS features (
  id          uuid primary key default gen_random_uuid(),
  key         text         not null unique,
  title       text         not null,
  description text,
  enabled     boolean      not null default true,
  usage_count int          not null default 0,
  icon        text,
  created_at  timestamptz  not null default now(),
  updated_at  timestamptz  not null default now()
);

-- ── 5. Fix audit_logs table ───────────────────────────────────
CREATE TABLE IF NOT EXISTS audit_logs (
  id         uuid primary key default gen_random_uuid(),
  type       text         not null default 'system',
  user_name  text         not null default 'System',
  user_role  text         not null default 'Automated',
  action     text         not null,
  target     text,
  outcome    text         not null default 'Success',
  metadata   jsonb,
  created_at timestamptz  not null default now()
);

-- ── 6. Fix system_metrics table ───────────────────────────────
CREATE TABLE IF NOT EXISTS system_metrics (
  id              uuid primary key default gen_random_uuid(),
  server_status   text         not null default 'Online',
  api_response_ms int          not null default 0,
  active_sessions int          not null default 0,
  error_count_24h int          not null default 0,
  cpu_load        numeric(5,2) not null default 0,
  recorded_at     timestamptz  not null default now()
);

-- ── 7. Fix revenue_snapshots table ───────────────────────────
CREATE TABLE IF NOT EXISTS revenue_snapshots (
  id            uuid primary key default gen_random_uuid(),
  month         date         not null unique,
  mrr           numeric(12,2) not null default 0,
  new_companies int          not null default 0,
  created_at    timestamptz  not null default now()
);

-- ── 8. Drop & recreate ALL RLS policies (fixes infinite recursion) ──
-- Companies
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow_all_companies" ON companies;
CREATE POLICY "allow_all_companies" ON companies FOR ALL USING (true) WITH CHECK (true);

-- Invoices
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow_all_invoices" ON invoices;
CREATE POLICY "allow_all_invoices" ON invoices FOR ALL USING (true) WITH CHECK (true);

-- subscription_plans
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow_all_plans" ON subscription_plans;
CREATE POLICY "allow_all_plans" ON subscription_plans FOR ALL USING (true) WITH CHECK (true);

-- features
ALTER TABLE features ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow_all_features" ON features;
CREATE POLICY "allow_all_features" ON features FOR ALL USING (true) WITH CHECK (true);

-- audit_logs
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow_all_audit_logs" ON audit_logs;
CREATE POLICY "allow_all_audit_logs" ON audit_logs FOR ALL USING (true) WITH CHECK (true);

-- system_metrics
ALTER TABLE system_metrics ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow_all_system_metrics" ON system_metrics;
CREATE POLICY "allow_all_system_metrics" ON system_metrics FOR ALL USING (true) WITH CHECK (true);

-- revenue_snapshots
ALTER TABLE revenue_snapshots ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow_all_revenue_snapshots" ON revenue_snapshots;
CREATE POLICY "allow_all_revenue_snapshots" ON revenue_snapshots FOR ALL USING (true) WITH CHECK (true);

-- ── 9. Seed subscription plans ───────────────────────────────
INSERT INTO subscription_plans (name, price, employee_limit, storage_gb, support_level, features) VALUES
  ('Basic',        99,   50,   10,   'Email',                    ARRAY['Payroll','Attendance','Employee Management']),
  ('Professional', 299,  250,  100,  'Priority Email & Chat',    ARRAY['All Basic','Performance','Recruitment','AI Analytics']),
  ('Enterprise',   999,  null, 1000, '24/7 Dedicated Support',   ARRAY['All Professional','Custom Integration','Mobile App','Advanced Security'])
ON CONFLICT (name) DO NOTHING;

-- ── 10. Seed feature flags ───────────────────────────────────
INSERT INTO features (key, title, description, enabled, usage_count, icon) VALUES
  ('payroll',    'Payroll Module',    'Automated salary calculations, tax compliance, and direct deposit.',   true,  0, 'CreditCard'),
  ('attendance', 'Attendance Module', 'Biometric, GPS, and manual clock-in tracking.',                       true,  0, 'Activity'),
  ('ai',         'AI Performance',   'AI-driven performance reviews and predictive attrition analytics.',    true,  0, 'Cpu'),
  ('mobile',     'Mobile App Access','Native iOS & Android application for employees and managers.',         true,  0, 'Smartphone'),
  ('api',        'API Access',       'Full REST API for custom integrations and third-party tools.',         false, 0, 'Globe'),
  ('reports',    'Advanced Reports', 'Custom report builder with scheduled exports and data visualization.', true,  0, 'Database')
ON CONFLICT (key) DO NOTHING;

-- Reload schema cache after running this
-- Supabase Dashboard → Settings → API → Reload schema cache
