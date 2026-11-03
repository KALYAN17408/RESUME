import React from 'react';
import type { SectionCheck } from '../types/analyzer.types';
import { CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';
import { cn } from '@/utils/cn';

interface SectionCheckListProps {
  sections: SectionCheck[];
}

export const SectionCheckList: React.FC<SectionCheckListProps> = ({ sections }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
      {sections.map((section) => {
        const isComplete = section.status === 'complete';
        const isPartial = section.status === 'partial';

        return (
          <div
            key={section.id}
            className={cn(
              'p-4 rounded-2xl border transition-all',
              isComplete
                ? 'bg-white border-zinc-200'
                : isPartial
                ? 'bg-zinc-50 border-zinc-300'
                : 'bg-zinc-100/50 border-zinc-300 border-dashed'
            )}
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5">
                {isComplete ? (
                  <CheckCircle2 className="w-5 h-5 text-zinc-900" />
                ) : isPartial ? (
                  <AlertTriangle className="w-5 h-5 text-zinc-600" />
                ) : (
                  <XCircle className="w-5 h-5 text-zinc-400" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-xs font-bold text-zinc-900 truncate">{section.name}</h4>
                  <span
                    className={cn(
                      'text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full',
                      isComplete
                        ? 'bg-zinc-900 text-white'
                        : isPartial
                        ? 'bg-zinc-200 text-zinc-800'
                        : 'bg-zinc-200 text-zinc-500'
                    )}
                  >
                    {section.status}
                  </span>
                </div>

                <p className="text-xs text-zinc-600 mt-1 leading-relaxed">{section.feedback}</p>

                {section.details && (
                  <p className="text-[11px] text-zinc-400 mt-1.5 italic">
                    {section.details}
                  </p>
                )}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
