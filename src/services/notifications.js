import { supabase, supabaseAdmin } from './supabase';

export async function getNotifications() {
  const { data, error } = await (supabaseAdmin || supabase)
    .from('audit_logs')
    .select('id, type, action, target, user_name, created_at, outcome')
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) throw error;
  return data ?? [];
}

export async function getUnreadCount() {
  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { count, error } = await (supabaseAdmin || supabase)
    .from('audit_logs')
    .select('id', { count: 'exact', head: true })
    .gte('created_at', since);

  if (error) return 0;
  return count ?? 0;
}
