import { supabase, supabaseAdmin } from './supabase';

export async function loginCompany(email, password) {
  try {
    // Try querying with password filter first (standard secure way)
    const { data: creds, error } = await (supabaseAdmin || supabase)
      .from('company_credentials')
      .select('*, companies(*)')
      .eq('login_email', email)
      .eq('login_password', password)
      .eq('is_active', true)
      .maybeSingle();

    if (error) {
      // If column not found / cache issue, fallback to email-only query and client-side check
      if (error.code === 'PGRST204' || error.message?.includes('login_password') || error.message?.includes('schema cache')) {
        const { data: fallbackCreds, error: fallbackError } = await (supabaseAdmin || supabase)
          .from('company_credentials')
          .select('*, companies(*)')
          .eq('login_email', email)
          .eq('is_active', true)
          .maybeSingle();

        if (fallbackError) throw fallbackError;
        if (!fallbackCreds) throw new Error('Invalid email or password.');

        // If the column is completely missing/uncached in the response object, we raise a helpful error.
        if ('login_password' in fallbackCreds) {
          if (fallbackCreds.login_password !== password) {
            throw new Error('Invalid email or password.');
          }
        } else {
          throw new Error('Database schema cache is out of date. Please go to Supabase Dashboard -> Settings -> API -> click "Reload schema cache" to enable login password verification.');
        }

        // Update last_login_at
        await (supabaseAdmin || supabase)
          .from('company_credentials')
          .update({ last_login_at: new Date().toISOString() })
          .eq('id', fallbackCreds.id);

        const company = fallbackCreds.companies;
        return {
          companyId: fallbackCreds.company_id,
          companyName: company?.name || 'Company Portal',
          email: fallbackCreds.login_email,
          role: fallbackCreds.role,
          companyDetails: company
        };
      }
      throw error;
    }

    if (!creds) {
      throw new Error('Invalid email or password.');
    }

    // Update last_login_at
    await (supabaseAdmin || supabase)
      .from('company_credentials')
      .update({ last_login_at: new Date().toISOString() })
      .eq('id', creds.id);

    const company = creds.companies;
    return {
      companyId: creds.company_id,
      companyName: company?.name || 'Company Portal',
      email: creds.login_email,
      role: creds.role,
      companyDetails: company
    };
  } catch (err) {
    throw err;
  }
}
