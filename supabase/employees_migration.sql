-- ============================================================
--  UNAI MEMBER — Employees & Company Access Control Migration
--  Run this in: Supabase Dashboard → SQL Editor
--  Split into steps so each can be run separately if needed
-- ============================================================

-- ────────────────────────────────────────────────────────────
--  STEP 1: EMPLOYEES TABLE
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS employees (
  id              uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id      uuid        NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  employee_code   text,
  first_name      text        NOT NULL,
  last_name       text        NOT NULL,
  email           text,
  phone           text,
  department      text,
  designation     text,
  employment_type text        NOT NULL DEFAULT 'Full-Time',
  emp_status      text        NOT NULL DEFAULT 'Active',
  date_of_joining date,
  date_of_birth   date,
  salary          numeric(12,2),
  address         text,
  avatar_url      text,
  metadata        jsonb,
  created_at      timestamptz NOT NULL DEFAULT now(),
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- ────────────────────────────────────────────────────────────
--  STEP 1b: SAFE COLUMN FIX
--  If the table already existed with old 'status' column name,
--  rename it. If emp_status is missing entirely, add it.
-- ────────────────────────────────────────────────────────────
DO $$
BEGIN
  -- Case 1: old 'status' column exists → rename to emp_status
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'employees' AND column_name = 'status'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'employees' AND column_name = 'emp_status'
  ) THEN
    ALTER TABLE employees RENAME COLUMN status TO emp_status;

  -- Case 2: neither column exists (should not happen, but be safe)
  ELSIF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'employees' AND column_name = 'emp_status'
  ) THEN
    ALTER TABLE employees ADD COLUMN emp_status text NOT NULL DEFAULT 'Active';
  END IF;
END;
$$;

-- ────────────────────────────────────────────────────────────
--  STEP 2: INDEXES
-- ────────────────────────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_employees_company_id ON employees(company_id);

-- Safe index on emp_status (created only after column is guaranteed to exist)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_indexes
    WHERE tablename = 'employees' AND indexname = 'idx_employees_emp_status'
  ) THEN
    CREATE INDEX idx_employees_emp_status ON employees(company_id, emp_status);
  END IF;
END;
$$;

-- ────────────────────────────────────────────────────────────
--  STEP 3: EMPLOYEE CODE AUTO-GENERATOR
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION generate_employee_code()
RETURNS TRIGGER LANGUAGE plpgsql AS $$
DECLARE
  next_num int;
BEGIN
  IF NEW.employee_code IS NULL OR NEW.employee_code = '' THEN
    SELECT COALESCE(
      MAX(
        CASE
          WHEN employee_code ~ '^EMP-[0-9]+$'
          THEN CAST(REPLACE(employee_code, 'EMP-', '') AS int)
          ELSE 0
        END
      ), 0
    ) + 1
    INTO next_num
    FROM employees
    WHERE company_id = NEW.company_id;

    NEW.employee_code := 'EMP-' || LPAD(next_num::text, 3, '0');
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_employee_code ON employees;
CREATE TRIGGER trg_employee_code
  BEFORE INSERT ON employees
  FOR EACH ROW
  EXECUTE PROCEDURE generate_employee_code();

-- ────────────────────────────────────────────────────────────
--  STEP 4: UPDATED_AT TRIGGER ON EMPLOYEES
-- ────────────────────────────────────────────────────────────
DROP TRIGGER IF EXISTS trg_employees_updated_at ON employees;
CREATE TRIGGER trg_employees_updated_at
  BEFORE UPDATE ON employees
  FOR EACH ROW EXECUTE PROCEDURE set_updated_at();

-- ────────────────────────────────────────────────────────────
--  STEP 5: EMPLOYEE COUNT SYNC ON COMPANIES
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION sync_employee_count()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE companies
       SET employee_count = COALESCE(employee_count, 0) + 1
     WHERE id = NEW.company_id;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE companies
       SET employee_count = GREATEST(COALESCE(employee_count, 0) - 1, 0)
     WHERE id = OLD.company_id;
  END IF;
  RETURN NULL;
END;
$$;

DROP TRIGGER IF EXISTS trg_sync_employee_count ON employees;
CREATE TRIGGER trg_sync_employee_count
  AFTER INSERT OR DELETE ON employees
  FOR EACH ROW EXECUTE PROCEDURE sync_employee_count();

-- ────────────────────────────────────────────────────────────
--  STEP 6: COMPANY ACCESS CONTROLS TABLE
-- ────────────────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS company_access_controls (
  id                  uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id          uuid        NOT NULL REFERENCES companies(id) ON DELETE CASCADE UNIQUE,
  -- Core HR Modules
  employees_module    boolean     NOT NULL DEFAULT true,
  attendance_module   boolean     NOT NULL DEFAULT false,
  payroll_module      boolean     NOT NULL DEFAULT false,
  performance_module  boolean     NOT NULL DEFAULT false,
  recruitment_module  boolean     NOT NULL DEFAULT false,
  training_module     boolean     NOT NULL DEFAULT false,
  -- Reports & Analytics
  reports_enabled     boolean     NOT NULL DEFAULT false,
  analytics_enabled   boolean     NOT NULL DEFAULT false,
  ai_insights_enabled boolean     NOT NULL DEFAULT false,
  -- Integrations & Access
  api_access          boolean     NOT NULL DEFAULT false,
  mobile_app_access   boolean     NOT NULL DEFAULT false,
  can_export_data     boolean     NOT NULL DEFAULT true,
  can_manage_roles    boolean     NOT NULL DEFAULT false,
  custom_branding     boolean     NOT NULL DEFAULT false,
  -- Limits
  max_departments     int         NOT NULL DEFAULT 10,
  max_admin_users     int         NOT NULL DEFAULT 3,
  created_at          timestamptz NOT NULL DEFAULT now(),
  updated_at          timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_company_access_company ON company_access_controls(company_id);

DROP TRIGGER IF EXISTS trg_company_access_updated_at ON company_access_controls;
CREATE TRIGGER trg_company_access_updated_at
  BEFORE UPDATE ON company_access_controls
  FOR EACH ROW EXECUTE PROCEDURE set_updated_at();

-- ────────────────────────────────────────────────────────────
--  STEP 7: ROW LEVEL SECURITY
-- ────────────────────────────────────────────────────────────
ALTER TABLE employees               ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_access_controls ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "allow_all_employees"      ON employees;
DROP POLICY IF EXISTS "allow_all_company_access" ON company_access_controls;

CREATE POLICY "allow_all_employees"
  ON employees FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "allow_all_company_access"
  ON company_access_controls FOR ALL USING (true) WITH CHECK (true);

-- ────────────────────────────────────────────────────────────
--  STEP 8: AUTO-CREATE ACCESS ROW WHEN COMPANY IS CREATED
-- ────────────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION create_default_company_access()
RETURNS TRIGGER LANGUAGE plpgsql SECURITY DEFINER AS $$
BEGIN
  INSERT INTO company_access_controls (company_id)
  VALUES (NEW.id)
  ON CONFLICT (company_id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_company_access_init ON companies;
CREATE TRIGGER trg_company_access_init
  AFTER INSERT ON companies
  FOR EACH ROW EXECUTE PROCEDURE create_default_company_access();

-- ────────────────────────────────────────────────────────────
--  STEP 9: BACKFILL — existing companies get a default access row
-- ────────────────────────────────────────────────────────────
INSERT INTO company_access_controls (company_id)
SELECT id FROM companies
ON CONFLICT (company_id) DO NOTHING;
