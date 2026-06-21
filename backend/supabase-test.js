// Simple Node script to test Supabase connection (backend). Replace values in `backend/.env`.
require('dotenv').config({ path: require('path').join(__dirname, '.env') });

(async () => {
  const { createClient } = await import('@supabase/supabase-js');

  const url = process.env.SUPABASE_URL || 'https://your-project.supabase.co';
  const key = process.env.SUPABASE_KEY || 'your-service-or-anon-key';

  const supabase = createClient(url, key);

  try {
    const { data, error } = await supabase.from('users').select('*').limit(10);
    if (error) {
      console.error('Supabase error:', error);
      process.exit(1);
    }
    console.log('Users:', data);
  } catch (err) {
    console.error('Test failed:', err);
    process.exit(1);
  }
})();
