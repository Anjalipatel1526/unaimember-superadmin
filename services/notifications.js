import { supabase, supabaseAdmin, supabaseKeyIsPlaceholder } from './supabase';

export async function getNotifications() {
  if (supabaseKeyIsPlaceholder) {
    return [
      {
        id: '1',
        type: 'system',
        action: 'Create Client Company',
        target: 'Story Seed Studio',
        user_name: 'Super Admin',
        created_at: new Date(Date.now() - 3600000).toISOString(),
        outcome: 'Success'
      },
      {
        id: '2',
        type: 'billing',
        action: 'Invoice Generation',
        target: 'INV-0002',
        user_name: 'System Scheduler',
        created_at: new Date(Date.now() - 86400000).toISOString(),
        outcome: 'Success'
      }
    ];
  }

  const { data, error } = await (supabaseAdmin || supabase)
    .from('audit_logs')
    .select('id, type, action, target, user_name, created_at, outcome')
    .order('created_at', { ascending: false })
    .limit(20);

  if (error) throw error;
  return data ?? [];
}

export async function getUnreadCount() {
  if (supabaseKeyIsPlaceholder) {
    return 2;
  }

  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const { count, error } = await (supabaseAdmin || supabase)
    .from('audit_logs')
    .select('id', { count: 'exact', head: true })
    .gte('created_at', since);

  if (error) return 0;
  return count ?? 0;
}
