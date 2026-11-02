import React from 'react';
import { useUIStore, type ToastItem } from '@/stores/uiStore';
import { CheckCircle2, AlertTriangle, XCircle, Info, X } from 'lucide-react';
import { cn } from '@/utils/cn';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useUIStore();

  if (toasts.length === 0) return null;

  return (
    <div
      aria-live="polite"
      className="fixed bottom-4 right-4 z-50 flex flex-col gap-2 max-w-sm w-full pointer-events-none"
    >
      {toasts.map((toast) => (
        <ToastCard key={toast.id} toast={toast} onClose={() => removeToast(toast.id)} />
      ))}
    </div>
  );
};

interface ToastCardProps {
  toast: ToastItem;
  onClose: () => void;
}

const ToastCard: React.FC<ToastCardProps> = ({ toast, onClose }) => {
  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />,
    warning: <AlertTriangle className="w-5 h-5 text-amber-600 shrink-0" />,
    error: <XCircle className="w-5 h-5 text-rose-600 shrink-0" />,
    info: <Info className="w-5 h-5 text-brand-600 shrink-0" />,
  };

  const borderStyles = {
    success: 'border-emerald-200 bg-white/95',
    warning: 'border-amber-200 bg-white/95',
    error: 'border-rose-200 bg-white/95',
    info: 'border-brand-200 bg-white/95',
  };

  return (
    <div
      role="alert"
      className={cn(
        'pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-elevated backdrop-blur-md transition-all duration-200 animate-in slide-in-from-bottom-2',
        borderStyles[toast.type]
      )}
    >
      {icons[toast.type]}
      <div className="flex-1 text-left min-w-0">
        {toast.title && <h5 className="text-sm font-semibold text-slate-900">{toast.title}</h5>}
        <p className="text-xs text-slate-600 leading-relaxed mt-0.5">{toast.message}</p>
      </div>
      <button
        onClick={onClose}
        aria-label="Close notification"
        className="text-slate-400 hover:text-slate-600 p-0.5 rounded-lg hover:bg-slate-100 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
};
