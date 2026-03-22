'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

export type ScoreRow = { id: string; score: number; date_played: string };

function normalizeDate(d: string): string {
  if (!d) return new Date().toISOString().slice(0, 10);
  return d.slice(0, 10);
}

function padToFive(rows: ScoreRow[]): { score: number; date_played: string }[] {
  const today = new Date().toISOString().slice(0, 10);
  const base = rows.slice(0, 5).map((r) => ({
    score: r.score,
    date_played: normalizeDate(r.date_played),
  }));
  while (base.length < 5) {
    base.push({ score: 18, date_played: today });
  }
  return base;
}

export function UserScoresModal({
  userId,
  email,
  open,
  onClose,
  initialScores,
}: {
  userId: string;
  email: string;
  open: boolean;
  onClose: () => void;
  initialScores: ScoreRow[];
}) {
  const router = useRouter();
  const [rows, setRows] = useState(() => padToFive(initialScores));
  const [saving, setSaving] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setRows(padToFive(initialScores));
      setErr(null);
    }
  }, [open, initialScores, userId]);

  if (!open) return null;

  async function save() {
    setSaving(true);
    setErr(null);
    const res = await fetch(`/api/admin/users/${userId}/scores`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ entries: rows }),
    });
    const data = await res.json().catch(() => ({}));
    setSaving(false);
    if (!res.ok) {
      setErr(typeof data.error === 'string' ? data.error : 'Save failed');
      return;
    }
    router.refresh();
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="scores-modal-title"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-xl shadow-xl max-w-lg w-full p-6 max-h-[90vh] overflow-y-auto"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="scores-modal-title" className="text-xl font-bold text-gray-900 mb-1">
          Edit golf scores
        </h2>
        <p className="text-sm text-gray-600 mb-4">{email}</p>
        <p className="text-xs text-gray-500 mb-4">
          Exactly five scores (1–45) with date played each — used for monthly draws.
        </p>
        <div className="space-y-3">
          {rows.map((row, i) => (
            <div key={i} className="flex gap-2 items-center flex-wrap">
              <span className="text-sm text-gray-500 w-6 shrink-0">{i + 1}.</span>
              <label className="sr-only" htmlFor={`score-${i}`}>
                Score {i + 1}
              </label>
              <input
                id={`score-${i}`}
                type="number"
                min={1}
                max={45}
                className="border border-gray-200 rounded-lg px-2 py-1.5 w-24 text-gray-900"
                value={row.score}
                onChange={(e) => {
                  const v = e.target.value;
                  const next = [...rows];
                  next[i] = { ...next[i], score: v === '' ? 0 : Number(v) };
                  setRows(next);
                }}
              />
              <label className="sr-only" htmlFor={`date-${i}`}>
                Date {i + 1}
              </label>
              <input
                id={`date-${i}`}
                type="date"
                className="border border-gray-200 rounded-lg px-2 py-1.5 text-gray-900"
                value={row.date_played}
                onChange={(e) => {
                  const next = [...rows];
                  next[i] = { ...next[i], date_played: e.target.value };
                  setRows(next);
                }}
              />
            </div>
          ))}
        </div>
        {err ? <p className="text-red-600 text-sm mt-3">{err}</p> : null}
        <div className="flex gap-2 justify-end mt-6">
          <button
            type="button"
            className="px-4 py-2 border border-gray-200 rounded-lg text-gray-700 hover:bg-gray-50"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            type="button"
            disabled={saving}
            className="px-4 py-2 bg-charity-dark text-white rounded-lg hover:bg-black/90 disabled:opacity-50"
            onClick={save}
          >
            {saving ? 'Saving…' : 'Save scores'}
          </button>
        </div>
      </div>
    </div>
  );
}
