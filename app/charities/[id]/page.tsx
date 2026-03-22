import { notFound } from 'next/navigation';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/server';

type CharityEvent = { name: string; date: string; location?: string };

export default async function CharityPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = await createClient();
  const { data: charity } = await supabase
    .from('charities')
    .select('*')
    .eq('id', id)
    .single();

  if (!charity) notFound();

  const rawEvents = charity.upcoming_events;
  const events: CharityEvent[] = Array.isArray(rawEvents) ? rawEvents : [];

  return (
    <div className="max-w-4xl mx-auto px-6 py-16">
      <Link href="/charities" className="text-charity font-medium hover:underline mb-8 inline-block">
        ← Back to charities
      </Link>
      <div className="bg-white p-8 md:p-12 rounded-2xl border border-gray-100 shadow-sm">
        {charity.image_url && (
          <img
            src={charity.image_url}
            alt={charity.name}
            className="w-full h-64 object-cover rounded-xl mb-8"
          />
        )}
        <h1 className="text-3xl md:text-4xl font-black text-gray-900 mb-4">{charity.name}</h1>
        <p className="text-gray-600 text-lg leading-relaxed">{charity.description || '—'}</p>

        {events.length > 0 && (
          <div className="mt-10 pt-8 border-t border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Upcoming Events</h2>
            <ul className="space-y-4">
              {events.map((evt, i) => (
                <li key={i} className="flex flex-col sm:flex-row sm:items-center gap-2 p-4 bg-gray-50 rounded-xl">
                  <span className="font-semibold text-gray-900">{evt.name}</span>
                  <span className="text-gray-600 text-sm">
                    {evt.date}
                    {evt.location && ` · ${evt.location}`}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
}
