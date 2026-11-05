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
      title: 'Resume Builder',
      moduleTag: 'Resume Builder',
      phaseBadge: 'Ready',
      description: 'Single-column ATS templates with live split-screen preview, full section customization, and clean vector PDF export.',
      features: [
        'Jake’s Tech, Harvard Classic, Stanford Editorial & Modern Tech Clean templates',
        'Live split-screen editor with real-time auto-save',
        'Vector text-stream PDF export with 100% selectable text',
        'Section reordering and appearance customization',
      ],
      icon: FileText,
      color: 'text-blue-600 bg-blue-50 border-blue-200/80',
      badgeVariant: 'brand',
      ctaLabel: 'Open Builder',
    },
    {
      id: 'module-b',
      title: 'ATS Resume Analyzer',
      moduleTag: 'ATS Analyzer',
      phaseBadge: 'Ready',
      description: 'Scan your resume against real target job descriptions with keyword matching, technical skills analysis, and actionable diagnostic recommendations.',
      features: [
        'PDF vector text extraction and layout scanning',
        'Compatibility scoring across keywords, skills, sections, and formatting',
        'Quantified metric detection & high-impact verb checks',
        'Direct alignment against target job descriptions with copyable fix tips',
      ],
      icon: ScanSearch,
      color: 'text-violet-600 bg-violet-50 border-violet-200/80',
      badgeVariant: 'violet',
      ctaLabel: 'Open Analyzer',
    },
    {
      id: 'module-c',
      title: 'Cover Letter Generator',
      moduleTag: 'Cover Letters',
      phaseBadge: 'Ready',
      description: 'Generate personalized cover letters tailored strictly to your verified resume and target role with custom tones and instant PDF export.',
      features: [
        'Candidate evidence grounded strictly in your selected resume details',
        '4 distinct tones (Professional, Confident, Concise, Enthusiastic)',
        'In-browser editable letter text with live word & character counts',
        'ATS-compliant PDF download & local draft saving',
      ],
      icon: Mail,
      color: 'text-teal-600 bg-teal-50 border-teal-200/80',
      badgeVariant: 'teal',
      ctaLabel: 'Open Generator',
    },
    {
      id: 'module-d',
      title: 'Career Copilot',
      moduleTag: 'Career Guide',
      phaseBadge: 'Coming Soon',
      description: 'Grounded career assistant to guide your job search pipeline, skill gap analysis, and offer strategy.',
      features: [
        'Personalized career guidance grounded on your profile',
        'Targeted career trajectory and skills gap roadmap',
        'Interactive resume refinement suggestions',
        'Offer evaluation and market compensation insights',
      ],
      icon: Bot,
      color: 'text-amber-600 bg-amber-50 border-amber-200/80',
      badgeVariant: 'amber',
      ctaLabel: 'Learn More',
    },
    {
      id: 'module-e',
      title: 'Mock Interview Prep',
      moduleTag: 'Interview Hub',
      phaseBadge: 'Coming Soon',
      description: 'Role-specific coding, system design, and behavioral interview question banks with guided answer frameworks.',
      features: [
        'Role-specific question generation from job descriptions',
        'System Design walkthroughs & technical evaluation tracks',
        'STAR method behavioral question simulations',
        'Structured answer frameworks and model responses',
      ],
      icon: MessageSquare,
      color: 'text-indigo-600 bg-indigo-50 border-indigo-200/80',
      badgeVariant: 'default',
      ctaLabel: 'Learn More',
    },
  ];

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <WelcomeBanner />

      {/* Quick Stats */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Account Metrics</h2>
          <span className="text-xs text-slate-500 font-medium">Free Plan Entitlements</span>
        </div>
        <QuickStats />
      </div>

      {/* Core Modules Grid */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900 tracking-tight text-left">Tools & Applications</h2>
            <p className="text-xs text-slate-500 text-left">
              Create, evaluate, and tailor your job application materials.
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-blue-600" />
            All Applications
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
                Key Capabilities:
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
