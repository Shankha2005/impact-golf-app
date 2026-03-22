'use client';
import { useState } from 'react';

export function ScoreEntryForm() {
  const [score, setScore] = useState('');
  const [date, setDate] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Submitting score:', { score, date });
    // API logic will go here
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4 w-full">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Stableford Score (1-45)</label>
        <input 
          type="number" 
          min="1" 
          max="45"
          required
          value={score}
          onChange={(e) => setScore(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-charity focus:border-charity transition"
          placeholder="e.g., 36"
        />
      </div>
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Date Played</label>
        <input 
          type="date" 
          required
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-charity focus:border-charity transition"
        />
      </div>
      <button type="submit" className="w-full py-3 bg-charity text-white rounded-lg hover:bg-charity-dark transition font-bold shadow-md shadow-green-100">
        Submit Score
      </button>
    </form>
  );
}