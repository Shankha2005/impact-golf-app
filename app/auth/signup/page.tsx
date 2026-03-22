'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient, isSupabaseConfigured } from '@/lib/supabase/client';
import { getPostAuthRedirectPath } from '@/lib/post-auth-redirect';

const CONFIG_ERROR =
  'Supabase is not configured. Add your NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY to .env.local — see SETUP.md.';

type Charity = { id: string; name: string };

export default function SignupPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [charityId, setCharityId] = useState('');
  const [charityPercent, setCharityPercent] = useState(10);
  const [charities, setCharities] = useState<Charity[]>([]);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const supabaseReady = isSupabaseConfigured();

  useEffect(() => {
    fetch('/api/charities')
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setCharities(data);
          setCharityId((prev) => prev || data[0].id);
        }
      })
      .catch(() => {});
  }, []);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!supabaseReady) {
      setError(CONFIG_ERROR);
      return;
    }
    setLoading(true);

    try {
      const supabase = createClient();
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: { data: { full_name: fullName } },
      });
      if (error) throw error;

      // Charity runs only after auth succeeds — it does not cause "Database error saving new user"
      if (charityId && charityPercent >= 10) {
        try {
          const charityRes = await fetch('/api/me/charity', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              charityId,
              contributionPercent: charityPercent,
            }),
          });
          if (!charityRes.ok) {
            // Session may not be ready yet; user can set charity in Profile
            console.warn('Charity preference not saved at signup; use Profile to set it.');
          }
        } catch {
          // Non-fatal; user can update in profile
        }
      }

      const next = await getPostAuthRedirectPath();
      window.location.assign(next);
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message.includes('fetch') ? CONFIG_ERROR : err.message);
      } else {
        setError('Sign up failed');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Create your account</h1>
        <p className="text-gray-600 mb-8">Join the platform and start making an impact</p>
        <p className="text-sm text-gray-500 mb-6 -mt-4">
          Choosing a charity is <strong>optional</strong> at signup — you can always set or change it later under{' '}
          <strong>Profile &amp; Subscription</strong>. It is <strong>not</strong> what causes signup database errors;
          those come from your Supabase profile trigger if migrations are missing or outdated.
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Full name</label>
            <input
              type="text"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-charity focus:border-transparent"
              placeholder="John Doe"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-charity focus:border-transparent"
              placeholder="you@example.com"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-charity focus:border-transparent"
              placeholder="••••••••"
            />
            <p className="mt-1 text-xs text-gray-500">At least 6 characters</p>
          </div>
          {charities.length > 0 && (
            <>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Choose your charity</label>
                <select
                  value={charityId}
                  onChange={(e) => setCharityId(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-charity focus:border-transparent"
                >
                  {charities.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Charity contribution: {charityPercent}% (min 10%)
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
            </>
          )}
          {!supabaseReady && (
            <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-amber-800 text-sm">
              Configure Supabase in .env.local to enable sign up. See SETUP.md for instructions.
            </div>
          )}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-charity text-white font-bold rounded-lg hover:bg-charity-dark transition disabled:opacity-50"
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>

        <p className="mt-6 text-center text-gray-600 text-sm">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-charity font-medium hover:underline">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
