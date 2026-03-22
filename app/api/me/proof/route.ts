import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

/**
 * Upload proof to Storage (as the user), then persist proof_url on winners using
 * the service role. Subscribers have no RLS UPDATE on `winners`, so a plain
 * client update silently affects 0 rows / fails — proofs never saved before.
 */
export async function POST(request: Request) {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const formData = await request.formData();
    const winnerId = formData.get('winnerId') as string;
    const file = formData.get('file') as File;
    if (!winnerId || !file?.size) {
      return NextResponse.json({ error: 'winnerId and file required' }, { status: 400 });
    }

    const { data: winner, error: winErr } = await supabase
      .from('winners')
      .select('id, user_id')
      .eq('id', winnerId)
      .eq('user_id', user.id)
      .single();

    if (winErr || !winner) {
      return NextResponse.json({ error: 'Winner not found' }, { status: 404 });
    }

    const ext = file.name.split('.').pop() || 'png';
    const safeExt = /^[a-z0-9]+$/i.test(ext) ? ext : 'png';
    // Path is inside bucket "proofs" — do not prefix with bucket name
    const path = `${user.id}/${winnerId}-${Date.now()}.${safeExt}`;

    const bytes = await file.arrayBuffer();
    const { error: uploadError } = await supabase.storage.from('proofs').upload(path, bytes, {
      contentType: file.type || 'image/png',
      upsert: true,
    });

    if (uploadError) {
      console.error('[proof] storage upload:', uploadError);
      return NextResponse.json(
        {
          error: uploadError.message,
          hint: 'Create a public "proofs" bucket and storage policies (see supabase/migrations/0005_storage_proofs.sql).',
        },
        { status: 400 }
      );
    }

    const { data: urlData } = supabase.storage.from('proofs').getPublicUrl(path);
    const proofUrl = urlData.publicUrl;

    const admin = createAdminClient();
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
    if (!serviceKey || serviceKey.includes('placeholder')) {
      console.error('[proof] SUPABASE_SERVICE_ROLE_KEY missing — cannot save proof_url');
      return NextResponse.json(
        {
          error:
            'Server missing SUPABASE_SERVICE_ROLE_KEY. Add it in .env.local and Vercel so proof URLs can be saved.',
        },
        { status: 503 }
      );
    }

    const { data: updated, error: updateError } = await admin
      .from('winners')
      .update({ proof_url: proofUrl, updated_at: new Date().toISOString() })
      .eq('id', winnerId)
      .eq('user_id', user.id)
      .select('id, proof_url')
      .maybeSingle();

    if (updateError) {
      console.error('[proof] db update:', updateError);
      return NextResponse.json({ error: updateError.message || 'Failed to save proof URL' }, { status: 500 });
    }

    if (!updated?.proof_url) {
      return NextResponse.json({ error: 'No row updated — check winner id and user' }, { status: 500 });
    }

    return NextResponse.json({ proofUrl: updated.proof_url });
  } catch (error) {
    console.error('[proof] unexpected:', error);
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}
