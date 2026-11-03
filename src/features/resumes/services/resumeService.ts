import { supabase } from '@/lib/supabase/client';
import { getSupabaseEnv } from '@/lib/supabase/env';
import type { ResumeData, ResumeListItem, TemplateId } from '../types/resume.types';
import { createEmptyResume, createSampleResume } from '../utils/resumeDefaults';

const STORAGE_PREFIX = 'resumax_resumes_';

function getStorageKey(userId: string): string {
  return `${STORAGE_PREFIX}${userId || 'anonymous'}`;
}

function getLocalResumes(userId: string): ResumeData[] {
  try {
    const raw = localStorage.getItem(getStorageKey(userId));
    if (!raw) return [];
    return JSON.parse(raw) as ResumeData[];
  } catch (err) {
    console.error('Failed to read resumes from localStorage:', err);
    return [];
  }
}

function setLocalResumes(userId: string, resumes: ResumeData[]): void {
  try {
    localStorage.setItem(getStorageKey(userId), JSON.stringify(resumes));
  } catch (err) {
    console.error('Failed to write resumes to localStorage:', err);
  }
}

export class ResumeService {
  /**
   * Check whether remote Supabase persistence is active and ready
   */
  static isRemoteConfigured(): boolean {
    const env = getSupabaseEnv();
    return env.isConfigured;
  }

  /**
   * List all resumes for a given user
   */
  static async listResumes(userId: string): Promise<ResumeListItem[]> {
    if (this.isRemoteConfigured()) {
      try {
        const { data, error } = await (supabase as any)
          .from('resumes')
          .select('id, user_id, title, target_role, template_id, updated_at, created_at, ats_score')
          .eq('user_id', userId)
          .order('updated_at', { ascending: false });

        if (!error && data) {
          return (data as any[]).map((item) => ({
            id: item.id,
            userId: item.user_id,
            title: item.title,
            targetRole: item.target_role || undefined,
            templateId: (item.template_id as TemplateId) || 'jakes-technical',
            updatedAt: item.updated_at,
            createdAt: item.created_at,
            atsScore: item.ats_score || 0,
          }));
        }
      } catch (remoteError) {
        console.warn('Remote Supabase list failed (table may not exist yet); falling back to local storage:', remoteError);
      }
    }

    // Local storage fallback
    const local = getLocalResumes(userId);
    return local.map((item) => ({
      id: item.id,
      userId: item.userId,
      title: item.title,
      targetRole: item.targetRole,
      templateId: item.templateId,
      updatedAt: item.updatedAt,
      createdAt: item.createdAt,
      atsScore: item.atsScore || 0,
    })).sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }

