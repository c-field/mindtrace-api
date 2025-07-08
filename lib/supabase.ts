import { createClient } from '@supabase/supabase-js';

// Debug log: confirm service role key is loaded
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
console.log("Using Supabase key (start):", supabaseKey?.slice(0, 8));

const supabase = createClient(
  process.env.SUPABASE_URL!,
  supabaseKey!
);

export default supabase;