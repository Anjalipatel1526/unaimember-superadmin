-- MASTER DATABASE SETUP FOR SUPABASE
-- Run this script in a brand new SQL editor tab to recreate all tables and triggers with all features.

-- 1. Create schemas, extensions, and types
CREATE SCHEMA IF NOT EXISTS extensions;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp" SCHEMA extensions;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ticket_priority') THEN
    CREATE TYPE public.ticket_priority AS ENUM ('Low', 'Medium', 'High', 'Critical');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'ticket_status') THEN
    CREATE TYPE public.ticket_status AS ENUM ('Open', 'In Progress', 'Resolved', 'Closed');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'plan_name') THEN
    CREATE TYPE public.plan_name AS ENUM ('Basic', 'Professional', 'Enterprise');
  END IF;
END$$;

-- 2. Create helper functions for triggers
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.audit_log_entry()
RETURNS TRIGGER AS $$
BEGIN
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.update_leave_balance()
RETURNS TRIGGER AS $$
BEGIN
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION public.init_employee_leave_balances()
RETURNS TRIGGER AS $$
BEGIN
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Create Companies Table
CREATE TABLE IF NOT EXISTS public.companies (
  id uuid NOT NULL DEFAULT gen_random_uuid (),
  name text NOT NULL,
  logo_url text NULL,
  industry text NULL,
  gst_number text NULL,
  plan text NULL DEFAULT 'starter'::text,
  is_active boolean NULL DEFAULT true,
  financial_year_start date NULL,
  created_at timestamp with time zone NULL DEFAULT now(),
  email text NULL,
  phone text NULL,
  address text NULL,
  payment_status text NOT NULL DEFAULT 'Pending'::text,
  trial_expiry date NULL,
  payroll_enabled boolean NOT NULL DEFAULT false,
  performance_enabled boolean NOT NULL DEFAULT false,
  employee_count integer NOT NULL DEFAULT 0,
  employee_limit integer NOT NULL DEFAULT 50,
  status text NOT NULL DEFAULT 'Active'::text,
  updated_at timestamp with time zone NULL DEFAULT now(),
  CONSTRAINT companies_pkey PRIMARY KEY (id)
);

DROP TRIGGER IF EXISTS trg_companies_updated_at ON public.companies;
CREATE TRIGGER trg_companies_updated_at BEFORE
UPDATE ON public.companies FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at ();

-- 4. Create Users Table
CREATE TABLE IF NOT EXISTS public.users (
  id uuid NOT NULL,
  company_id uuid NULL,
  role text NOT NULL,
  full_name text NULL,
  email text NULL,
  is_active boolean NULL DEFAULT true,
  created_at timestamp with time zone NULL DEFAULT now(),
  CONSTRAINT users_pkey PRIMARY KEY (id),
  CONSTRAINT users_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies (id) ON DELETE CASCADE,
  CONSTRAINT users_id_fkey FOREIGN KEY (id) REFERENCES auth.users (id) ON DELETE CASCADE,
  CONSTRAINT users_role_check CHECK (
    role = ANY (
      ARRAY[
        'SUPER_ADMIN'::text,
        'COMPANY_OWNER'::text,
        'ACCOUNTANT'::text,
        'HR_MANAGER'::text,
        'HR_OFFICER'::text,
        'EMPLOYEE'::text
      ]
    )
  )
);

