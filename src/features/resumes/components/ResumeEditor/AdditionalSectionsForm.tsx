import React from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import type {
  AchievementItem,
  LanguageItem,
  ResumeData,
  SectionType,
} from '../../types/resume.types';
import { Plus, Trash2 } from 'lucide-react';

interface AdditionalSectionsFormProps {
  data: ResumeData;
  onAddAchievement: () => void;
  onUpdateAchievement: (id: string, partial: Partial<AchievementItem>) => void;
  onDeleteAchievement: (id: string) => void;
  onAddLanguage: () => void;
  onUpdateLanguage: (id: string, partial: Partial<LanguageItem>) => void;
  onDeleteLanguage: (id: string) => void;
  onToggleSection: (section: SectionType, enabled: boolean) => void;
}

export const AdditionalSectionsForm: React.FC<AdditionalSectionsFormProps> = ({
  data,
  onAddAchievement,
  onUpdateAchievement,
  onDeleteAchievement,
  onAddLanguage,
  onUpdateLanguage,
  onDeleteLanguage,
  onToggleSection,
}) => {
  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-bold text-slate-900">Additional Resume Sections</h3>
        <p className="text-xs text-slate-500 mt-0.5">
          Configure optional sections like Honors/Awards and Languages.
        </p>
      </div>

      {/* Achievements / Honors */}
      <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="enable-achievements"
              checked={data.enabledSections.achievements || false}
              onChange={(e) => onToggleSection('achievements', e.target.checked)}
              className="rounded border-slate-300 text-black focus:ring-black w-4 h-4"
            />
            <label htmlFor="enable-achievements" className="text-xs font-bold text-slate-900 cursor-pointer">
              Achievements & Honors
            </label>
          </div>
          {data.enabledSections.achievements && (
            <Button size="sm" variant="outline" onClick={onAddAchievement} leftIcon={<Plus className="w-3 h-3" />}>
              Add Achievement
            </Button>
          )}
        </div>

        {data.enabledSections.achievements && (
          <div className="space-y-3 pt-2">
            {data.achievements.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No achievements added yet.</p>
            ) : (
              data.achievements.map((ach) => (
                <div key={ach.id} className="p-3 bg-slate-50 rounded-xl border border-slate-200/80 space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-semibold text-slate-800">{ach.title || 'Achievement'}</span>
                    <button
                      type="button"
                      onClick={() => onDeleteAchievement(ach.id)}
                      className="text-slate-400 hover:text-rose-600 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <Input
                      label="Title / Honor"
                      placeholder="e.g. 1st Place Hackathon Winner"
                      value={ach.title}
                      onChange={(e) => onUpdateAchievement(ach.id, { title: e.target.value })}
                    />
                    <Input
                      label="Issuer / Organization"
                      placeholder="e.g. MIT, TechCrunch"
                      value={ach.issuer || ''}
                      onChange={(e) => onUpdateAchievement(ach.id, { issuer: e.target.value })}
                    />
                  </div>
                  <Input
                    label="Description"
                    placeholder="Short summary of the achievement..."
                    value={ach.description || ''}
                    onChange={(e) => onUpdateAchievement(ach.id, { description: e.target.value })}
                  />
                </div>
              ))
            )}
          </div>
        )}
      </div>

      {/* Languages */}
      <div className="p-4 rounded-2xl border border-slate-200 bg-white space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              id="enable-languages"
              checked={data.enabledSections.languages || false}
              onChange={(e) => onToggleSection('languages', e.target.checked)}
              className="rounded border-slate-300 text-black focus:ring-black w-4 h-4"
            />
            <label htmlFor="enable-languages" className="text-xs font-bold text-slate-900 cursor-pointer">
              Languages
            </label>
          </div>
          {data.enabledSections.languages && (
            <Button size="sm" variant="outline" onClick={onAddLanguage} leftIcon={<Plus className="w-3 h-3" />}>
              Add Language
            </Button>
          )}
        </div>

        {data.enabledSections.languages && (
          <div className="space-y-2 pt-2">
            {data.languages.length === 0 ? (
              <p className="text-xs text-slate-400 italic">No languages added yet.</p>
            ) : (
              data.languages.map((lang) => (
                <div key={lang.id} className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Language (e.g. English, Spanish)"
                    value={lang.language}
                    onChange={(e) => onUpdateLanguage(lang.id, { language: e.target.value })}
                    className="flex-1 text-xs rounded-xl border border-slate-300 px-3 py-2 text-slate-800"
                  />
                  <select
                    value={lang.proficiency}
                    onChange={(e) => onUpdateLanguage(lang.id, { proficiency: e.target.value })}
                    className="text-xs rounded-xl border border-slate-300 px-3 py-2 text-slate-800 bg-white"
                  >
                    <option value="Native / Bilingual">Native / Bilingual</option>
                    <option value="Fluent">Fluent</option>
                    <option value="Professional Working">Professional Working</option>
                    <option value="Conversational">Conversational</option>
                    <option value="Elementary">Elementary</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => onDeleteLanguage(lang.id)}
                    className="p-2 text-slate-400 hover:text-rose-600 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};
