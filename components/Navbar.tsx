'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

function SignOutButton() {
  const router = useRouter();
  return (
    <button
      onClick={async () => {
        const supabase = createClient();
        await supabase.auth.signOut();
        router.push('/');
        router.refresh();
      }}
      className="text-gray-600 hover:text-gray-900 text-sm font-medium"
    >
      Sign Out
    </button>
  );
}

export default function Navbar() {
  const [user, setUser] = useState<{ email?: string } | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    supabase.auth.getUser().then(({ data: { user } }) => setUser(user));
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_, session) =>
      setUser(session?.user ?? null)
    );
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!user) {
      setIsAdmin(false);
      return;
    }
    fetch('/api/me', { credentials: 'include' })
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => setIsAdmin(data?.profile?.role === 'admin'))
      .catch(() => setIsAdmin(false));
  }, [user]);

  return (
    <header className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
        <Link href="/" className="text-2xl font-black tracking-tighter text-charity-dark">
          IMPACT<span className="text-charity">GOLF</span>
        </Link>
        
        <nav className="hidden md:flex gap-8 font-medium text-gray-600">
          <Link href="/" className="hover:text-charity transition">Home</Link>
          <Link href="/charities" className="hover:text-charity transition">Our Charities</Link>
          <Link href="/dashboard" className="hover:text-charity transition">Member Area</Link>
        </nav>

        {user ? (
          <div className="flex items-center gap-3 flex-wrap justify-end">
            {isAdmin ? (
              <>
                <Link
                  href="/admin"
                  className="px-6 py-2.5 bg-charity-dark text-white font-semibold rounded-full hover:bg-green-900 transition shadow-md"
                >
                  Admin
                </Link>
                <Link
                  href="/dashboard"
                  className="px-4 py-2 text-sm font-medium text-gray-700 border border-gray-200 rounded-full hover:bg-gray-50"
                >
                  Member area
                </Link>
              </>
            ) : (
              <Link href="/dashboard" className="px-6 py-2.5 bg-charity text-white font-medium rounded-full hover:bg-charity-dark transition shadow-md">
                Dashboard
              </Link>
            )}
            <SignOutButton />
          </div>
        ) : (
          <Link href="/auth/login" className="px-6 py-2.5 bg-gray-900 text-white font-medium rounded-full hover:bg-black transition shadow-md">
            Sign In
          </Link>
        )}
      </div>
    </header>
  );
}