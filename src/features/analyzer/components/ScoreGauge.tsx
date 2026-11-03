import React from 'react';
import { cn } from '@/utils/cn';

interface ScoreGaugeProps {
  score: number;
  label: string;
  size?: 'sm' | 'md' | 'lg';
  grade?: string;
  subtitle?: string;
  className?: string;
}

export const ScoreGauge: React.FC<ScoreGaugeProps> = ({
  score,
  label,
  size = 'md',
  grade,
  subtitle,
  className,
}) => {
  const clampedScore = Math.max(0, Math.min(100, Math.round(score)));

  // SVG circular geometry
  const dimension = size === 'lg' ? 160 : size === 'md' ? 110 : 70;
  const strokeWidth = size === 'lg' ? 12 : size === 'md' ? 8 : 6;
  const radius = (dimension - strokeWidth * 2) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (clampedScore / 100) * circumference;

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
            className="stroke-zinc-200"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          {/* Progress circle in sleek black */}
          <circle
            cx={dimension / 2}
            cy={dimension / 2}
            r={radius}
            className="stroke-black transition-all duration-700 ease-out"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
            fill="transparent"
          />
        </svg>

        {/* Center score readout */}
        <div className="absolute flex flex-col items-center justify-center text-zinc-900">
          <span
            className={cn(
              'font-black tracking-tight leading-none',
              size === 'lg' ? 'text-4xl' : size === 'md' ? 'text-2xl' : 'text-base'
            )}
          >
            {clampedScore}
          </span>
          <span className="text-[10px] uppercase font-bold text-zinc-400 mt-0.5">/ 100</span>
        </div>
      </div>

      <div className="mt-2 text-center">
        <p className="text-xs font-bold text-zinc-900 uppercase tracking-wider">{label}</p>
        {grade && (
          <span className="inline-block mt-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-zinc-900 text-white">
            {grade}
          </span>
        )}
        {subtitle && <p className="text-[11px] text-zinc-500 mt-0.5">{subtitle}</p>}
      </div>
    </div>
  );
};
