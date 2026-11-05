import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowLeft } from 'lucide-react';
import { ToastContainer } from '@/components/ui/Toast';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title, subtitle }) => {
  return (
    <div className="relative min-h-screen flex flex-col justify-center items-center py-12 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-slate-100/70 via-white to-zinc-100/60 overflow-hidden">
      {/* Ambient gradient spheres */}
      <div className="absolute top-0 right-1/4 -z-10 w-96 h-96 bg-zinc-200/40 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 left-1/4 -z-10 w-80 h-80 bg-slate-200/40 rounded-full blur-3xl pointer-events-none" />

      {/* Back to Home Button */}
      <div className="absolute top-6 left-6 sm:top-8 sm:left-8">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors px-3 py-1.5 rounded-xl hover:bg-white/80"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>
      </div>

      <div className="w-full max-w-md space-y-6">
        {/* Brand Logo & Header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-black flex items-center justify-center text-white shadow-md shadow-black/20 group-hover:scale-105 transition-transform">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-black tracking-tight text-slate-900">
              RESUME <span className="text-black font-extrabold text-xs px-1.5 py-0.5 rounded-md bg-zinc-100 border border-zinc-200">AI</span>
            </span>
          </Link>
          <h2 className="text-2xl font-extrabold text-slate-900 tracking-tight sm:text-3xl pt-2">
            {title}
          </h2>
          <p className="text-xs text-slate-500 max-w-xs mx-auto leading-relaxed">
            {subtitle}
          </p>
        </div>

        {/* Card */}
        <div className="rounded-3xl border border-slate-200/80 bg-white/90 p-8 shadow-card backdrop-blur-xl transition-all">
          {children}
        </div>

        {/* Security watermark */}
        <p className="text-center text-[11px] text-slate-500">
          Protected by industry-standard encryption & secure data privacy.
        </p>
      </div>

      <ToastContainer />
    </div>
  );
};
