'use client';

import { useState } from 'react';

export default function DrawManagement() {
  const [logic, setLogic] = useState('random');
  const [prizePool, setPrizePool] = useState('10000');
  const [simulationResult, setSimulationResult] = useState<{
    winningNumbers: number[];
    pools?: { match5: number; match4: number; match3: number };
  } | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  async function handleSimulate() {
    setLoading(true);
    setMessage('');
    try {
      const res = await fetch('/api/draws', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          logicType: logic,
          isSimulation: true,
          totalPrizePool: Number(prizePool),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      setSimulationResult({
        winningNumbers: data.winningNumbers,
        pools: data.pools,
      });
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Simulation failed');
    } finally {
      setLoading(false);
    }
  }

  async function handlePublish() {
    if (!confirm('Publish this draw? This will determine winners and cannot be undone.')) return;
    setLoading(true);
    setMessage('');
    try {
      const res = await fetch('/api/draws', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          logicType: logic,
          isSimulation: false,
          totalPrizePool: Number(prizePool),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      setMessage('Draw published successfully! Check winner amounts — they come from the prize pool you entered.');
      setSimulationResult(null);
    } catch (err) {
      setMessage(err instanceof Error ? err.message : 'Publish failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl">
      <h1 className="text-3xl font-bold mb-8">Draw Management</h1>

      {message && (
        <div
          className={`mb-6 p-4 rounded-lg ${
            message.includes('success') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
          }`}
        >
          {message}
        </div>
      )}

      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 space-y-6">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Total Prize Pool ($)</label>
          <input
            type="number"
            min="1"
            step="100"
            value={prizePool}
            onChange={(e) => setPrizePool(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-charity focus:border-charity"
          />
          <p className="text-sm text-gray-500 mt-2">
            Each winner&apos;s <strong>Amount</strong> is their share of this pool: <strong>40%</strong> (5-match),{' '}
            <strong>35%</strong> (4-match), <strong>25%</strong> (3-match), split equally within the tier. If you
            published with <strong>$0</strong> here, all amounts stay <strong>$0.00</strong> — enter a real pool
            before <strong>Publish Official Draw</strong>, or run the recalc SQL in <code className="text-xs bg-gray-100 px-1">README.md</code> after fixing the draw row.
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Draw Logic</label>
          <select
            value={logic}
            onChange={(e) => setLogic(e.target.value)}
            className="w-full p-3 border border-gray-300 rounded-lg focus:ring-charity focus:border-charity"
          >
            <option value="random">Standard Random Draw</option>
            <option value="algorithmic">Algorithmic (Weighted by Scores)</option>
          </select>
        </div>

        <div className="flex gap-4">
          <button
            onClick={handleSimulate}
            disabled={loading}
            className="px-6 py-3 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 transition disabled:opacity-50"
          >
            Run Simulation
          </button>
          <button
            onClick={handlePublish}
            disabled={loading}
            className="px-6 py-3 bg-charity-dark text-white font-medium rounded-lg hover:bg-green-800 transition shadow-lg shadow-green-200 disabled:opacity-50"
          >
            Publish Official Draw
          </button>
        </div>

        {simulationResult && (
          <div className="mt-6 p-4 bg-charity-light rounded-lg border border-green-200">
            <h3 className="text-green-800 font-semibold mb-2">Simulation Results</h3>
            <div className="flex gap-2 flex-wrap mb-4">
              {simulationResult.winningNumbers.map((num, i) => (
                <span
                  key={i}
                  className="w-10 h-10 flex items-center justify-center bg-white rounded-full font-bold text-charity-dark shadow-sm"
                >
                  {num}
                </span>
              ))}
            </div>
            {simulationResult.pools && (
              <div className="text-sm text-green-800 space-y-1">
                <p>5-Match pool: ${simulationResult.pools.match5.toFixed(2)}</p>
                <p>4-Match pool: ${simulationResult.pools.match4.toFixed(2)}</p>
                <p>3-Match pool: ${simulationResult.pools.match3.toFixed(2)}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
