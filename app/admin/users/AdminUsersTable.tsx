'use client';

import { useState } from 'react';
import { UserScoresModal, type ScoreRow } from './UserScoresModal';

export type AdminUserRow = {
  id: string;
  email: string;
  full_name: string | null;
  role: string;
  created_at: string;
  subscription: {
    status: string;
    plan: string;
    current_period_end: string | null;
  } | null;
  scores: ScoreRow[];
};

export function AdminUsersTable({ users }: { users: AdminUserRow[] }) {
  const [editing, setEditing] = useState<AdminUserRow | null>(null);

  return (
    <>
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left min-w-[720px]">
            <thead className="bg-gray-50 text-gray-600 text-sm border-b border-gray-100">
              <tr>
                <th className="p-4">Email</th>
                <th className="p-4">Name</th>
                <th className="p-4">Role</th>
                <th className="p-4">Subscription</th>
                <th className="p-4">Status</th>
                <th className="p-4">Latest scores</th>
                <th className="p-4 w-36">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {users.map((u) => (
                <tr key={u.id}>
                  <td className="p-4 font-medium">{u.email}</td>
                  <td className="p-4">{u.full_name || '—'}</td>
                  <td className="p-4 capitalize">{u.role}</td>
                  <td className="p-4 capitalize">{u.subscription?.plan ?? '—'}</td>
                  <td className="p-4">
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${
                        u.subscription?.status === 'active'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-gray-100 text-gray-700'
                      }`}
                    >
                      {u.subscription?.status ?? '—'}
                    </span>
                  </td>
                  <td className="p-4 text-sm text-gray-500">
                    {u.scores.length ? u.scores.map((s) => s.score).join(', ') : '—'}
                  </td>
                  <td className="p-4">
                    <button
                      type="button"
                      onClick={() => setEditing(u)}
                      className="text-sm font-medium text-charity-dark hover:underline"
                    >
                      Edit scores
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {editing ? (
        <UserScoresModal
          key={editing.id}
          userId={editing.id}
          email={editing.email}
          open
          onClose={() => setEditing(null)}
          initialScores={editing.scores}
        />
      ) : null}
    </>
  );
}
