import { supabase } from './supabase';

// ── Get all employees for a specific company ──────────────────
export async function getEmployees(companyId) {
  const { data, error } = await supabase
    .from('employees')
    .select('*')
    .eq('company_id', companyId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data ?? [];
}

// ── Get single employee ───────────────────────────────────────
export async function getEmployee(id) {
  const { data, error } = await supabase
    .from('employees')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  return data;
}

// ── Create employee under a specific company ──────────────────
export async function createEmployee(companyId, payload) {
  const { data, error } = await supabase
    .from('employees')
    .insert([{
      company_id:      companyId,
      first_name:      payload.first_name,
      last_name:       payload.last_name,
      email:           payload.email           || null,
      phone:           payload.phone           || null,
      department:      payload.department      || null,
      designation:     payload.designation     || null,
      employment_type: payload.employment_type || 'Full-Time',
      emp_status:     payload.status          || 'Active',
      date_of_joining: payload.date_of_joining || null,
      date_of_birth:   payload.date_of_birth   || null,
      salary:          payload.salary ? Number(payload.salary) : null,
      address:         payload.address         || null,
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ── Update employee ──────────────────────────────────────────
export async function updateEmployee(id, payload) {
  // Map 'status' form field → 'emp_status' DB column
  const dbPayload = { ...payload };
  if ('status' in dbPayload) {
    dbPayload.emp_status = dbPayload.status;
    delete dbPayload.status;
  }
  const { data, error } = await supabase
    .from('employees')
    .update(dbPayload)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ── Delete employee ──────────────────────────────────────────
export async function deleteEmployee(id) {
  const { error } = await supabase.from('employees').delete().eq('id', id);
  if (error) throw error;
}

// ── Get employee stats for a company ─────────────────────────
export async function getEmployeeStats(companyId) {
  const { data, error } = await supabase
    .from('employees')
    .select('emp_status, employment_type, department, salary, date_of_joining')
    .eq('company_id', companyId);

  if (error) throw error;

  const total    = data.length;
  const active   = data.filter(e => e.emp_status === 'Active').length;
  const inactive = data.filter(e => e.emp_status === 'Inactive').length;
  const onLeave  = data.filter(e => e.emp_status === 'On Leave').length;

  const departments = [...new Set(data.map(e => e.department).filter(Boolean))];

  // Employment type breakdown
  const employmentTypes = {};
  data.forEach(e => {
    const t = e.employment_type || 'Unknown';
    employmentTypes[t] = (employmentTypes[t] || 0) + 1;
  });

  // Department-wise salary breakdown (monthly payroll cost)
  const departmentSalary = {};
  const departmentCount = {};
  data.forEach(e => {
    const dept = e.department || 'General';
    departmentSalary[dept] = (departmentSalary[dept] || 0) + (e.salary || 0);
    departmentCount[dept] = (departmentCount[dept] || 0) + 1;
  });

  // Total monthly payroll
  const totalPayroll = data.reduce((sum, e) => sum + (e.salary || 0), 0);

  // Monthly joining trend (last 6 months)
  const now = new Date();
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const joiningTrend = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const month = d.getMonth();
    const year = d.getFullYear();
    const count = data.filter(e => {
      if (!e.date_of_joining) return false;
      const jd = new Date(e.date_of_joining);
      return jd.getMonth() === month && jd.getFullYear() === year;
    }).length;
    joiningTrend.push({ name: monthNames[month], count });
  }

  // Status breakdown for pie chart
  const statusBreakdown = { active, inactive, onLeave };

  return {
    total, active, inactive, onLeave, departments,
    employmentTypes, departmentSalary, departmentCount,
    totalPayroll, joiningTrend, statusBreakdown
  };
}

// ── Get / Upsert company access controls ─────────────────────
export async function getCompanyAccess(companyId) {
  const { data, error } = await supabase
    .from('company_access_controls')
    .select('*')
    .eq('company_id', companyId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function upsertCompanyAccess(companyId, controls) {
  const { data, error } = await supabase
    .from('company_access_controls')
    .upsert({ company_id: companyId, ...controls }, { onConflict: 'company_id' })
    .select()
    .single();

  if (error) throw error;
  return data;
}
