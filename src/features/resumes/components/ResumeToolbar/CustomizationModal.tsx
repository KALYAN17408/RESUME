import React from 'react';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import type { ResumeCustomization } from '../../types/resume.types';

interface CustomizationModalProps {
  isOpen: boolean;
  onClose: () => void;
  customization: ResumeCustomization;
  onUpdate: (partial: Partial<ResumeCustomization>) => void;
}

const ACCENT_COLORS = [
  { name: 'Pure Black', value: '#000000' },
  { name: 'Obsidian', value: '#09090b' },
  { name: 'Charcoal', value: '#18181b' },
  { name: 'Slate Black', value: '#0f172a' },
  { name: 'Graphite', value: '#27272a' },
  { name: 'Zinc Dark', value: '#3f3f46' },
  { name: 'Neutral Dark', value: '#52525b' },
];

const FONTS = [
  { name: 'Inter (Clean Sans)', value: 'Inter, sans-serif' },
  { name: 'Merriweather (Classic Serif)', value: 'Georgia, Merriweather, serif' },
  { name: 'Times New Roman (Academic)', value: '"Times New Roman", Times, serif' },
  { name: 'Roboto (Modern Neutral)', value: 'Roboto, sans-serif' },
];

export const CustomizationModal: React.FC<CustomizationModalProps> = ({
  isOpen,
  onClose,
  customization,
  onUpdate,
}) => {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Resume Appearance & Typography"
      description="Fine-tune colors, fonts, and spacing while maintaining 100% compliance with ATS scanning parameters."
      maxWidth="md"
    >
      <div className="space-y-6 py-2">
        {/* Accent Color */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
            Accent Color
          </label>
          <div className="flex flex-wrap gap-3">
            {ACCENT_COLORS.map((color) => {
              const isSelected = customization.accentColor === color.value;
              return (
                <button
                  key={color.value}
                  type="button"
                  onClick={() => onUpdate({ accentColor: color.value })}
                  className={`w-9 h-9 rounded-full flex items-center justify-center transition-all ${
                    isSelected ? 'ring-2 ring-offset-2 ring-black scale-110 shadow-sm' : 'hover:scale-105'
                  }`}
                  style={{ backgroundColor: color.value }}
                  title={color.name}
                >
                  {isSelected && <span className="w-2.5 h-2.5 rounded-full bg-white" />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Font Selection */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
            Typography Family
          </label>
          <div className="space-y-2">
            {FONTS.map((font) => {
              const isSelected = customization.fontFamily === font.value;
              return (
                <div
                  key={font.value}
                  onClick={() => onUpdate({ fontFamily: font.value })}
                  className={`p-3 rounded-xl border text-sm cursor-pointer transition-all flex items-center justify-between ${
                    isSelected
                      ? 'border-black bg-zinc-50 font-bold text-black'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                  style={{ fontFamily: font.value }}
                >
                  <span>{font.name}</span>
                  {isSelected && <span className="text-black font-semibold text-xs">Active</span>}
                </div>
              );
            })}
          </div>
        </div>

        {/* Line Spacing */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-slate-900 uppercase tracking-wider block">
            Line Spacing Density
          </label>
          <div className="grid grid-cols-3 gap-2">
            {(['compact', 'normal', 'relaxed'] as const).map((spacing) => {
              const isSelected = customization.lineSpacing === spacing;
              return (
                <button
                  key={spacing}
                  type="button"
                  onClick={() => onUpdate({ lineSpacing: spacing })}
                  className={`py-2 px-3 rounded-xl border text-xs font-medium capitalize transition-all ${
                    isSelected
                      ? 'border-black bg-zinc-100 text-black font-bold'
                      : 'border-slate-200 hover:border-slate-300 text-slate-700'
                  }`}
                >
                  {spacing}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="mt-6 pt-3 border-t border-slate-100 flex justify-end">
        <Button variant="primary" size="sm" onClick={onClose}>
          Done
        </Button>
      </div>
    </Modal>
  );
};
