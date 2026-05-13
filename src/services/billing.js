import { supabase } from './supabase';

// ── All invoices ─────────────────────────────────────────────
export async function getInvoices() {
  const { data, error } = await supabase
    .from('invoices')
    .select('*, companies ( name )')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data ?? [];
}

// ── Billing KPI aggregates (handles RLS recursion gracefully) ─
export async function getBillingStats() {
  try {
    const { data: all, error } = await supabase
      .from('invoices')
      .select('amount, status, paid_at');

    if (error) throw error;

    const firstOfMonth = new Date();
    firstOfMonth.setDate(1); firstOfMonth.setHours(0, 0, 0, 0);

    const paid    = all.filter(r => r.status === 'Paid');
    const mrr     = paid.filter(r => r.paid_at && new Date(r.paid_at) >= firstOfMonth);
    const pending = all.filter(r => r.status === 'Pending').length;
    const failed  = all.filter(r => r.status === 'Failed').length;

    return {
      totalRevenue: paid.reduce((s, r) => s + Number(r.amount), 0),
      mrr:          mrr.reduce((s, r)  => s + Number(r.amount), 0),
      pending,
      failed,
    };
  } catch (e) {
    // RLS infinite recursion or missing table — return zeros
    console.warn('[Billing] Stats error (run fix_migration.sql):', e.message);
    return { totalRevenue: 0, mrr: 0, pending: 0, failed: 0 };
  }
}

// ── Create invoice ───────────────────────────────────────────
export async function createInvoice(payload) {
  const { data, error } = await supabase
    .from('invoices')
    .insert([payload])
    .select('*, companies ( name )')
    .single();

  if (error) throw error;
  return data;
}

// ── Update invoice status ────────────────────────────────────
export async function updateInvoiceStatus(id, status) {
  const patch = { status };
  if (status === 'Paid') patch.paid_at = new Date().toISOString();

  const { data, error } = await supabase
    .from('invoices')
    .update(patch)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ── Revenue snapshots for chart ──────────────────────────────
export async function getRevenueSnapshots() {
  const { data, error } = await supabase
    .from('revenue_snapshots')
    .select('*')
    .order('month', { ascending: true });

  if (error) return []; // table may not exist yet
  return data ?? [];
}

// ── Generate next invoice number ─────────────────────────────
export async function nextInvoiceNumber() {
  const { count } = await supabase
    .from('invoices')
    .select('id', { count: 'exact', head: true });

  const n = (count ?? 0) + 1;
  return `INV-${String(n).padStart(4, '0')}`;
}
