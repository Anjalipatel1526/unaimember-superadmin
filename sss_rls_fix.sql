-- ============================================================
-- SSS Admin & Employee Dashboard — RLS Permissions Fix
-- Run this in Supabase SQL Editor:
-- https://supabase.com/dashboard/project/nchqkbabvzhedzyomefu/sql
-- ============================================================

-- 1. Enable RLS on all tables (if not already enabled)
ALTER TABLE employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE leave_requests ENABLE ROW LEVEL SECURITY;

-- 2. EMPLOYEES policies
DROP POLICY IF EXISTS "sss_admin_select_employees" ON employees;
CREATE POLICY "sss_admin_select_employees" ON employees FOR SELECT USING (true);

DROP POLICY IF EXISTS "sss_admin_insert_employees" ON employees;
CREATE POLICY "sss_admin_insert_employees" ON employees FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "sss_admin_update_employees" ON employees;
CREATE POLICY "sss_admin_update_employees" ON employees FOR UPDATE USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "sss_admin_delete_employees" ON employees;
CREATE POLICY "sss_admin_delete_employees" ON employees FOR DELETE USING (true);


-- 3. ATTENDANCE policies
DROP POLICY IF EXISTS "sss_admin_select_attendance" ON attendance;
CREATE POLICY "sss_admin_select_attendance" ON attendance FOR SELECT USING (true);

DROP POLICY IF EXISTS "sss_admin_insert_attendance" ON attendance;
CREATE POLICY "sss_admin_insert_attendance" ON attendance FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "sss_admin_update_attendance" ON attendance;
CREATE POLICY "sss_admin_update_attendance" ON attendance FOR UPDATE USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "sss_admin_delete_attendance" ON attendance;
CREATE POLICY "sss_admin_delete_attendance" ON attendance FOR DELETE USING (true);


-- 4. LEAVE_REQUESTS policies
DROP POLICY IF EXISTS "sss_admin_select_leave_requests" ON leave_requests;
CREATE POLICY "sss_admin_select_leave_requests" ON leave_requests FOR SELECT USING (true);

DROP POLICY IF EXISTS "sss_admin_insert_leave_requests" ON leave_requests;
CREATE POLICY "sss_admin_insert_leave_requests" ON leave_requests FOR INSERT WITH CHECK (true);

DROP POLICY IF EXISTS "sss_admin_update_leave_requests" ON leave_requests;
CREATE POLICY "sss_admin_update_leave_requests" ON leave_requests FOR UPDATE USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "sss_admin_delete_leave_requests" ON leave_requests;
CREATE POLICY "sss_admin_delete_leave_requests" ON leave_requests FOR DELETE USING (true);


-- 5. DAILY_REPORTS policies
ALTER TABLE daily_reports ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow_all_daily_reports" ON daily_reports;
CREATE POLICY "allow_all_daily_reports" ON daily_reports FOR ALL USING (true) WITH CHECK (true);


-- 6. NOTIFICATIONS policies and columns
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS priority text DEFAULT 'Medium';
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS attachment_url text;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS attachment_name text;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS scheduled_for timestamptz;
ALTER TABLE notifications ADD COLUMN IF NOT EXISTS is_archived boolean DEFAULT false;

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "allow_all_notifications" ON notifications;
CREATE POLICY "allow_all_notifications" ON notifications FOR ALL USING (true) WITH CHECK (true);
