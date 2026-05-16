-- ============================================================
--  UNAI MEMBER — FINAL AGGRESSIVE FIX
--  Run this in: Supabase Dashboard → SQL Editor
--  This script nukes recursive policies and fixes missing columns
-- ============================================================

-- ── 1. Fix companies table ──────────────────────────────────
ALTER TABLE companies
  ADD COLUMN IF NOT EXISTS status          text NOT NULL DEFAULT 'Active',
  ADD COLUMN IF NOT EXISTS email           text,
  ADD COLUMN IF NOT EXISTS phone           text,
  ADD COLUMN IF NOT EXISTS address         text,
  ADD COLUMN IF NOT EXISTS logo_url        text,
  ADD COLUMN IF NOT EXISTS employee_count  int4 NOT NULL DEFAULT 0,
  ADD COLUMN IF NOT EXISTS employee_limit  int4 NOT NULL DEFAULT 50,
  ADD COLUMN IF NOT EXISTS payment_status  text NOT NULL DEFAULT 'Pending',
  ADD COLUMN IF NOT EXISTS trial_expiry    date,
  ADD COLUMN IF NOT EXISTS payroll_enabled boolean NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS performance_enabled boolean NOT NULL DEFAULT false;

-- ── 2. Create tables if missing ──────────────────────────────
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

-- ── 3. NUKE ALL RECURSIVE POLICIES ───────────────────────────
-- This anonymous block drops EVERY policy on the problematic tables
-- to ensure no hidden recursive policies remain.

DO $$ 
DECLARE 
    r record;
BEGIN 
    -- Drop all policies for public.users
    FOR r IN SELECT policyname FROM pg_policies WHERE tablename = 'users' AND schemaname = 'public' LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON public.users', r.policyname);
    END LOOP;
    
    -- Drop all policies for companies
    FOR r IN SELECT policyname FROM pg_policies WHERE tablename = 'companies' AND schemaname = 'public' LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON companies', r.policyname);
    END LOOP;

    -- Drop all policies for invoices
    FOR r IN SELECT policyname FROM pg_policies WHERE tablename = 'invoices' AND schemaname = 'public' LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON invoices', r.policyname);
    END LOOP;
END $$;

-- ── 4. Create clean, non-recursive policies ──────────────────
-- Companies
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
CREATE POLICY "permissive_companies" ON companies FOR ALL USING (true) WITH CHECK (true);

-- Invoices
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
CREATE POLICY "permissive_invoices" ON invoices FOR ALL USING (true) WITH CHECK (true);

-- Users (The cause of the crash)
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
CREATE POLICY "permissive_users" ON public.users FOR ALL USING (true) WITH CHECK (true);

-- ── 5. Seed basic data ───────────────────────────────────────
INSERT INTO features (key, title, description, enabled, usage_count, icon) VALUES
  ('payroll',    'Payroll Module',    'Automated salary calculations.', true, 0, 'CreditCard'),
  ('attendance', 'Attendance Module', 'Tracking clock-in/out.',        true, 0, 'Activity')
ON CONFLICT (key) DO NOTHING;

-- Reload schema cache after running this:
-- Supabase Dashboard → Settings → API → Reload schema cache
