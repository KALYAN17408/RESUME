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
  Mail,
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
      moduleTag: 'Resume Builder',
      phaseBadge: 'Operational',
      description: 'Single-column ATS templates (Jake’s, Harvard, Stanford, Modern Tech) with live split-screen preview and vector text PDF export.',
      features: [
        'Jake’s Tech, Harvard Classic, Stanford Editorial & Modern Tech Clean templates',
        'Live split-screen editor with debounced auto-save',
        'Vector text-stream PDF export with 100% selectable text',
        'Full section reordering and customization engine',
      ],
      icon: FileText,
      color: 'text-blue-600 bg-blue-50 border-blue-200/80',
      badgeVariant: 'brand',
    },
    {
      id: 'module-b',
      title: 'ATS Resume Analyzer',
      moduleTag: 'ATS Scanner',
      phaseBadge: 'Operational',
      description: 'PDF/DOCX ingestion with 4-vector recruiter-grade scoring, deterministic keyword density analysis, and actionable diagnostic fix recommendations.',
      features: [
        'PDF vector text extraction and scanned document detection',
        '4-vector scoring (Keywords 40%, Skills 25%, Sections 15%, Formatting 20%)',
        'Quantified metric detection & Google XYZ formula checks',
        'Direct alignment against target job descriptions with copyable recommendations',
      ],
      icon: ScanSearch,
      color: 'text-violet-600 bg-violet-50 border-violet-200/80',
      badgeVariant: 'violet',
    },
    {
      id: 'module-c',
      title: 'AI Cover Letter Generator',
      moduleTag: 'Cover Letters',
      phaseBadge: 'Operational',
      description: 'Role-tailored, grounded cover letter generator with 4 tones, draft persistence, and instant ATS-compliant vector PDF export.',
      features: [
        'Candidate evidence grounded strictly in selected resume (skills, projects, education)',
        '4 distinct tones (Professional, Confident, Concise, Enthusiastic)',
        'In-browser editable letter text with live word & character metrics',
        'Multi-page ATS-friendly PDF download & local draft persistence',
      ],
      icon: Mail,
      color: 'text-teal-600 bg-teal-50 border-teal-200/80',
      badgeVariant: 'teal',
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
      color: 'text-amber-600 bg-amber-50 border-amber-200/80',
      badgeVariant: 'amber',
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
      color: 'text-indigo-600 bg-indigo-50 border-indigo-200/80',
      badgeVariant: 'default',
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
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-blue-600" />
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
                    <CheckCircle2 className="w-4 h-4 text-blue-600 shrink-0 mt-0.5" />
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
                {selectedModule.id === 'module-b' && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      setSelectedModule(null);
                      navigate('/dashboard/analyzer');
                    }}
                  >
                    Open ATS Analyzer
                  </Button>
                )}
                {selectedModule.id === 'module-c' && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => {
                      setSelectedModule(null);
                      navigate('/dashboard/cover-letter');
                    }}
                  >
                    Open Cover Letter Generator
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
