import { supabase, supabaseAdmin, supabaseKeyIsPlaceholder } from './supabase';

// ── Mock Fallback Data for Local Sandbox Development ──────────
const MOCK_COMPANIES = [
  {
    id: '88888888-8888-4888-8888-888888888888',
    name: 'Story Seed Studio',
    email: 'admin@storyseed.com',
    phone: '+91 98765 43210',
    address: 'Mumbai, India',
    status: 'Active',
    plan: 'enterprise',
    employee_count: 3,
    employee_limit: 100,
    payment_status: 'Paid',
    created_at: new Date(Date.now() - 30 * 24 * 3600000).toISOString()
  },
  {
    id: '77777777-7777-4777-7777-777777777777',
    name: 'Acme Corp',
    email: 'contact@acme.com',
    phone: '+1 555-0199',
    address: 'California, US',
    status: 'Active',
    plan: 'professional',
    employee_count: 142,
    employee_limit: 250,
    payment_status: 'Paid',
    created_at: new Date(Date.now() - 60 * 24 * 3600000).toISOString()
  },
  {
    id: '11111111-1111-4111-1111-111111111111',
    name: 'Globex Ltd',
    email: 'info@globex.com',
    phone: '+44 20 7946 0958',
    address: 'London, Europe',
    status: 'Trial',
    plan: 'basic',
    employee_count: 12,
    employee_limit: 50,
    payment_status: 'Pending',
    created_at: new Date(Date.now() - 15 * 24 * 3600000).toISOString()
  },
  {
    id: '22222222-2222-4222-2222-222222222222',
    name: 'Initech Inc',
    email: 'support@initech.com',
    phone: '+1 555-0177',
    address: 'Texas, US',
    status: 'Suspended',
    plan: 'basic',
    employee_count: 8,
    employee_limit: 50,
    payment_status: 'Failed',
    created_at: new Date(Date.now() - 90 * 24 * 3600000).toISOString()
  }
];

// ── Generate a secure random password ────────────────────────
function generatePassword(length = 12) {
  const upper  = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const lower  = 'abcdefghjkmnpqrstuvwxyz';
  const digits = '23456789';
  const special = '@#$!';
  const all = upper + lower + digits + special;

  // Guarantee at least one of each type
  let pwd = [
    upper[Math.floor(Math.random() * upper.length)],
    lower[Math.floor(Math.random() * lower.length)],
    digits[Math.floor(Math.random() * digits.length)],
    special[Math.floor(Math.random() * special.length)],
  ];

  for (let i = pwd.length; i < length; i++) {
    pwd.push(all[Math.floor(Math.random() * all.length)]);
  }

  // Shuffle
  return pwd.sort(() => Math.random() - 0.5).join('');
}

// ── Generate login email from company name ────────────────────
function generateLoginEmail(companyName) {
  const slug = companyName
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '')   // remove special chars
    .substring(0, 20);
  const rand = Math.floor(1000 + Math.random() * 9000);
  return `${slug}${rand}@unaimember.app`;
}

// ── Fetch all companies ───────────────────────────────────────
export async function getCompanies() {
  if (supabaseKeyIsPlaceholder) {
    return MOCK_COMPANIES;
  }

  const { data, error } = await (supabaseAdmin || supabase)
    .from('companies')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data ?? [];
}

// ── Fetch companies with their login credentials joined ───────
export async function getCompaniesWithCredentials() {
  if (supabaseKeyIsPlaceholder) {
    return MOCK_COMPANIES.map(c => ({
      ...c,
      company_credentials: {
        login_email: c.email,
        login_password: 'password123',
        is_active: c.status !== 'Suspended',
        auth_user_id: c.id
      }
    }));
  }

  const { data, error } = await (supabaseAdmin || supabase)
    .from('companies')
    .select(`
      *,
      company_credentials (
        login_email,
        login_password,
        is_active,
        auth_user_id
      )
    `)
    .order('created_at', { ascending: false });

  if (error) {
    if (error.code === 'PGRST200' || error.message?.includes('company_credentials')) {
      return getCompanies();
    }
    throw error;
  }
  return data ?? [];
}

