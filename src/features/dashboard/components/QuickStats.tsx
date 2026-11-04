import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { FileText, ScanSearch, Target, Zap } from 'lucide-react';
import { useAuthStore } from '@/stores/authStore';
import { ResumeService } from '@/features/resumes/services/resumeService';

export const QuickStats: React.FC = () => {
  const { user } = useAuthStore();
  const [resumeCount, setResumeCount] = useState<number>(0);

  useEffect(() => {
    let isMounted = true;
    ResumeService.listResumes(user?.id || 'demo_user')
      .then((resumes) => {
        if (isMounted) {
          setResumeCount(resumes.length);
        }
      })
      .catch(() => {
        // Safe fallback
      });
    return () => {
      isMounted = false;
    };
  }, [user?.id]);

  const stats = [
    {
      name: 'Resumes Saved',
      value: String(resumeCount),
      quota: 'Workspace Active',
      icon: FileText,
      color: 'text-slate-900 bg-slate-100 border-slate-200',
    },
    {
      name: 'ATS Score Scans',
      value: '1',
      quota: 'Ready to Run',
      icon: ScanSearch,
      color: 'text-emerald-700 bg-emerald-50 border-emerald-200/60',
    },
    {
      name: 'Tailored Letters',
      value: 'Ready',
      quota: 'Pro Included',
      icon: Target,
      color: 'text-blue-700 bg-blue-50 border-blue-200/60',
    },
    {
      name: 'AI Quota Balance',
      value: '100%',
      quota: 'Monthly Reset Cycle',
      icon: Zap,
      color: 'text-amber-700 bg-amber-50 border-amber-200/60',
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
              <p className="text-[11px] text-slate-500 font-medium">{stat.quota}</p>
            </div>
            <div className={`w-12 h-12 rounded-radius-md border flex items-center justify-center shrink-0 ${stat.color}`}>
              <Icon className="w-6 h-6" />
            </div>
          </Card>
        );
      })}
    </div>
  );
};
