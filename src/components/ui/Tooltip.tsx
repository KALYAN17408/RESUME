import React, { useState, useRef, useId } from 'react';
import { cn } from '@/utils/cn';

export interface TooltipProps {
  content: React.ReactNode;
  children: React.ReactElement;
  position?: 'top' | 'bottom' | 'left' | 'right';
  shortcut?: string;
  className?: string;
  delayMs?: number;
}

export const Tooltip: React.FC<TooltipProps> = ({
  content,
  children,
  position = 'top',
  shortcut,
  className,
  delayMs = 150,
}) => {
  const [isVisible, setIsVisible] = useState(false);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const tooltipId = useId();

  const showTooltip = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      setIsVisible(true);
    }, delayMs);
  };

  const hideTooltip = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    setIsVisible(false);
  };

  const positionClasses = {
    top: 'bottom-full left-1/2 -translate-x-1/2 mb-2',
    bottom: 'top-full left-1/2 -translate-x-1/2 mt-2',
    left: 'right-full top-1/2 -translate-y-1/2 mr-2',
    right: 'left-full top-1/2 -translate-y-1/2 ml-2',
  };

  // Clone child to automatically bind accessibility and focus listeners
  const trigger = React.cloneElement(children, {
    'aria-describedby': isVisible ? tooltipId : children.props['aria-describedby'],
    onMouseEnter: (e: React.MouseEvent) => {
      children.props.onMouseEnter?.(e);
      showTooltip();
    },
    onMouseLeave: (e: React.MouseEvent) => {
      children.props.onMouseLeave?.(e);
      hideTooltip();
    },
    onFocus: (e: React.FocusEvent) => {
      children.props.onFocus?.(e);
      showTooltip();
    },
    onBlur: (e: React.FocusEvent) => {
      children.props.onBlur?.(e);
      hideTooltip();
    },
    onKeyDown: (e: React.KeyboardEvent) => {
      children.props.onKeyDown?.(e);
      if (e.key === 'Escape') {
        hideTooltip();
      }
    },
  });

  return (
    <div className="relative inline-flex items-center justify-center">
      {trigger}

      {isVisible && (
        <div
          id={tooltipId}
          role="tooltip"
          aria-hidden={!isVisible}
          className={cn(
            'absolute z-50 pointer-events-none whitespace-nowrap rounded-radius-xs bg-slate-900 px-2 py-1 text-[11px] font-medium text-white shadow-elevated transition-opacity duration-quick animate-in fade-in-0 zoom-in-95',
            positionClasses[position],
            className
          )}
        >
          <div className="flex items-center gap-1.5">
            <span>{content}</span>
            {shortcut && (
              <kbd className="rounded bg-slate-800 px-1 py-0.5 text-[9px] font-mono text-slate-300 border border-slate-700">
                {shortcut}
              </kbd>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

