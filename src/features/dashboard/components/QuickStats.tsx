import React, { useState, useEffect } from 'react';
import { Card } from '@/components/ui/Card';
import { FileText, ScanSearch, Mail, Zap } from 'lucide-react';
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
      quota: 'Ready to export',
      icon: FileText,
      color: 'text-blue-600 bg-blue-50/80 border-blue-200',
      badgeColor: 'text-blue-700 bg-blue-50',
      accentGlow: 'hover:border-blue-300 hover:shadow-md hover:shadow-blue-500/5',
    },
    {
      name: 'ATS Scans',
      value: 'Ready',
      quota: 'Compatibility audit',
      icon: ScanSearch,
      color: 'text-violet-600 bg-violet-50/80 border-violet-200',
      badgeColor: 'text-violet-700 bg-violet-50',
      accentGlow: 'hover:border-violet-300 hover:shadow-md hover:shadow-violet-500/5',
    },
    {
      name: 'Cover Letters',
      value: 'Ready',
      quota: 'Role-tailored letters',
      icon: Mail,
      color: 'text-teal-600 bg-teal-50/80 border-teal-200',
      badgeColor: 'text-teal-700 bg-teal-50',
      accentGlow: 'hover:border-teal-300 hover:shadow-md hover:shadow-teal-500/5',
    },
    {
      name: 'AI Quota Balance',
      value: '100%',
      quota: 'Free plan allowance',
      icon: Zap,
      color: 'text-amber-600 bg-amber-50/80 border-amber-200',
      badgeColor: 'text-amber-800 bg-amber-50',
      accentGlow: 'hover:border-amber-300 hover:shadow-md hover:shadow-amber-500/5',
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <Card
            key={stat.name}
            className={`p-5 flex items-center justify-between border-slate-200 bg-white transition-all duration-standard ${stat.accentGlow}`}
          >
            <div className="space-y-1.5 text-left">
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">{stat.name}</p>
              <p className="text-2xl font-black text-slate-900 tracking-tight">{stat.value}</p>
              <span className={`inline-block text-[11px] font-semibold px-2 py-0.5 rounded-radius-xs ${stat.badgeColor}`}>
                {stat.quota}
              </span>
            </div>
            <div className={`w-12 h-12 rounded-radius-md border flex items-center justify-center shrink-0 ${stat.color} shadow-xs`}>
              <Icon className="w-6 h-6" />
            </div>
          </Card>
        );
      })}
    </div>
  );
};
