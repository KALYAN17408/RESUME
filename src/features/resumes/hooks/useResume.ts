import { useState, useEffect, useCallback } from 'react';
import type {
  ResumeData,
  PersonalInfo,
  ExperienceItem,
  EducationItem,
  SkillCategory,
  ProjectItem,
  CertificationItem,
  AchievementItem,
  LanguageItem,
  ResumeCustomization,
  TemplateId,
  SectionType,
} from '../types/resume.types';
import { ResumeService } from '../services/resumeService';
import { createSampleResume } from '../utils/resumeDefaults';
import { useResumeAutosave } from './useResumeAutosave';
import { moveItemUp, moveItemDown } from '../utils/reorderSections';

export function useResume(resumeId?: string, userId?: string) {
  const [resume, setResume] = useState<ResumeData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Auto-save integration
  const { saveStatus, lastSavedAt, errorMessage, saveImmediately } = useResumeAutosave(resume);

  // Load resume data
  useEffect(() => {
    let isMounted = true;

    async function loadResume() {
      if (!resumeId) {
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const effectiveUserId = userId || 'anonymous';
        let data = await ResumeService.getResume(resumeId, effectiveUserId);

        // If not found in storage, check if this is a sample request or initialize a clean one
        if (!data) {
          if (resumeId === 'sample') {
            data = createSampleResume(effectiveUserId, 'jakes-technical');
            await ResumeService.saveResume(data);
          } else {
            setError('Resume not found.');
          }
        }

        if (isMounted && data) {
          setResume(data);
        }
      } catch (err: unknown) {
        if (isMounted) {
          setError(err instanceof Error ? err.message : 'Failed to load resume');
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    }

    loadResume();

    return () => {
      isMounted = false;
    };
  }, [resumeId, userId]);

  // Update root properties
  const updateTitle = useCallback((title: string) => {
    setResume((prev) => (prev ? { ...prev, title } : prev));
  }, []);

  const updateTargetRole = useCallback((targetRole: string) => {
    setResume((prev) => (prev ? { ...prev, targetRole } : prev));
  }, []);

  const changeTemplate = useCallback((templateId: TemplateId) => {
    setResume((prev) => {
      if (!prev) return prev;
      const updated = { ...prev, templateId };
      // Save immediately on template switch
      saveImmediately(updated);
      return updated;
    });
  }, [saveImmediately]);

  const updateCustomization = useCallback((partial: Partial<ResumeCustomization>) => {
    setResume((prev) =>
      prev
        ? {
            ...prev,
            customization: { ...prev.customization, ...partial },
          }
        : prev
    );
  }, []);

  // Update Personal Info
  const updatePersonalInfo = useCallback((partial: Partial<PersonalInfo>) => {
    setResume((prev) =>
      prev
        ? {
            ...prev,
            personalInfo: { ...prev.personalInfo, ...partial },
          }
        : prev
    );
  }, []);

  // Section Ordering & Visibility
  const reorderSectionUp = useCallback((sectionIndex: number) => {
    setResume((prev) => {
      if (!prev) return prev;
      const updated = {
        ...prev,
        sectionsOrder: moveItemUp(prev.sectionsOrder, sectionIndex),
      };
      saveImmediately(updated);
      return updated;
    });
  }, [saveImmediately]);

  const reorderSectionDown = useCallback((sectionIndex: number) => {
    setResume((prev) => {
      if (!prev) return prev;
      const updated = {
        ...prev,
        sectionsOrder: moveItemDown(prev.sectionsOrder, sectionIndex),
      };
      saveImmediately(updated);
      return updated;
    });
  }, [saveImmediately]);

  const toggleSectionEnabled = useCallback((sectionType: SectionType, enabled: boolean) => {
    setResume((prev) => {
      if (!prev) return prev;
      const updated = {
        ...prev,
        enabledSections: {
          ...prev.enabledSections,
          [sectionType]: enabled,
        },
      };
      saveImmediately(updated);
      return updated;
    });
  }, [saveImmediately]);

  // Work Experience Operations
  const addExperience = useCallback((item?: Partial<ExperienceItem>) => {
    const newItem: ExperienceItem = {
      id: crypto.randomUUID(),
      jobTitle: item?.jobTitle || '',
      company: item?.company || '',
      location: item?.location || '',
      startDate: item?.startDate || '',
      endDate: item?.endDate || '',
      current: item?.current || false,
      highlights: item?.highlights || [''],
      employmentType: item?.employmentType || 'Full-time',
    };
    setResume((prev) => (prev ? { ...prev, experiences: [newItem, ...prev.experiences] } : prev));
  }, []);

  const updateExperience = useCallback((id: string, partial: Partial<ExperienceItem>) => {
    setResume((prev) =>
      prev
        ? {
            ...prev,
            experiences: prev.experiences.map((exp) =>
              exp.id === id ? { ...exp, ...partial } : exp
            ),
          }
        : prev
    );
  }, []);

  const deleteExperience = useCallback((id: string) => {
    setResume((prev) =>
      prev
        ? {
            ...prev,
            experiences: prev.experiences.filter((exp) => exp.id !== id),
          }
        : prev
    );
  }, []);

  // Education Operations
  const addEducation = useCallback((item?: Partial<EducationItem>) => {
    const newItem: EducationItem = {
      id: crypto.randomUUID(),
      degree: item?.degree || '',
      institution: item?.institution || '',
      location: item?.location || '',
      startDate: item?.startDate || '',
      endDate: item?.endDate || '',
      current: item?.current || false,
      gpa: item?.gpa || '',
      honors: item?.honors || '',
      description: item?.description || '',
    };
    setResume((prev) => (prev ? { ...prev, educations: [newItem, ...prev.educations] } : prev));
  }, []);

  const updateEducation = useCallback((id: string, partial: Partial<EducationItem>) => {
    setResume((prev) =>
      prev
        ? {
            ...prev,
            educations: prev.educations.map((edu) =>
              edu.id === id ? { ...edu, ...partial } : edu
            ),
          }
        : prev
    );
  }, []);

  const deleteEducation = useCallback((id: string) => {
    setResume((prev) =>
      prev
        ? {
            ...prev,
            educations: prev.educations.filter((edu) => edu.id !== id),
          }
        : prev
    );
  }, []);

  // Skills Operations
  const addSkillCategory = useCallback((name = 'New Category') => {
    const newCat: SkillCategory = {
      id: crypto.randomUUID(),
      name,
      skills: [],
    };
    setResume((prev) => (prev ? { ...prev, skillCategories: [...prev.skillCategories, newCat] } : prev));
  }, []);

  const updateSkillCategory = useCallback((id: string, partial: Partial<SkillCategory>) => {
    setResume((prev) =>
      prev
        ? {
            ...prev,
            skillCategories: prev.skillCategories.map((cat) =>
              cat.id === id ? { ...cat, ...partial } : cat
            ),
          }
        : prev
    );
  }, []);

  const deleteSkillCategory = useCallback((id: string) => {
    setResume((prev) =>
      prev
        ? {
            ...prev,
            skillCategories: prev.skillCategories.filter((cat) => cat.id !== id),
          }
        : prev
    );
  }, []);

  // Projects Operations
  const addProject = useCallback((item?: Partial<ProjectItem>) => {
    const newItem: ProjectItem = {
      id: crypto.randomUUID(),
      name: item?.name || '',
      description: item?.description || '',
      technologies: item?.technologies || [],
      url: item?.url || '',
      githubUrl: item?.githubUrl || '',
      startDate: item?.startDate || '',
      endDate: item?.endDate || '',
    };
    setResume((prev) => (prev ? { ...prev, projects: [newItem, ...prev.projects] } : prev));
  }, []);

  const updateProject = useCallback((id: string, partial: Partial<ProjectItem>) => {
    setResume((prev) =>
      prev
        ? {
            ...prev,
            projects: prev.projects.map((p) => (p.id === id ? { ...p, ...partial } : p)),
          }
        : prev
    );
  }, []);

  const deleteProject = useCallback((id: string) => {
    setResume((prev) =>
      prev
        ? {
            ...prev,
            projects: prev.projects.filter((p) => p.id !== id),
          }
        : prev
    );
  }, []);

  // Certifications Operations
  const addCertification = useCallback((item?: Partial<CertificationItem>) => {
    const newItem: CertificationItem = {
      id: crypto.randomUUID(),
      name: item?.name || '',
      issuer: item?.issuer || '',
      issueDate: item?.issueDate || '',
      expiryDate: item?.expiryDate || '',
      credentialUrl: item?.credentialUrl || '',
    };
    setResume((prev) => (prev ? { ...prev, certifications: [newItem, ...prev.certifications] } : prev));
  }, []);

  const updateCertification = useCallback((id: string, partial: Partial<CertificationItem>) => {
    setResume((prev) =>
      prev
        ? {
            ...prev,
            certifications: prev.certifications.map((c) =>
              c.id === id ? { ...c, ...partial } : c
            ),
          }
        : prev
    );
  }, []);

  const deleteCertification = useCallback((id: string) => {
    setResume((prev) =>
      prev
        ? {
            ...prev,
            certifications: prev.certifications.filter((c) => c.id !== id),
          }
        : prev
    );
  }, []);

  // Achievements Operations
  const addAchievement = useCallback((item?: Partial<AchievementItem>) => {
    const newItem: AchievementItem = {
      id: crypto.randomUUID(),
      title: item?.title || '',
      issuer: item?.issuer || '',
      date: item?.date || '',
      description: item?.description || '',
    };
    setResume((prev) => (prev ? { ...prev, achievements: [newItem, ...prev.achievements] } : prev));
  }, []);

  const updateAchievement = useCallback((id: string, partial: Partial<AchievementItem>) => {
    setResume((prev) =>
      prev
        ? {
            ...prev,
            achievements: prev.achievements.map((a) => (a.id === id ? { ...a, ...partial } : a)),
          }
        : prev
    );
  }, []);

  const deleteAchievement = useCallback((id: string) => {
    setResume((prev) =>
      prev
        ? {
            ...prev,
            achievements: prev.achievements.filter((a) => a.id !== id),
          }
        : prev
    );
  }, []);

  // Languages Operations
  const addLanguage = useCallback((language = '', proficiency = 'Fluent') => {
    const newItem: LanguageItem = {
      id: crypto.randomUUID(),
      language,
      proficiency,
    };
    setResume((prev) => (prev ? { ...prev, languages: [...prev.languages, newItem] } : prev));
  }, []);

  const updateLanguage = useCallback((id: string, partial: Partial<LanguageItem>) => {
    setResume((prev) =>
      prev
        ? {
            ...prev,
            languages: prev.languages.map((l) => (l.id === id ? { ...l, ...partial } : l)),
          }
        : prev
    );
  }, []);

  const deleteLanguage = useCallback((id: string) => {
    setResume((prev) =>
      prev
        ? {
            ...prev,
            languages: prev.languages.filter((l) => l.id !== id),
          }
        : prev
    );
  }, []);

  return {
    resume,
    loading,
    error,
    saveStatus,
    lastSavedAt,
    errorMessage,
    saveImmediately,
    updateTitle,
    updateTargetRole,
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
  };
}
