import { createClient } from '@supabase/supabase-js';

const supabaseUrl  = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey  = import.meta.env.VITE_SUPABASE_ANON_KEY;
const serviceKey   = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error(
    '[Supabase] Missing env vars. Add VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY to your .env file.'
  );
}

// Regular anon client — used for all standard operations
export const supabase = createClient(supabaseUrl, supabaseKey);

// Admin client — uses service role key to bypass RLS and create Auth users
// Only used in Super Admin actions (company/user creation)
export const supabaseAdmin = serviceKey && serviceKey !== 'your-service-role-key-here'
  ? createClient(supabaseUrl, serviceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
  : null;

// In-memory cache to store company ID to table prefix mappings
let companyPrefixCache = {};

export async function resolveTenantTableName(companyId, baseTableName) {
  if (!companyId) return baseTableName;

  const cleanId = companyId.replace(/-/g, '_');
  
  if (companyPrefixCache[companyId]) {
    return `company_${companyPrefixCache[companyId]}_${baseTableName}`;
  }

  try {
    const { data, error } = await (supabaseAdmin || supabase)
      .from('companies')
      .select('name')
      .eq('id', companyId)
      .maybeSingle();

    if (data && data.name) {
      const cleanName = data.name.toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .trim()
        .replace(/\s+/g, '_');
      const shortId = cleanId.split('_')[0]; // first segment of UUID
      const prefix = `${cleanName}_${shortId}`;
      companyPrefixCache[companyId] = prefix;
      return `company_${prefix}_${baseTableName}`;
    }
  } catch (e) {
    console.error('Failed to resolve tenant table prefix', e);
  }

  // Fallback to simple clean UUID prefix if lookup fails
  return `company_${cleanId}_${baseTableName}`;
}

export function getTenantTableName(companyId, baseTableName) {
  if (!companyId) return baseTableName;
  const cleanId = companyId.replace(/-/g, '_');
  return `company_${cleanId}_${baseTableName}`;
}

export default supabase;
