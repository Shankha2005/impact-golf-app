import { createBrowserClient } from '@supabase/ssr';

export function isSupabaseConfigured() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL?.trim();
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim();
  return !!(
    url &&
    url.startsWith('https://') &&
    url.includes('.supabase.co') &&
    !url.includes('placeholder') &&
    key &&
    key.length > 20 &&
    !key.includes('placeholder') &&
    !key.includes('your_')
  );
}

export function createClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const validUrl = url && /^https?:\/\//.test(url) ? url : 'https://placeholder.supabase.co';
  const validKey = key && !key.includes('placeholder') ? key : 'placeholder-key';
  return createBrowserClient(validUrl, validKey);
}