-- 5. Create Company Credentials Table
CREATE TABLE IF NOT EXISTS public.company_credentials (
  id uuid NOT NULL DEFAULT gen_random_uuid (),
  company_id uuid NOT NULL,
  auth_user_id uuid NULL,
  login_email text NOT NULL,
  role text NOT NULL DEFAULT 'company_admin'::text,
  is_active boolean NOT NULL DEFAULT true,
  last_login_at timestamp with time zone NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  login_password text NOT NULL DEFAULT ''::text,
  CONSTRAINT company_credentials_pkey PRIMARY KEY (id),
  CONSTRAINT company_credentials_company_id_key UNIQUE (company_id),
  CONSTRAINT company_credentials_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies (id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS idx_company_credentials_company ON public.company_credentials USING btree (company_id);
CREATE INDEX IF NOT EXISTS idx_company_credentials_email ON public.company_credentials USING btree (login_email);

DROP TRIGGER IF EXISTS trg_company_credentials_updated_at ON public.company_credentials;
CREATE TRIGGER trg_company_credentials_updated_at BEFORE
UPDATE ON public.company_credentials FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at ();

-- 6. Create Departments Table
CREATE TABLE IF NOT EXISTS public.departments (
  id uuid NOT NULL DEFAULT gen_random_uuid (),
  company_id uuid NULL,
  name text NOT NULL,
  created_at timestamp with time zone NULL DEFAULT now(),
  CONSTRAINT departments_pkey PRIMARY KEY (id),
  CONSTRAINT departments_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies (id) ON DELETE CASCADE
);

-- 7. Create Base Employees Table
CREATE TABLE IF NOT EXISTS public.employees (
  id uuid NOT NULL DEFAULT gen_random_uuid (),
  user_id uuid NULL,
  company_id uuid NULL,
  first_name text NOT NULL,
  last_name text NOT NULL,
  phone text NULL,
  joining_date date NULL,
  designation text NULL,
  department_id uuid NULL,
  reporting_manager_id uuid NULL,
  basic_salary numeric(12, 2) NULL,
  bank_account text NULL,
  bank_ifsc text NULL,
  pan_number text NULL,
  pf_number text NULL,
  is_active boolean NULL DEFAULT true,
  created_at timestamp with time zone NULL DEFAULT now(),
  CONSTRAINT employees_pkey PRIMARY KEY (id),
  CONSTRAINT employees_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies (id) ON DELETE CASCADE,
  CONSTRAINT employees_department_id_fkey FOREIGN KEY (department_id) REFERENCES public.departments (id) ON DELETE SET NULL,
  CONSTRAINT employees_reporting_manager_id_fkey FOREIGN KEY (reporting_manager_id) REFERENCES public.employees (id) ON DELETE SET NULL,
  CONSTRAINT employees_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users (id) ON DELETE CASCADE
);

DROP TRIGGER IF EXISTS audit_employees ON public.employees;
CREATE TRIGGER audit_employees
AFTER INSERT OR DELETE OR UPDATE ON public.employees FOR EACH ROW
EXECUTE FUNCTION public.audit_log_entry ();

DROP TRIGGER IF EXISTS on_employee_inserted ON public.employees;
CREATE TRIGGER on_employee_inserted
AFTER INSERT ON public.employees FOR EACH ROW
EXECUTE FUNCTION public.init_employee_leave_balances ();

-- 8. Create Base Attendance Table
CREATE TABLE IF NOT EXISTS public.attendance (
  id uuid NOT NULL DEFAULT gen_random_uuid (),
  employee_id uuid NULL,
  company_id uuid NULL,
  date date NOT NULL,
  clock_in timestamp with time zone NULL,
  clock_out timestamp with time zone NULL,
  status text NULL DEFAULT 'PRESENT'::text,
  is_manual_correction boolean NULL DEFAULT false,
  corrected_by uuid NULL,
  CONSTRAINT attendance_pkey PRIMARY KEY (id),
  CONSTRAINT attendance_employee_id_date_key UNIQUE (employee_id, date),
  CONSTRAINT attendance_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies (id) ON DELETE CASCADE,
  CONSTRAINT attendance_corrected_by_fkey FOREIGN KEY (corrected_by) REFERENCES public.users (id) ON DELETE SET NULL,
  CONSTRAINT attendance_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees (id) ON DELETE CASCADE
);

-- 9. Create Base Leave Requests Table
CREATE TABLE IF NOT EXISTS public.leave_requests (
  id uuid NOT NULL DEFAULT gen_random_uuid (),
  employee_id uuid NULL,
  company_id uuid NULL,
  leave_type text NOT NULL,
  from_date date NOT NULL,
  to_date date NOT NULL,
  total_days integer NULL,
  reason text NULL,
  status text NULL DEFAULT 'PENDING'::text,
  approved_by uuid NULL,
  rejected_reason text NULL,
  created_at timestamp with time zone NULL DEFAULT now(),
  CONSTRAINT leave_requests_pkey PRIMARY KEY (id),
  CONSTRAINT leave_requests_approved_by_fkey FOREIGN KEY (approved_by) REFERENCES public.users (id) ON DELETE SET NULL,
  CONSTRAINT leave_requests_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies (id) ON DELETE CASCADE,
  CONSTRAINT leave_requests_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees (id) ON DELETE CASCADE,
  CONSTRAINT leave_requests_status_check CHECK (
    status = ANY (ARRAY['PENDING'::text, 'APPROVED'::text, 'REJECTED'::text])
  )
);

DROP TRIGGER IF EXISTS on_leave_request_approved ON public.leave_requests;
CREATE TRIGGER on_leave_request_approved
AFTER UPDATE ON public.leave_requests FOR EACH ROW
EXECUTE FUNCTION public.update_leave_balance ();

-- 10. Create Leave Balances Table
CREATE TABLE IF NOT EXISTS public.leave_balances (
  id uuid NOT NULL DEFAULT gen_random_uuid (),
  employee_id uuid NULL,
  company_id uuid NULL,
  leave_type text NOT NULL,
  total_days integer not null,
  used_days integer NULL DEFAULT 0,
  remaining_days integer NULL,
  year integer NOT NULL,
  CONSTRAINT leave_balances_pkey PRIMARY KEY (id),
  CONSTRAINT leave_balances_employee_id_leave_type_year_key UNIQUE (employee_id, leave_type, year),
  CONSTRAINT leave_balances_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies (id) ON DELETE CASCADE,
  CONSTRAINT leave_balances_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees (id) ON DELETE CASCADE
);

-- 11. Create Documents Table
CREATE TABLE IF NOT EXISTS public.documents (
  id uuid NOT NULL DEFAULT gen_random_uuid (),
  employee_id uuid NULL,
  company_id uuid NULL,
  document_type text not null,
  storage_path text not null,
  status text NULL DEFAULT 'PENDING'::text,
  confidence_score numeric(4, 3) NULL,
  fail_reasons text[] NULL,
  extracted_fields jsonb NULL,
  reviewed_by uuid NULL,
  override_comment text NULL,
  created_at timestamp with time zone NULL DEFAULT now(),
  CONSTRAINT documents_pkey PRIMARY KEY (id),
  CONSTRAINT documents_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies (id) ON DELETE CASCADE,
  CONSTRAINT documents_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees (id) ON DELETE CASCADE,
  CONSTRAINT documents_reviewed_by_fkey FOREIGN KEY (reviewed_by) REFERENCES public.users (id) ON DELETE SET NULL,
  CONSTRAINT documents_status_check CHECK (
    status = ANY (ARRAY['PENDING'::text, 'APPROVED'::text, 'REJECTED'::text, 'MANUAL_REVIEW'::text])
  )
);

-- 12. Create Daily Reports Table
CREATE TABLE IF NOT EXISTS public.daily_reports (
  id uuid NOT NULL DEFAULT gen_random_uuid (),
  employee_id uuid NULL,
  company_id uuid NULL,
  report_date date NOT NULL,
  description text NOT NULL,
  tags text[] NULL,
  submitted_at timestamp with time zone NULL DEFAULT now(),
  CONSTRAINT daily_reports_pkey PRIMARY KEY (id),
  CONSTRAINT daily_reports_employee_id_report_date_key UNIQUE (employee_id, report_date),
  CONSTRAINT daily_reports_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies (id) ON DELETE CASCADE,
  CONSTRAINT daily_reports_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees (id) ON DELETE CASCADE
);

-- 13. Create Performance Table
CREATE TABLE IF NOT EXISTS public.performance (
  id uuid NOT NULL DEFAULT gen_random_uuid (),
  employee_id uuid NULL,
  company_id uuid NULL,
  reviewer_id uuid NULL,
  score numeric(4, 2) NULL,
  level text NULL,
  notes text NULL,
  review_date date NULL,
  created_at timestamp with time zone NULL DEFAULT now(),
  CONSTRAINT performance_pkey PRIMARY KEY (id),
  CONSTRAINT performance_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies (id) ON DELETE CASCADE,
  CONSTRAINT performance_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees (id) ON DELETE CASCADE,
  CONSTRAINT performance_reviewer_id_fkey FOREIGN KEY (reviewer_id) REFERENCES public.users (id) ON DELETE SET NULL,
  CONSTRAINT performance_level_check CHECK (
    level = ANY (ARRAY['BRONZE'::text, 'SILVER'::text, 'GOLD'::text, 'PLATINUM'::text])
  )
);

-- 14. Create Payroll Table
CREATE TABLE IF NOT EXISTS public.payroll (
  id uuid NOT NULL DEFAULT gen_random_uuid (),
  employee_id uuid NULL,
  company_id uuid NULL,
  month text NOT NULL,
  basic numeric(12, 2) NULL,
  hra numeric(12, 2) NULL,
  allowances numeric(12, 2) NULL,
  gross numeric(12, 2) NULL,
  pf_employee numeric(12, 2) NULL,
  pf_employer numeric(12, 2) NULL,
  tds numeric(12, 2) NULL,
  other_deductions numeric(12, 2) NULL,
  total_deductions numeric(12, 2) NULL,
  net_salary numeric(12, 2) NULL,
  payslip_path text NULL,
  status text NULL DEFAULT 'PROCESSED'::text,
  processed_by uuid NULL,
  processed_at timestamp with time zone NULL,
  CONSTRAINT payroll_pkey PRIMARY KEY (id),
  CONSTRAINT payroll_employee_id_month_key UNIQUE (employee_id, month),
  CONSTRAINT payroll_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies (id) ON DELETE CASCADE,
  CONSTRAINT payroll_employee_id_fkey FOREIGN KEY (employee_id) REFERENCES public.employees (id) ON DELETE CASCADE,
  CONSTRAINT payroll_processed_by_fkey FOREIGN KEY (processed_by) REFERENCES public.users (id) ON DELETE SET NULL
);

DROP TRIGGER IF EXISTS audit_payroll ON public.payroll;
CREATE TRIGGER audit_payroll
AFTER INSERT OR DELETE OR UPDATE ON public.payroll FOR EACH ROW
EXECUTE FUNCTION public.audit_log_entry ();

-- 15. Create Notifications Table
CREATE TABLE IF NOT EXISTS public.notifications (
  id uuid NOT NULL DEFAULT gen_random_uuid (),
  user_id uuid NULL,
  company_id uuid NULL,
  type text NOT NULL,
  title text NOT NULL,
  body text not null,
  is_read boolean NULL DEFAULT false,
  created_at timestamp with time zone NULL DEFAULT now(),
  CONSTRAINT notifications_pkey PRIMARY KEY (id),
  CONSTRAINT notifications_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies (id) ON DELETE CASCADE,
  CONSTRAINT notifications_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users (id) ON DELETE CASCADE
);

-- 16. Create Audit Logs Table
CREATE TABLE IF NOT EXISTS public.audit_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid (),
  user_id uuid NULL,
  company_id uuid NULL,
  action text NOT NULL,
  table_name text NOT NULL,
  row_id uuid NULL,
  old_data jsonb NULL,
  new_data jsonb NULL,
  ip_address text NULL,
  created_at timestamp with time zone NULL DEFAULT now(),
  CONSTRAINT audit_logs_pkey PRIMARY KEY (id),
  CONSTRAINT audit_logs_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies (id) ON DELETE CASCADE,
  CONSTRAINT audit_logs_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users (id) ON DELETE CASCADE
);

-- 17. Create Support Tickets Table
CREATE TABLE IF NOT EXISTS public.support_tickets (
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4 (),
  ticket_number text NOT NULL,
  company_id uuid NOT NULL,
  subject text NOT NULL,
  priority public.ticket_priority NOT NULL DEFAULT 'Medium'::ticket_priority,
  status public.ticket_status NOT NULL DEFAULT 'Open'::ticket_status,
  assigned_agent text NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT support_tickets_pkey PRIMARY KEY (id),
  CONSTRAINT support_tickets_ticket_number_key UNIQUE (ticket_number),
  CONSTRAINT support_tickets_company_id_fkey FOREIGN KEY (company_id) REFERENCES public.companies (id) ON DELETE CASCADE
);

DROP TRIGGER IF EXISTS trg_support_tickets_updated_at ON public.support_tickets;
CREATE TRIGGER trg_support_tickets_updated_at BEFORE
UPDATE ON public.support_tickets FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at ();

-- 18. Create Ticket Messages Table
CREATE TABLE IF NOT EXISTS public.ticket_messages (
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4 (),
  ticket_id uuid NOT NULL,
  sender_name text NOT NULL,
  sender_role text NOT NULL DEFAULT 'client'::text,
  body text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT ticket_messages_pkey PRIMARY KEY (id),
  CONSTRAINT ticket_messages_ticket_id_fkey FOREIGN KEY (ticket_id) REFERENCES public.support_tickets (id) ON DELETE CASCADE
);

-- 19. Create System Metrics Table
CREATE TABLE IF NOT EXISTS public.system_metrics (
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4 (),
  server_status text NOT NULL DEFAULT 'Online'::text,
  api_response_ms integer NOT NULL DEFAULT 0,
  active_sessions integer NOT NULL DEFAULT 0,
  error_count_24h integer NOT NULL DEFAULT 0,
  cpu_load numeric(5, 2) NOT NULL DEFAULT 0,
  recorded_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT system_metrics_pkey PRIMARY KEY (id)
);

-- 20. Create Subscription Plans Table
CREATE TABLE IF NOT EXISTS public.subscription_plans (
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4 (),
  name public.plan_name NOT NULL,
  price numeric(10, 2) NOT NULL,
  employee_limit integer NULL,
  storage_gb integer NOT NULL,
  support_level text NOT NULL,
  features text[] NOT NULL DEFAULT '{}'::text[],
  enabled boolean NOT NULL DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT subscription_plans_pkey PRIMARY KEY (id),
  CONSTRAINT subscription_plans_name_key UNIQUE (name)
);

DROP TRIGGER IF EXISTS trg_subscription_plans_updated_at ON public.subscription_plans;
CREATE TRIGGER trg_subscription_plans_updated_at BEFORE
UPDATE ON public.subscription_plans FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at ();

-- 21. Create Revenue Snapshots Table
CREATE TABLE IF NOT EXISTS public.revenue_snapshots (
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4 (),
  month date NOT NULL,
  mrr numeric(12, 2) NOT NULL DEFAULT 0,
  new_companies integer NOT NULL DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT revenue_snapshots_pkey PRIMARY KEY (id),
  CONSTRAINT revenue_snapshots_month_key UNIQUE (month)
);

-- 22. Create Features Table
CREATE TABLE IF NOT EXISTS public.features (
  id uuid NOT NULL DEFAULT extensions.uuid_generate_v4 (),
  key text NOT NULL,
  title text NOT NULL,
  description text NULL,
  enabled boolean NOT NULL DEFAULT true,
  usage_count integer NOT NULL DEFAULT 0,
  icon text NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT features_pkey PRIMARY KEY (id),
  CONSTRAINT features_key_key UNIQUE (key)
);

DROP TRIGGER IF EXISTS trg_features_updated_at ON public.features;
CREATE TRIGGER trg_features_updated_at BEFORE
UPDATE ON public.features FOR EACH ROW
EXECUTE FUNCTION public.set_updated_at ();

-- 23. Create SSS Tasks Table
CREATE TABLE IF NOT EXISTS public.sss_tasks (
  id uuid NOT NULL DEFAULT gen_random_uuid (),
  company_id uuid NOT NULL REFERENCES public.companies(id) ON DELETE CASCADE,
  task_title text NOT NULL,
  task_description text NULL,
  department_id uuid NULL,
  project_name text NULL,
  priority text NULL DEFAULT 'Medium'::text,
  category text NULL,
  start_date date NULL,
  due_date date NULL,
  estimated_hours numeric NULL,
  instructions text NULL,
  status text NULL DEFAULT 'Pending'::text,
  completion_pct integer NULL DEFAULT 0,
  created_by text NULL DEFAULT 'Manager'::text,
  assigned_date timestamp with time zone NULL DEFAULT now(),
  last_updated timestamp with time zone NULL DEFAULT now(),
  remarks text NULL,
  reference_docs text[] NULL,
  created_at timestamp with time zone NULL DEFAULT now(),
  CONSTRAINT sss_tasks_pkey PRIMARY KEY (id)
);

-- 24. Create SSS Task Assignments Table
CREATE TABLE IF NOT EXISTS public.sss_task_assignments (
  id uuid NOT NULL DEFAULT gen_random_uuid (),
  task_id uuid NULL REFERENCES public.sss_tasks(id) ON DELETE CASCADE,
  employee_id uuid NULL,
  assigned_at timestamp with time zone NULL DEFAULT now(),
  CONSTRAINT sss_task_assignments_pkey PRIMARY KEY (id)
);

-- 25. Create SSS Task Progress Table
CREATE TABLE IF NOT EXISTS public.sss_task_progress (
  id uuid NOT NULL DEFAULT gen_random_uuid (),
  task_id uuid NULL REFERENCES public.sss_tasks(id) ON DELETE CASCADE,
  employee_id uuid NULL,
  progress_pct integer NULL DEFAULT 0,
  note text NULL,
  status text NULL,
  created_at timestamp with time zone NULL DEFAULT now(),
  CONSTRAINT sss_task_progress_pkey PRIMARY KEY (id)
);

-- 26. Create SSS Task Feedback Table
CREATE TABLE IF NOT EXISTS public.sss_task_feedback (
  id uuid NOT NULL DEFAULT gen_random_uuid (),
  task_id uuid NULL REFERENCES public.sss_tasks(id) ON DELETE CASCADE,
  employee_id uuid NULL,
  completion_date date NULL,
  hours_worked numeric NULL,
  work_summary text NULL,
  challenges text NULL,
  suggestions text NULL,
  lessons_learned text NULL,
  additional_notes text NULL,
  file_urls text[] NULL,
  submitted_at timestamp with time zone NULL DEFAULT now(),
  CONSTRAINT sss_task_feedback_pkey PRIMARY KEY (id)
);

-- 27. Create SSS Task Reviews Table
CREATE TABLE IF NOT EXISTS public.sss_task_reviews (
  id uuid NOT NULL DEFAULT gen_random_uuid (),
  task_id uuid NULL REFERENCES public.sss_tasks(id) ON DELETE CASCADE,
  reviewed_by text NULL DEFAULT 'Manager'::text,
  decision text NULL,
  manager_comments text NULL,
  employee_rating integer NULL,
  reviewed_at timestamp with time zone NULL DEFAULT now(),
  CONSTRAINT sss_task_reviews_pkey PRIMARY KEY (id)
);


-- 28. DYNAMIC TENANT TABLES PROVISIONING TRIGGER (WITH COMPANY NAME IN TABLE NAMES)
CREATE OR REPLACE FUNCTION public.create_tenant_tables()
RETURNS TRIGGER AS $$
DECLARE
  clean_name TEXT;
  short_id TEXT;
  prefix TEXT;
BEGIN
  -- Clean the company name: lowercase, remove non-alphanumeric, replace spaces with underscores
  clean_name := lower(regexp_replace(NEW.name, '[^a-zA-Z0-9\s]', '', 'g'));
  clean_name := regexp_replace(clean_name, '\s+', '_', 'g');
  
  -- Extract first segment of UUID (first 8 characters)
  short_id := split_part(NEW.id::text, '-', 1);
  
  -- Define Prefix: company_[clean_name]_[short_id]
  prefix := 'company_' || clean_name || '_' || short_id;

  -- Create company-specific Employees table
  EXECUTE format('
    CREATE TABLE IF NOT EXISTS public.%I_employees (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      phone TEXT,
      designation TEXT,
      joining_date DATE,
      basic_salary NUMERIC,
      is_active BOOLEAN DEFAULT true,
      pf_number TEXT,
      created_at TIMESTAMPTZ DEFAULT now()
    );
  ', prefix);

  -- Create company-specific Attendance table
  EXECUTE format('
    CREATE TABLE IF NOT EXISTS public.%I_attendance (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
      employee_id UUID,
      date DATE NOT NULL,
      status TEXT,
      check_in TIME,
      check_out TIME,
      total_hours NUMERIC,
      remarks TEXT,
      created_at TIMESTAMPTZ DEFAULT now()
    );
  ', prefix);

  -- Create company-specific Leave Requests table
  EXECUTE format('
    CREATE TABLE IF NOT EXISTS public.%I_leave_requests (
      id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
      employee_id UUID,
      leave_type TEXT,
      start_date DATE NOT NULL,
      end_date DATE NOT NULL,
      reason TEXT,
      status TEXT DEFAULT %L,
      created_at TIMESTAMPTZ DEFAULT now()
    );
  ', prefix, 'Pending');

  -- IMPORTANT: Notify PostgREST to reload its schema cache
  NOTIFY pgrst, 'reload schema';

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Recreate the company trigger
DROP TRIGGER IF EXISTS trigger_create_tenant_tables ON public.companies;
CREATE TRIGGER trigger_create_tenant_tables
AFTER INSERT ON public.companies
FOR EACH ROW
EXECUTE FUNCTION public.create_tenant_tables();

-- 29. RUN MIGRATION LOOP FOR EXISTING COMPANIES
DO $$
DECLARE
  comp RECORD;
  clean_name TEXT;
  short_id TEXT;
  prefix TEXT;
BEGIN
  FOR comp IN SELECT id, name FROM public.companies LOOP
    clean_name := lower(regexp_replace(comp.name, '[^a-zA-Z0-9\s]', '', 'g'));
    clean_name := regexp_replace(clean_name, '\s+', '_', 'g');
    short_id := split_part(comp.id::text, '-', 1);
    prefix := 'company_' || clean_name || '_' || short_id;
    
    -- Create Employees table
    EXECUTE format('
      CREATE TABLE IF NOT EXISTS public.%I_employees (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
        first_name TEXT NOT NULL,
        last_name TEXT NOT NULL,
        phone TEXT,
        designation TEXT,
        joining_date DATE,
        basic_salary NUMERIC,
        is_active BOOLEAN DEFAULT true,
        pf_number TEXT,
        created_at TIMESTAMPTZ DEFAULT now()
      );
    ', prefix);

    -- Create Attendance table
    EXECUTE format('
      CREATE TABLE IF NOT EXISTS public.%I_attendance (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
        employee_id UUID,
        date DATE NOT NULL,
        status TEXT,
        check_in TIME,
        check_out TIME,
        total_hours NUMERIC,
        remarks TEXT,
        created_at TIMESTAMPTZ DEFAULT now()
      );
    ', prefix);

    -- Create Leave Requests table
    EXECUTE format('
      CREATE TABLE IF NOT EXISTS public.%I_leave_requests (
        id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        company_id UUID REFERENCES public.companies(id) ON DELETE CASCADE,
        employee_id UUID,
        leave_type TEXT,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        reason TEXT,
        status TEXT DEFAULT %L,
        created_at TIMESTAMPTZ DEFAULT now()
      );
    ', prefix, 'Pending');
  END LOOP;
END;
$$;
