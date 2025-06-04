import React from 'react';
import { colorThemes } from '@/constants/data';

export function PopularSearches({ searches, onQuickSearch, selectedColor }) {
  const theme = colorThemes[selectedColor];

  if (!searches || searches.length === 0) {
    return null;
  }

  return (
    <div className={`${theme.card} rounded-2xl shadow-md p-4 mb-6`}>
      <h3 className="text-sm font-medium text-gray-700 mb-3">🔥 熱門搜索</h3>
      <div className="flex flex-wrap gap-2">
        {searches.map((item, index) => (
          <button
            key={item.id}
            onClick={() => onQuickSearch(item)}
            className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors"
          >
            <span className="mr-1">{item.text}</span>
            <span className="text-gray-500">({item.publisher} {item.grade}-{item.semester})</span>
            <span className="ml-1 text-gray-400">×{item.searchCount}</span>
          </button>
        ))}
      </div>
    </div>
  );
}