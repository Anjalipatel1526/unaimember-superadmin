import { createClient } from '@supabase/supabase-js';

const getEnv = (name) => {
  if (typeof process !== 'undefined' && process.env && process.env[name]) {
    return process.env[name];
  }
  try {
    if (import.meta && import.meta.env && import.meta.env[name]) {
      return import.meta.env[name];
    }
  } catch (e) {}
  return null;
};

const supabaseUrl  = getEnv('NEXT_PUBLIC_SUPABASE_URL') || getEnv('VITE_SUPABASE_URL') || 'https://nchqkbabvzhedzyomefu.supabase.co';
const supabaseKey  = getEnv('NEXT_PUBLIC_SUPABASE_ANON_KEY') || getEnv('VITE_SUPABASE_ANON_KEY') || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder';
const serviceKey   = getEnv('VITE_SUPABASE_SERVICE_ROLE_KEY') || getEnv('NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY');

if (supabaseKey.includes('placeholder')) {
  console.warn(
    '\x1b[33m%s\x1b[0m',
    '[Supabase] WARNING: Running with placeholder API key. Please configure NEXT_PUBLIC_SUPABASE_ANON_KEY in your .env.local file.'
  );
} else if (!getEnv('VITE_SUPABASE_URL') && !getEnv('NEXT_PUBLIC_SUPABASE_URL')) {
  console.warn(
    '[Supabase] Missing env vars. Add VITE_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_URL to your environment.'
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

export const supabaseKeyIsPlaceholder = !supabaseKey || supabaseKey.includes('placeholder');

export default supabase;
