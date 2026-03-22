'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

type Charity = { id: string; name: string };
type Sub = { status: string; plan: string; current_period_end: string } | null;
type CharityPref = { charity_id: string; contribution_percent: number; charities: { name: string } } | null;

export default function ProfilePage() {
  const [charityPercent, setCharityPercent] = useState(10);
  const [selectedCharityId, setSelectedCharityId] = useState('');
  const [charities, setCharities] = useState<Charity[]>([]);
  const [subscription, setSubscription] = useState<Sub>(null);
  const [charityPref, setCharityPref] = useState<CharityPref>(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function load() {
      try {
        const [meRes, charitiesRes] = await Promise.all([
          fetch('/api/me', { credentials: 'include' }),
          fetch('/api/charities'),
        ]);

        let me: {
          subscription?: Sub;
          charityPreference?: CharityPref;
        } | null = null;
        if (meRes.ok) {
          try {
            me = await meRes.json();
          } catch {
            me = null;
          }
        }

        let list: unknown = [];
        if (charitiesRes.ok) {
          try {
            list = await charitiesRes.json();
          } catch {
            list = [];
          }
        }
        const safeList = Array.isArray(list) ? list : [];

        setSubscription(me?.subscription ?? null);
        setCharityPref(me?.charityPreference ?? null);
        if (me?.charityPreference && typeof me.charityPreference.contribution_percent === 'number') {
          setCharityPercent(me.charityPreference.contribution_percent);
        }
        if (me?.charityPreference?.charity_id) {
          setSelectedCharityId(String(me.charityPreference.charity_id));
        }
        setCharities(
          safeList
            .filter((c): c is Charity => c != null && typeof c === 'object' && 'id' in c && 'name' in c)
            .map((c) => ({ id: String(c.id), name: String(c.name) }))
        );

        const prefCharityId = me?.charityPreference?.charity_id;
        if (prefCharityId) {
          setSelectedCharityId(String(prefCharityId));
        } else if (safeList.length > 0) {
          const first = safeList[0] as { id?: string };
          if (first?.id) setSelectedCharityId(String(first.id));
        }
      } catch (e) {
        console.error('[profile load]', e);
      }
    }
    load();
  }, []);

  async function handleUpdateCharity() {
    setSaving(true);
    try {
      const res = await fetch('/api/me/charity', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          charityId: selectedCharityId,
          contributionPercent: charityPercent,
        }),
      });
      if (!res.ok) throw new Error('Failed');
      const name = charities.find((c) => c.id === selectedCharityId)?.name ?? '';
      setCharityPref({
        charity_id: selectedCharityId,
        contribution_percent: charityPercent,
        charities: { name },
      });
    } finally {
      setSaving(false);
    }
  }

  const isActive = subscription?.status === 'active';
  const renewDate = subscription?.current_period_end
    ? new Date(String(subscription.current_period_end)).toLocaleDateString()
    : '—';

  const planLabel =
    subscription?.plan === 'yearly' ? 'Yearly ($120/yr)' : subscription?.plan === 'monthly' ? 'Monthly ($15/mo)' : '—';

  return (
    <div className="max-w-2xl space-y-6">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Profile & Settings</h1>

      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
        <h2 className="text-lg font-bold mb-4 flex justify-between items-center">
          Subscription Plan
          <span
            className={`px-3 py-1 text-sm rounded-full ${
              isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-700'
            }`}
          >
            {isActive ? 'Active' : 'Inactive'}
          </span>
        </h2>
        {subscription ? (
          <>
            <p className="text-gray-600">
              <strong>Plan:</strong> {planLabel}
            </p>
            <p className="text-gray-600 mt-1">
              <strong>Renews on:</strong> {renewDate}
            </p>
            {!isActive && (
              <Link
                href="/auth/subscribe"
                className="mt-4 inline-block px-4 py-2 bg-charity text-white rounded-lg hover:bg-charity-dark transition text-sm font-medium"
              >
                Subscribe now
              </Link>
            )}
          </>
        ) : (
          <p className="text-gray-600">No active subscription.</p>
        )}
      </div>

      <div className="bg-white p-6 rounded-xl border border-gray-100 shadow-sm">
        <h2 className="text-lg font-bold mb-4">Charity Contribution</h2>
        <p className="text-gray-600 mb-4 text-sm">
          Select a charity and set your contribution percentage (minimum 10%).
        </p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Charity</label>
            {charities.length === 0 ? (
              <p className="text-sm text-amber-600 bg-amber-50 p-3 rounded-lg">
                No charities available yet. Run the database seed (supabase/seed.sql) or ask an admin to add charities.
              </p>
            ) : (
              <select
                value={selectedCharityId}
                onChange={(e) => setSelectedCharityId(e.target.value)}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-charity focus:border-transparent"
              >
                {charities.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name || '—'}
                  </option>
                ))}
              </select>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Contribution: {charityPercent}%
            </label>
            <input
              type="range"
              min={10}
              max={100}
              value={charityPercent}
              onChange={(e) => setCharityPercent(Number(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-charity"
            />
          </div>
          <button
            onClick={handleUpdateCharity}
            disabled={saving || !selectedCharityId || charities.length === 0}
            className="px-4 py-2 bg-charity text-white rounded-lg hover:bg-charity-dark transition text-sm font-medium disabled:opacity-50"
          >
            {saving ? 'Saving...' : 'Update Contribution'}
          </button>
        </div>
      </div>
    </div>
  );
}
