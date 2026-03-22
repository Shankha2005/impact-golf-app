'use client';

import { useState, useEffect } from 'react';

type Score = { id: string; score: number; date_played: string };

export default function ScoreEntry() {
  const [score, setScore] = useState('');
  const [datePlayed, setDatePlayed] = useState(new Date().toISOString().slice(0, 10));
  const [recentScores, setRecentScores] = useState<Score[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function fetchScores() {
    const res = await fetch(`/api/scores?t=${Date.now()}`, { cache: 'no-store' });
    if (!res.ok) return;
    const data = await res.json();
    setRecentScores(Array.isArray(data) ? data : []);
  }

  useEffect(() => {
    fetchScores();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/scores', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        cache: 'no-store',
        body: JSON.stringify({ score: Number(score), datePlayed }),
      });
      const data = await res.json();
      if (!res.ok) {
        const detail = [data.error, data.code].filter(Boolean).join(' ');
        throw new Error(detail || 'Failed to save score');
      }
      setScore('');
      setDatePlayed(new Date().toISOString().slice(0, 10));
      await fetchScores();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">My Golf Scores</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm h-fit">
          <h2 className="text-lg font-bold mb-4">Enter New Score</h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <p className="text-sm text-red-600">{error}</p>
            )}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Stableford Score (1-45)</label>
              <input
                type="number"
                min={1}
                max={45}
                required
                value={score}
                onChange={(e) => setScore(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-charity focus:border-charity"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date Played</label>
              <input
                type="date"
                required
                value={datePlayed}
                onChange={(e) => setDatePlayed(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-charity focus:border-charity"
              />
            </div>
            <button
              type="submit"
              disabled={loading}
              className="w-full py-2 bg-charity text-white rounded-lg hover:bg-charity-dark transition font-medium disabled:opacity-50"
            >
              {loading ? 'Submitting...' : 'Submit Score'}
            </button>
          </form>
        </div>

        <div className="bg-gray-50 p-6 rounded-xl border border-gray-200">
          <h2 className="text-lg font-bold mb-4">Last 5 Scores</h2>
          <p className="text-sm text-gray-500 mb-4">
            Only your latest 5 scores are kept. Oldest scores drop off automatically.
          </p>

          <ul className="space-y-3">
            {recentScores.length === 0 ? (
              <li className="text-gray-500 text-sm">No scores yet. Add your first score above.</li>
            ) : (
              recentScores.map((s) => (
                <li
                  key={s.id}
                  className="flex justify-between items-center bg-white p-3 rounded-lg border border-gray-100 shadow-sm"
                >
                  <span className="font-medium text-gray-900">{s.score} pts</span>
                  <span className="text-sm text-gray-500">{s.date_played}</span>
                </li>
              ))
            )}
          </ul>
        </div>
      </div>
    </div>
  );
}
