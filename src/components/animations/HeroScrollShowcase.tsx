import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Badge } from '@/components/ui/Badge';
import { Sparkles, CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react';

export const HeroScrollShowcase: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'center center'],
  });

  // Direct GPU-accelerated transforms (instant responsiveness without spring lag)
  const rotateX = useTransform(scrollYProgress, [0, 1], [10, 0]);
  const scale = useTransform(scrollYProgress, [0, 1], [0.95, 1]);
  const opacity = useTransform(scrollYProgress, [0, 0.5], [0.75, 1]);
  const y = useTransform(scrollYProgress, [0, 1], [35, 0]);

  return (
    <div
      ref={containerRef}
      style={{ perspective: 1200 }}
      className="pt-6 sm:pt-10 max-w-5xl mx-auto"
    >
      <motion.div
        style={{
          rotateX,
          scale,
          opacity,
          y,
          transformStyle: 'preserve-3d',
          willChange: 'transform',
          transform: 'translateZ(0)',
        }}
        className="relative rounded-3xl border border-slate-200/90 bg-white p-3 sm:p-5 shadow-elevated"
      >
        {/* Subtle ambient sheen */}
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-tr from-brand-500/5 via-transparent to-purple-500/5 pointer-events-none" />

        {/* Floating Top Floating Chip */}
        <div className="absolute -top-3.5 right-6 sm:right-10 z-20 hidden sm:flex items-center gap-2 px-3 py-1 rounded-full bg-slate-900 text-white text-xs font-semibold shadow-md border border-slate-800">
          <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Real-time ATS Compliance Check</span>
        </div>

        <div className="rounded-2xl border border-slate-200/80 bg-white p-6 sm:p-8 text-left grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Column: Interactive Resume Sheet Preview */}
          <div className="lg:col-span-7 space-y-4 font-mono text-xs text-slate-800 bg-slate-50 p-6 sm:p-7 rounded-2xl border border-slate-200/80 shadow-xs relative overflow-hidden group">
            <div className="border-b border-slate-200/80 pb-3 flex justify-between items-start">
              <div>
                <h3 className="text-base sm:text-lg font-black text-slate-900 tracking-tight font-sans">
                  ALEX JOHNSON
                </h3>
                <p className="text-[11px] text-slate-500 font-sans mt-0.5">
                  San Francisco, CA • alex@example.com • linkedin.com/in/alex • github.com/alex
                </p>
              </div>
              <Badge variant="success" size="sm" className="font-sans font-bold px-2.5 py-1">
                ATS Score 96/100
              </Badge>
            </div>

            <div className="space-y-1.5">
              <p className="font-bold text-[11px] text-slate-900 font-sans tracking-wider uppercase flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-brand-600" />
                PROFESSIONAL EXPERIENCE
              </p>
              <div className="text-[11px] text-slate-700 font-sans space-y-1">
                <div className="flex justify-between font-bold text-slate-900">
                  <span>Senior Software Engineer — CloudPlatform Inc.</span>
                  <span className="text-slate-500 font-medium text-[10px]">2023 – Present</span>
                </div>
                <p className="text-slate-600 pl-3 border-l-2 border-brand-500 leading-relaxed">
                  • Spearheaded migration of 14 microservices to Kubernetes, reducing p99 API latency by 42% across 1.2M daily active users.
                </p>
                <p className="text-slate-600 pl-3 border-l-2 border-brand-500 leading-relaxed">
                  • Architected distributed caching layer saving $180K in annual AWS infrastructure spend.
                </p>
              </div>
            </div>

            <div className="space-y-1 pt-1 border-t border-slate-200/60">
              <p className="font-bold text-[11px] text-slate-900 font-sans tracking-wider uppercase">
                TECHNICAL SKILLS
              </p>
              <p className="text-[11px] text-slate-600 font-sans leading-normal">
                <span className="font-semibold text-slate-800">Languages & Frameworks:</span> TypeScript, React, Go, Python, Node.js, PostgreSQL, Docker, AWS.
              </p>
            </div>
          </div>

          {/* Right Column: AI Live Transformation showcase */}
          <div className="lg:col-span-5 space-y-4">
            <div className="rounded-2xl border border-brand-200/80 bg-gradient-to-br from-brand-50/80 via-white to-indigo-50/50 p-5 space-y-3 shadow-xs">
              <div className="flex items-center justify-between text-brand-700 font-bold text-xs">
                <span className="flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-brand-600" />
                  Google XYZ Formula Optimizer
                </span>
                <span className="text-[10px] text-brand-600 font-mono bg-brand-100/60 px-2 py-0.5 rounded-full">
                  Instant Fix
                </span>
              </div>

              <div className="space-y-2 text-xs text-left">
                <div className="bg-white/90 p-3 rounded-xl border border-slate-200/80 text-slate-400 line-through text-[11px]">
                  &quot;Worked on migrating backend microservices to Kubernetes.&quot;
                </div>
                <div className="flex items-center justify-center gap-1.5 text-[10px] font-bold text-brand-600 tracking-wider uppercase">
                  <span>AI Quantification Engine</span>
                  <ArrowRight className="w-3 h-3" />
                </div>
                <div className="bg-gradient-to-r from-brand-600 to-indigo-600 text-white p-3.5 rounded-xl font-medium shadow-md text-xs leading-relaxed">
                  &quot;Spearheaded migration of 14 microservices to Kubernetes, reducing p99 API latency by 42% across 1.2M daily active users.&quot;
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="rounded-2xl bg-white p-4 border border-slate-200/80 shadow-xs">
                <p className="text-2xl font-black text-slate-900">100%</p>
                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mt-0.5">Parse Accuracy</p>
              </div>
              <div className="rounded-2xl bg-white p-4 border border-slate-200/80 shadow-xs">
                <p className="text-2xl font-black text-brand-600 flex items-center justify-center gap-1">
                  <ShieldCheck className="w-5 h-5 text-brand-600" /> Vector
                </p>
                <p className="text-[10px] text-slate-500 uppercase font-bold tracking-wider mt-0.5">Text-Stream PDF</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  );
};
