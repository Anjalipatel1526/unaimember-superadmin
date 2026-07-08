-- RUN THIS SCRIPT IN SUPABASE SQL EDITOR TO CREATE TABLES FOR ALL EXISTING COMPANIES
DO $$
DECLARE
  comp RECORD;
  clean_id TEXT;
BEGIN
  FOR comp IN SELECT id FROM public.companies LOOP
    clean_id := replace(comp.id::text, '-', '_');
    
    -- Create Employees table
    EXECUTE format('
      CREATE TABLE IF NOT EXISTS public.company_%s_employees (
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
    ', clean_id);

    -- Create Attendance table
    EXECUTE format('
      CREATE TABLE IF NOT EXISTS public.company_%s_attendance (
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
    ', clean_id);

    -- Create Leave Requests table
    EXECUTE format('
      CREATE TABLE IF NOT EXISTS public.company_%s_leave_requests (
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
    ', clean_id, 'Pending');
  END LOOP;
END;
$$;
