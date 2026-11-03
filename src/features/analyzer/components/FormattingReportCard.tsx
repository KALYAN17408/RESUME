import React from 'react';
import type { FormattingCheck } from '../types/analyzer.types';
import { CheckCircle2, AlertCircle, XCircle } from 'lucide-react';
import { cn } from '@/utils/cn';

interface FormattingReportCardProps {
  formatting: FormattingCheck[];
  wordCount: number;
  actionVerbCount: number;
  metricCount: number;
}

export const FormattingReportCard: React.FC<FormattingReportCardProps> = ({
  formatting,
  wordCount,
  actionVerbCount,
  metricCount,
}) => {
  return (
    <div className="space-y-4">
      {/* Metrics Summary Strip */}
      <div className="grid grid-cols-3 gap-3">
        <div className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200 text-center">
          <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Word Count</p>
          <p className="text-xl font-black text-zinc-900 mt-0.5">{wordCount}</p>
          <p className="text-[10px] text-zinc-500 mt-0.5">400–950 target</p>
        </div>

        <div className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200 text-center">
          <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">Action Verbs</p>
          <p className="text-xl font-black text-zinc-900 mt-0.5">{actionVerbCount}</p>
          <p className="text-[10px] text-zinc-500 mt-0.5">8+ recommended</p>
        </div>

        <div className="p-3.5 rounded-2xl bg-zinc-50 border border-zinc-200 text-center">
          <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">XYZ Metrics</p>
          <p className="text-xl font-black text-zinc-900 mt-0.5">{metricCount}</p>
          <p className="text-[10px] text-zinc-500 mt-0.5">Percentages, $, scale</p>
        </div>
      </div>

      {/* Diagnostics List */}
      <div className="space-y-2.5">
        {formatting.map((item) => {
          const isPass = item.status === 'pass';
          const isWarning = item.status === 'warning';

          return (
            <div
              key={item.id}
              className={cn(
                'p-4 rounded-2xl border transition-all',
                isPass
                  ? 'bg-white border-zinc-200'
                  : isWarning
                  ? 'bg-zinc-50 border-zinc-300'
                  : 'bg-zinc-100 border-zinc-300'
              )}
            >
              <div className="flex items-start gap-3">
                <div className="mt-0.5">
                  {isPass ? (
                    <CheckCircle2 className="w-4 h-4 text-zinc-900" />
                  ) : isWarning ? (
                    <AlertCircle className="w-4 h-4 text-zinc-600" />
                  ) : (
                    <XCircle className="w-4 h-4 text-zinc-400" />
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <h4 className="text-xs font-bold text-zinc-900">{item.title}</h4>
                    <span className="text-[11px] font-mono font-bold text-zinc-700">
                      {item.score}%
                    </span>
                  </div>

                  <p className="text-xs text-zinc-600 mt-1 leading-relaxed">{item.detail}</p>

                  {item.recommendation && (
                    <div className="mt-2 p-2 rounded-xl bg-zinc-100 border border-zinc-200 text-[11px] text-zinc-800">
                      <span className="font-bold">Suggestion: </span>
                      {item.recommendation}
                    </div>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
