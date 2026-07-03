const fs = require('fs');
const env = fs.readFileSync('.env', 'utf8');
const getEnvVar = (name) => {
  const match = env.match(new RegExp(`^${name}=(.*)$`, 'm'));
  return match ? match[1].trim() : null;
};

const supabaseUrl = getEnvVar('VITE_SUPABASE_URL');
const serviceKey = getEnvVar('VITE_SUPABASE_SERVICE_ROLE_KEY');

async function checkSchema() {
  const url = `${supabaseUrl}/rest/v1/`;
  try {
    const res = await fetch(url, {
      headers: {
        'apikey': serviceKey,
        'Authorization': `Bearer ${serviceKey}`
      }
    });
    const schema = await res.json();
    const schema = await res.json();
    const tableDef = schema.definitions.attendance;
    if (tableDef) {
      console.log('Attendance table columns:');
      console.log(Object.keys(tableDef.properties));
    } else {
      console.log('Attendance definition not found.');
    }
  } catch (e) {
    console.error('Failed to get schema:', e);
  }
}

checkSchema();
