import Link from 'next/link';
import { Heart, Trophy, Target } from 'lucide-react';
import { createClient } from '@/lib/supabase/server';

export default async function LandingPage() {
  const supabase = await createClient();
  // Featured first, then name — avoids empty homepage when no rows have is_featured = true (seed / data issue).
  const { data: featuredCharities } = await supabase
    .from('charities')
    .select('id, name, description, is_featured')
    .order('is_featured', { ascending: false })
    .order('name', { ascending: true })
    .limit(3);
  const spotlight = Array.isArray(featuredCharities) ? featuredCharities : [];
  return (
    <div className="flex flex-col items-center">
      {/* Hero Section */}
      <section className="w-full bg-charity-light py-24 px-6 text-center border-b border-green-100 relative overflow-hidden">
        <div className="max-w-4xl mx-auto relative z-10">
          <span className="px-4 py-1.5 bg-green-100 text-green-800 font-bold tracking-wide text-sm rounded-full mb-6 inline-block">
            PLAY WITH PURPOSE
          </span>
          <h1 className="text-5xl md:text-7xl font-black text-gray-900 tracking-tight leading-tight mb-8">
            Turn Your Scores Into <span className="text-charity">Meaningful Impact</span>.
          </h1>
          <p className="text-xl text-gray-600 mb-10 max-w-2xl mx-auto leading-relaxed">
            Track your performance, enter monthly prize draws, and support incredible charities—all with one simple subscription[cite: 11, 14, 15].
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/auth/signup" className="px-8 py-4 bg-charity text-white font-bold rounded-full text-lg hover:bg-charity-dark transition shadow-xl shadow-green-200">
              Start Your Journey
            </Link>
            <Link href="/charities" className="px-8 py-4 bg-white text-gray-800 font-bold rounded-full text-lg border border-gray-200 hover:border-gray-300 transition shadow-sm">
              Meet Our Charities
            </Link>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="w-full py-24 px-6 bg-white">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12 text-center">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                <Target size={32} />
              </div>
              <h3 className="text-2xl font-bold mb-3">1. Track Scores</h3>
              <p className="text-gray-600 leading-relaxed">Log your latest Stableford scores in our seamless tracker. We always keep your rolling top 5[cite: 44, 48].</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-yellow-50 text-yellow-600 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                <Trophy size={32} />
              </div>
              <h3 className="text-2xl font-bold mb-3">2. Win Prizes</h3>
              <p className="text-gray-600 leading-relaxed">Match numbers in our monthly draws. The more accurate your tracking, the more exciting the rewards[cite: 14].</p>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 bg-green-50 text-green-600 rounded-2xl flex items-center justify-center mb-6 shadow-sm">
                <Heart size={32} />
              </div>
              <h3 className="text-2xl font-bold mb-3">3. Give Back</h3>
              <p className="text-gray-600 leading-relaxed">A minimum 10% portion of your subscription automatically goes to a charity of your choice, making a real-world difference.</p>
            </div>
          </div>
        </div>
      </section>

      {/* Partner charities spotlight (always show section; empty state if DB has no rows or RLS blocks reads) */}
      <section className="w-full py-24 px-6 bg-charity-light border-t border-green-100">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight mb-4 text-center">
            Partner Charities
          </h2>
          <p className="text-xl text-gray-600 text-center max-w-2xl mx-auto mb-12">
            Support incredible causes. Your subscription helps these organizations make a real impact.
          </p>
          {spotlight.length === 0 ? (
            <div className="text-center max-w-xl mx-auto rounded-2xl bg-white/80 border border-green-100 p-8">
              <p className="text-gray-700 mb-4">
                No charities returned from the database. Seed data (see <code className="text-sm bg-white px-1 rounded">supabase/seed.sql</code>)
                and ensure RLS allows public <code className="text-sm bg-white px-1 rounded">SELECT</code> on{' '}
                <code className="text-sm bg-white px-1 rounded">charities</code> (migration{' '}
                <code className="text-sm bg-white px-1 rounded">0006_charities_public_read.sql</code>).
              </p>
              <Link
                href="/charities"
                className="px-8 py-4 bg-charity text-white font-bold rounded-full hover:bg-charity-dark transition inline-block"
              >
                Charities directory
              </Link>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {spotlight.map((c) => (
                  <Link
                    key={c.id}
                    href={`/charities/${c.id}`}
                    className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-lg hover:border-charity/30 transition group"
                  >
                    {c.is_featured ? (
                      <span className="text-xs font-bold text-charity uppercase tracking-wider">Featured</span>
                    ) : (
                      <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Partner</span>
                    )}
                    <h3 className="text-xl font-bold text-gray-900 mt-2 mb-3 group-hover:text-charity transition">
                      {c.name}
                    </h3>
                    <p className="text-gray-600 text-sm line-clamp-3">{c.description || '—'}</p>
                    <span className="mt-4 inline-block text-charity font-semibold text-sm group-hover:underline">
                      Learn more →
                    </span>
                  </Link>
                ))}
              </div>
              <div className="text-center mt-10">
                <Link
                  href="/charities"
                  className="px-8 py-4 bg-charity text-white font-bold rounded-full hover:bg-charity-dark transition inline-block"
                >
                  Explore All Charities
                </Link>
              </div>
            </>
          )}
        </div>
      </section>
    </div>
  );
}