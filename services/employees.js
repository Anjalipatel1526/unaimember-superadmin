import { supabase, supabaseAdmin, supabaseKeyIsPlaceholder, resolveTenantTableName } from './supabase';

// ── Mock Fallback Data for Local Sandbox Development ──────────
const MOCK_EMPLOYEES = [
  {
    id: '88888888-8888-4888-8888-888888888888',
    first_name: 'Anjali',
    last_name: 'Patel',
    phone: '9876543210',
    designation: 'HR Manager',
    joining_date: '2024-01-15',
    basic_salary: 75000,
    is_active: true,
    pf_number: '{"email":"hr@storyseed.com","password":"password123","department":"Human Resources","employment_type":"Full-Time","status":"Active","date_of_birth":"1995-05-10","address":"Mumbai, India"}',
    email: 'hr@storyseed.com',
    password: 'password123',
    department: 'Human Resources',
    employment_type: 'Full-Time',
    status: 'Active',
    date_of_joining: '2024-01-15',
    date_of_birth: '1995-05-10',
    salary: 75000,
    address: 'Mumbai, India'
  },
  {
    id: '77777777-7777-4777-7777-777777777777',
    first_name: 'Vikram',
    last_name: 'Singh',
    phone: '9876543211',
    designation: 'Manager',
    joining_date: '2024-01-20',
    basic_salary: 90000,
    is_active: true,
    pf_number: '{"email":"manager@storyseed.com","password":"password123","department":"Engineering","employment_type":"Full-Time","status":"Active","date_of_birth":"1992-12-05","address":"Delhi, India"}',
    email: 'manager@storyseed.com',
    password: 'password123',
    department: 'Engineering',
    employment_type: 'Full-Time',
    status: 'Active',
    date_of_joining: '2024-01-20',
    date_of_birth: '1992-12-05',
    salary: 90000,
    address: 'Delhi, India'
  },
  {
    id: '11111111-1111-4111-1111-111111111111',
    first_name: 'Rohan',
    last_name: 'Sharma',
    phone: '9876543212',
    designation: 'Software Engineer',
    joining_date: '2024-02-01',
    basic_salary: 60000,
    is_active: true,
    pf_number: '{"email":"rohan@storyseed.com","password":"password123","department":"Engineering","employment_type":"Full-Time","status":"Active","date_of_birth":"1998-03-22","address":"Bangalore, India"}',
    email: 'rohan@storyseed.com',
    password: 'password123',
    department: 'Engineering',
    employment_type: 'Full-Time',
    status: 'Active',
    date_of_joining: '2024-02-01',
    date_of_birth: '1998-03-22',
    salary: 60000,
    address: 'Bangalore, India'
  }
];

const MOCK_ACCESS_CONTROLS = {
  employees_module: true,
  attendance_module: true,
  payroll_module: true,
  performance_module: true,
  recruitment_module: true,
  training_module: false,
  reports_enabled: true,
  analytics_enabled: true,
  ai_insights_enabled: false,
  api_access: false,
  mobile_app_access: true,
  can_export_data: true,
  can_manage_roles: false,
  custom_branding: true,
  max_departments: 10,
  max_admin_users: 3
};

