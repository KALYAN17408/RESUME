import React, { useState } from 'react';
import type { KeywordMatch } from '../types/analyzer.types';
import { Check, X, Search } from 'lucide-react';
import { cn } from '@/utils/cn';

interface KeywordPillListProps {
  matchedKeywords: KeywordMatch[];
  missingKeywords: KeywordMatch[];
}

export const KeywordPillList: React.FC<KeywordPillListProps> = ({
  matchedKeywords,
  missingKeywords,
}) => {
  const [filter, setFilter] = useState<'all' | 'matched' | 'missing'>('all');
  const [search, setSearch] = useState('');

  const allKeywords = [...matchedKeywords, ...missingKeywords];

  const displayedKeywords = allKeywords.filter((kw) => {
    if (filter === 'matched' && !kw.matched) return false;
    if (filter === 'missing' && kw.matched) return false;
    if (search.trim()) {
      return kw.term.toLowerCase().includes(search.toLowerCase().trim());
    }
    return true;
  });

  return (
    <div className="space-y-4">
      {/* Controls row */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Filter Pills */}
        <div className="inline-flex rounded-xl bg-zinc-100 p-1 border border-zinc-200">
          <button
            onClick={() => setFilter('all')}
            className={cn(
              'px-3 py-1.5 text-xs font-semibold rounded-lg transition-all',
              filter === 'all'
                ? 'bg-black text-white shadow-sm'
                : 'text-zinc-600 hover:text-black'
            )}
          >
            All Keywords ({allKeywords.length})
          </button>
          <button
            onClick={() => setFilter('matched')}
            className={cn(
              'px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5',
              filter === 'matched'
                ? 'bg-black text-white shadow-sm'
                : 'text-zinc-600 hover:text-black'
            )}
          >
            <Check className="w-3.5 h-3.5" />
            <span>Matched ({matchedKeywords.length})</span>
          </button>
          <button
            onClick={() => setFilter('missing')}
            className={cn(
              'px-3 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center gap-1.5',
              filter === 'missing'
                ? 'bg-black text-white shadow-sm'
                : 'text-zinc-600 hover:text-black'
            )}
          >
            <X className="w-3.5 h-3.5" />
            <span>Missing ({missingKeywords.length})</span>
          </button>
        </div>

        {/* Search Input */}
        <div className="relative min-w-[200px]">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
          <input
            type="text"
            placeholder="Search keywords..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-8 pr-3 py-1.5 text-xs rounded-xl bg-white border border-zinc-200 text-zinc-900 placeholder:text-zinc-400 focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
          />
        </div>
      </div>

      {/* Keywords grid / tag cloud */}
      {displayedKeywords.length === 0 ? (
        <div className="p-8 text-center bg-zinc-50 rounded-2xl border border-dashed border-zinc-200 text-zinc-500 text-xs">
          No keywords match your selected criteria.
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {displayedKeywords.map((kw, index) => {
            const isMatched = kw.matched;

            return (
              <div
                key={`${kw.term}-${index}`}
                className={cn(
                  'inline-flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all',
                  isMatched
                    ? 'bg-zinc-900 text-white border-zinc-800'
                    : 'bg-white text-zinc-900 border-zinc-300 border-dashed hover:border-zinc-500'
                )}
              >
                <div className="flex items-center gap-1.5">
                  {isMatched ? (
                    <Check className="w-3 h-3 text-white" />
                  ) : (
                    <X className="w-3 h-3 text-zinc-400" />
                  )}
                  <span className="font-semibold">{kw.term}</span>
                </div>

                {/* Frequency & importance badges */}
                <div className="flex items-center gap-1">
                  <span
                    className={cn(
                      'text-[9px] uppercase px-1.5 py-0.2 rounded font-bold tracking-wider',
                      isMatched ? 'bg-zinc-800 text-zinc-300' : 'bg-zinc-100 text-zinc-600'
                    )}
                  >
                    JD: {kw.countInJob}x
                  </span>

                  {kw.importance === 'critical' && (
                    <span
                      className={cn(
                        'text-[9px] font-bold px-1.5 py-0.2 rounded',
                        isMatched
                          ? 'bg-zinc-700 text-zinc-200'
                          : 'bg-zinc-200 text-zinc-900'
                      )}
                    >
                      Critical
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
