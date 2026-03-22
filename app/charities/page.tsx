import { createClient } from '@/lib/supabase/server';
import CharityDirectoryClient from './CharityDirectoryClient';

export default async function CharityDirectory() {
  const supabase = await createClient();
  const { data: charities } = await supabase
    .from('charities')
    .select('id, name, description, image_url, is_featured, slug')
    .order('is_featured', { ascending: false });

  const list = charities ?? [];

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

      <CharityDirectoryClient charities={list} />
    </div>
  );
}
