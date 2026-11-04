import React from 'react';
import { cn } from '@/utils/cn';
import { Spinner } from './Spinner';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger' | 'violet' | 'teal';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      isLoading = false,
      leftIcon,
      rightIcon,
      disabled,
      children,
      ...props
    },
    ref
  ) => {
    const baseStyles =
      'inline-flex items-center justify-center font-medium transition-all duration-standard focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed select-none rounded-radius-sm';

    const variants = {
      primary:
        'bg-blue-600 text-white hover:bg-blue-700 active:bg-blue-800 focus-visible:ring-blue-600 shadow-sm shadow-blue-500/20 hover:shadow-md hover:shadow-blue-500/25',
      secondary:
        'bg-slate-900 text-white hover:bg-slate-800 active:bg-slate-950 focus-visible:ring-slate-700 shadow-xs',
      outline:
        'border border-slate-200 bg-white text-slate-800 hover:bg-blue-50/70 hover:text-blue-700 hover:border-blue-200 active:bg-blue-100/60 focus-visible:ring-blue-600 shadow-xs',
      ghost:
        'bg-transparent text-slate-700 hover:bg-blue-50/70 hover:text-blue-700 active:bg-blue-100/70 focus-visible:ring-blue-400',
      danger:
        'bg-red-600 text-white hover:bg-red-700 active:bg-red-800 focus-visible:ring-red-500 shadow-xs shadow-red-500/20',
      violet:
        'bg-violet-600 text-white hover:bg-violet-700 active:bg-violet-800 focus-visible:ring-violet-600 shadow-sm shadow-violet-500/20 hover:shadow-md hover:shadow-violet-500/25',
      teal:
        'bg-teal-600 text-white hover:bg-teal-700 active:bg-teal-800 focus-visible:ring-teal-600 shadow-sm shadow-teal-500/20 hover:shadow-md hover:shadow-teal-500/25',
    };

    const sizes = {
      sm: 'text-xs px-3 py-1.5 gap-1.5 min-h-[32px]',
      md: 'text-sm px-4 py-2 gap-2 min-h-[40px]',
      lg: 'text-base px-6 py-2.5 gap-2.5 font-semibold min-h-[44px]',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || isLoading}
        className={cn(baseStyles, variants[variant], sizes[size], className)}
        {...props}
      >
        {isLoading ? (
          <Spinner size="sm" className="text-current" />
        ) : (
          leftIcon && <span className="shrink-0">{leftIcon}</span>
        )}
        <span>{children}</span>
        {!isLoading && rightIcon && <span className="shrink-0">{rightIcon}</span>}
      </button>
    );
  }
);

Button.displayName = 'Button';
