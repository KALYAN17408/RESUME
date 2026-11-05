import React from 'react';
import { useAuthStore } from '@/stores/authStore';
import { ShieldCheck } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

export const WelcomeBanner: React.FC = () => {
  const { user, profile } = useAuthStore();
  const rawName = profile?.full_name || user?.user_metadata?.full_name || (user?.email ? user.email.split('@')[0] : '');
  const userName = rawName ? rawName.trim() : '';
  const tier = profile?.tier || 'free';

  return (
    <div className="relative overflow-hidden rounded-radius-xl bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 p-6 sm:p-8 text-white shadow-elevated">
      {/* Atmospheric subtle radial glow elements */}
      <div className="absolute top-0 right-0 -z-0 h-64 w-64 rounded-full bg-white/10 blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 left-1/4 -z-0 h-48 w-48 rounded-full bg-teal-400/15 blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2.5 flex-wrap">
            <Badge variant="outline" size="sm" className="bg-white/15 text-white border-white/30 uppercase tracking-wider text-[10px] font-semibold backdrop-blur-xs">
              {tier} Plan
            </Badge>
            <Badge variant="outline" size="sm" className="bg-emerald-400/20 text-emerald-100 border-emerald-300/40 text-[10px] gap-1 font-semibold backdrop-blur-xs">
              <ShieldCheck className="w-3 h-3 text-emerald-300" /> Resume Builder Active
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white drop-shadow-xs">
            {userName ? `Welcome back, ${userName}` : 'Welcome back'}
          </h1>
          <p className="text-xs sm:text-sm text-blue-50/90 max-w-xl leading-relaxed">
            Your career workspace is ready. Create professional resumes, analyze your ATS compatibility, and generate tailored cover letters.
          </p>
        </div>
      </div>
    </div>
  );
};
