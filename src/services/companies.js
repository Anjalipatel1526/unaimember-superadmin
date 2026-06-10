import { supabase, supabaseAdmin } from './supabase';

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
  const { data, error } = await supabase
    .from('companies')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data ?? [];
}

// ── Fetch companies with their login credentials joined ───────
export async function getCompaniesWithCredentials() {
  const { data, error } = await supabase
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
    plan_id:             payload.plan_id             || null,
    payroll_enabled:     payload.payroll_enabled     ?? false,
    performance_enabled: payload.performance_enabled ?? false,
    payment_status:      payload.payment_status      || 'Pending',
  };

  // 1️⃣  Insert the company record
  let company;
  try {
    const { data, error } = await supabase
      .from('companies')
      .insert([{ ...safe, ...optionals }])
      .select()
      .single();
    if (error) throw error;
    company = data;
  } catch (err) {
    if (err.message?.includes('schema cache') || err.code === 'PGRST204') {
      const { data, error: err2 } = await supabase
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
    await supabase.from('company_credentials').upsert([
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
  const { data, error } = await supabase
    .from('company_credentials')
    .select('*')
    .eq('company_id', companyId)
    .maybeSingle();

  if (error) throw error;
  return data;
}

// ── Reset / update password for a company login ───────────────
export async function resetCompanyPassword(companyId, newPasswordInput) {
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
  const { error: dbErr } = await supabase
    .from('company_credentials')
    .update({ login_password: newPassword })
    .eq('company_id', companyId);

  if (dbErr) throw dbErr;
  return { email: creds.login_email, password: newPassword };
}

// ── Update company ────────────────────────────────────────────
export async function updateCompany(id, payload) {
  const { data, error } = await supabase
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

  const { error } = await supabase.from('companies').delete().eq('id', id);
  if (error) throw error;
}

// ── Dashboard stats ───────────────────────────────────────────
export async function getCompanyStats() {
  const { data, error } = await supabase
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
