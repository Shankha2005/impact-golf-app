'use client';

import { useState, useEffect, useRef } from 'react';
import { formatUsd, moneyAmount } from '@/lib/money';

type Winner = {
  id: string;
  match_type: string;
  amount: number;
  proof_url: string | null;
  verification_status: string;
  payment_state: string;
  created_at: string;
  draws: { draw_date: string } | null;
};

export default function WinningsPage() {
  const [winners, setWinners] = useState<Winner[]>([]);
  const [uploading, setUploading] = useState<string | null>(null);
  const [uploadTarget, setUploadTarget] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetch('/api/me/winners')
      .then(async (r) => {
        const data = await r.json().catch(() => null);
        if (!r.ok || !Array.isArray(data)) return [];
        return data as Winner[];
      })
      .then(setWinners)
      .catch(() => setWinners([]));
  }, []);

  const totalWon = Array.isArray(winners)
    ? winners
        .filter((w) => (w?.verification_status ?? '') === 'approved')
        .reduce((sum, w) => sum + moneyAmount(w?.amount), 0)
    : 0;

  async function handleFileSelect() {
    const input = fileInputRef.current;
    if (!input?.files?.length || !uploadTarget) return;
    handleUpload(uploadTarget, input.files[0]);
    setUploadTarget(null);
    input.value = '';
  }

  async function handleUpload(winnerId: string, file: File) {
    setUploading(winnerId);
    try {
      const formData = new FormData();
      formData.set('winnerId', winnerId);
      formData.set('file', file);
      const res = await fetch('/api/me/proof', {
        method: 'POST',
        body: formData,
      });
      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || data.hint || 'Upload failed');
      }
      setWinners((prev) =>
        prev.map((w) =>
          w.id === winnerId ? { ...w, proof_url: data.proofUrl } : w
        )
      );
    } catch (e) {
      alert(
        e instanceof Error
          ? e.message
          : 'Upload failed. Add SUPABASE_SERVICE_ROLE_KEY on the server, create the "proofs" bucket, and run 0005_storage_proofs.sql.'
      );
    } finally {
      setUploading(null);
    }
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Winnings &amp; upload proof</h1>
      <p className="text-gray-600 text-sm mb-6">
        <strong>Where to upload:</strong> this page — when you have a winning row with status &quot;pending&quot;,
        use <strong>Upload proof</strong> (screenshot of your scores). Admins review it under{' '}
        <strong>Admin → Winners &amp; proof review</strong> (only users with <code className="bg-gray-100 px-1 rounded">role = admin</code>).
      </p>

      <div className="bg-charity-dark text-white p-6 rounded-xl shadow-lg mb-8">
        <h3 className="text-green-100 font-medium text-sm">Total Lifetime Winnings</h3>
        <p className="text-4xl font-bold mt-1">${formatUsd(totalWon)}</p>
      </div>

      {winners.length === 0 ? (
        <div className="bg-white p-8 rounded-xl border border-gray-100 shadow-sm text-center text-gray-600">
          No winnings yet. Keep entering draws!
        </div>
      ) : (
        <div className="space-y-6">
          {winners.map((w) => (
            <div
              key={w.id}
              className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm"
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="font-bold text-gray-900">{w.match_type ?? '—'}</h2>
                  <p className="text-sm text-gray-500">
                    Draw:{' '}
                    {w.draws?.draw_date ? new Date(String(w.draws.draw_date)).toLocaleDateString() : '—'}
                  </p>
                </div>
                <span className="text-xl font-bold text-charity">${formatUsd(w?.amount)}</span>
              </div>

              <div className="flex gap-2 flex-wrap">
                <span
                  className={`px-2 py-1 text-xs rounded-full ${
                    (w.verification_status ?? '') === 'approved'
                      ? 'bg-green-100 text-green-800'
                      : (w.verification_status ?? '') === 'rejected'
                      ? 'bg-red-100 text-red-800'
                      : 'bg-yellow-100 text-yellow-800'
                  }`}
                >
                  {w.verification_status ?? '—'}
                </span>
                <span
                  className={`px-2 py-1 text-xs rounded-full ${
                    (w.payment_state ?? '') === 'paid' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  {w.payment_state ?? '—'}
                </span>
              </div>

              {!w.proof_url && (w.verification_status ?? '') === 'pending' && (
                <div className="mt-4">
                  <p className="text-sm text-gray-600 mb-2">
                    Upload a screenshot of your scores from the golf platform.
                  </p>
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={handleFileSelect}
                  />
                  <button
                    onClick={() => {
                      setUploadTarget(w.id);
                      fileInputRef.current?.click();
                    }}
                    disabled={!!uploading}
                    className="px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-black transition text-sm font-medium disabled:opacity-50"
                  >
                    {uploading === w.id ? 'Uploading...' : 'Upload proof'}
                  </button>
                </div>
              )}
              {w.proof_url && (
                <p className="mt-2 text-sm text-green-700">Proof uploaded ✓</p>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
