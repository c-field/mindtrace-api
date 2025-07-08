import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase environment variables');
}

console.log("Using Supabase key:", supabaseKey?.slice(0, 8));

const supabase = createClient(supabaseUrl, supabaseKey);

export default supabase;