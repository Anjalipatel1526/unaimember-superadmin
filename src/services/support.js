import { supabase, supabaseAdmin } from './supabase';

// ── All tickets with company name ────────────────────────────
export async function getTickets() {
  const { data, error } = await (supabaseAdmin || supabase)
    .from('support_tickets')
    .select('*, companies ( name )')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

// ── Messages for a ticket ────────────────────────────────────
export async function getTicketMessages(ticketId) {
  const { data, error } = await (supabaseAdmin || supabase)
    .from('ticket_messages')
    .select('*')
    .eq('ticket_id', ticketId)
    .order('created_at', { ascending: true });

  if (error) throw error;
  return data;
}

// ── Send a message ───────────────────────────────────────────
export async function sendMessage({ ticketId, senderName, senderRole, body }) {
  const { data, error } = await (supabaseAdmin || supabase)
    .from('ticket_messages')
    .insert([{
      ticket_id:   ticketId,
      sender_name: senderName,
      sender_role: senderRole,
      body,
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ── Update ticket status ─────────────────────────────────────
export async function updateTicketStatus(id, status) {
  const { data, error } = await (supabaseAdmin || supabase)
    .from('support_tickets')
    .update({ status })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ── Real-time subscription to new messages ───────────────────
export function subscribeToMessages(ticketId, callback) {
  return supabase
    .channel(`ticket-${ticketId}`)
    .on(
      'postgres_changes',
      {
        event:  'INSERT',
        schema: 'public',
        table:  'ticket_messages',
        filter: `ticket_id=eq.${ticketId}`,
      },
      payload => callback(payload.new)
    )
    .subscribe();
}

// ── Get tickets for a specific company ────────────────────────
export async function getCompanyTickets(companyId) {
  const { data, error } = await (supabaseAdmin || supabase)
    .from('support_tickets')
    .select('*')
    .eq('company_id', companyId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data;
}

// ── Create support ticket for a company ────────────────────────
export async function createSupportTicket(companyId, { subject, priority }) {
  const ticketNumber = `TKT-${Math.floor(100000 + Math.random() * 900000)}`;
  const { data, error } = await (supabaseAdmin || supabase)
    .from('support_tickets')
    .insert([{
      company_id: companyId,
      ticket_number: ticketNumber,
      subject,
      priority: priority || 'Medium',
      status: 'Open',
    }])
    .select()
    .single();

  if (error) throw error;
  return data;
}
