import { createClient } from '@supabase/supabase-js';

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const validUrl = url && /^https?:\/\//.test(url) ? url : 'https://placeholder.supabase.co';
const validKey = key && !key.includes('placeholder') ? key : 'placeholder-key';

export const supabase = createClient(validUrl, validKey);