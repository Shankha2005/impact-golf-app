import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function GET() {
  try {
    const supabase = await createClient();
    const { data, error } = await supabase
      .from('charities')
      .select('*')
      .order('is_featured', { ascending: false }); // Feature charities first [cite: 83]

    if (error) throw error;
    return NextResponse.json(data ?? [], { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch charities' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const serverSupabase = await createClient();
    const { data: { user } } = await serverSupabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: profile } = await serverSupabase.from('profiles').select('role').eq('id', user.id).single();
    if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const body = await request.json();
    const { name, description, imageUrl, isFeatured } = body;
    const admin = createAdminClient();

    const { data, error } = await admin
      .from('charities')
      .insert([{ name, description, image_url: imageUrl, is_featured: isFeatured ?? false }])
      .select()
      .single();

    if (error) throw error;
    return NextResponse.json({ message: 'Charity created', data }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create charity' }, { status: 500 });
  }
}