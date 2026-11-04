import React from 'react';
import { cn } from '@/utils/cn';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?:
    | 'default'
    | 'brand'
    | 'violet'
    | 'teal'
    | 'amber'
    | 'success'
    | 'warning'
    | 'danger'
    | 'outline';
  size?: 'sm' | 'md';
}

export const Badge: React.FC<BadgeProps> = ({
  className,
  variant = 'default',
  size = 'md',
  children,
  ...props
}) => {
  const variants = {
    default: 'bg-slate-100 text-slate-700 border-slate-200',
    brand: 'bg-blue-50 text-blue-700 border-blue-200 font-semibold',
    violet: 'bg-violet-50 text-violet-700 border-violet-200 font-semibold',
    teal: 'bg-teal-50 text-teal-700 border-teal-200 font-semibold',
    amber: 'bg-amber-50 text-amber-800 border-amber-200 font-semibold',
    success: 'bg-emerald-50 text-emerald-800 border-emerald-200 font-semibold',
    warning: 'bg-amber-50 text-amber-800 border-amber-200 font-semibold',
    danger: 'bg-red-50 text-red-700 border-red-200 font-semibold',
    outline: 'bg-white text-slate-700 border-slate-200 shadow-2xs',
  };

  const sizes = {
    sm: 'text-[11px] px-2 py-0.5 rounded-radius-xs',
    md: 'text-xs px-2.5 py-1 rounded-radius-xs',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1 border font-medium transition-colors',
        variants[variant],
        sizes[size],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
};