// ── Get all employees for a specific company ──────────────────
export async function getEmployees(companyId) {
  if (supabaseKeyIsPlaceholder) {
    return MOCK_EMPLOYEES;
  }

  const tableName = await resolveTenantTableName(companyId, 'employees');
  const { data, error } = await (supabaseAdmin || supabase)
    .from(tableName)
    .select('*')
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
export async function getEmployee(companyId, id) {
  if (supabaseKeyIsPlaceholder) {
    return MOCK_EMPLOYEES.find(e => e.id === id) || null;
  }

  const tableName = await resolveTenantTableName(companyId, 'employees');
  const { data, error } = await (supabaseAdmin || supabase)
    .from(tableName)
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
  if (supabaseKeyIsPlaceholder) {
    const mockEmp = {
      id: Math.random().toString(),
      first_name: payload.first_name,
      last_name: payload.last_name,
      phone: payload.phone || '',
      designation: payload.designation || '',
      joining_date: payload.date_of_joining || new Date().toISOString().split('T')[0],
      basic_salary: Number(payload.salary) || 0,
      is_active: payload.status === 'Active',
      email: payload.email || '',
      password: payload.password || '123456',
      department: payload.department || '',
      employment_type: payload.employment_type || 'Full-Time',
      status: payload.status || 'Active',
      date_of_joining: payload.date_of_joining || new Date().toISOString().split('T')[0],
      date_of_birth: payload.date_of_birth || '',
      salary: Number(payload.salary) || 0,
      address: payload.address || ''
    };
    MOCK_EMPLOYEES.unshift(mockEmp);
    return mockEmp;
  }

  const tableName = await resolveTenantTableName(companyId, 'employees');
  const meta = {
    email:           payload.email           || null,
    password:        payload.password        || '123456',
    department:      payload.department      || null,
    employment_type: payload.employment_type || 'Full-Time',
    status:          payload.status          || 'Active',
    date_of_birth:   payload.date_of_birth   || null,
    address:         payload.address         || null,
  };

  const { data, error } = await (supabaseAdmin || supabase)
    .from(tableName)
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
export async function updateEmployee(companyId, id, payload) {
  if (supabaseKeyIsPlaceholder) {
    const idx = MOCK_EMPLOYEES.findIndex(e => e.id === id);
    if (idx !== -1) {
      MOCK_EMPLOYEES[idx] = { ...MOCK_EMPLOYEES[idx], ...payload };
      return MOCK_EMPLOYEES[idx];
    }
    return null;
  }

  const tableName = await resolveTenantTableName(companyId, 'employees');
  // Fetch current metadata to preserve other properties
  const { data: current, error: fetchErr } = await (supabaseAdmin || supabase)
    .from(tableName)
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

  const { data, error } = await (supabaseAdmin || supabase)
    .from(tableName)
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
export async function deleteEmployee(companyId, id) {
  if (supabaseKeyIsPlaceholder) {
    const idx = MOCK_EMPLOYEES.findIndex(e => e.id === id);
    if (idx !== -1) {
      MOCK_EMPLOYEES.splice(idx, 1);
    }
    return;
  }

  const empTable = await resolveTenantTableName(companyId, 'employees');
  const attTable = await resolveTenantTableName(companyId, 'attendance');
  const leaveTable = await resolveTenantTableName(companyId, 'leave_requests');

  // First, delete dependent attendance logs
  const { error: attendanceError } = await (supabaseAdmin || supabase)
    .from(attTable)
    .delete()
    .eq('employee_id', id);
  if (attendanceError) throw attendanceError;

  // Next, delete dependent leave requests
  const { error: leaveError } = await (supabaseAdmin || supabase)
    .from(leaveTable)
    .delete()
    .eq('employee_id', id);
  if (leaveError) throw leaveError;

  // Finally, delete the employee record
  const { error } = await (supabaseAdmin || supabase)
    .from(empTable)
    .delete()
    .eq('id', id);
  if (error) throw error;
}

// ── Get employee stats for a company ─────────────────────────
export async function getEmployeeStats(companyId) {
  if (supabaseKeyIsPlaceholder) {
    const total = MOCK_EMPLOYEES.length;
    const active = MOCK_EMPLOYEES.filter(e => e.status === 'Active').length;
    const inactive = MOCK_EMPLOYEES.filter(e => e.status === 'Inactive').length;
    const onLeave = MOCK_EMPLOYEES.filter(e => e.status === 'On Leave').length;
    const departments = [...new Set(MOCK_EMPLOYEES.map(e => e.department).filter(Boolean))];
    const totalPayroll = MOCK_EMPLOYEES.reduce((sum, e) => sum + (e.salary || 0), 0);

    return {
      total, active, inactive, onLeave, departments,
      employmentTypes: { 'Full-Time': total },
      departmentSalary: { 'Human Resources': 75000, 'Engineering': 150000 },
      departmentCount: { 'Human Resources': 1, 'Engineering': 2 },
      totalPayroll,
      joiningTrend: [
        { name: 'Jan', count: 2 },
        { name: 'Feb', count: 1 },
        { name: 'Mar', count: 0 },
        { name: 'Apr', count: 0 },
        { name: 'May', count: 0 },
        { name: 'Jun', count: 0 }
      ],
      statusBreakdown: { active, inactive, onLeave }
    };
  }

  const tableName = await resolveTenantTableName(companyId, 'employees');
  const { data, error } = await (supabaseAdmin || supabase)
    .from(tableName)
    .select('*');

  if (error) throw error;

  const parsedData = (data ?? []).map(emp => {
    let meta = {};
    if (emp.pf_number) {
      try {
        meta = JSON.parse(emp.pf_number);
      } catch (e) {
        meta = {};
      }
    }
    return {
      emp_status:      meta.status          || emp.emp_status || (emp.is_active ? 'Active' : 'Inactive'),
      employment_type: meta.employment_type || 'Full-Time',
      department:      meta.department      || null,
      salary:          emp.basic_salary     || 0,
      date_of_joining: emp.joining_date     || null,
    };
  });

  const total    = parsedData.length;
  const active   = parsedData.filter(e => e.emp_status === 'Active').length;
  const inactive = parsedData.filter(e => e.emp_status === 'Inactive').length;
  const onLeave  = parsedData.filter(e => e.emp_status === 'On Leave').length;

  const departments = [...new Set(parsedData.map(e => e.department).filter(Boolean))];

  // Employment type breakdown
  const employmentTypes = {};
  parsedData.forEach(e => {
    const t = e.employment_type || 'Unknown';
    employmentTypes[t] = (employmentTypes[t] || 0) + 1;
  });

  // Department-wise salary breakdown (monthly payroll cost)
  const departmentSalary = {};
  const departmentCount = {};
  parsedData.forEach(e => {
    const dept = e.department || 'General';
    departmentSalary[dept] = (departmentSalary[dept] || 0) + (e.salary || 0);
    departmentCount[dept] = (departmentCount[dept] || 0) + 1;
  });

  // Total monthly payroll
  const totalPayroll = parsedData.reduce((sum, e) => sum + (e.salary || 0), 0);

  // Monthly joining trend (last 6 months)
  const now = new Date();
  const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  const joiningTrend = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const month = d.getMonth();
    const year = d.getFullYear();
    const count = parsedData.filter(e => {
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
  if (supabaseKeyIsPlaceholder) {
    return MOCK_ACCESS_CONTROLS;
  }

  const { data, error } = await (supabaseAdmin || supabase)
    .from('company_access_controls')
    .select('*')
    .eq('company_id', companyId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

export async function upsertCompanyAccess(companyId, controls) {
  if (supabaseKeyIsPlaceholder) {
    Object.assign(MOCK_ACCESS_CONTROLS, controls);
    return MOCK_ACCESS_CONTROLS;
  }

  const { data, error } = await (supabaseAdmin || supabase)
    .from('company_access_controls')
    .upsert({ company_id: companyId, ...controls }, { onConflict: 'company_id' })
    .select()
    .single();

  if (error) throw error;
  return data;
}
