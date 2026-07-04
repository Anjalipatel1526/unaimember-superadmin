import { supabase } from './supabase';

// ── Get all employees for a specific company ──────────────────
export async function getEmployees(companyId) {
  const { data, error } = await supabase
    .from('employees')
    .select('*')
    .eq('company_id', companyId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return (data ?? []).map(emp => {
    let meta = {};
    if (emp.pf_number) {
      try {
        meta = JSON.parse(emp.pf_number);
      } catch (e) {
        meta = {};
      }
    }
    return {
      ...emp,
      email:           meta.email           || null,
      password:        meta.password        || '123456',
      department:      meta.department      || null,
      employment_type: meta.employment_type || 'Full-Time',
      status:          meta.status          || emp.emp_status || (emp.is_active ? 'Active' : 'Inactive'),
      date_of_joining: emp.joining_date     || null,
      date_of_birth:   meta.date_of_birth   || null,
      salary:          emp.basic_salary     || null,
      address:         meta.address         || null,
    };
  });
}

// ── Get single employee ───────────────────────────────────────
export async function getEmployee(id) {
  const { data, error } = await supabase
    .from('employees')
    .select('*')
    .eq('id', id)
    .single();

  if (error) throw error;
  if (!data) return null;

  let meta = {};
  if (data.pf_number) {
    try {
      meta = JSON.parse(data.pf_number);
    } catch (e) {
      meta = {};
    }
  }

  return {
    ...data,
    email:           meta.email           || null,
    password:        meta.password        || '123456',
    department:      meta.department      || null,
    employment_type: meta.employment_type || 'Full-Time',
    status:          meta.status          || data.emp_status || (data.is_active ? 'Active' : 'Inactive'),
    date_of_joining: data.joining_date     || null,
    date_of_birth:   meta.date_of_birth   || null,
    salary:          data.basic_salary     || null,
    address:         meta.address         || null,
  };
}

// ── Create employee under a specific company ──────────────────
export async function createEmployee(companyId, payload) {
  const meta = {
    email:           payload.email           || null,
    password:        payload.password        || '123456',
    department:      payload.department      || null,
    employment_type: payload.employment_type || 'Full-Time',
    status:          payload.status          || 'Active',
    date_of_birth:   payload.date_of_birth   || null,
    address:         payload.address         || null,
  };

  const { data, error } = await supabase
    .from('employees')
    .insert([{
      company_id:      companyId,
      first_name:      payload.first_name,
      last_name:       payload.last_name,
      phone:           payload.phone           || null,
      designation:     payload.designation     || null,
      joining_date:    payload.date_of_joining || null,
      basic_salary:    payload.salary ? Number(payload.salary) : null,
      is_active:       payload.status === 'Active',
      pf_number:       JSON.stringify(meta),
    }])
    .select()
    .single();

  if (error) throw error;
  return {
    ...data,
    email:           meta.email,
    password:        meta.password,
    department:      meta.department,
    employment_type: meta.employment_type,
    status:          meta.status,
    date_of_joining: data.joining_date,
    date_of_birth:   meta.date_of_birth,
    salary:          data.basic_salary,
    address:         meta.address,
  };
}

// ── Update employee ──────────────────────────────────────────
export async function updateEmployee(id, payload) {
  // Fetch current metadata to preserve other properties
  const { data: current, error: fetchErr } = await supabase
    .from('employees')
    .select('pf_number')
    .eq('id', id)
    .single();

  if (fetchErr) throw fetchErr;

  let currentMeta = {};
  if (current && current.pf_number) {
    try {
      currentMeta = JSON.parse(current.pf_number);
    } catch (e) {
      currentMeta = {};
    }
  }

  const updatedMeta = {
    ...currentMeta,
    email:           payload.email           !== undefined ? payload.email           : currentMeta.email,
    password:        payload.password        !== undefined ? payload.password        : currentMeta.password,
    department:      payload.department      !== undefined ? payload.department      : currentMeta.department,
    employment_type: payload.employment_type !== undefined ? payload.employment_type : currentMeta.employment_type,
    status:          payload.status          !== undefined ? payload.status          : currentMeta.status,
    date_of_birth:   payload.date_of_birth   !== undefined ? payload.date_of_birth   : currentMeta.date_of_birth,
    address:         payload.address         !== undefined ? payload.address         : currentMeta.address,
  };

  const dbPayload = {
    first_name:   payload.first_name,
    last_name:    payload.last_name,
    phone:        payload.phone        !== undefined ? payload.phone        : null,
    designation:  payload.designation  !== undefined ? payload.designation  : null,
    joining_date: payload.date_of_joining !== undefined ? payload.date_of_joining : null,
    basic_salary: payload.salary ? Number(payload.salary) : null,
    is_active:    (payload.status !== undefined ? payload.status : updatedMeta.status) === 'Active',
    pf_number:    JSON.stringify(updatedMeta),
  };

  const { data, error } = await supabase
    .from('employees')
    .update(dbPayload)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return {
    ...data,
    email:           updatedMeta.email,
    password:        updatedMeta.password,
    department:      updatedMeta.department,
    employment_type: updatedMeta.employment_type,
    status:          updatedMeta.status,
    date_of_joining: data.joining_date,
    date_of_birth:   updatedMeta.date_of_birth,
    salary:          data.basic_salary,
    address:         updatedMeta.address,
  };
}

// ── Delete employee ──────────────────────────────────────────
export async function deleteEmployee(id) {
  // First, delete dependent attendance logs
  const { error: attendanceError } = await supabase
    .from('attendance')
    .delete()
    .eq('employee_id', id);
  if (attendanceError) throw attendanceError;

  // Next, delete dependent leave requests
  const { error: leaveError } = await supabase
    .from('leave_requests')
    .delete()
    .eq('employee_id', id);
  if (leaveError) throw leaveError;

  // Finally, delete the employee record
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
