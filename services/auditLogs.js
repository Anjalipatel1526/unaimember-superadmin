import { supabase, supabaseAdmin, supabaseKeyIsPlaceholder } from './supabase';

// ── Mock Fallback Data for Local Sandbox Development ──────────
const MOCK_AUDIT_LOGS = [
  {
    id: 'log-001',
    created_at: new Date(Date.now() - 3600000).toISOString(),
    user_name: 'Anjali Patel',
    user_role: 'HR Manager',
    action: 'Create Employee Record',
    target: 'Rohan Sharma',
    outcome: 'Success',
    metadata: { department: 'Engineering', designation: 'Software Engineer' }
  },
  {
    id: 'log-002',
    created_at: new Date(Date.now() - 7200000).toISOString(),
    user_name: 'Super Admin',
    user_role: 'Super Admin',
    action: 'Create Client Company',
    target: 'Story Seed Studio',
    outcome: 'Success',
    metadata: { status: 'Active', plan: 'Enterprise' }
  },
  {
    id: 'log-003',
    created_at: new Date(Date.now() - 86400000).toISOString(),
    user_name: 'System Scheduler',
    user_role: 'system',
    action: 'Invoice Generation',
    target: 'INV-0002',
    outcome: 'Success',
    metadata: { amount: 299, company_id: '77777777-7777-4777-7777-777777777777' }
  }
];

// ── All logs ─────────────────────────────────────────────────
export async function getAuditLogs({ company, role, from, to } = {}) {
  if (supabaseKeyIsPlaceholder) {
    let logs = [...MOCK_AUDIT_LOGS];
    if (company) logs = logs.filter(l => (l.target || '').toLowerCase().includes(company.toLowerCase()) || (l.user_name || '').toLowerCase().includes(company.toLowerCase()));
    if (role)    logs = logs.filter(l => l.user_role === role);
    return logs;
  }

  let query = (supabaseAdmin || supabase)
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
  if (supabaseKeyIsPlaceholder) {
    MOCK_AUDIT_LOGS.unshift({
      id: Math.random().toString(),
      created_at: new Date().toISOString(),
      user_name: userName || 'System',
      user_role: userRole || 'system',
      action,
      target,
      outcome,
      metadata
    });
    return;
  }

  const { error } = await (supabaseAdmin || supabase)
    .from('audit_logs')
    .insert([{ type, user_name: userName, user_role: userRole, action, target, outcome, metadata }]);

  if (error) console.error('[Audit] Failed to write log:', error);
}
