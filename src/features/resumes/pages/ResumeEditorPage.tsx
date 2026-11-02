import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { useResume } from '../hooks/useResume';
import { ResumeService } from '../services/resumeService';
import { ResumeToolbar } from '../components/ResumeToolbar/ResumeToolbar';
import { ResumeEditor } from '../components/ResumeEditor/ResumeEditor';
import { ResumePreview } from '../components/ResumePreview/ResumePreview';
import { Spinner } from '@/components/ui/Spinner';
import { Button } from '@/components/ui/Button';
import { ArrowLeft } from 'lucide-react';

export const ResumeEditorPage: React.FC = () => {
  const { resumeId } = useParams<{ resumeId: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const effectiveUserId = user?.id || 'demo_user';

  // If path is /dashboard/resumes/new, handle instant creation
  const isNewRoute = !resumeId || resumeId === 'new';

  useEffect(() => {
    if (isNewRoute) {
      async function createAndRedirect() {
        const newResume = await ResumeService.createResume(
          effectiveUserId,
          'Untitled Resume',
          'jakes-technical',
          false
        );
        navigate(`/dashboard/resumes/${newResume.id}/edit`, { replace: true });
      }
      createAndRedirect();
    }
  }, [isNewRoute, effectiveUserId, navigate]);

  const {
    resume,
    loading,
    error,
    saveStatus,
    lastSavedAt,
    errorMessage,
    updateTitle,
    changeTemplate,
    updateCustomization,
    updatePersonalInfo,
    reorderSectionUp,
    reorderSectionDown,
    toggleSectionEnabled,
    addExperience,
    updateExperience,
    deleteExperience,
    addEducation,
    updateEducation,
    deleteEducation,
    addSkillCategory,
    updateSkillCategory,
    deleteSkillCategory,
    addProject,
    updateProject,
    deleteProject,
    addCertification,
    updateCertification,
    deleteCertification,
    addAchievement,
    updateAchievement,
    deleteAchievement,
    addLanguage,
    updateLanguage,
    deleteLanguage,
  } = useResume(resumeId && resumeId !== 'new' ? resumeId : undefined, effectiveUserId);

  const [zoom, setZoom] = useState<number>(100);
  const [mobileTab, setMobileTab] = useState<'editor' | 'preview'>('editor');

  if (isNewRoute || loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center space-y-3">
        <Spinner size="lg" className="text-black" />
        <p className="text-xs font-semibold text-slate-600">Initializing resume workspace...</p>
      </div>
    );
  }

  if (error || !resume) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center mx-auto">
          <ArrowLeft className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-base font-bold text-slate-900">Resume Not Found</h2>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            {error || "The resume you requested could not be located in your workspace."}
          </p>
        </div>
        <Button variant="primary" size="sm" onClick={() => navigate('/dashboard/resumes')}>
          Return to My Resumes
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-100">
      {/* Top Universal Toolbar */}
      <ResumeToolbar
        data={resume}
        saveStatus={saveStatus}
        lastSavedAt={lastSavedAt}
        errorMessage={errorMessage}
        zoom={zoom}
        onZoomChange={setZoom}
        onTitleChange={updateTitle}
        onTemplateChange={changeTemplate}
        onCustomizationChange={updateCustomization}
        activeTab={mobileTab}
        onTabChange={setMobileTab}
      />

      {/* Split Workspace */}
      <main className="flex-1 flex overflow-hidden">
        {/* Left Side: Section Editor Forms */}
        <section
          className={`w-full lg:w-[480px] xl:w-[560px] 2xl:w-[620px] shrink-0 h-[calc(100vh-61px)] overflow-hidden ${
            mobileTab === 'editor' ? 'block' : 'hidden lg:block'
          }`}
        >
          <ResumeEditor
            data={resume}
            onUpdatePersonalInfo={updatePersonalInfo}
            onAddExperience={addExperience}
            onUpdateExperience={updateExperience}
            onDeleteExperience={deleteExperience}
            onAddEducation={addEducation}
            onUpdateEducation={updateEducation}
            onDeleteEducation={deleteEducation}
            onAddSkillCategory={addSkillCategory}
            onUpdateSkillCategory={updateSkillCategory}
            onDeleteSkillCategory={deleteSkillCategory}
            onAddProject={addProject}
            onUpdateProject={updateProject}
            onDeleteProject={deleteProject}
            onAddCertification={addCertification}
            onUpdateCertification={updateCertification}
            onDeleteCertification={deleteCertification}
            onAddAchievement={addAchievement}
            onUpdateAchievement={updateAchievement}
            onDeleteAchievement={deleteAchievement}
            onAddLanguage={addLanguage}
            onUpdateLanguage={updateLanguage}
            onDeleteLanguage={deleteLanguage}
            onReorderSectionUp={reorderSectionUp}
            onReorderSectionDown={reorderSectionDown}
            onToggleSectionEnabled={toggleSectionEnabled}
          />
        </section>

        {/* Right Side: Center Live Preview */}
        <section
          className={`flex-1 h-[calc(100vh-61px)] overflow-hidden ${
            mobileTab === 'preview' ? 'block' : 'hidden lg:block'
          }`}
        >
          <ResumePreview data={resume} zoom={zoom} />
        </section>
      </main>
    </div>
  );
};
