import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/Button';
import { Sparkles, ArrowLeft } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center px-4 bg-slate-50 text-slate-900 text-center space-y-6">
      <div className="w-16 h-16 rounded-3xl bg-brand-50 border border-brand-200/60 text-brand-600 flex items-center justify-center mx-auto shadow-sm">
        <Sparkles className="w-8 h-8" />
      </div>
      <div className="space-y-2 max-w-md">
        <span className="text-xs font-mono font-bold text-brand-600 uppercase tracking-widest">404 Error</span>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Page Not Found</h1>
        <p className="text-xs text-slate-500 leading-relaxed">
          The career page or document you are looking for does not exist or has been relocated.
        </p>
      </div>
      <div>
        <Link to="/">
          <Button variant="primary" leftIcon={<ArrowLeft className="w-4 h-4" />}>
            Return to Homepage
          </Button>
        </Link>
      </div>
    </div>
  );
};
