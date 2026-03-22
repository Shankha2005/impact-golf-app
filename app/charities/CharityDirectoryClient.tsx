'use client';

import { useState, useMemo } from 'react';
import Link from 'next/link';
import { Search } from 'lucide-react';

type Charity = {
  id: string;
  name: string;
  description: string | null;
  image_url?: string | null;
  is_featured?: boolean | null;
  slug?: string | null;
};

export default function CharityDirectoryClient({
  charities,
  loadError,
}: {
  charities: Charity[];
  loadError?: string | null;
}) {
  const [search, setSearch] = useState('');
  const [filterFeatured, setFilterFeatured] = useState<'all' | 'featured'>('all');

  const filtered = useMemo(() => {
    let list = charities;
    if (search.trim()) {
      const q = search.toLowerCase().trim();
      list = list.filter(
        (c) =>
          c.name.toLowerCase().includes(q) ||
          (c.description?.toLowerCase().includes(q) ?? false)
      );
    }
    if (filterFeatured === 'featured') {
      list = list.filter((c) => Boolean(c.is_featured));
    }
    return list;
  }, [charities, search, filterFeatured]);

  return (
    <>
      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Search charities..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-charity focus:border-transparent"
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setFilterFeatured('all')}
            className={`px-4 py-3 rounded-xl font-medium transition ${
              filterFeatured === 'all'
                ? 'bg-charity text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All
          </button>
          <button
            onClick={() => setFilterFeatured('featured')}
            className={`px-4 py-3 rounded-xl font-medium transition ${
              filterFeatured === 'featured'
                ? 'bg-charity text-white'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            Featured
          </button>
        </div>
      </div>

      {loadError ? (
        <p className="text-center text-amber-800 bg-amber-50 border border-amber-100 rounded-xl py-4 px-4 mb-8 text-sm">
          Could not load charities from the database: {loadError}. Check Supabase RLS (public SELECT on{' '}
          <code className="bg-white px-1 rounded">charities</code>) and project env vars.
        </p>
      ) : null}

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {filtered.length === 0 ? (
          <p className="col-span-full text-center text-gray-500 py-12">
            {charities.length === 0
              ? loadError
                ? 'Fix the error above, or run supabase/seed.sql if the table is empty.'
                : 'No charities listed yet. Run the seed: supabase/seed.sql'
              : 'No charities match your search.'}
          </p>
        ) : (
          filtered.map((charity) => (
            <div
              key={charity.id}
              className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition group"
            >
              {Boolean(charity.is_featured) && (
                <span className="text-xs font-bold text-charity uppercase tracking-wider">
                  Featured
                </span>
              )}
              <h3 className="text-2xl font-bold text-gray-900 mt-2 mb-4 group-hover:text-charity transition">
                {charity.name}
              </h3>
              <p className="text-gray-600 mb-8 line-clamp-3">{charity.description || '—'}</p>
              <Link
                href={`/charities/${charity.id}`}
                className="text-gray-900 font-bold border-b-2 border-charity pb-1 hover:text-charity transition inline-block"
              >
                Learn More
              </Link>
            </div>
          ))
        )}
      </div>
    </>
  );
}
