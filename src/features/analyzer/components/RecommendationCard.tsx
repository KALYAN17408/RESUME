import React, { useState } from 'react';
import type { AtsRecommendation } from '../types/analyzer.types';
import { Copy, Check, Lightbulb, AlertCircle, Info } from 'lucide-react';
import { cn } from '@/utils/cn';

interface RecommendationCardProps {
  recommendation: AtsRecommendation;
}

export const RecommendationCard: React.FC<RecommendationCardProps> = ({ recommendation }) => {
  const [copied, setCopied] = useState(false);

  const handleCopyExample = () => {
    if (!recommendation.actionableExample) return;
    navigator.clipboard.writeText(recommendation.actionableExample);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const isHigh = recommendation.severity === 'high';
  const isMedium = recommendation.severity === 'medium';

  return (
    <div
      className={cn(
        'p-4 rounded-2xl border transition-all',
        isHigh
          ? 'bg-white border-zinc-900 shadow-sm'
          : isMedium
          ? 'bg-white border-zinc-300'
          : 'bg-zinc-50 border-zinc-200'
      )}
    >
      <div className="flex items-start gap-3">
        <div className="mt-0.5">
          {isHigh ? (
            <AlertCircle className="w-4 h-4 text-zinc-900" />
          ) : isMedium ? (
            <Lightbulb className="w-4 h-4 text-zinc-700" />
          ) : (
            <Info className="w-4 h-4 text-zinc-500" />
          )}
        </div>

        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2">
            <h4 className="text-xs font-bold text-zinc-900">{recommendation.title}</h4>
            <span
              className={cn(
                'text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full',
                isHigh
                  ? 'bg-zinc-900 text-white'
                  : isMedium
                  ? 'bg-zinc-200 text-zinc-800'
                  : 'bg-zinc-100 text-zinc-600'
              )}
            >
              {recommendation.severity} Priority
            </span>
          </div>

          <p className="text-xs text-zinc-600 mt-1 leading-relaxed">{recommendation.description}</p>

          <p className="text-xs text-zinc-900 font-medium mt-2 leading-relaxed">
            <span className="font-bold">Action: </span>
            {recommendation.suggestion}
          </p>

          {recommendation.actionableExample && (
            <div className="mt-2.5 p-2.5 rounded-xl bg-zinc-100 border border-zinc-200 flex items-start justify-between gap-2">
              <p className="text-[11px] text-zinc-800 font-mono leading-relaxed select-all">
                {recommendation.actionableExample}
              </p>
              <button
                onClick={handleCopyExample}
                aria-label="Copy example bullet"
                className="p-1 rounded-md text-zinc-500 hover:text-black hover:bg-zinc-200 transition-colors shrink-0"
              >
                {copied ? <Check className="w-3.5 h-3.5 text-zinc-900" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
