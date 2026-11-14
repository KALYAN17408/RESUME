import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, ArrowLeft, FileText, ScanSearch, Mail, CheckCircle2, ShieldCheck } from 'lucide-react';
import { ToastContainer } from '@/components/ui/Toast';
import { Badge } from '@/components/ui/Badge';

interface AuthLayoutProps {
  children: React.ReactNode;
  title: string;
  subtitle: string;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({ children, title, subtitle }) => {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col lg:grid lg:grid-cols-12 relative overflow-hidden">
      {/* ─── Left Panel: Auth Form ─── */}
      <div className="lg:col-span-6 xl:col-span-5 flex flex-col justify-between p-6 sm:p-10 lg:p-14 relative z-10 bg-white border-r border-slate-200/80">
        {/* Top Header: Back Link */}
        <div className="flex items-center justify-between pb-6">
          <Link
            to="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-slate-900 transition-colors px-3 py-1.5 rounded-xl hover:bg-slate-100"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Home</span>
          </Link>
          <Badge variant="outline" size="sm" className="bg-emerald-50 text-emerald-700 border-emerald-200 text-[10px] font-bold uppercase tracking-wider">
            100% Free Forever
          </Badge>
        </div>

        {/* Form Container */}
        <div className="max-w-md w-full mx-auto my-auto space-y-6 py-4">
          {/* Brand & Page Header */}
          <div className="space-y-2 text-left">
            <Link to="/" className="inline-flex items-center gap-2.5 group">
              <div className="w-9 h-9 rounded-xl bg-black flex items-center justify-center text-white shadow-md shadow-black/20 group-hover:scale-105 transition-transform">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-black tracking-tight text-slate-900">
                RESUME <span className="text-black font-extrabold text-xs px-1.5 py-0.5 rounded-md bg-zinc-100 border border-zinc-200">AI</span>
              </span>
            </Link>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight pt-2">
              {title}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
              {subtitle}
            </p>
          </div>

          {/* Form Content */}
          <div className="rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-8 shadow-xs">
            {children}
          </div>
        </div>

        {/* Security Footer */}
        <div className="pt-6 border-t border-slate-100 text-center text-[11px] text-slate-400 space-y-1.5">
          <div className="flex items-center justify-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Protected by industry-standard encryption & PostgreSQL RLS privacy.</span>
          </div>
          <div className="flex items-center justify-center gap-2 text-slate-500">
            <Link to="/terms" className="hover:underline hover:text-slate-700">Terms of Service</Link>
            <span>•</span>
            <Link to="/privacy-policy" className="hover:underline hover:text-slate-700">Privacy Policy</Link>
          </div>
        </div>
      </div>

      {/* ─── Right Panel: Platform Showcase (Visible on Large Screens) ─── */}
      <div className="hidden lg:col-span-6 xl:col-span-7 lg:flex flex-col justify-between p-12 lg:p-16 bg-gradient-to-br from-slate-950 via-zinc-900 to-black text-white relative overflow-hidden">
        {/* Ambient atmospheric glows */}
        <div className="absolute top-0 right-0 -z-0 h-96 w-96 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/4 -z-0 h-80 w-80 rounded-full bg-teal-500/10 blur-3xl pointer-events-none" />

        {/* Top Tagline */}
        <div className="relative z-10">
          <Badge variant="outline" size="sm" className="bg-white/10 text-white border-white/20 uppercase tracking-wider text-[10px] font-bold">
            Career Acceleration Platform
          </Badge>
        </div>

        {/* Core Showcase Cards */}
        <div className="relative z-10 space-y-8 max-w-lg my-auto py-8">
          <div className="space-y-3">
            <h2 className="text-3xl xl:text-4xl font-black text-white tracking-tight leading-tight">
              Build recruiter-approved resumes that get interviews.
            </h2>
            <p className="text-sm text-slate-400 leading-relaxed">
              Every tool is completely free with no hidden paywalls. Access industry-standard templates and automated application audits in one workspace.
            </p>
          </div>

          {/* Available Features List */}
          <div className="space-y-4">
            {/* Feature 1: Resume Builder */}
            <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
              <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/10 flex items-center justify-center shrink-0 text-white">
                <FileText className="w-5 h-5" />
              </div>
              <div className="space-y-1 text-left">
                <h3 className="text-sm font-bold text-white">ATS Resume Builder</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Single-column formats (Jake&apos;s Tech, Harvard, Stanford) with live split-screen editor and selectable-text PDF export.
                </p>
              </div>
            </div>

            {/* Feature 2: ATS Analyzer */}
            <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center shrink-0 text-emerald-400">
                <ScanSearch className="w-5 h-5" />
              </div>
              <div className="space-y-1 text-left">
                <h3 className="text-sm font-bold text-white">ATS Resume Analyzer</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  0–100 compatibility audit measuring readability, keyword density, and bullet impact against target job descriptions.
                </p>
              </div>
            </div>

            {/* Feature 3: Cover Letter Generator */}
            <div className="flex items-start gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-md">
              <div className="w-10 h-10 rounded-xl bg-teal-500/20 border border-teal-500/30 flex items-center justify-center shrink-0 text-teal-400">
                <Mail className="w-5 h-5" />
              </div>
              <div className="space-y-1 text-left">
                <h3 className="text-sm font-bold text-white">Cover Letter Generator</h3>
                <p className="text-xs text-slate-300 leading-relaxed">
                  Role-tailored letters grounded strictly on your verified resume details with 4 tone options and instant PDF download.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Trust Points */}
        <div className="relative z-10 pt-6 border-t border-white/10 flex flex-wrap items-center gap-6 text-xs text-slate-400">
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" /> 4 Proven ATS Formats
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Clean Selectable PDFs
          </span>
          <span className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Zero Paywalls
          </span>
        </div>
      </div>

      <ToastContainer />
    </div>
  );
};
