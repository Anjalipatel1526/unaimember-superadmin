import { supabase } from './supabase';

// ── All plans ────────────────────────────────────────────────
export async function getPlans() {
  const { data, error } = await supabase
    .from('subscription_plans')
    .select('*')
    .order('price', { ascending: true });

  if (error) throw error;
  return data;
}

// ── Active subscription count ─────────────────────────────────
export async function getActiveSubscriptionCount() {
  const { count, error } = await supabase
    .from('companies')
    .select('id', { count: 'exact', head: true })
    .eq('status', 'Active');

  if (error) throw error;
  return count ?? 0;
}

// ── Update plan ──────────────────────────────────────────────
export async function updatePlan(id, payload) {
  const { data, error } = await supabase
    .from('subscription_plans')
    .update(payload)
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}

// ── Toggle plan enabled state ────────────────────────────────
export async function togglePlan(id, enabled) {
  return updatePlan(id, { enabled });
}
