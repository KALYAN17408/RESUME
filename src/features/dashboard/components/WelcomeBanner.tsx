import React from 'react';
import { useAuthStore } from '@/stores/authStore';
import { Sparkles, ShieldCheck } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

export const WelcomeBanner: React.FC = () => {
  const { user, profile } = useAuthStore();
  const userName = profile?.full_name || user?.user_metadata?.full_name || user?.email?.split('@')[0] || 'Engineer';
  const tier = profile?.tier || 'free';

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-black via-zinc-900 to-black p-8 text-white shadow-elevated">
      {/* Decorative gradient overlay */}
      <div className="absolute top-0 right-0 -z-0 h-64 w-64 rounded-full bg-white/5 blur-3xl" />
      <div className="absolute bottom-0 left-1/3 -z-0 h-48 w-48 rounded-full bg-white/5 blur-2xl" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-2.5">
            <Badge variant="brand" size="sm" className="bg-white/10 text-white border-white/20 uppercase tracking-wider text-[10px]">
              {tier} Tier Workspace
            </Badge>
            <Badge variant="success" size="sm" className="bg-emerald-500/20 text-emerald-300 border-emerald-400/30 text-[10px] gap-1">
              <ShieldCheck className="w-3 h-3" /> Phase 2 Resume Builder Live
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
            Welcome back, {userName}! 👋
          </h1>
          <p className="text-xs sm:text-sm text-slate-300 max-w-xl leading-relaxed">
            Your career command center is ready. The ATS Resume Builder is live with 4 single-column templates and real-time vector PDF export.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="rounded-2xl border border-white/10 bg-white/5 p-4 backdrop-blur-md text-left shrink-0">
            <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block">
              Active Security Model
            </span>
            <span className="text-xs font-bold text-white flex items-center gap-1.5 mt-1">
              <Sparkles className="w-3.5 h-3.5 text-zinc-300" /> Supabase PKCE Auth
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