// ── Create company + store login credentials ─────────────────
export async function createCompany(payload) {
  if (supabaseKeyIsPlaceholder) {
    const mockCompany = {
      id: Math.random().toString(),
      name: payload.name,
      email: payload.email || 'company@example.com',
      phone: payload.phone || '',
      address: payload.address || '',
      status: payload.status || 'Trial',
      plan: payload.plan || 'basic',
      employee_count: 0,
      employee_limit: Number(payload.employee_limit) || 50,
      payment_status: payload.payment_status || 'Pending',
      created_at: new Date().toISOString()
    };
    MOCK_COMPANIES.unshift(mockCompany);
    return {
      company: mockCompany,
      credentials: { email: mockCompany.email, password: 'password123', authUserId: mockCompany.id }
    };
  }

  const safe = {
    name:           payload.name,
    status:         payload.status         || 'Trial',
    employee_count: 0,
    employee_limit: Number(payload.employee_limit) || 50,
  };

  const optionals = {
    email:               payload.email,
    phone:               payload.phone,
    address:             payload.address,
    logo_url:            payload.logo_url            || null,
    trial_expiry:        payload.trial_expiry        || null,
    plan:                payload.plan                || 'starter',
    payroll_enabled:     payload.payroll_enabled     ?? false,
    performance_enabled: payload.performance_enabled ?? false,
    payment_status:      payload.payment_status      || 'Pending',
  };

  // 1️⃣  Insert the company record
  let company;
  try {
    const { data, error } = await (supabaseAdmin || supabase)
      .from('companies')
      .insert([{ ...safe, ...optionals }])
      .select()
      .single();
    if (error) throw error;
    company = data;
  } catch (err) {
    if (err.message?.includes('schema cache') || err.code === 'PGRST204') {
      const { data, error: err2 } = await (supabaseAdmin || supabase)
        .from('companies')
        .insert([safe])
        .select()
        .single();
      if (err2) throw err2;
      company = data;
    } else {
      throw err;
    }
  }

  // 2️⃣  Use super admin's custom credentials (or auto-generate fallback)
  const loginEmail = payload.login_id?.trim()
    ? payload.login_id.trim()
    : generateLoginEmail(payload.name);
  const password = payload.login_password?.trim()
    ? payload.login_password.trim()
    : generatePassword(12);

  // 3️⃣  Attempt to create Supabase Auth user
  let authUserId = null;
  if (supabaseAdmin) {
    try {
      const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
        email: loginEmail,
        password,
        email_confirm: true,
        user_metadata: { company_id: company.id, company_name: company.name, role: 'company_admin' },
      });
      if (authError) console.warn('[Auth]', authError.message);
      else authUserId = authData.user?.id ?? null;
    } catch (e) {
      console.warn('[Auth] skipped:', e.message);
    }
  }

  // 4️⃣  Store credentials (including password) in DB
  try {
    await (supabaseAdmin || supabase).from('company_credentials').upsert([
      {
        company_id:     company.id,
        auth_user_id:   authUserId,
        login_email:    loginEmail,
        login_password: password,      // stored so super admin can view
        role:           'company_admin',
        is_active:      true,
      }
    ], { onConflict: 'company_id' });
  } catch (e) {
    console.warn('[Credentials] store failed:', e.message);
  }

  return {
    company,
    credentials: { email: loginEmail, password, authUserId },
  };
}

