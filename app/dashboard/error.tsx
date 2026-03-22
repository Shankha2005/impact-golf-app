'use client';

import Link from 'next/link';

export default function DashboardError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="max-w-lg mx-auto p-8 text-center">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Dashboard couldn&apos;t load</h1>
      <p className="text-gray-600 text-sm mb-2">
        {error?.message ? String(error.message) : 'Something went wrong on the server.'}
        {error?.digest ? (
          <span className="block text-xs text-gray-400 mt-2">Digest: {error.digest}</span>
        ) : null}
      </p>
      <div className="flex flex-col sm:flex-row gap-3 justify-center mt-6">
        <button
          type="button"
          onClick={() => reset()}
          className="px-4 py-2 bg-charity text-white rounded-lg hover:bg-charity-dark font-medium"
        >
          Try again
        </button>
        <Link href="/" className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium">
          Home
        </Link>
        <Link
          href="/auth/login"
          className="px-4 py-2 border border-gray-300 rounded-lg text-gray-700 hover:bg-gray-50 font-medium"
        >
          Sign in again
        </Link>
      </div>
    </div>
  );
}
