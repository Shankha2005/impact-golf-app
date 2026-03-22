'use client';

import { useState } from 'react';
import { formatUsd } from '@/lib/money';

type Winner = {
  id: string;
  email?: string;
  match_type: string;
  amount: number;
  proof_url: string | null;
  verification_status: string;
  payment_state: string;
  drawDate?: string;
};

export default function WinnersTable({ winners }: { winners: Winner[] }) {
  const [localWinners, setLocalWinners] = useState(winners);

  async function handleVerify(id: string, status: 'approved' | 'rejected') {
    const res = await fetch('/api/winners', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ winnerId: id, status }),
    });
    if (!res.ok) return;
    setLocalWinners((prev) =>
      prev.map((w) =>
        w.id === id
          ? {
              ...w,
              verification_status: status,
              payment_state: status === 'approved' ? 'paid' : 'pending',
            }
          : w
      )
    );
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-gray-500">
        <strong>Approve / Reject</strong> appears only when status is <em>pending</em> and the user has uploaded a
        proof file.
      </p>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
      <table className="w-full text-left">
        <thead className="bg-gray-50 text-gray-600 text-sm border-b border-gray-100">
          <tr>
            <th className="p-4">Email</th>
            <th className="p-4">Match</th>
            <th className="p-4">Amount</th>
            <th className="p-4">Draw Date</th>
            <th className="p-4">Proof (review)</th>
            <th className="p-4">Verification</th>
            <th className="p-4">Payment</th>
            <th className="p-4">Actions</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          {localWinners.length === 0 ? (
            <tr>
              <td colSpan={8} className="p-8 text-center text-gray-500">
                No winners yet
              </td>
            </tr>
          ) : (
            localWinners.map((w) => (
              <tr key={w.id}>
                <td className="p-4 font-medium">{w.email ?? '—'}</td>
                <td className="p-4">{w.match_type}</td>
                <td className="p-4">${formatUsd(w.amount)}</td>
                <td className="p-4">
                  {w.drawDate ? new Date(w.drawDate).toLocaleDateString() : '—'}
                </td>
                <td className="p-4">
                  {w.proof_url ? (
                    <a
                      href={w.proof_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-charity hover:underline"
                    >
                      View
                    </a>
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
                </td>
                <td className="p-4">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      w.verification_status === 'approved'
                        ? 'bg-green-100 text-green-700'
                        : w.verification_status === 'rejected'
                        ? 'bg-red-100 text-red-700'
                        : 'bg-yellow-100 text-yellow-800'
                    }`}
                  >
                    {w.verification_status}
                  </span>
                </td>
                <td className="p-4">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      w.payment_state === 'paid' ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-700'
                    }`}
                  >
                    {w.payment_state}
                  </span>
                </td>
                <td className="p-4">
                  {w.verification_status === 'pending' && w.proof_url && (
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleVerify(w.id, 'approved')}
                        className="text-green-600 hover:underline text-sm font-medium"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleVerify(w.id, 'rejected')}
                        className="text-red-600 hover:underline text-sm font-medium"
                      >
                        Reject
                      </button>
                    </div>
                  )}
                </td>
              </tr>
            ))
          )}
        </tbody>
      </table>
      </div>
    </div>
  );
}
