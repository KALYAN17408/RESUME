import React, { useState } from 'react';
import type { ResumeData, SectionType } from '../../types/resume.types';
import { PersonalInfoForm } from './PersonalInfoForm';
import { ExperienceForm } from './ExperienceForm';
import { EducationForm } from './EducationForm';
import { SkillsForm } from './SkillsForm';
import { ProjectsForm } from './ProjectsForm';
import { CertificationsForm } from './CertificationsForm';
import { AdditionalSectionsForm } from './AdditionalSectionsForm';
import { SectionReorderModal } from './SectionReorderModal';
import {
  User,
  Briefcase,
  GraduationCap,
  Wrench,
  FolderGit2,
  Award,
  PlusCircle,
  ArrowUpDown,
} from 'lucide-react';

interface ResumeEditorProps {
  data: ResumeData;
  onUpdatePersonalInfo: (partial: Partial<ResumeData['personalInfo']>) => void;
  onAddExperience: () => void;
  onUpdateExperience: (id: string, partial: any) => void;
  onDeleteExperience: (id: string) => void;
  onAddEducation: () => void;
  onUpdateEducation: (id: string, partial: any) => void;
  onDeleteEducation: (id: string) => void;
  onAddSkillCategory: (name?: string) => void;
  onUpdateSkillCategory: (id: string, partial: any) => void;
  onDeleteSkillCategory: (id: string) => void;
  onAddProject: () => void;
  onUpdateProject: (id: string, partial: any) => void;
  onDeleteProject: (id: string) => void;
  onAddCertification: () => void;
  onUpdateCertification: (id: string, partial: any) => void;
  onDeleteCertification: (id: string) => void;
  onAddAchievement: () => void;
  onUpdateAchievement: (id: string, partial: any) => void;
  onDeleteAchievement: (id: string) => void;
  onAddLanguage: () => void;
  onUpdateLanguage: (id: string, partial: any) => void;
  onDeleteLanguage: (id: string) => void;
  onReorderSectionUp: (index: number) => void;
  onReorderSectionDown: (index: number) => void;
  onToggleSectionEnabled: (section: SectionType, enabled: boolean) => void;
}

type EditorTab =
  | 'personal'
  | 'experience'
  | 'education'
  | 'skills'
  | 'projects'
  | 'certifications'
  | 'additional';

const TABS: { id: EditorTab; label: string; icon: React.ElementType }[] = [
  { id: 'personal', label: 'Contact Info', icon: User },
  { id: 'experience', label: 'Experience', icon: Briefcase },
  { id: 'education', label: 'Education', icon: GraduationCap },
  { id: 'skills', label: 'Skills', icon: Wrench },
  { id: 'projects', label: 'Projects', icon: FolderGit2 },
  { id: 'certifications', label: 'Certifications', icon: Award },
  { id: 'additional', label: 'Additional', icon: PlusCircle },
];

export const ResumeEditor: React.FC<ResumeEditorProps> = ({
  data,
  onUpdatePersonalInfo,
  onAddExperience,
  onUpdateExperience,
  onDeleteExperience,
  onAddEducation,
  onUpdateEducation,
  onDeleteEducation,
  onAddSkillCategory,
  onUpdateSkillCategory,
  onDeleteSkillCategory,
  onAddProject,
  onUpdateProject,
  onDeleteProject,
  onAddCertification,
  onUpdateCertification,
  onDeleteCertification,
  onAddAchievement,
  onUpdateAchievement,
  onDeleteAchievement,
  onAddLanguage,
  onUpdateLanguage,
  onDeleteLanguage,
  onReorderSectionUp,
  onReorderSectionDown,
  onToggleSectionEnabled,
}) => {
  const [activeTab, setActiveTab] = useState<EditorTab>('personal');
  const [reorderModalOpen, setReorderModalOpen] = useState(false);

  return (
    <div className="flex flex-col h-full bg-slate-50 border-r border-slate-200">
      {/* Top Section Navigation Pill bar */}
      <div className="p-3 bg-white border-b border-slate-200">
        <div className="flex items-center justify-between pb-2">
          <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
            Sections
          </span>
          <button
            type="button"
            onClick={() => setReorderModalOpen(true)}
            className="text-xs text-black font-semibold flex items-center gap-1 hover:underline"
          >
            <ArrowUpDown className="w-3.5 h-3.5" /> Reorder Sections
          </button>
        </div>

        {/* Scrollable pill tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
          {TABS.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                  isActive
                    ? 'bg-black text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200/70 hover:text-slate-900'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Editor Content Workspace */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-50">
        <div className="max-w-2xl mx-auto bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs">
          {activeTab === 'personal' && (
            <PersonalInfoForm
              data={data.personalInfo}
              onChange={onUpdatePersonalInfo}
            />
          )}

          {activeTab === 'experience' && (
            <ExperienceForm
              experiences={data.experiences}
              onAdd={onAddExperience}
              onUpdate={onUpdateExperience}
              onDelete={onDeleteExperience}
            />
          )}

          {activeTab === 'education' && (
            <EducationForm
              educations={data.educations}
              onAdd={onAddEducation}
              onUpdate={onUpdateEducation}
              onDelete={onDeleteEducation}
            />
          )}

          {activeTab === 'skills' && (
            <SkillsForm
              categories={data.skillCategories}
              onAddCategory={onAddSkillCategory}
              onUpdateCategory={onUpdateSkillCategory}
              onDeleteCategory={onDeleteSkillCategory}
            />
          )}

          {activeTab === 'projects' && (
            <ProjectsForm
              projects={data.projects}
              onAdd={onAddProject}
              onUpdate={onUpdateProject}
              onDelete={onDeleteProject}
            />
          )}

          {activeTab === 'certifications' && (
            <CertificationsForm
              certifications={data.certifications}
              onAdd={onAddCertification}
              onUpdate={onUpdateCertification}
              onDelete={onDeleteCertification}
            />
          )}

          {activeTab === 'additional' && (
            <AdditionalSectionsForm
              data={data}
              onAddAchievement={onAddAchievement}
              onUpdateAchievement={onUpdateAchievement}
              onDeleteAchievement={onDeleteAchievement}
              onAddLanguage={onAddLanguage}
              onUpdateLanguage={onUpdateLanguage}
              onDeleteLanguage={onDeleteLanguage}
              onToggleSection={onToggleSectionEnabled}
            />
          )}
        </div>
      </div>

      {/* Section Reorder Modal */}
      <SectionReorderModal
        isOpen={reorderModalOpen}
        onClose={() => setReorderModalOpen(false)}
        data={data}
        onMoveUp={onReorderSectionUp}
        onMoveDown={onReorderSectionDown}
        onToggleEnabled={onToggleSectionEnabled}
      />
    </div>
  );
};
