import React from 'react';
import type { JobApplicationStatus } from '../types/job.types';
import { Search, Filter, ArrowUpDown } from 'lucide-react';
import { cn } from '@/utils/cn';

export type StatusFilterOption = 'all' | JobApplicationStatus;
export type SortOption = 'date_desc' | 'score_desc' | 'company_asc';

interface JobFilterBarProps {
  searchQuery: string;
  onSearchChange: (q: string) => void;
  statusFilter: StatusFilterOption;
  onStatusFilterChange: (s: StatusFilterOption) => void;
  sortBy: SortOption;
  onSortByChange: (s: SortOption) => void;
  counts: Record<string, number>;
}

export const JobFilterBar: React.FC<JobFilterBarProps> = ({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusFilterChange,
  sortBy,
  onSortByChange,
  counts,
}) => {
  const tabs: { key: StatusFilterOption; label: string }[] = [
    { key: 'all', label: 'All Jobs' },
    { key: 'interested', label: 'Interested' },
    { key: 'applied', label: 'Applied' },
    { key: 'interviewing', label: 'Interviewing' },
    { key: 'offer', label: 'Offers' },
    { key: 'rejected', label: 'Archived' },
  ];

  return (
    <div className="space-y-3">
      {/* Top row: Search bar & Sort selector */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search by role, company, or location..."
            className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 shadow-2xs focus:border-blue-500 focus:outline-hidden focus:ring-1 focus:ring-blue-500"
          />
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <ArrowUpDown className="w-3.5 h-3.5 text-slate-400" />
          <select
            value={sortBy}
            onChange={(e) => onSortByChange(e.target.value as SortOption)}
            className="rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs font-medium text-slate-700 shadow-2xs focus:border-blue-500 focus:outline-hidden"
          >
            <option value="date_desc">Newest Added</option>
            <option value="score_desc">Highest Match Score</option>
            <option value="company_asc">Company (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Status filter pills */}
      <div className="flex flex-wrap items-center gap-1.5 border-b border-slate-200/80 pb-2">
        {tabs.map((tab) => {
          const isActive = statusFilter === tab.key;
          const count = counts[tab.key] || 0;

          return (
            <button
              key={tab.key}
              onClick={() => onStatusFilterChange(tab.key)}
              className={cn(
                'flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-all',
                isActive
                  ? 'bg-blue-600 text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              )}
            >
              <span>{tab.label}</span>
              <span
                className={cn(
                  'rounded-md px-1.5 py-0.2 text-[10px] font-bold',
                  isActive ? 'bg-blue-700 text-white' : 'bg-slate-200/70 text-slate-700'
                )}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
