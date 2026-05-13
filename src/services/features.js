import { supabase } from './supabase';

// ── All features ─────────────────────────────────────────────
export async function getFeatures() {
  const { data, error } = await supabase
    .from('features')
    .select('*')
    .order('title', { ascending: true });

  if (error) throw error;
  return data;
}

// ── Toggle a feature on/off ───────────────────────────────────
export async function toggleFeature(id, enabled) {
  const { data, error } = await supabase
    .from('features')
    .update({ enabled })
    .eq('id', id)
    .select()
    .single();

  if (error) throw error;
  return data;
}
