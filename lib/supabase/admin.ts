import { createClient } from '@supabase/supabase-js';

/**
 * Server-only Supabase client with service role key.
 * Use for admin operations that bypass RLS (user management, draws, etc.)
 */
export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  const validUrl = supabaseUrl && /^https?:\/\//.test(supabaseUrl) ? supabaseUrl : 'https://placeholder.supabase.co';
  const validKey = serviceRoleKey && !serviceRoleKey.includes('placeholder') ? serviceRoleKey : 'placeholder-key';
  return createClient(validUrl, validKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
