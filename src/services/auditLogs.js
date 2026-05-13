import { supabase } from './supabase';

// ── All logs ─────────────────────────────────────────────────
export async function getAuditLogs({ company, role, from, to } = {}) {
  let query = supabase
    .from('audit_logs')
    .select('*')
    .order('created_at', { ascending: false });

  if (company) query = query.ilike('target', `%${company}%`);
  if (role)    query = query.eq('user_role', role);
  if (from)    query = query.gte('created_at', from);
  if (to)      query = query.lte('created_at', to);

  const { data, error } = await query;
  if (error) throw error;
  return data;
}

// ── Insert a log entry ────────────────────────────────────────
export async function createLog({ type, userName, userRole, action, target, outcome = 'Success', metadata }) {
  const { error } = await supabase
    .from('audit_logs')
    .insert([{ type, user_name: userName, user_role: userRole, action, target, outcome, metadata }]);

  if (error) console.error('[Audit] Failed to write log:', error);
}
