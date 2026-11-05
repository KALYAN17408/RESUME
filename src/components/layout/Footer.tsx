import React from 'react';
import { Sparkles, Shield, Lock } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-200 bg-white py-12 lg:py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">
          {/* Brand Info */}
          <div className="md:col-span-1 space-y-4">
            <Link to="/" className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-black flex items-center justify-center text-white">
                <Sparkles className="w-4 h-4" />
              </div>
              <span className="text-base font-bold text-slate-900 tracking-tight">
                RESUME <span className="text-black font-extrabold text-xs px-1.5 py-0.5 rounded-md bg-zinc-100 border border-zinc-200">AI</span>
              </span>
            </Link>
            <p className="text-xs text-slate-500 leading-relaxed">
              Professional AI career platform. Built to empower job seekers with parser-safe resumes and tailored application materials.
            </p>
            <div className="flex items-center gap-4 text-xs text-slate-400 pt-2">
              <span className="flex items-center gap-1">
                <Shield className="w-3.5 h-3.5 text-black" /> ATS-Tested
              </span>
              <span className="flex items-center gap-1">
                <Lock className="w-3.5 h-3.5 text-emerald-600" /> Private & Secure
              </span>
            </div>
          </div>

          {/* Product Links */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">Features</h4>
            <ul className="space-y-2 text-xs text-slate-600">
              <li>
                <span className="hover:text-slate-900 cursor-pointer">AI Resume Builder</span>
              </li>
              <li>
                <span className="hover:text-slate-900 cursor-pointer">ATS Resume Analyzer</span>
              </li>
              <li>
                <span className="hover:text-slate-900 cursor-pointer">Cover Letter Generator</span>
              </li>
              <li>
                <span className="hover:text-slate-900 cursor-pointer">Career Copilot</span>
              </li>
              <li>
                <span className="hover:text-slate-900 cursor-pointer">Mock Interview Prep</span>
              </li>
            </ul>
          </div>

          {/* Templates */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">ATS Templates</h4>
            <ul className="space-y-2 text-xs text-slate-600">
              <li>
                <span className="hover:text-slate-900 cursor-pointer">Jake's Technical Format</span>
              </li>
              <li>
                <span className="hover:text-slate-900 cursor-pointer">Harvard Classic Serif</span>
              </li>
              <li>
                <span className="hover:text-slate-900 cursor-pointer">Stanford Editorial Navy</span>
              </li>
              <li>
                <span className="hover:text-slate-900 cursor-pointer">Modern Tech Minimal</span>
              </li>
            </ul>
          </div>

          {/* Architecture & Compliance */}
          <div className="space-y-3">
            <h4 className="text-xs font-semibold text-slate-900 uppercase tracking-wider">Platform & Standards</h4>
            <p className="text-xs text-slate-500 leading-relaxed">
              Clean PDF exports with selectable text and standard formatting designed for applicant tracking systems.
            </p>
            <div className="pt-2 text-xs text-slate-400">
              <p>© {new Date().getFullYear()} RESUME AI. All rights reserved.</p>
              <p className="mt-1">Independent platform inspired by modern career workflows.</p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};
