'use client';
import { useState } from 'react';

export function CharitySelector() {
  const [percentage, setPercentage] = useState(10); // Minimum 10%
  const [selectedCharity, setSelectedCharity] = useState('global-golf');

  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">Select a Charity</label>
        <select 
          value={selectedCharity}
          onChange={(e) => setSelectedCharity(e.target.value)}
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-charity"
        >
          <option value="global-golf">Global Golf Foundation</option>
          <option value="green-fairways">Green Fairways Initiative</option>
          <option value="veterans">Veterans on the Green</option>
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2 flex justify-between">
          Contribution Percentage
          <span className="text-charity-dark font-bold">{percentage}%</span>
        </label>
        <input 
          type="range" 
          min="10" 
          max="100" 
          value={percentage} 
          onChange={(e) => setPercentage(Number(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-charity"
        />
        <p className="text-xs text-gray-500 mt-2">Minimum contribution is 10% of your subscription fee.</p>
      </div>
    </div>
  );
}