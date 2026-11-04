import React from 'react';
import { cn } from '@/utils/cn';

interface ScoreGaugeProps {
  score: number;
  label: string;
  size?: 'sm' | 'md' | 'lg';
  grade?: string;
  subtitle?: string;
  variant?: 'violet' | 'dynamic' | 'blue' | 'teal';
  className?: string;
}

export const ScoreGauge: React.FC<ScoreGaugeProps> = ({
  score,
  label,
  size = 'md',
  grade,
  subtitle,
  variant = 'dynamic',
  className,
}) => {
  const clampedScore = Math.max(0, Math.min(100, Math.round(score)));

  // SVG circular geometry
  const dimension = size === 'lg' ? 160 : size === 'md' ? 110 : 70;
  const strokeWidth = size === 'lg' ? 12 : size === 'md' ? 8 : 6;
  const radius = (dimension - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clampedScore / 100) * circumference;

  const getStrokeColor = () => {
    if (variant === 'violet') return 'stroke-violet-600';
    if (variant === 'blue') return 'stroke-blue-600';
    if (variant === 'teal') return 'stroke-teal-600';
    // Dynamic score-based
    if (clampedScore >= 80) return 'stroke-emerald-600';
    if (clampedScore >= 60) return 'stroke-amber-500';
    return 'stroke-red-500';
  };

  const getGradeBadgeClass = () => {
    if (clampedScore >= 80) return 'bg-emerald-50 text-emerald-800 border border-emerald-200';
    if (clampedScore >= 60) return 'bg-amber-50 text-amber-800 border border-amber-200';
    return 'bg-red-50 text-red-700 border border-red-200';
  };

  return (
    <div className={cn('flex flex-col items-center justify-center text-center', className)}>
      <div className="relative inline-flex items-center justify-center">
        <svg
          width={dimension}
          height={dimension}
          className="transform -rotate-90"
          aria-label={`${label}: ${clampedScore}%`}
        >
          {/* Background circle track */}
          <circle
            cx={dimension / 2}
            cy={dimension / 2}
            r={radius}
            className={variant === 'violet' ? 'stroke-violet-100' : 'stroke-slate-200/80'}
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Progress circle */}
          <circle
            cx={dimension / 2}
            cy={dimension / 2}
            r={radius}
            className={cn('transition-all duration-700 ease-out', getStrokeColor())}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            fill="transparent"
          />
        </svg>

        {/* Center score readout */}
        <div className="absolute flex flex-col items-center justify-center text-slate-900">
          <span
            className={cn(
              'font-black tracking-tight leading-none',
              size === 'lg' ? 'text-4xl' : size === 'md' ? 'text-2xl' : 'text-base'
            )}
          >
            {clampedScore}
          </span>
          <span className="text-[10px] uppercase font-bold text-slate-400 mt-0.5">/ 100</span>
        </div>
      </div>

      <div className="mt-2 text-center">
        <p className="text-xs font-bold text-slate-900 uppercase tracking-wider">{label}</p>
        {grade && (
          <span className={cn('inline-block mt-1 text-[11px] font-bold px-2 py-0.5 rounded-full', getGradeBadgeClass())}>
            Grade {grade}
          </span>
        )}
        {subtitle && <p className="text-[11px] text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
};
