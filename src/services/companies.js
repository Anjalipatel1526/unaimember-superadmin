import { supabase } from './supabase';

// ── Fetch all companies ───────────────────────────────────────
export async function getCompanies() {
  const { data, error } = await supabase
    .from('companies')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data ?? [];
}

// ── Create company (only safe minimal columns) ────────────────
export async function createCompany(payload) {
  // Build payload with only what's guaranteed to exist.
  // Run supabase/fix_migration.sql to add all optional columns.
  const safe = {
    name:           payload.name,
    status:         payload.status         || 'Trial',
    employee_count: 0,
    employee_limit: Number(payload.employee_limit) || 50,
  };

  // Optional columns — add only if the value exists (column may not yet be in schema cache)
  const optionals = {
    email:               payload.email,
    phone:               payload.phone,
    address:             payload.address,
    trial_expiry:        payload.trial_expiry        || null,
    plan_id:             payload.plan_id             || null,
    payroll_enabled:     payload.payroll_enabled     ?? false,
    performance_enabled: payload.performance_enabled ?? false,
    payment_status:      payload.payment_status      || 'Pending',
  };

  // Attempt insert with all optional fields
  try {
    const { data, error } = await supabase
      .from('companies')
      .insert([{ ...safe, ...optionals }])
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    // If schema cache is missing columns, fall back to minimal insert
    if (err.message?.includes('schema cache') || err.code === 'PGRST204') {
      const { data, error: err2 } = await supabase
        .from('companies')
        .insert([safe])
        .select()
        .single();
      if (err2) throw err2;
      return data;
    }
    throw err;
  }
}

// ── Update company ───────────────────────────────────────────
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

// ── Delete company ───────────────────────────────────────────
export async function deleteCompany(id) {
  const { error } = await supabase.from('companies').delete().eq('id', id);
  if (error) throw error;
}

// ── Dashboard stats ──────────────────────────────────────────
export async function getCompanyStats() {
  const { data, error } = await supabase
    .from('companies')
    .select('status, employee_count');

  if (error) throw error;

  return {
    total:          data.length,
    totalEmployees: data.reduce((s, c) => s + (c.employee_count || 0), 0),
    trials:         data.filter(c => c.status === 'Trial').length,
  };
}
