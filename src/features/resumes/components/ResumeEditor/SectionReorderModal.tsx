import React from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import type { ResumeData, SectionType } from '../../types/resume.types';
import { ArrowUp, ArrowDown } from 'lucide-react';

interface SectionReorderModalProps {
  isOpen: boolean;
  onClose: () => void;
  data: ResumeData;
  onMoveUp: (index: number) => void;
  onMoveDown: (index: number) => void;
  onToggleEnabled: (section: SectionType, enabled: boolean) => void;
}

const SECTION_LABELS: Record<string, string> = {
  personal: 'Personal Information & Header',
  summary: 'Professional Summary',
  experience: 'Work Experience',
  education: 'Education',
  skills: 'Technical Skills',
  projects: 'Key Projects',
  certifications: 'Certifications',
  achievements: 'Achievements & Honors',
  languages: 'Languages',
  publications: 'Publications',
  volunteer: 'Volunteer Experience',
  interests: 'Interests',
};

export const SectionReorderModal: React.FC<SectionReorderModalProps> = ({
  isOpen,
  onClose,
  data,
  onMoveUp,
  onMoveDown,
  onToggleEnabled,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Reorder & Toggle Resume Sections"
      description="Change the top-to-bottom reading sequence of your resume sections or enable/disable optional sections."
      maxWidth="md"
    >
      <div className="space-y-2 py-2 max-h-[60vh] overflow-y-auto">
        {data.sectionsOrder.map((sectionType, index) => {
          const isEnabled = data.enabledSections[sectionType] ?? true;
          const label = SECTION_LABELS[sectionType] || sectionType;
          const isFirst = index === 0;
          const isLast = index === data.sectionsOrder.length - 1;

          return (
            <div
              key={sectionType}
              className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                isEnabled
                  ? 'border-slate-200 bg-white shadow-xs'
                  : 'border-slate-200/60 bg-slate-50/50 opacity-60'
              }`}
            >
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  id={`sec-${sectionType}`}
                  checked={isEnabled}
                  onChange={(e) => onToggleEnabled(sectionType, e.target.checked)}
                  className="rounded border-slate-300 text-black focus:ring-black w-4 h-4 cursor-pointer"
                />
                <label
                  htmlFor={`sec-${sectionType}`}
                  className="text-xs font-bold text-slate-800 cursor-pointer select-none"
                >
                  {label}
                </label>
              </div>

              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={isFirst}
                  onClick={() => onMoveUp(index)}
                  className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded disabled:opacity-30 disabled:hover:bg-transparent"
                  title="Move section up"
                >
                  <ArrowUp className="w-4 h-4" />
                </button>
                <button
                  type="button"
                  disabled={isLast}
                  onClick={() => onMoveDown(index)}
                  className="p-1.5 text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded disabled:opacity-30 disabled:hover:bg-transparent"
                  title="Move section down"
                >
                  <ArrowDown className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex justify-end">
        <Button variant="primary" size="sm" onClick={onClose}>
          Done
        </Button>
      </div>
    </Modal>
  );
};
