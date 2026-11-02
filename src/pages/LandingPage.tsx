import React from 'react';
import { Link } from 'react-router-dom';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  FileText,
  ScanSearch,
  Bot,
  MessageSquare,
  CheckCircle2,
  Lock,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-brand-500 selection:text-white">
      {/* Navigation */}
      <Navbar />

      {/* ─── Hero Section ─── */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-32 bg-gradient-to-b from-indigo-50/50 via-white to-white">
        {/* Ambient background glows */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 w-[700px] h-[400px] bg-brand-200/30 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          {/* Announcement pill */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-brand-200 bg-brand-50/80 text-brand-700 text-xs font-semibold shadow-xs">
            <Sparkles className="w-3.5 h-3.5 text-brand-600" />
            <span>Next-Generation Career Platform Built for Tech</span>
            <span className="text-brand-300">•</span>
            <span className="font-bold text-slate-900">Zero Parsing Errors</span>
          </div>

          {/* Main Headline */}
          <div className="space-y-4 max-w-4xl mx-auto">
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-slate-900 tracking-tight leading-[1.08]">
              Land Your Dream Job with an <br className="hidden sm:inline" />
              <span className="bg-gradient-to-r from-brand-700 via-brand-600 to-indigo-600 bg-clip-text text-transparent">
                AI-Powered Resume
              </span>
            </h1>
            <p className="text-base sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
              Create recruiter-approved, ATS-safe resumes in minutes. Built on battle-tested single-column formats with real-time vector text PDF export.
            </p>
          </div>

          {/* Call to Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Link to="/signup" className="w-full sm:w-auto">
              <Button size="lg" className="w-full sm:w-auto shadow-elevated" rightIcon={<ArrowRight className="w-4 h-4" />}>
                Build Your Resume Free
              </Button>
            </Link>
            <a href="#templates" className="w-full sm:w-auto">
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                Explore ATS Templates
              </Button>
            </a>
          </div>

          {/* Trust badges */}
          <div className="pt-6 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500 font-medium">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> 100% Vector Text-Stream PDF
            </span>
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-brand-600" /> Workday & Greenhouse Parser Safe
            </span>
            <span className="flex items-center gap-1.5">
              <Lock className="w-4 h-4 text-slate-600" /> Private & Secure Storage
            </span>
          </div>

          {/* ─── Hero Visual Preview Mockup ─── */}
          <div className="pt-10 max-w-5xl mx-auto">
            <div className="relative rounded-3xl border border-slate-200/80 bg-slate-900/5 p-3 sm:p-5 shadow-2xl backdrop-blur-xl">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 text-left shadow-subtle grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
                {/* Left: Template snapshot illustration */}
                <div className="lg:col-span-7 space-y-4 font-mono text-xs text-slate-800 bg-slate-50 p-6 rounded-xl border border-slate-200/80">
                  <div className="border-b border-slate-200 pb-3 flex justify-between items-start">
                    <div>
                      <h3 className="text-base font-bold text-slate-900 tracking-tight font-sans">ALEX JOHNSON</h3>
                      <p className="text-[11px] text-slate-500 font-sans">San Francisco, CA • alex@example.com • github.com/alex</p>
                    </div>
                    <Badge variant="success" size="sm" className="font-sans">
                      ATS Score 96/100
                    </Badge>
                  </div>
                  <div className="space-y-1">
                    <p className="font-bold text-[11px] text-slate-900 font-sans tracking-wider uppercase">EXPERIENCE</p>
                    <div className="text-[11px] text-slate-700 font-sans">
                      <div className="flex justify-between font-semibold">
                        <span>Senior Software Engineer — CloudPlatform Inc.</span>
                        <span className="text-slate-500">2023 – Present</span>
                      </div>
                      <p className="text-slate-600 mt-1 pl-3 border-l-2 border-brand-500">
                        • Spearheaded migration of 14 microservices to Kubernetes, reducing p99 API latency by 42% across 1.2M daily active users.
                      </p>
                      <p className="text-slate-600 mt-1 pl-3 border-l-2 border-brand-500">
                        • Architected distributed caching layer saving \$180K in annual AWS infrastructure spend.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Right: AI transformation badge */}
                <div className="lg:col-span-5 space-y-4">
                  <div className="rounded-xl border border-brand-200 bg-brand-50/70 p-4 space-y-2">
                    <div className="flex items-center gap-2 text-brand-700 font-bold text-xs">
                      <Sparkles className="w-4 h-4 text-brand-600" />
                      Google XYZ Formula Optimization
                    </div>
                    <div className="space-y-1.5 text-xs text-left">
                      <div className="bg-white/80 p-2.5 rounded-lg border border-brand-100 text-slate-500 line-through">
                        &quot;Worked on migrating backend microservices to Kubernetes.&quot;
                      </div>
                      <div className="text-[10px] text-center font-bold text-brand-600">↓ TRANSFORMED BY AI</div>
                      <div className="bg-brand-600 text-white p-2.5 rounded-lg font-medium shadow-sm">
                        &quot;Spearheaded migration of 14 microservices to Kubernetes, reducing p99 API latency by 42% across 1.2M daily active users.&quot;
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-center">
                    <div className="rounded-xl bg-slate-50 p-3 border border-slate-100">
                      <p className="text-xl font-bold text-slate-900">100%</p>
                      <p className="text-[10px] text-slate-500 uppercase font-semibold">Parse Rate</p>
                    </div>
                    <div className="rounded-xl bg-slate-50 p-3 border border-slate-100">
                      <p className="text-xl font-bold text-slate-900">&lt; 2.5s</p>
                      <p className="text-[10px] text-slate-500 uppercase font-semibold">Vector PDF Export</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Product Modules Section ─── */}
      <section id="features" className="py-20 lg:py-28 bg-slate-50 border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-3 max-w-3xl mx-auto">
            <Badge variant="brand" size="sm" className="uppercase tracking-wider font-bold">
              Engineering Architecture
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              An End-to-End AI Career Platform
            </h2>
            <p className="text-sm sm:text-base text-slate-600">
              Each module is designed with clear architectural separation to provide maximum parsing reliability and actionable career guidance.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Feature 1 */}
            <Card className="p-6 space-y-4 hover:shadow-elevated transition-all">
              <div className="w-12 h-12 rounded-2xl bg-brand-50 border border-brand-200/60 text-brand-600 flex items-center justify-center">
                <FileText className="w-6 h-6" />
              </div>
              <div className="space-y-1 text-left">
                <h3 className="text-base font-bold text-slate-900">AI Resume Builder</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Single-column formats (Jake&apos;s, Harvard, Stanford) with live split-screen editor and searchable vector text PDF downloads.
                </p>
              </div>
              <ul className="text-xs text-slate-600 space-y-1.5 text-left border-t border-slate-100 pt-3">
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-brand-600 shrink-0" /> Zero parsing tables
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-brand-600 shrink-0" /> Debounced autosave
                </li>
              </ul>
            </Card>

            {/* Feature 2 */}
            <Card className="p-6 space-y-4 hover:shadow-elevated transition-all">
              <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200/60 text-emerald-600 flex items-center justify-center">
                <ScanSearch className="w-6 h-6" />
              </div>
              <div className="space-y-1 text-left">
                <h3 className="text-base font-bold text-slate-900">ATS Resume Analyzer</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Upload your existing PDF or DOCX resume for a 5-vector recruiter audit measuring parseability, impact, and keywords.
                </p>
              </div>
              <ul className="text-xs text-slate-600 space-y-1.5 text-left border-t border-slate-100 pt-3">
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> 0–100 Recruiter Score
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> One-click bullet fixes
                </li>
              </ul>
            </Card>

            {/* Feature 3 */}
            <Card className="p-6 space-y-4 hover:shadow-elevated transition-all">
              <div className="w-12 h-12 rounded-2xl bg-purple-50 border border-purple-200/60 text-purple-600 flex items-center justify-center">
                <Bot className="w-6 h-6" />
              </div>
              <div className="space-y-1 text-left">
                <h3 className="text-base font-bold text-slate-900">Career Copilot (&quot;Max&quot;)</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  An in-app conversational assistant grounded on your actual work history, guiding role pivots and salary negotiation.
                </p>
              </div>
              <ul className="text-xs text-slate-600 space-y-1.5 text-left border-t border-slate-100 pt-3">
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-purple-600 shrink-0" /> Grounded career RAG
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-purple-600 shrink-0" /> Skills gap analysis
                </li>
              </ul>
            </Card>

            {/* Feature 4 */}
            <Card className="p-6 space-y-4 hover:shadow-elevated transition-all">
              <div className="w-12 h-12 rounded-2xl bg-rose-50 border border-rose-200/60 text-rose-600 flex items-center justify-center">
                <MessageSquare className="w-6 h-6" />
              </div>
              <div className="space-y-1 text-left">
                <h3 className="text-base font-bold text-slate-900">Mock Interview Hub</h3>
                <p className="text-xs text-slate-500 leading-relaxed">
                  Role-specific question banks covering Data Structures, System Design, and STAR behavioral scenarios with AI feedback.
                </p>
              </div>
              <ul className="text-xs text-slate-600 space-y-1.5 text-left border-t border-slate-100 pt-3">
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-rose-600 shrink-0" /> System design tracks
                </li>
                <li className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-rose-600 shrink-0" /> STAR feedback scoring
                </li>
              </ul>
            </Card>
          </div>
        </div>
      </section>

      {/* ─── Templates Preview Section ─── */}
      <section id="templates" className="py-20 lg:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-3 max-w-3xl mx-auto">
            <Badge variant="default" size="sm" className="uppercase tracking-wider font-bold">
              Standardized Typography
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Recruiter-Approved ATS Templates
            </h2>
            <p className="text-sm sm:text-base text-slate-600">
              No graphics, two-column bars, or unparseable tables. Designed strictly around corporate parsing engine standards.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Template 1 */}
            <div className="group rounded-2xl border border-slate-200 bg-slate-50 p-4 transition-all hover:border-brand-500 hover:shadow-card text-left">
              <div className="h-44 rounded-xl bg-white border border-slate-200 p-3 space-y-2 font-mono text-[9px] text-slate-400 overflow-hidden shadow-xs">
                <div className="border-b pb-1 font-bold text-slate-800 text-[10px]">JAKE&apos;S TECHNICAL RESUME</div>
                <div className="h-1.5 w-3/4 bg-slate-200 rounded"></div>
                <div className="h-1.5 w-1/2 bg-slate-100 rounded"></div>
                <div className="h-1.5 w-full bg-slate-100 rounded"></div>
                <div className="h-1.5 w-5/6 bg-slate-100 rounded"></div>
              </div>
              <div className="pt-3">
                <h4 className="text-sm font-bold text-slate-900">Jake&apos;s Tech Standard</h4>
                <p className="text-xs text-slate-500 mt-0.5">The Silicon Valley gold-standard single-column layout.</p>
              </div>
            </div>

            {/* Template 2 */}
            <div className="group rounded-2xl border border-slate-200 bg-slate-50 p-4 transition-all hover:border-brand-500 hover:shadow-card text-left">
              <div className="h-44 rounded-xl bg-white border border-slate-200 p-3 space-y-2 font-serif text-[9px] text-slate-400 overflow-hidden shadow-xs">
                <div className="border-b pb-1 font-bold text-slate-900 text-[10px] text-center">HARVARD CLASSIC</div>
                <div className="h-1.5 w-full bg-slate-200 rounded"></div>
                <div className="h-1.5 w-2/3 bg-slate-100 rounded"></div>
                <div className="h-1.5 w-4/5 bg-slate-100 rounded"></div>
              </div>
              <div className="pt-3">
                <h4 className="text-sm font-bold text-slate-900">Harvard Classic</h4>
                <p className="text-xs text-slate-500 mt-0.5">Crisp, traditional serif layout with centered hierarchy.</p>
              </div>
            </div>

            {/* Template 3 */}
            <div className="group rounded-2xl border border-slate-200 bg-slate-50 p-4 transition-all hover:border-brand-500 hover:shadow-card text-left">
              <div className="h-44 rounded-xl bg-white border border-slate-200 p-3 space-y-2 text-[9px] text-slate-400 overflow-hidden shadow-xs">
                <div className="border-b border-indigo-200 pb-1 font-bold text-indigo-900 text-[10px]">STANFORD EDITORIAL</div>
                <div className="h-1.5 w-3/4 bg-indigo-100 rounded"></div>
                <div className="h-1.5 w-5/6 bg-slate-100 rounded"></div>
                <div className="h-1.5 w-2/3 bg-slate-100 rounded"></div>
              </div>
              <div className="pt-3">
                <h4 className="text-sm font-bold text-slate-900">Stanford Editorial</h4>
                <p className="text-xs text-slate-500 mt-0.5">Refined layout with restrained ink-blue accents.</p>
              </div>
            </div>

            {/* Template 4 */}
            <div className="group rounded-2xl border border-slate-200 bg-slate-50 p-4 transition-all hover:border-brand-500 hover:shadow-card text-left">
              <div className="h-44 rounded-xl bg-white border border-slate-200 p-3 space-y-2 text-[9px] text-slate-400 overflow-hidden shadow-xs">
                <div className="border-b pb-1 font-bold text-slate-900 text-[10px]">MODERN TECH CLEAN</div>
                <div className="h-1.5 w-full bg-slate-200 rounded"></div>
                <div className="h-1.5 w-4/5 bg-slate-100 rounded"></div>
                <div className="h-1.5 w-3/4 bg-slate-100 rounded"></div>
              </div>
              <div className="pt-3">
                <h4 className="text-sm font-bold text-slate-900">Modern Tech Clean</h4>
                <p className="text-xs text-slate-500 mt-0.5">Contemporary spacing optimized for engineering skills.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── How it Works ─── */}
      <section id="how-it-works" className="py-20 lg:py-28 bg-slate-50 border-t border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-3 max-w-3xl mx-auto">
            <Badge variant="brand" size="sm" className="uppercase tracking-wider font-bold">
              Workflow
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Four Steps to an Interview-Ready Resume
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-left">
            <div className="rounded-2xl bg-white border border-slate-200 p-6 space-y-3 shadow-xs">
              <span className="w-8 h-8 rounded-xl bg-brand-50 text-brand-600 font-black text-sm flex items-center justify-center">
                1
              </span>
              <h4 className="text-sm font-bold text-slate-900">Select Template</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Choose Jake&apos;s Tech standard or Harvard Classic, or import your current PDF.
              </p>
            </div>

            <div className="rounded-2xl bg-white border border-slate-200 p-6 space-y-3 shadow-xs">
              <span className="w-8 h-8 rounded-xl bg-brand-50 text-brand-600 font-black text-sm flex items-center justify-center">
                2
              </span>
              <h4 className="text-sm font-bold text-slate-900">AI Bullet Optimization</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Formulate achievements around Google&apos;s XYZ framework with quantified metrics.
              </p>
            </div>

            <div className="rounded-2xl bg-white border border-slate-200 p-6 space-y-3 shadow-xs">
              <span className="w-8 h-8 rounded-xl bg-brand-50 text-brand-600 font-black text-sm flex items-center justify-center">
                3
              </span>
              <h4 className="text-sm font-bold text-slate-900">Job Match & Tailor</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Paste the target job description to identify missing keywords and tailor bullets.
              </p>
            </div>

            <div className="rounded-2xl bg-white border border-slate-200 p-6 space-y-3 shadow-xs">
              <span className="w-8 h-8 rounded-xl bg-brand-50 text-brand-600 font-black text-sm flex items-center justify-center">
                4
              </span>
              <h4 className="text-sm font-bold text-slate-900">Vector PDF Export</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Download true vector text-stream PDFs guaranteed to pass ATS scanners with 100% accuracy.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Pricing Preview ─── */}
      <section id="pricing" className="py-20 lg:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-3 max-w-3xl mx-auto">
            <Badge variant="brand" size="sm" className="uppercase tracking-wider font-bold">
              Transparent Pricing
            </Badge>
            <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
              Invest in Your Career
            </h2>
            <p className="text-sm sm:text-base text-slate-600">
              Clear tiers with functional free access and high-volume options for active job searches.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left max-w-5xl mx-auto">
            {/* Free Tier */}
            <Card className="p-8 flex flex-col justify-between border-slate-200">
              <div className="space-y-4">
                <Badge variant="default" size="sm">
                  Free Forever
                </Badge>
                <h3 className="text-xl font-bold text-slate-900">Starter</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-slate-900">\$0</span>
                  <span className="text-xs text-slate-500">/month</span>
                </div>
                <p className="text-xs text-slate-500">Essential tools to build and download an ATS-safe resume.</p>
                <ul className="space-y-2 text-xs text-slate-600 pt-4 border-t border-slate-100">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Up to 3 active resumes
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Vector text-stream PDF downloads
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Standard ATS templates
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" /> 1 Monthly ATS review
                  </li>
                </ul>
              </div>
              <div className="pt-6">
                <Link to="/signup">
                  <Button variant="outline" className="w-full">
                    Get Started Free
                  </Button>
                </Link>
              </div>
            </Card>

            {/* Pro Tier */}
            <Card className="p-8 flex flex-col justify-between border-brand-500 shadow-elevated relative bg-brand-50/10">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Badge variant="brand" size="sm" className="bg-brand-600 text-white font-bold py-1 px-3">
                  Most Popular
                </Badge>
              </div>
              <div className="space-y-4">
                <Badge variant="brand" size="sm">
                  Pro Plan
                </Badge>
                <h3 className="text-xl font-bold text-slate-900">Professional</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-slate-900">\$29</span>
                  <span className="text-xs text-slate-500">/month</span>
                </div>
                <p className="text-xs text-slate-500">For engineers actively applying to competitive roles.</p>
                <ul className="space-y-2 text-xs text-slate-700 pt-4 border-t border-slate-100">
                  <li className="flex items-center gap-2 font-medium">
                    <CheckCircle2 className="w-4 h-4 text-brand-600" /> Unlimited resumes & versions
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-brand-600" /> 30 Per-job tailored resumes/mo
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-brand-600" /> 25 Recruiter-grade ATS audits
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-brand-600" /> 50 Daily AI copilot turns
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-brand-600" /> DOCX and Vector PDF exports
                  </li>
                </ul>
              </div>
              <div className="pt-6">
                <Link to="/signup">
                  <Button variant="primary" className="w-full">
                    Upgrade to Pro
                  </Button>
                </Link>
              </div>
            </Card>

            {/* Premium Tier */}
            <Card className="p-8 flex flex-col justify-between border-slate-200">
              <div className="space-y-4">
                <Badge variant="default" size="sm">
                  Intensive Search
                </Badge>
                <h3 className="text-xl font-bold text-slate-900">Premium</h3>
                <div className="flex items-baseline gap-1">
                  <span className="text-4xl font-black text-slate-900">\$49</span>
                  <span className="text-xs text-slate-500">/month</span>
                </div>
                <p className="text-xs text-slate-500">Maximum speed with full interview coaching tracks.</p>
                <ul className="space-y-2 text-xs text-slate-600 pt-4 border-t border-slate-100">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-brand-600" /> 150 Job tailoring runs/mo
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-brand-600" /> 100 In-depth ATS reviews
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-brand-600" /> Full Mock Interview prep hub
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-brand-600" /> 200 Daily Copilot turns
                  </li>
                </ul>
              </div>
              <div className="pt-6">
                <Link to="/signup">
                  <Button variant="outline" className="w-full">
                    Start Premium
                  </Button>
                </Link>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* ─── FAQ Section ─── */}
      <section id="faq" className="py-20 lg:py-28 bg-slate-50 border-t border-slate-200/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <div className="text-center space-y-3">
            <Badge variant="default" size="sm" className="uppercase tracking-wider font-bold">
              Frequently Asked Questions
            </Badge>
            <h2 className="text-3xl font-black text-slate-900 tracking-tight">Got Questions? We Have Answers.</h2>
          </div>

          <div className="space-y-4 text-left">
            <Card className="p-6">
              <h4 className="text-sm font-bold text-slate-900">Why are single-column resumes recommended for tech?</h4>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Most enterprise ATS platforms (Workday, Taleo, Greenhouse) read text top-to-bottom. Multi-column tables or text boxes frequently result in jumbled text where job titles and companies become mismatched, causing automated rejection.
              </p>
            </Card>

            <Card className="p-6">
              <h4 className="text-sm font-bold text-slate-900">How does ResuMax AI generate PDFs differently?</h4>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Many tools use canvas snapshots (rendering HTML to an image inside a PDF), which leaves zero selectable text for ATS bots. ResuMax AI outputs true vector text streams where each word, glyph, and link is readable by any parser.
              </p>
            </Card>

            <Card className="p-6">
              <h4 className="text-sm font-bold text-slate-900">Is my resume data private?</h4>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                Yes. All user documents are stored in private storage buckets protected by PostgreSQL Row Level Security. We never share your data with recruiters or third parties.
              </p>
            </Card>
          </div>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
};
