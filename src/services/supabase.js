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

export default supabase;
