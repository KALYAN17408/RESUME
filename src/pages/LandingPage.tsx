import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Navbar } from '@/components/layout/Navbar';
import { Footer } from '@/components/layout/Footer';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { ScrollProgress } from '@/components/animations/ScrollProgress';
import { FadeIn, StaggerContainer } from '@/components/animations/FadeIn';
import { HeroScrollShowcase } from '@/components/animations/HeroScrollShowcase';
import {
  Sparkles,
  ArrowRight,
  ShieldCheck,
  FileText,
  ScanSearch,
  Mail,
  Briefcase,
  CheckCircle2,
  Lock,
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white text-slate-900 selection:bg-black selection:text-white">
      {/* Apple-style top scroll-progress indicator */}
      <ScrollProgress />

      {/* Navigation */}
      <Navbar />

      {/* ─── Hero Section with Apple-Style 3D Tilt & Parallax ─── */}
      <section className="relative overflow-hidden pt-12 pb-20 lg:pt-20 lg:pb-32 bg-gradient-to-b from-slate-100/60 via-white to-white">
        {/* Ambient background glow optimized with GPU-composited radial gradient */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 -z-10 w-[700px] h-[400px] bg-[radial-gradient(ellipse_at_center,rgba(0,0,0,0.06)_0%,rgba(0,0,0,0)_70%)] rounded-full pointer-events-none transform-gpu will-change-transform" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-8">
          {/* Announcement pill with subtle spring float */}
          <FadeIn delay={0.1} direction="down">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-zinc-200 bg-zinc-100 text-black text-xs font-semibold shadow-xs">
              <Sparkles className="w-3.5 h-3.5 text-black" />
              <span>Next-Generation Career Platform Built for Tech</span>
              <span className="text-zinc-400">•</span>
              <span className="font-bold text-black">Zero Parsing Errors</span>
            </div>
          </FadeIn>

          {/* Main Headline */}
          <div className="space-y-4 max-w-4xl mx-auto">
            <FadeIn delay={0.2} distance={40}>
              <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black text-slate-900 tracking-tight leading-[1.08]">
                Land Your Dream Job with an <br className="hidden sm:inline" />
                <span className="text-black">
                  AI-Powered Resume
                </span>
              </h1>
            </FadeIn>

            <FadeIn delay={0.3} distance={30}>
              <p className="text-base sm:text-xl text-slate-600 max-w-2xl mx-auto leading-relaxed">
                Create recruiter-approved, ATS-safe resumes in minutes. Built on proven single-column formats with clean PDF export.
              </p>
            </FadeIn>
          </div>

          {/* Call to Actions */}
          <FadeIn delay={0.4} distance={20}>
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
          </FadeIn>

          {/* Trust badges */}
          <FadeIn delay={0.5} distance={15}>
            <div className="pt-4 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500 font-medium">
              <span className="flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" /> ATS-Compliant PDF Export
              </span>
              <span className="flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-black" /> Workday & Greenhouse Parser Safe
              </span>
              <span className="flex items-center gap-1.5">
                <Lock className="w-4 h-4 text-slate-600" /> Private & Secure Storage
              </span>
            </div>
          </FadeIn>

          {/* ─── Apple-Style 3D Tilt Scroll-Driven Showcase ─── */}
          <HeroScrollShowcase />
        </div>
      </section>

      {/* ─── Product Modules Section with Stagger Reveal ─── */}
      <section id="features" className="py-20 lg:py-28 bg-slate-50 border-y border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <FadeIn direction="up">
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
          </FadeIn>

          <StaggerContainer className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Feature 1 */}
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 24 },
                show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] } },
              }}
              whileHover={{ y: -4 }}
              style={{ willChange: 'transform, opacity', transform: 'translateZ(0)' }}
            >
              <Card className="p-6 space-y-4 hover:shadow-elevated transition-shadow h-full flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-zinc-100 border border-zinc-200 text-black flex items-center justify-center">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div className="space-y-1 text-left">
                    <h3 className="text-base font-bold text-slate-900">AI Resume Builder</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Single-column formats (Jake&apos;s, Harvard, Stanford) with live split-screen editor and searchable PDF downloads.
                    </p>
                  </div>
                </div>
                <ul className="text-xs text-slate-600 space-y-1.5 text-left border-t border-slate-100 pt-3">
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-black shrink-0" /> Single-column layout
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-black shrink-0" /> Automatic saving
                  </li>
                </ul>
              </Card>
            </motion.div>

            {/* Feature 2 */}
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 24 },
                show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] } },
              }}
              whileHover={{ y: -4 }}
              style={{ willChange: 'transform, opacity', transform: 'translateZ(0)' }}
            >
              <Card className="p-6 space-y-4 hover:shadow-elevated transition-shadow h-full flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-50 border border-emerald-200/60 text-emerald-600 flex items-center justify-center">
                    <ScanSearch className="w-6 h-6" />
                  </div>
                  <div className="space-y-1 text-left">
                    <h3 className="text-base font-bold text-slate-900">ATS Resume Analyzer</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Upload your existing resume PDF for an ATS compatibility audit measuring readability, impact, and keywords.
                    </p>
                  </div>
                </div>
                <ul className="text-xs text-slate-600 space-y-1.5 text-left border-t border-slate-100 pt-3">
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> 0–100 ATS Score
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" /> One-click bullet fixes
                  </li>
                </ul>
              </Card>
            </motion.div>

            {/* Feature 3 */}
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 24 },
                show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] } },
              }}
              whileHover={{ y: -4 }}
              style={{ willChange: 'transform, opacity', transform: 'translateZ(0)' }}
            >
              <Card className="p-6 space-y-4 hover:shadow-elevated transition-shadow h-full flex flex-col justify-between">
                <div className="space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-teal-50 border border-teal-200/60 text-teal-600 flex items-center justify-center">
                    <Mail className="w-6 h-6" />
                  </div>
                  <div className="space-y-1 text-left">
                    <h3 className="text-base font-bold text-slate-900">Cover Letter Generator</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Generate personalized cover letters grounded strictly on your verified resume with 4 tone options and PDF download.
                    </p>
                  </div>
                </div>
                <ul className="text-xs text-slate-600 space-y-1.5 text-left border-t border-slate-100 pt-3">
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0" /> Grounded on your resume
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0" /> 4 tailored tones & PDF export
                  </li>
                </ul>
              </Card>
            </motion.div>

            {/* Feature 4 */}
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 24 },
                show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] } },
              }}
              whileHover={{ y: -4 }}
              style={{ willChange: 'transform, opacity', transform: 'translateZ(0)' }}
            >
              <Card className="p-6 space-y-4 hover:shadow-elevated transition-shadow h-full flex flex-col justify-between relative bg-slate-50/50">
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="w-12 h-12 rounded-2xl bg-blue-50 border border-blue-200/60 text-blue-600 flex items-center justify-center">
                      <Briefcase className="w-6 h-6" />
                    </div>
                    <Badge variant="outline" size="sm" className="bg-blue-50 text-blue-700 border-blue-200 text-[10px] font-bold uppercase tracking-wider">
                      Coming Soon
                    </Badge>
                  </div>
                  <div className="space-y-1 text-left">
                    <h3 className="text-base font-bold text-slate-900">Job Matching & Tracker</h3>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      Upcoming intelligent role matching, skill gap discovery, and end-to-end job application tracking.
                    </p>
                  </div>
                </div>
                <ul className="text-xs text-slate-500 space-y-1.5 text-left border-t border-slate-200/60 pt-3">
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" /> Skill gap detection
                  </li>
                  <li className="flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0" /> Application pipeline tracking
                  </li>
                </ul>
              </Card>
            </motion.div>
          </StaggerContainer>
        </div>
      </section>

      {/* ─── Templates Preview Section ─── */}
      <section id="templates" className="py-20 lg:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <FadeIn direction="up">
            <div className="text-center space-y-3 max-w-3xl mx-auto">
              <Badge variant="default" size="sm" className="uppercase tracking-wider font-bold">
                Standardized Typography
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                Recruiter-Approved ATS Templates
              </h2>
              <p className="text-sm sm:text-base text-slate-600">
                No complex graphics, columns, or tables. Designed around standard applicant tracking system formats.
              </p>
            </div>
          </FadeIn>

          <StaggerContainer className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Template 1 */}
            <motion.div
              variants={{
                hidden: { opacity: 0, scale: 0.95 },
                show: { opacity: 1, scale: 1, transition: { duration: 0.5 } },
              }}
              whileHover={{ y: -6, scale: 1.02 }}
              className="group rounded-2xl border border-slate-200 bg-slate-50 p-4 transition-all hover:border-black hover:shadow-card text-left cursor-pointer"
            >
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
            </motion.div>

            {/* Template 2 */}
            <motion.div
              variants={{
                hidden: { opacity: 0, scale: 0.95 },
                show: { opacity: 1, scale: 1, transition: { duration: 0.5 } },
              }}
              whileHover={{ y: -6, scale: 1.02 }}
              className="group rounded-2xl border border-slate-200 bg-slate-50 p-4 transition-all hover:border-black hover:shadow-card text-left cursor-pointer"
            >
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
            </motion.div>

            {/* Template 3 */}
            <motion.div
              variants={{
                hidden: { opacity: 0, scale: 0.95 },
                show: { opacity: 1, scale: 1, transition: { duration: 0.5 } },
              }}
              whileHover={{ y: -6, scale: 1.02 }}
              className="group rounded-2xl border border-slate-200 bg-slate-50 p-4 transition-all hover:border-black hover:shadow-card text-left cursor-pointer"
            >
              <div className="h-44 rounded-xl bg-white border border-slate-200 p-3 space-y-2 text-[9px] text-slate-400 overflow-hidden shadow-xs">
                <div className="border-b border-slate-300 pb-1 font-bold text-black text-[10px]">STANFORD EDITORIAL</div>
                <div className="h-1.5 w-3/4 bg-slate-300 rounded"></div>
                <div className="h-1.5 w-5/6 bg-slate-100 rounded"></div>
                <div className="h-1.5 w-2/3 bg-slate-100 rounded"></div>
              </div>
              <div className="pt-3">
                <h4 className="text-sm font-bold text-slate-900">Stanford Editorial</h4>
                <p className="text-xs text-slate-500 mt-0.5">Refined layout with restrained monochrome accents.</p>
              </div>
            </motion.div>

            {/* Template 4 */}
            <motion.div
              variants={{
                hidden: { opacity: 0, scale: 0.95 },
                show: { opacity: 1, scale: 1, transition: { duration: 0.5 } },
              }}
              whileHover={{ y: -6, scale: 1.02 }}
              className="group rounded-2xl border border-slate-200 bg-slate-50 p-4 transition-all hover:border-black hover:shadow-card text-left cursor-pointer"
            >
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
            </motion.div>
          </StaggerContainer>
        </div>
      </section>

      {/* ─── How it Works ─── */}
      <section id="how-it-works" className="py-20 lg:py-28 bg-slate-50 border-t border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <FadeIn direction="up">
            <div className="text-center space-y-3 max-w-3xl mx-auto">
              <Badge variant="brand" size="sm" className="uppercase tracking-wider font-bold">
                Workflow
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                Four Steps to an Interview-Ready Resume
              </h2>
            </div>
          </FadeIn>

          <StaggerContainer className="grid grid-cols-1 md:grid-cols-4 gap-6 text-left">
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 25 },
                show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
              }}
              whileHover={{ y: -4 }}
              className="rounded-2xl bg-white border border-slate-200 p-6 space-y-3 shadow-xs"
            >
              <span className="w-8 h-8 rounded-xl bg-black text-white font-black text-sm flex items-center justify-center">
                1
              </span>
              <h4 className="text-sm font-bold text-slate-900">Select Template</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Choose Jake&apos;s Tech standard or Harvard Classic, or import your current PDF.
              </p>
            </motion.div>

            <motion.div
              variants={{
                hidden: { opacity: 0, y: 25 },
                show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
              }}
              whileHover={{ y: -4 }}
              className="rounded-2xl bg-white border border-slate-200 p-6 space-y-3 shadow-xs"
            >
              <span className="w-8 h-8 rounded-xl bg-black text-white font-black text-sm flex items-center justify-center">
                2
              </span>
              <h4 className="text-sm font-bold text-slate-900">Build & Customize</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Add your work experience, projects, and skills with real-time split-screen editing.
              </p>
            </motion.div>

            <motion.div
              variants={{
                hidden: { opacity: 0, y: 25 },
                show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
              }}
              whileHover={{ y: -4 }}
              className="rounded-2xl bg-white border border-slate-200 p-6 space-y-3 shadow-xs"
            >
              <span className="w-8 h-8 rounded-xl bg-black text-white font-black text-sm flex items-center justify-center">
                3
              </span>
              <h4 className="text-sm font-bold text-slate-900">Scan & Match</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Run ATS compatibility audits, check keyword alignment, and craft tailored cover letters.
              </p>
            </motion.div>

            <motion.div
              variants={{
                hidden: { opacity: 0, y: 25 },
                show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
              }}
              whileHover={{ y: -4 }}
              className="rounded-2xl bg-white border border-slate-200 p-6 space-y-3 shadow-xs"
            >
              <span className="w-8 h-8 rounded-xl bg-black text-white font-black text-sm flex items-center justify-center">
                4
              </span>
              <h4 className="text-sm font-bold text-slate-900">Clean PDF Export</h4>
              <p className="text-xs text-slate-500 leading-relaxed">
                Download clean, selectable-text PDFs formatted to pass ATS scanners reliably.
              </p>
            </motion.div>
          </StaggerContainer>
        </div>
      </section>

      {/* ─── Free CTA Section ─── */}
      <section id="cta" className="py-20 lg:py-28 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn direction="up">
            <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-zinc-900 to-black p-10 sm:p-16 text-center shadow-elevated">
              <div className="absolute top-0 right-1/4 -z-0 h-64 w-64 rounded-full bg-white/5 blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-1/3 -z-0 h-48 w-48 rounded-full bg-blue-500/10 blur-3xl pointer-events-none" />
              <div className="relative z-10 space-y-6 max-w-2xl mx-auto">
                <Badge variant="outline" size="sm" className="bg-white/10 text-white border-white/20 uppercase tracking-wider font-bold">
                  100% Free — No Credit Card Required
                </Badge>
                <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
                  Start Building Your Resume Today
                </h2>
                <p className="text-sm sm:text-base text-slate-400 leading-relaxed">
                  Every feature is completely free. Build unlimited resumes, run ATS scans, and generate cover letters — no paywalls, no hidden limits.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
                  <Link to="/signup">
                    <Button size="lg" className="bg-white text-black hover:bg-slate-100 shadow-elevated" rightIcon={<ArrowRight className="w-4 h-4" />}>
                      Create Free Account
                    </Button>
                  </Link>
                  <a href="#features">
                    <Button variant="outline" size="lg" className="border-white/30 text-white hover:bg-white/10">
                      Explore Features
                    </Button>
                  </a>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ─── FAQ Section ─── */}
      <section id="faq" className="py-20 lg:py-28 bg-slate-50 border-t border-slate-200/80">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
          <FadeIn direction="up">
            <div className="text-center space-y-3">
              <Badge variant="default" size="sm" className="uppercase tracking-wider font-bold">
                Frequently Asked Questions
              </Badge>
              <h2 className="text-3xl font-black text-slate-900 tracking-tight">Got Questions? We Have Answers.</h2>
            </div>
          </FadeIn>

          <StaggerContainer className="space-y-4 text-left">
            <motion.div
              variants={{
                hidden: { opacity: 0, y: 20 },
                show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
              }}
            >
              <Card className="p-6 hover:shadow-subtle transition-all">
                <h4 className="text-sm font-bold text-slate-900">Why are single-column resumes recommended for tech?</h4>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  Most applicant tracking systems (Workday, Taleo, Greenhouse) read text top-to-bottom. Multi-column tables or text boxes frequently result in jumbled text where job titles and companies become mismatched, causing automated rejection.
                </p>
              </Card>
            </motion.div>

            <motion.div
              variants={{
                hidden: { opacity: 0, y: 20 },
                show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
              }}
            >
              <Card className="p-6 hover:shadow-subtle transition-all">
                <h4 className="text-sm font-bold text-slate-900">How does RESUME AI generate PDFs differently?</h4>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  Many tools save resumes as flat images inside a PDF, leaving no selectable text for ATS parsers. RESUME AI exports clean text documents where each word and section is readable by ATS software.
                </p>
              </Card>
            </motion.div>

            <motion.div
              variants={{
                hidden: { opacity: 0, y: 20 },
                show: { opacity: 1, y: 0, transition: { duration: 0.5 } },
              }}
            >
              <Card className="p-6 hover:shadow-subtle transition-all">
                <h4 className="text-sm font-bold text-slate-900">Is my resume data private?</h4>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                  Yes. All user documents are stored in private storage buckets protected by PostgreSQL Row Level Security. We never share your data with recruiters or third parties.
                </p>
              </Card>
            </motion.div>
          </StaggerContainer>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
};
