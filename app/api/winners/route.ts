import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function PATCH(request: Request) {
  try {
    const serverSupabase = await createClient();
    const { data: { user } } = await serverSupabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const { data: profile } = await serverSupabase.from('profiles').select('role').eq('id', user.id).single();
    if (profile?.role !== 'admin') return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const body = await request.json();
    const { winnerId, status } = body;
    const verificationStatus = status?.toLowerCase() === 'approved' ? 'approved' : status?.toLowerCase() === 'rejected' ? 'rejected' : 'pending';
    const paymentState = verificationStatus === 'approved' ? 'paid' : 'pending';

    const admin = createAdminClient();
    const { data, error } = await admin
      .from('winners')
      .update({ verification_status: verificationStatus, payment_state: paymentState })
      .eq('id', winnerId);

    if (error) throw error;

    return NextResponse.json({ message: `Winner ${status}`, data }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update winner status' }, { status: 500 });
  }
}