  /**
   * Get a complete single resume by ID
   */
  static async getResume(id: string, userId: string): Promise<ResumeData | null> {
    if (this.isRemoteConfigured()) {
      try {
        const { data, error } = await (supabase as any)
          .from('resumes')
          .select('*')
          .eq('id', id)
          .eq('user_id', userId)
          .maybeSingle();

        if (!error && data) {
          // Parse complex payload from Supabase record
          const fullResume: ResumeData = {
            id: data.id,
            userId: data.user_id,
            title: data.title,
            targetRole: data.target_role || undefined,
            templateId: (data.template_id as TemplateId) || 'jakes-technical',
            createdAt: data.created_at,
            updatedAt: data.updated_at,
            customization: (data.customization as unknown as ResumeData['customization']) || {
              accentColor: '#0f172a',
              fontFamily: 'Inter',
              fontSize: 'medium',
              lineSpacing: 'normal',
              margins: 'normal',
            },
            personalInfo: (data.personal_info as unknown as ResumeData['personalInfo']) || {
              fullName: '',
              professionalTitle: '',
              email: '',
              phone: '',
              location: '',
              linkedinUrl: '',
              githubUrl: '',
              portfolioUrl: '',
              summary: '',
            },
            sectionsOrder: (data.sections_order as unknown as ResumeData['sectionsOrder']) || [],
            enabledSections: (data.enabled_sections as unknown as ResumeData['enabledSections']) || {},
            experiences: [],
            educations: [],
            skillCategories: [],
            projects: [],
            certifications: [],
            achievements: [],
            languages: [],
            publications: [],
            volunteer: [],
            interests: [],
            atsScore: data.ats_score || 0,
          };

          // Also fetch resume_sections
          const { data: sections } = await (supabase as any)
            .from('resume_sections')
            .select('*')
            .eq('resume_id', id)
            .order('display_order', { ascending: true });

          if (sections) {
            for (const sec of sections) {
              const content = sec.content as unknown as Record<string, unknown>;
              if (sec.section_type === 'experience' && Array.isArray(content?.items)) {
                fullResume.experiences = content.items as ResumeData['experiences'];
              } else if (sec.section_type === 'education' && Array.isArray(content?.items)) {
                fullResume.educations = content.items as ResumeData['educations'];
              } else if (sec.section_type === 'skills' && Array.isArray(content?.items)) {
                fullResume.skillCategories = content.items as ResumeData['skillCategories'];
              } else if (sec.section_type === 'projects' && Array.isArray(content?.items)) {
                fullResume.projects = content.items as ResumeData['projects'];
              } else if (sec.section_type === 'certifications' && Array.isArray(content?.items)) {
                fullResume.certifications = content.items as ResumeData['certifications'];
              } else if (sec.section_type === 'achievements' && Array.isArray(content?.items)) {
                fullResume.achievements = content.items as ResumeData['achievements'];
              } else if (sec.section_type === 'languages' && Array.isArray(content?.items)) {
                fullResume.languages = content.items as ResumeData['languages'];
              } else if (sec.section_type === 'publications' && Array.isArray(content?.items)) {
                fullResume.publications = content.items as ResumeData['publications'];
              } else if (sec.section_type === 'volunteer' && Array.isArray(content?.items)) {
                fullResume.volunteer = content.items as ResumeData['volunteer'];
              } else if (sec.section_type === 'interests' && Array.isArray(content?.items)) {
                fullResume.interests = content.items as ResumeData['interests'];
              }
            }
          }

          return fullResume;
        }
      } catch (remoteError) {
        console.warn('Remote Supabase fetch failed; falling back to local storage:', remoteError);
      }
    }

    // Local storage lookup
    const local = getLocalResumes(userId);
    return local.find((r) => r.id === id) || null;
  }

  /**
   * Save (create or update) a resume
   */
  static async saveResume(resume: ResumeData): Promise<{
    success: boolean;
    isRemote: boolean;
    error?: string;
  }> {
    const updatedResume: ResumeData = {
      ...resume,
      updatedAt: new Date().toISOString(),
    };

    // Always keep local storage updated as a bulletproof cache / offline backup
    const localResumes = getLocalResumes(updatedResume.userId);
    const existingIndex = localResumes.findIndex((r) => r.id === updatedResume.id);
    if (existingIndex >= 0) {
      localResumes[existingIndex] = updatedResume;
    } else {
      localResumes.push(updatedResume);
    }
    setLocalResumes(updatedResume.userId, localResumes);

    if (this.isRemoteConfigured()) {
      try {
        // Upsert into master resumes table
        const { error: resumeError } = await (supabase as any).from('resumes').upsert(
          {
            id: updatedResume.id,
            user_id: updatedResume.userId,
            title: updatedResume.title,
            target_role: updatedResume.targetRole || null,
            summary: updatedResume.personalInfo.summary || null,
            template_id: updatedResume.templateId,
            customization: updatedResume.customization as unknown as Record<string, unknown>,
            personal_info: updatedResume.personalInfo as unknown as Record<string, unknown>,
            sections_order: updatedResume.sectionsOrder,
            enabled_sections: updatedResume.enabledSections as unknown as Record<string, unknown>,
            ats_score: updatedResume.atsScore || 0,
            updated_at: updatedResume.updatedAt,
          },
          { onConflict: 'id' }
        );

        if (resumeError) {
          console.warn('Supabase resumes table write error:', resumeError.message);
          return { success: true, isRemote: false, error: resumeError.message };
        }

        // Upsert modular sections
        const sectionsData = [
          { type: 'experience', title: 'Work Experience', items: updatedResume.experiences, order: 2 },
          { type: 'education', title: 'Education', items: updatedResume.educations, order: 3 },
          { type: 'skills', title: 'Technical Skills', items: updatedResume.skillCategories, order: 4 },
          { type: 'projects', title: 'Projects', items: updatedResume.projects, order: 5 },
          { type: 'certifications', title: 'Certifications', items: updatedResume.certifications, order: 6 },
          { type: 'achievements', title: 'Achievements', items: updatedResume.achievements, order: 7 },
          { type: 'languages', title: 'Languages', items: updatedResume.languages, order: 8 },
          { type: 'publications', title: 'Publications', items: updatedResume.publications, order: 9 },
          { type: 'volunteer', title: 'Volunteer Experience', items: updatedResume.volunteer, order: 10 },
          { type: 'interests', title: 'Interests', items: updatedResume.interests, order: 11 },
        ];

        for (const sec of sectionsData) {
          await (supabase as any).from('resume_sections').upsert(
            {
              resume_id: updatedResume.id,
              section_type: sec.type,
              section_title: sec.title,
              display_order: sec.order,
              content: { items: sec.items } as unknown as Record<string, unknown>,
              is_visible: updatedResume.enabledSections[sec.type as keyof typeof updatedResume.enabledSections] ?? true,
              updated_at: updatedResume.updatedAt,
            },
            { onConflict: 'resume_id,section_type' }
          );
        }

        return { success: true, isRemote: true };
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        console.warn('Supabase remote sync encountered an issue, saved to local cache:', message);
        return { success: true, isRemote: false, error: message };
      }
    }

    return { success: true, isRemote: false };
  }

