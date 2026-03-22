import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

const getSupabaseConfig = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const validUrl = url && /^https?:\/\//.test(url) ? url : 'https://placeholder.supabase.co';
  const validKey = key && !key.includes('placeholder') ? key : 'placeholder-key';
  return { validUrl, validKey };
};

export async function createClient() {
  const cookieStore = await cookies();
  const { validUrl, validKey } = getSupabaseConfig();
  return createServerClient(
    validUrl,
    validKey,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Called from Server Component
          }
        },
      },
    }
  );
}
