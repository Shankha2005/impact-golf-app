import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';
import { redirect } from 'next/navigation';
import CharityManager from './CharityManager';

export default async function CharityManagement() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth/login');

  const { data: profile } = await supabase.from('profiles').select('role').eq('id', user.id).single();
  if (profile?.role !== 'admin') redirect('/dashboard');

  const admin = createAdminClient();
  const { data: charities } = await admin.from('charities').select('*').order('is_featured', { ascending: false });

  return (
    <div className="max-w-4xl">
      <CharityManager charities={charities ?? []} />
    </div>
  );
}
