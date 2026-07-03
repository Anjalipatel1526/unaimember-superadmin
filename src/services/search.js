import { supabase, supabaseAdmin } from './supabase';

/**
 * Global search across companies, invoices, and support tickets.
 * Returns grouped results with a `type` tag.
 */
export async function globalSearch(query) {
  if (!query || query.trim().length < 2) return [];

  const q = query.trim();

  const [companies, invoices, tickets] = await Promise.all([
    // Companies: search by name or email
    (supabaseAdmin || supabase)
      .from('companies')
      .select('id, name, email, status')
      .or(`name.ilike.%${q}%,email.ilike.%${q}%`)
      .limit(5),

    // Invoices: search by invoice_number or joined company name
    (supabaseAdmin || supabase)
      .from('invoices')
      .select('id, invoice_number, amount, status, companies(name)')
      .ilike('invoice_number', `%${q}%`)
      .limit(5),

    // Support tickets: search by ticket_number or subject
    (supabaseAdmin || supabase)
      .from('support_tickets')
      .select('id, ticket_number, subject, status, companies(name)')
      .or(`ticket_number.ilike.%${q}%,subject.ilike.%${q}%`)
      .limit(5),
  ]);

  const results = [];

  (companies.data || []).forEach(c => results.push({
    type: 'company',
    id: c.id,
    title: c.name,
    subtitle: c.email,
    badge: c.status,
    to: '/companies',
  }));

  (invoices.data || []).forEach(inv => results.push({
    type: 'invoice',
    id: inv.id,
    title: inv.invoice_number,
    subtitle: `${inv.companies?.name ?? '—'} · $${Number(inv.amount).toLocaleString()}`,
    badge: inv.status,
    to: '/billing',
  }));

  (tickets.data || []).forEach(t => results.push({
    type: 'ticket',
    id: t.id,
    title: t.ticket_number,
    subtitle: `${t.subject} · ${t.companies?.name ?? '—'}`,
    badge: t.status,
    to: '/support',
  }));

  return results;
}
