const fs = require('fs');
const { createClient } = require('@supabase/supabase-js');

const env = fs.readFileSync('.env', 'utf8');
const getEnvVar = (name) => {
  const match = env.match(new RegExp(`^${name}=(.*)$`, 'm'));
  return match ? match[1].trim() : null;
};

const supabaseUrl = getEnvVar('VITE_SUPABASE_URL');
const anonKey = getEnvVar('VITE_SUPABASE_ANON_KEY');

const supabase = createClient(supabaseUrl, anonKey);

async function test() {
  // Let's get the first employee in the DB
  const { data: emps, error: err1 } = await supabase.from('employees').select('*').limit(1);
  if (err1) {
    console.error('Fetch employee failed:', err1);
    return;
  }
  if (!emps || emps.length === 0) {
    console.error('No employees found in DB');
    return;
  }
  const emp = emps[0];
  console.log('Testing update for employee ID:', emp.id);

  // Attempt to update age inside metadata
  const currentMeta = emp.pf_number ? JSON.parse(emp.pf_number) : {};
  const updatedMeta = { ...currentMeta, age: '35' };

  const { data: updateData, error: updateErr } = await supabase
    .from('employees')
    .update({ pf_number: JSON.stringify(updatedMeta) })
    .eq('id', emp.id)
    .select();

  if (updateErr) {
    console.error('Update failed:', updateErr);
  } else {
    console.log('Update succeeded:', updateData);
  }
}

test();
