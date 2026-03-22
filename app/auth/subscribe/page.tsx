'use client';

import { useState } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';
import { Check } from 'lucide-react';

export default function SubscribePage() {
  const [plan, setPlan] = useState<'monthly' | 'yearly'>('yearly');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  async function handleCheckout() {
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Checkout failed');
      if (data.url) window.location.href = data.url;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-[60vh] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl">
        <h1 className="text-3xl font-bold text-gray-900 mb-2 text-center">
          Choose your plan
        </h1>
        <p className="text-gray-600 mb-10 text-center">
          Subscribe to enter draws, track scores, and support charities
        </p>

        {error && (
          <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm text-center">
            {error}
          </div>
        )}

        <div className="grid md:grid-cols-2 gap-6">
          <button
            onClick={() => setPlan('monthly')}
            className={`p-6 rounded-xl border-2 text-left transition ${
              plan === 'monthly'
                ? 'border-charity bg-charity-light'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="font-bold text-lg">Monthly</span>
              {plan === 'monthly' && (
                <Check className="w-5 h-5 text-charity" strokeWidth={3} />
              )}
            </div>
            <p className="text-3xl font-black text-gray-900">$15<span className="text-lg font-normal text-gray-600">/mo</span></p>
            <p className="text-sm text-gray-600 mt-2">Billed monthly. Cancel anytime.</p>
          </button>

          <button
            onClick={() => setPlan('yearly')}
            className={`p-6 rounded-xl border-2 text-left transition relative ${
              plan === 'yearly'
                ? 'border-charity bg-charity-light'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <span className="absolute -top-2 right-4 px-2 py-0.5 bg-charity text-white text-xs font-bold rounded-full">
              Save 33%
            </span>
            <div className="flex items-center justify-between mb-4">
              <span className="font-bold text-lg">Yearly</span>
              {plan === 'yearly' && (
                <Check className="w-5 h-5 text-charity" strokeWidth={3} />
              )}
            </div>
            <p className="text-3xl font-black text-gray-900">$120<span className="text-lg font-normal text-gray-600">/yr</span></p>
            <p className="text-sm text-gray-600 mt-2">$10/mo. Billed annually.</p>
          </button>
        </div>

        <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
          <button
            onClick={handleCheckout}
            disabled={loading}
            className="px-8 py-4 bg-charity text-white font-bold rounded-full text-lg hover:bg-charity-dark transition disabled:opacity-50"
          >
            {loading ? 'Redirecting...' : 'Continue to payment'}
          </button>
          <Link
            href="/dashboard"
            className="px-8 py-4 border border-gray-300 text-gray-700 font-medium rounded-full text-lg hover:bg-gray-50 transition text-center"
          >
            Maybe later
          </Link>
        </div>

        <p className="mt-6 text-center text-gray-500 text-sm">
          Secure payment powered by Stripe. A minimum 10% goes to your chosen charity.
        </p>
      </div>
    </div>
  );
}
