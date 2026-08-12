import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabasePublishableKey =
  import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY;

if (!supabaseUrl || !supabasePublishableKey) {
  throw new Error(
    'Missing Supabase environment variables. Check your .env.local file.'
  );
}

export const supabase = createClient(
  supabaseUrl,
  supabasePublishableKey
);
export const testSupabaseConnection = async () => {
  const { data, error } = await supabase.auth.getSession();

  if (error) {
    console.error('Supabase connection error:', error);
    return false;
  }

  console.log('Supabase connected successfully:', data);
  return true;
};