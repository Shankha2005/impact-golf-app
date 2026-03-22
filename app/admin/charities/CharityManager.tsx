'use client';

import { useState } from 'react';

type Charity = {
  id: string;
  name: string;
  description: string | null;
  image_url: string | null;
  is_featured: boolean;
};

export default function CharityManager({ charities: initial }: { charities: Charity[] }) {
  const [charities, setCharities] = useState(initial);
  const [showForm, setShowForm] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [isFeatured, setIsFeatured] = useState(false);
  const [loading, setLoading] = useState(false);

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch('/api/charities', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          description: description || null,
          imageUrl: imageUrl || null,
          isFeatured,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed');
      const newCharity = data.data ?? { id: '', name, description, image_url: imageUrl, is_featured: isFeatured };
      setCharities((prev) => [...prev, newCharity]);
      setName('');
      setDescription('');
      setImageUrl('');
      setIsFeatured(false);
      setShowForm(false);
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Charity Management</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2 bg-charity text-white rounded-lg hover:bg-charity-dark transition font-medium"
        >
          {showForm ? 'Cancel' : '+ Add New Charity'}
        </button>
      </div>

      {showForm && (
        <form onSubmit={handleAdd} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 mb-8 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
            <input
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg"
              rows={3}
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Image URL</label>
            <input
              type="url"
              value={imageUrl}
              onChange={(e) => setImageUrl(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-lg"
            />
          </div>
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={isFeatured}
              onChange={(e) => setIsFeatured(e.target.checked)}
              id="featured"
            />
            <label htmlFor="featured" className="text-sm font-medium text-gray-700">Featured</label>
          </div>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-charity text-white rounded-lg hover:bg-charity-dark transition disabled:opacity-50"
          >
            Add Charity
          </button>
        </form>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {charities.map((c) => (
          <div key={c.id} className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xl font-bold">{c.name}</h3>
              {c.is_featured && (
                <span className="px-2 py-1 bg-yellow-100 text-yellow-800 text-xs font-bold rounded">Featured</span>
              )}
            </div>
            <p className="text-gray-600 text-sm mb-4 line-clamp-2">{c.description || '—'}</p>
          </div>
        ))}
      </div>
    </>
  );
}
