import React from 'react';
import { Card } from '@/components/ui/Card';
import { FileText, ScanSearch, Target, Zap } from 'lucide-react';

export const QuickStats: React.FC = () => {
  const stats = [
    {
      name: 'Resumes Saved',
      value: '0',
      quota: '3 Max (Free Tier)',
      icon: FileText,
      color: 'text-black bg-zinc-100 border-zinc-200',
    },
    {
      name: 'ATS Score Scans',
      value: '0',
      quota: '1 Scan Available',
      icon: ScanSearch,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-200/60',
    },
    {
      name: 'Tailored Applications',
      value: '0',
      quota: 'Active in Phase 4',
      icon: Target,
      color: 'text-black bg-zinc-100 border-zinc-200',
    },
    {
      name: 'AI Quota Balance',
      value: '100%',
      quota: 'Monthly Reset Cycle',
      icon: Zap,
      color: 'text-amber-600 bg-amber-50 border-amber-200/60',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card key={stat.name} className="p-5 flex items-center justify-between">
            <div className="space-y-1 text-left">
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{stat.name}</p>
              <p className="text-2xl font-black text-slate-900 tracking-tight">{stat.value}</p>
              <p className="text-[11px] text-slate-400 font-medium">{stat.quota}</p>
            </div>
            <div className={`w-12 h-12 rounded-2xl border flex items-center justify-center shrink-0 ${stat.color}`}>
              <Icon className="w-6 h-6" />
            </div>
          </Card>
        );
      })}
    </div>
  );
};
