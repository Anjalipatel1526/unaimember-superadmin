import { supabase } from './supabase';

// ── Latest snapshot ───────────────────────────────────────────
export async function getLatestMetrics() {
  const { data, error } = await supabase
    .from('system_metrics')
    .select('*')
    .order('recorded_at', { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data ?? null;
}

// ── Last N snapshots for chart ────────────────────────────────
export async function getMetricsHistory(limit = 24) {
  const { data, error } = await supabase
    .from('system_metrics')
    .select('cpu_load, api_response_ms, active_sessions, recorded_at')
    .order('recorded_at', { ascending: true })
    .limit(limit);

  if (error) throw error;
  return data;
}

// ── Insert snapshot (call from your server/cron) ──────────────
export async function recordMetrics(payload) {
  const { error } = await supabase
    .from('system_metrics')
    .insert([payload]);

  if (error) throw error;
}