// ── Get credentials for a company ────────────────────────────
export async function getCompanyCredentials(companyId) {
  if (supabaseKeyIsPlaceholder) {
    const c = MOCK_COMPANIES.find(comp => comp.id === companyId);
    return c ? {
      company_id: c.id,
      login_email: c.email,
      login_password: 'password123',
      role: 'company_admin',
      is_active: c.status !== 'Suspended'
    } : null;
  }

  const { data, error } = await (supabaseAdmin || supabase)
    .from('company_credentials')
    .select('*')
    .eq('company_id', companyId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

// ── Reset / update password for a company login ───────────────
export async function resetCompanyPassword(companyId, newPasswordInput) {
  if (supabaseKeyIsPlaceholder) {
    const c = MOCK_COMPANIES.find(comp => comp.id === companyId);
    return { email: c ? c.email : 'admin@example.com', password: newPasswordInput || 'newpassword123' };
  }

  const creds = await getCompanyCredentials(companyId);
  if (!creds) throw new Error('No credentials found for this company');

  const newPassword = newPasswordInput?.trim() || generatePassword(12);

  // Update Supabase Auth user if available
  if (supabaseAdmin && creds.auth_user_id) {
    try {
      const { error } = await supabaseAdmin.auth.admin.updateUserById(creds.auth_user_id, {
        password: newPassword,
      });
      if (error) console.warn('[Auth reset]', error.message);
    } catch (e) {
      console.warn('[Auth reset skipped]', e.message);
    }
  }

  // Always update the stored password in company_credentials
  const { error: dbErr } = await (supabaseAdmin || supabase)
    .from('company_credentials')
    .update({ login_password: newPassword })
    .eq('company_id', companyId);

  if (dbErr) throw dbErr;
  return { email: creds.login_email, password: newPassword };
}

// ── Update company ────────────────────────────────────────────
export async function updateCompany(id, payload) {
  if (supabaseKeyIsPlaceholder) {
    const idx = MOCK_COMPANIES.findIndex(c => c.id === id);
    if (idx !== -1) {
      MOCK_COMPANIES[idx] = { ...MOCK_COMPANIES[idx], ...payload };
      return MOCK_COMPANIES[idx];
    }
    return null;
  }

  const { data, error } = await (supabaseAdmin || supabase)
    .from('companies')
    .update(payload)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ── Delete company ────────────────────────────────────────────
export async function deleteCompany(id) {
  if (supabaseKeyIsPlaceholder) {
    const idx = MOCK_COMPANIES.findIndex(c => c.id === id);
    if (idx !== -1) {
      MOCK_COMPANIES.splice(idx, 1);
    }
    return;
  }

  // Also deactivate the auth user if possible
  if (supabaseAdmin) {
    try {
      const creds = await getCompanyCredentials(id);
      if (creds?.auth_user_id) {
        await supabaseAdmin.auth.admin.deleteUser(creds.auth_user_id);
      }
    } catch (e) {
      console.warn('[Auth] Could not delete auth user:', e.message);
    }
  }

  const { error } = await (supabaseAdmin || supabase).from('companies').delete().eq('id', id);
  if (error) throw error;
}

// ── Dashboard stats ───────────────────────────────────────────
export async function getCompanyStats() {
  if (supabaseKeyIsPlaceholder) {
    const india = MOCK_COMPANIES.filter(c => c.address.toLowerCase().includes('india')).length;
    const us = MOCK_COMPANIES.filter(c => c.address.toLowerCase().includes('us')).length;
    const europe = MOCK_COMPANIES.filter(c => c.address.toLowerCase().includes('europe') || c.address.toLowerCase().includes('london')).length;
    const other = MOCK_COMPANIES.length - (india + us + europe);
    return {
      total:          MOCK_COMPANIES.length,
      totalEmployees: MOCK_COMPANIES.reduce((s, c) => s + (c.employee_count || 0), 0),
      trials:         MOCK_COMPANIES.filter(c => c.status === 'Trial').length,
      regions: { india, us, europe, other }
    };
  }

  const { data, error } = await (supabaseAdmin || supabase)
    .from('companies')
    .select('status, employee_count, address');

  if (error) throw error;

  let india = 0;
  let us = 0;
  let europe = 0;
  let other = 0;

  (data ?? []).forEach(c => {
    const addr = (c.address || '').toLowerCase();
    if (
      addr.includes('india') ||
      addr.includes('mumbai') ||
      addr.includes('delhi') ||
      addr.includes('bangalore') ||
      addr.includes('chennai') ||
      addr.includes('pune') ||
      addr.includes('hyderabad') ||
      addr.includes('kolkata')
    ) {
      india++;
    } else if (
      addr.includes('us') ||
      addr.includes('usa') ||
      addr.includes('united states') ||
      addr.includes('california') ||
      addr.includes('seattle') ||
      addr.includes('new york') ||
      addr.includes('san francisco') ||
      addr.includes('texas')
    ) {
      us++;
    } else if (
      addr.includes('europe') ||
      addr.includes('uk') ||
      addr.includes('london') ||
      addr.includes('germany') ||
      addr.includes('france') ||
      addr.includes('paris') ||
      addr.includes('berlin') ||
      addr.includes('italy') ||
      addr.includes('spain')
    ) {
      europe++;
    } else {
      other++;
    }
  });

  return {
    total:          data.length,
    totalEmployees: data.reduce((s, c) => s + (c.employee_count || 0), 0),
    trials:         data.filter(c => c.status === 'Trial').length,
    regions: { india, us, europe, other }
  };
}
