import React from 'react';
import { Modal } from '@/components/ui/Modal';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { TEMPLATE_LIST } from '../../templates/templateRegistry';
import type { TemplateId } from '../../types/resume.types';
import { Check, Sparkles } from 'lucide-react';

interface TemplateSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  activeTemplateId: TemplateId;
  onSelectTemplate: (id: TemplateId) => void;
}

export const TemplateSelectorModal: React.FC<TemplateSelectorModalProps> = ({
  isOpen,
  onClose,
  activeTemplateId,
  onSelectTemplate,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Select ATS Resume Template"
      description="All templates use single-column layouts engineered to pass recruiter applicant tracking systems with 100% parseability."
      maxWidth="xl"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-2">
        {TEMPLATE_LIST.map((template) => {
          const isSelected = template.id === activeTemplateId;
          return (
            <div
              key={template.id}
              onClick={() => {
                onSelectTemplate(template.id);
                onClose();
              }}
              className={`p-4 rounded-2xl border-2 text-left cursor-pointer transition-all flex flex-col justify-between ${
                isSelected
                  ? 'border-black bg-zinc-50 shadow-subtle'
                  : 'border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
              }`}
            >
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-slate-900 text-sm flex items-center gap-1.5">
                    {template.name}
                    {isSelected && (
                      <span className="w-5 h-5 rounded-full bg-black text-white flex items-center justify-center">
                        <Check className="w-3 h-3" />
                      </span>
                    )}
                  </h3>
                  <Badge variant={isSelected ? 'brand' : 'default'} size="sm">
                    {template.badge}
                  </Badge>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">
                  {template.description}
                </p>
                <div className="pt-2 border-t border-slate-100 text-[11px] text-slate-500">
                  <span className="font-semibold text-slate-700">Best for: </span>
                  {template.recommendedRole}
                </div>
              </div>

              <div className="pt-4 flex items-center justify-between">
                <span className="text-[11px] font-mono text-slate-400">
                  Font: {template.defaultFont}
                </span>
                <Button
                  size="sm"
                  variant={isSelected ? 'primary' : 'outline'}
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectTemplate(template.id);
                    onClose();
                  }}
                >
                  {isSelected ? 'Active Template' : 'Use Template'}
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <span className="flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-black" /> Switching templates preserves all resume content.
        </span>
        <Button variant="ghost" size="sm" onClick={onClose}>
          Close
        </Button>
      </div>
    </Modal>
  );
};
