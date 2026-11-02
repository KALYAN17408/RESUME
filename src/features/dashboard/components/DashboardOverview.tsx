import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { WelcomeBanner } from './WelcomeBanner';
import { QuickStats } from './QuickStats';
import { ModuleCard, type ModuleCardProps } from './ModuleCard';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import {
  FileText,
  ScanSearch,
  Target,
  Bot,
  MessageSquare,
  CheckCircle2,
  Calendar,
  Layers,
} from 'lucide-react';

export const DashboardOverview: React.FC = () => {
  const navigate = useNavigate();
  const [selectedModule, setSelectedModule] = useState<ModuleCardProps | null>(null);

  const modules: ModuleCardProps[] = [
    {
      id: 'module-a',
      title: 'AI Resume Builder',
      moduleTag: 'Module A',
      phaseBadge: 'Operational',
      description: 'Single-column ATS templates (Jake’s, Harvard, Stanford, Modern Tech) with live split-screen preview and vector text PDF export.',
      features: [
        'Jake’s Tech, Harvard Classic, Stanford Editorial & Modern Tech Clean templates',
        'Live split-screen editor with debounced auto-save',
        'Vector text-stream PDF export with 100% selectable text',
        'Full section reordering and customization engine',
      ],
      icon: FileText,
      color: 'text-brand-600 bg-brand-50 border-brand-200/60',
    },
    {
      id: 'module-b',
      title: 'ATS Resume Analyzer',
      moduleTag: 'Module B',
      phaseBadge: 'Phase 3',
      description: 'PDF/DOCX ingestion with 5-vector recruiter-grade scoring and actionable diagnostic fix recommendations.',
      features: [
        'PDF/DOCX text extraction into structured AST',
        '5-vector scoring (Parseability, Impact, Brevity, Style, Skills)',
        'Quantified metric detection & Google XYZ formula checks',
        'One-click bullet rewriter with contextual suggestions',
      ],
      icon: ScanSearch,
      color: 'text-emerald-600 bg-emerald-50 border-emerald-200/60',
    },
    {
      id: 'module-c',
      title: 'AI Job Matching & Tailoring',
      moduleTag: 'Module C',
      phaseBadge: 'Phase 4',
      description: 'Job description parser extracting hard/soft skill requirements and generating tailored resume variants.',
      features: [
        'Raw job specification NLP parsing and keyword extraction',
        'Semantic match scoring & missing skill identification',
        'Dynamic resume tailoring without hallucinated claims',
        'Automated role-aligned cover letter generation',
      ],
      icon: Target,
      color: 'text-indigo-600 bg-indigo-50 border-indigo-200/60',
    },
    {
      id: 'module-d',
      title: 'AI Career Copilot ("Max")',
      moduleTag: 'Module D',
      phaseBadge: 'Phase 5',
      description: 'Grounded career assistant managing your entire search pipeline, skill gap analysis, and offer strategy.',
      features: [
        'Conversational drawer grounded on your verified profile',
        'Targeted career trajectory and skills gap roadmap',
        'Interactive resume refinement prompts',
        'Offer evaluation and market compensation insights',
      ],
      icon: Bot,
      color: 'text-purple-600 bg-purple-50 border-purple-200/60',
    },
    {
      id: 'module-e',
      title: 'Mock Interview Prep Hub',
      moduleTag: 'Module E',
      phaseBadge: 'Phase 5',
      description: 'Role-specific coding, system design, and behavioral question banks with interactive AI critiques.',
      features: [
        'Role-specific question generation from job specifications',
        'System Design walkthroughs & DSA evaluation tracks',
        'STAR method behavioral question simulations',
        'Scored AI feedback and model answer walkthroughs',
      ],
      icon: MessageSquare,
      color: 'text-rose-600 bg-rose-50 border-rose-200/60',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <WelcomeBanner />

      {/* Quick Stats */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Workspace Metrics</h2>
          <span className="text-xs text-slate-500 font-medium">Free Tier Entitlements</span>
        </div>
        <QuickStats />
      </div>

      {/* Core Modules Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight text-left">Platform Capabilities</h2>
            <p className="text-xs text-slate-500 text-left">
              Production modules planned in the Phase 0 architectural roadmap.
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-brand-600" />
            5 Modules Scheduled
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {modules.map((mod) => (
            <ModuleCard key={mod.id} {...mod} onExplore={() => setSelectedModule(mod)} />
          ))}
        </div>
      </div>

      {/* Module Spec Modal */}
      {selectedModule && (
        <Modal
          isOpen={!!selectedModule}
          onClose={() => setSelectedModule(null)}
          title={selectedModule.title}
          description={`${selectedModule.moduleTag} • ${selectedModule.phaseBadge}`}
        >
          <div className="space-y-4 text-left">
            <p className="text-xs text-slate-600 leading-relaxed">{selectedModule.description}</p>
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-4 space-y-2">
              <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                Architecture Specifications:
              </h4>
              <ul className="space-y-2 text-xs text-slate-700">
                {selectedModule.features.map((feat, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-brand-600 shrink-0 mt-0.5" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>
            <div className="flex items-center justify-between text-[11px] text-slate-500 pt-2 border-t border-slate-100">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-400" />
                Status: <span className="font-semibold text-slate-800">{selectedModule.phaseBadge}</span>
              </span>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" onClick={() => setSelectedModule(null)}>
                  Close
                </Button>
                {selectedModule.id === 'module-a' && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      setSelectedModule(null);
                      navigate('/dashboard/resumes');
                    }}
                  >
                    Open Resume Builder
                  </Button>
                )}
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};
