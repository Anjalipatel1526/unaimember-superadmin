-- DYNAMIC SEED DATA FOR STORY SEED STUDIO
-- Run this entire script in your Supabase SQL Editor.
-- It will automatically find the company, detect its UUID and table names, and seed employee credentials.

DO $$
DECLARE
  co_id UUID;
  co_name TEXT;
  clean_name TEXT;
  short_id TEXT;
  emp_table TEXT;
  att_table TEXT;
  lr_table TEXT;
  dept_table TEXT;

  -- Record presence checks
  att_exists BOOLEAN;
  lr_exists1 BOOLEAN;
  lr_exists2 BOOLEAN;

  hr_emp_id UUID := '88888888-8888-4888-8888-888888888888';
  mgr_emp_id UUID := '77777777-7777-4777-7777-777777777777';
  eng_emp_id UUID := '11111111-1111-4111-1111-111111111111';
BEGIN
  -- 1. Check if Story Seed Studio exists; if not, insert it
  SELECT id, name INTO co_id, co_name 
  FROM public.companies 
  WHERE name ILIKE '%story%seed%' 
  LIMIT 1;

  IF co_id IS NULL THEN
    INSERT INTO public.companies (name, email, status, payment_status, plan)
    VALUES ('Story Seed Studio', 'admin@storyseed.com', 'Active', 'Paid', 'Enterprise')
    RETURNING id, name INTO co_id, co_name;
  END IF;

  -- 2. Insert or update Company Credentials
  INSERT INTO public.company_credentials (company_id, login_email, login_password, role, is_active)
  VALUES (co_id, 'admin@storyseed.com', 'password123', 'company_admin', true)
  ON CONFLICT (company_id) DO UPDATE SET login_password = EXCLUDED.login_password;

  -- 3. Resolve table name prefix using trigger logic
  clean_name := lower(regexp_replace(co_name, '[^a-zA-Z0-9\s]', '', 'g'));
  clean_name := regexp_replace(clean_name, '\s+', '_', 'g');
  short_id := split_part(co_id::text, '-', 1);
  
  dept_table := format('company_%s_%s_departments', clean_name, short_id);
  emp_table := format('company_%s_%s_employees', clean_name, short_id);
  att_table := format('company_%s_%s_attendance', clean_name, short_id);
  lr_table := format('company_%s_%s_leave_requests', clean_name, short_id);

  RAISE NOTICE 'Resolved Employee Table: %', emp_table;

  -- 4. Insert default departments
  EXECUTE format('
    INSERT INTO %I (name, company_id) VALUES 
    (''Human Resources'', $1), 
    (''Engineering'', $1)
    ON CONFLICT DO NOTHING;
  ', dept_table) USING co_id;

  -- 5. Insert HR Manager Employee (Credentials: hr@storyseed.com / password123)
  EXECUTE format('
    INSERT INTO %I (id, company_id, first_name, last_name, phone, designation, joining_date, basic_salary, is_active, pf_number)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    ON CONFLICT (id) DO NOTHING;
  ', emp_table) USING 
    hr_emp_id, co_id, 'Anjali', 'Patel', '9876543210', 'HR Manager', '2024-01-15'::DATE, 75000, true, 
    '{"email":"hr@storyseed.com","password":"password123","department":"Human Resources","employment_type":"Full-Time","status":"Active","date_of_birth":"1995-05-10","address":"Mumbai, India"}';

  -- 6. Insert Manager Employee (Credentials: manager@storyseed.com / password123)
  EXECUTE format('
    INSERT INTO %I (id, company_id, first_name, last_name, phone, designation, joining_date, basic_salary, is_active, pf_number)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    ON CONFLICT (id) DO NOTHING;
  ', emp_table) USING 
    mgr_emp_id, co_id, 'Vikram', 'Singh', '9876543211', 'Manager', '2024-01-20'::DATE, 90000, true, 
    '{"email":"manager@storyseed.com","password":"password123","department":"Engineering","employment_type":"Full-Time","status":"Active","date_of_birth":"1992-12-05","address":"Delhi, India"}';

  -- 7. Insert Sample Software Engineer (Credentials: rohan@storyseed.com / password123)
  EXECUTE format('
    INSERT INTO %I (id, company_id, first_name, last_name, phone, designation, joining_date, basic_salary, is_active, pf_number)
    VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
    ON CONFLICT (id) DO NOTHING;
  ', emp_table) USING 
    eng_emp_id, co_id, 'Rohan', 'Sharma', '9876543212', 'Software Engineer', '2024-02-01'::DATE, 60000, true, 
    '{"email":"rohan@storyseed.com","password":"password123","department":"Engineering","employment_type":"Full-Time","status":"Active","date_of_birth":"1998-03-22","address":"Bangalore, India"}';

  -- 8. Seed Attendance Logs
  EXECUTE format('
    SELECT EXISTS (
      SELECT 1 FROM %I WHERE employee_id = $1 AND date = CURRENT_DATE
    )
  ', att_table) INTO att_exists USING eng_emp_id;

  IF NOT att_exists THEN
    EXECUTE format('
      INSERT INTO %I (company_id, employee_id, date, status, check_in, check_out, total_hours)
      VALUES ($1, $2, CURRENT_DATE, $3, $4, $5, $6)
    ', att_table) USING 
      co_id, eng_emp_id, 'PRESENT', '09:00:00'::TIME, '18:00:00'::TIME, 9.0;
  END IF;

  -- 9. Seed Leave Request 1 (Pending)
  EXECUTE format('
    SELECT EXISTS (
      SELECT 1 FROM %I WHERE employee_id = $1 AND start_date = CURRENT_DATE + INTERVAL ''2 day''
    )
  ', lr_table) INTO lr_exists1 USING eng_emp_id;

  IF NOT lr_exists1 THEN
    EXECUTE format('
      INSERT INTO %I (company_id, employee_id, leave_type, start_date, end_date, reason, status)
      VALUES ($1, $2, $3, CURRENT_DATE + INTERVAL ''2 day'', CURRENT_DATE + INTERVAL ''3 day'', $4, $5)
    ', lr_table) USING 
      co_id, eng_emp_id, 'Casual Leave', 'Family function', 'Pending';
  END IF;

  -- 10. Seed Leave Request 2 (Approved)
  EXECUTE format('
    SELECT EXISTS (
      SELECT 1 FROM %I WHERE employee_id = $1 AND start_date = CURRENT_DATE - INTERVAL ''5 day''
    )
  ', lr_table) INTO lr_exists2 USING eng_emp_id;

  IF NOT lr_exists2 THEN
    EXECUTE format('
      INSERT INTO %I (company_id, employee_id, leave_type, start_date, end_date, reason, status)
      VALUES ($1, $2, $3, CURRENT_DATE - INTERVAL ''5 day'', CURRENT_DATE - INTERVAL ''4 day'', $4, $5)
    ', lr_table) USING 
      co_id, eng_emp_id, 'Sick Leave', 'Fever', 'Approved';
  END IF;

END$$;
