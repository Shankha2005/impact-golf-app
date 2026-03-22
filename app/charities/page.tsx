import { createClient } from '@/lib/supabase/server';
import CharityDirectoryClient from './CharityDirectoryClient';

/** Always fetch fresh rows (matches homepage); avoids stale static HTML with an empty list on Vercel. */
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function CharityDirectory() {
  const supabase = await createClient();

  // Keep the select aligned with `app/page.tsx` so the same RLS/columns work everywhere.
  // Optional columns (image_url, slug) are omitted here so a partial schema never returns PGRST204.
  const { data, error } = await supabase
    .from('charities')
    .select('id, name, description, is_featured')
    .order('is_featured', { ascending: false })
    .order('name', { ascending: true });

  if (error) {
    console.error('[charities/page]', error.message, error.code, error.details);
  }

  const list = Array.isArray(data) ? data : [];

  return (
    <div className="max-w-7xl mx-auto px-6 py-16">
      <div className="text-center mb-16">
        <h1 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tight mb-4">
          Our Partner Charities
        </h1>
        <p className="text-xl text-gray-600 max-w-2xl mx-auto">
          When you subscribe, you choose where your contribution goes. Explore the incredible
          organizations making an impact today.
        </p>
      </div>

      <CharityDirectoryClient charities={list} loadError={error?.message ?? null} />
    </div>
  );
}
