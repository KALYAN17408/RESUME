import React from 'react';
import { AlertTriangle, KeyRound } from 'lucide-react';
import { getSupabaseEnv } from '@/lib/supabase/env';

export const ConfigMissingBanner: React.FC = () => {
  const { isConfigured, missingVariables } = getSupabaseEnv();

  if (isConfigured) return null;

  return (
    <div className="mb-6 rounded-2xl border border-amber-200 bg-amber-50/90 p-4 text-left shadow-sm backdrop-blur-sm">
      <div className="flex items-start gap-3">
        <div className="rounded-lg bg-amber-100 p-2 text-amber-700 shrink-0">
          <AlertTriangle className="w-5 h-5" />
        </div>
        <div className="flex-1 text-xs">
          <h4 className="font-bold text-amber-900 text-sm flex items-center gap-1.5">
            <KeyRound className="w-4 h-4 text-amber-700" />
            Supabase Credentials Required
          </h4>
          <p className="mt-1 text-amber-800 leading-relaxed">
            The application is in configuration-required mode. Missing required environment variables:{' '}
            <span className="font-mono font-semibold">{missingVariables.join(', ')}</span>.
          </p>
          <div className="mt-2 rounded-lg bg-amber-100/70 p-2.5 font-mono text-[11px] text-amber-950">
            Copy <span className="font-bold">.env.example</span> to <span className="font-bold">.env</span> and fill in your Supabase project URL and anon key.
          </div>
          <p className="mt-2 text-[11px] text-amber-700">
            Authentication requests will be held until configuration is provided. No simulated mock accounts are created.
          </p>
        </div>
      </div>
    </div>
  );
};