  /**
   * Create a new resume
   */
  static async createResume(
    userId: string,
    title = 'Untitled Resume',
    templateId: TemplateId = 'jakes-technical',
    fromSample = false
  ): Promise<ResumeData> {
    const newResume = fromSample
      ? createSampleResume(userId, templateId)
      : createEmptyResume(userId, title, templateId);

    newResume.title = title;
    newResume.templateId = templateId;

    await this.saveResume(newResume);
    return newResume;
  }

  /**
   * Duplicate an existing resume
   */
  static async duplicateResume(id: string, userId: string): Promise<ResumeData | null> {
    const existing = await this.getResume(id, userId);
    if (!existing) return null;

    const duplicated: ResumeData = {
      ...existing,
      id: crypto.randomUUID(),
      title: `${existing.title} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      experiences: existing.experiences.map((exp) => ({ ...exp, id: crypto.randomUUID() })),
      educations: existing.educations.map((edu) => ({ ...edu, id: crypto.randomUUID() })),
      skillCategories: existing.skillCategories.map((cat) => ({ ...cat, id: crypto.randomUUID() })),
      projects: existing.projects.map((proj) => ({ ...proj, id: crypto.randomUUID() })),
      certifications: existing.certifications.map((cert) => ({ ...cert, id: crypto.randomUUID() })),
      achievements: existing.achievements.map((ach) => ({ ...ach, id: crypto.randomUUID() })),
      languages: existing.languages.map((lang) => ({ ...lang, id: crypto.randomUUID() })),
      publications: existing.publications.map((pub) => ({ ...pub, id: crypto.randomUUID() })),
      volunteer: existing.volunteer.map((vol) => ({ ...vol, id: crypto.randomUUID() })),
      interests: existing.interests.map((int) => ({ ...int, id: crypto.randomUUID() })),
    };

    await this.saveResume(duplicated);
    return duplicated;
  }

  /**
   * Rename a resume
   */
  static async renameResume(id: string, userId: string, newTitle: string): Promise<boolean> {
    const existing = await this.getResume(id, userId);
    if (!existing) return false;

    existing.title = newTitle.trim() || 'Untitled Resume';
    await this.saveResume(existing);
    return true;
  }

  /**
   * Delete a resume
   */
  static async deleteResume(id: string, userId: string): Promise<boolean> {
    // Remove from local storage
    const local = getLocalResumes(userId);
    const filtered = local.filter((r) => r.id !== id);
    setLocalResumes(userId, filtered);

    if (this.isRemoteConfigured()) {
      try {
        const { error } = await (supabase as any)
          .from('resumes')
          .delete()
          .eq('id', id)
          .eq('user_id', userId);

        if (error) {
          console.warn('Remote deletion error:', error.message);
        }
      } catch (err) {
        console.warn('Remote deletion failed:', err);
      }
    }

    return true;
  }

  /**
   * Create a point-in-time version snapshot of a resume before modifications
   */
  static async createSnapshot(
    resume: ResumeData,
    changeSummary = 'Pre-optimization snapshot'
  ): Promise<{ success: boolean; versionNumber?: number; versionId?: string; error?: string }> {
    const versionId = crypto.randomUUID();
    const now = new Date().toISOString();

    // 1. Calculate next version number from local storage cache
    const versionsKey = `resumax_versions_${resume.id}`;
    let nextVersionNumber = 1;
    try {
      const raw = localStorage.getItem(versionsKey);
      const localVersions: ResumeVersion[] = raw ? JSON.parse(raw) : [];
      const maxLocalNumber = localVersions.reduce((max, v) => Math.max(max, v.versionNumber), 0);
      nextVersionNumber = maxLocalNumber + 1;

      const newVersion: ResumeVersion = {
        id: versionId,
        resumeId: resume.id,
        createdBy: resume.userId,
        versionNumber: nextVersionNumber,
        changeSummary,
        snapshot: JSON.parse(JSON.stringify(resume)),
        createdAt: now,
      };

      localVersions.unshift(newVersion);
      localStorage.setItem(versionsKey, JSON.stringify(localVersions));
    } catch (localErr) {
      console.warn('Failed to save snapshot to local storage:', localErr);
    }

    // 2. Persist to Supabase if remote configured
    if (this.isRemoteConfigured()) {
      try {
        const { data: existingVersions, error: queryError } = await (supabase as any)
          .from('resume_versions')
          .select('version_number')
          .eq('resume_id', resume.id)
          .order('version_number', { ascending: false })
          .limit(1);

        if (!queryError && existingVersions && existingVersions.length > 0) {
          nextVersionNumber = (existingVersions[0].version_number || 0) + 1;
        }

        const { error: insertError } = await (supabase as any)
          .from('resume_versions')
          .insert({
            id: versionId,
            resume_id: resume.id,
            created_by: resume.userId,
            version_number: nextVersionNumber,
            change_summary: changeSummary,
            snapshot: resume,
            created_at: now,
          });

        if (insertError) {
          console.warn('Supabase version snapshot insert failed:', insertError.message);
          return { success: false, error: insertError.message };
        }

        return { success: true, versionNumber: nextVersionNumber, versionId };
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        console.warn('Supabase remote snapshot failed:', message);
        return { success: false, error: message };
      }
    }

    return { success: true, versionNumber: nextVersionNumber, versionId };
  }

  /**
   * List all point-in-time version snapshots for a resume
   */
  static async listVersions(resumeId: string, userId: string): Promise<ResumeVersion[]> {
    if (this.isRemoteConfigured()) {
      try {
        const { data, error } = await (supabase as any)
          .from('resume_versions')
          .select('*')
          .eq('resume_id', resumeId)
          .order('version_number', { ascending: false });

        if (!error && data) {
          return (data as any[]).map((v) => ({
            id: v.id,
            resumeId: v.resume_id,
            createdBy: v.created_by,
            versionNumber: v.version_number,
            changeSummary: v.change_summary,
            snapshot: v.snapshot as ResumeData,
            createdAt: v.created_at,
          }));
        }
      } catch (err) {
        console.warn('Failed to fetch remote versions, falling back to local:', err);
      }
    }

    try {
      const raw = localStorage.getItem(`resumax_versions_${resumeId}`);
      if (!raw) return [];
      const versions = JSON.parse(raw) as ResumeVersion[];
      return versions.filter((v) => v.createdBy === userId || !v.createdBy);
    } catch {
      return [];
    }
  }
}

export interface ResumeVersion {
  id: string;
  resumeId: string;
  createdBy: string;
  versionNumber: number;
  changeSummary: string | null;
  snapshot: ResumeData;
  createdAt: string;
}
