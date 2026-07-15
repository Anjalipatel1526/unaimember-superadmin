import { supabase, supabaseAdmin, supabaseKeyIsPlaceholder } from './supabase';

// ── Mock Fallback Data for Local Sandbox Development ──────────
const MOCK_INVOICES = [
  {
    id: 'inv-001',
    invoice_number: 'INV-0001',
    amount: 99.00,
    status: 'Paid',
    paid_at: new Date(Date.now() - 5 * 24 * 3600000).toISOString(),
    created_at: new Date(Date.now() - 5 * 24 * 3600000).toISOString(),
    companies: { name: 'Story Seed Studio' }
  },
  {
    id: 'inv-002',
    invoice_number: 'INV-0002',
    amount: 299.00,
    status: 'Paid',
    paid_at: new Date(Date.now() - 12 * 24 * 3600000).toISOString(),
    created_at: new Date(Date.now() - 12 * 24 * 3600000).toISOString(),
    companies: { name: 'Acme Corp' }
  },
  {
    id: 'inv-003',
    invoice_number: 'INV-0003',
    amount: 99.00,
    status: 'Pending',
    paid_at: null,
    created_at: new Date(Date.now() - 2 * 24 * 3600000).toISOString(),
    companies: { name: 'Globex Ltd' }
  },
  {
    id: 'inv-004',
    invoice_number: 'INV-0004',
    amount: 99.00,
    status: 'Failed',
    paid_at: null,
    created_at: new Date(Date.now() - 1 * 24 * 3600000).toISOString(),
    companies: { name: 'Initech Inc' }
  }
];

const MOCK_REVENUE_SNAPSHOTS = [
  { id: '1', month: '2026-01-01', mrr: 400, new_companies: 1 },
  { id: '2', month: '2026-02-01', mrr: 700, new_companies: 2 },
  { id: '3', month: '2026-03-01', mrr: 600, new_companies: 1 },
  { id: '4', month: '2026-04-01', mrr: 900, new_companies: 3 },
  { id: '5', month: '2026-05-01', mrr: 1100, new_companies: 2 },
  { id: '6', month: '2026-06-01', mrr: 1400, new_companies: 4 }
];

// ── All invoices ─────────────────────────────────────────────
export async function getInvoices() {
  if (supabaseKeyIsPlaceholder) {
    return MOCK_INVOICES;
  }

  const { data, error } = await (supabaseAdmin || supabase)
    .from('invoices')
    .select('*, companies ( name )')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data ?? [];
}

// ── Billing KPI aggregates (handles RLS recursion gracefully) ─
export async function getBillingStats() {
  if (supabaseKeyIsPlaceholder) {
    const paid    = MOCK_INVOICES.filter(r => r.status === 'Paid');
    const firstOfMonth = new Date();
    firstOfMonth.setDate(1); firstOfMonth.setHours(0, 0, 0, 0);
    const mrr     = paid.filter(r => r.paid_at && new Date(r.paid_at) >= firstOfMonth);
    const pending = MOCK_INVOICES.filter(r => r.status === 'Pending').length;
    const failed  = MOCK_INVOICES.filter(r => r.status === 'Failed').length;

    return {
      totalRevenue: paid.reduce((s, r) => s + Number(r.amount), 0),
      mrr:          mrr.reduce((s, r)  => s + Number(r.amount), 0),
      pending,
      failed,
    };
  }

  try {
    const { data: all, error } = await (supabaseAdmin || supabase)
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
  if (supabaseKeyIsPlaceholder) {
    const mockInvoice = {
      id: Math.random().toString(),
      invoice_number: payload.invoice_number || 'INV-9999',
      amount: Number(payload.amount),
      status: payload.status || 'Pending',
      paid_at: payload.status === 'Paid' ? new Date().toISOString() : null,
      created_at: new Date().toISOString(),
      companies: { name: 'Acme Corp' }
    };
    MOCK_INVOICES.unshift(mockInvoice);
    return mockInvoice;
  }

  const { data, error } = await (supabaseAdmin || supabase)
    .from('invoices')
    .insert([payload])
    .select('*, companies ( name )')
    .single();

  if (error) throw error;
  return data;
}

// ── Update invoice status ────────────────────────────────────
export async function updateInvoiceStatus(id, status) {
  if (supabaseKeyIsPlaceholder) {
    const inv = MOCK_INVOICES.find(i => i.id === id);
    if (inv) {
      inv.status = status;
      if (status === 'Paid') inv.paid_at = new Date().toISOString();
    }
    return inv;
  }

  const patch = { status };
  if (status === 'Paid') patch.paid_at = new Date().toISOString();

  const { data, error } = await (supabaseAdmin || supabase)
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
  if (supabaseKeyIsPlaceholder) {
    return MOCK_REVENUE_SNAPSHOTS;
  }

  const { data, error } = await (supabaseAdmin || supabase)
    .from('revenue_snapshots')
    .select('*')
    .order('month', { ascending: true });

  if (error) return []; // table may not exist yet
  return data ?? [];
}

// ── Generate next invoice number ─────────────────────────────
export async function nextInvoiceNumber() {
  if (supabaseKeyIsPlaceholder) {
    return `INV-${String(MOCK_INVOICES.length + 1).padStart(4, '0')}`;
  }

  const { count } = await (supabaseAdmin || supabase)
    .from('invoices')
    .select('id', { count: 'exact', head: true });

  const n = (count ?? 0) + 1;
  return `INV-${String(n).padStart(4, '0')}`;
}
