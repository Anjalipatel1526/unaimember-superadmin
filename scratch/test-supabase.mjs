import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://nchqkbabvzhedzyomefu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.placeholder'; // Wait, let's see if we can read env first, but let's test this placeholder first.

const supabase = createClient(supabaseUrl, supabaseKey);

async function run() {
  console.log('Testing connection to Supabase...');
  try {
    const { data, error } = await supabase.from('companies').select('*');
    if (error) {
      console.error('Error fetching companies:', error);
    } else {
      console.log('Companies data:', data);
    }
  } catch (err) {
    console.error('Exception fetching companies:', err);
  }

  try {
    const { data, error } = await supabase.from('audit_logs').select('*');
    if (error) {
      console.error('Error fetching audit_logs:', error);
    } else {
      console.log('Audit logs data:', data);
    }
  } catch (err) {
    console.error('Exception fetching audit_logs:', err);
  }
}

run();
