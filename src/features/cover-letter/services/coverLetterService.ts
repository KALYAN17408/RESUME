import type { CoverLetterDraft } from '../types/coverLetter.types';

const STORAGE_PREFIX = 'resumax_cover_letter_drafts_';
const LEGACY_OPT_PREFIX = 'resumax_opt_sessions_';

function getStorageKey(userId: string): string {
  return `${STORAGE_PREFIX}${userId || 'anonymous'}`;
}

export class CoverLetterService {
  /**
   * Reads all saved drafts for a user, automatically migrating legacy optimizer cover letters
   */
  static getDrafts(userId: string): CoverLetterDraft[] {
    const drafts: CoverLetterDraft[] = [];
    const storageKey = getStorageKey(userId);

    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          drafts.push(...parsed);
        }
      }
    } catch (err) {
      console.warn('[CoverLetterService] Failed to parse drafts from localStorage:', err);
    }

    // Check for legacy optimizer sessions containing cover letters to preserve
    try {
      const legacyKey = `${LEGACY_OPT_PREFIX}${userId || 'anonymous'}`;
      const legacyRaw = localStorage.getItem(legacyKey);
      if (legacyRaw) {
        const legacySessions = JSON.parse(legacyRaw);
        if (Array.isArray(legacySessions)) {
          for (const s of legacySessions) {
            const cl = s.cover_letter || s.coverLetter;
            if (cl && (cl.editedCoverLetter || cl.coverLetterResult?.content)) {
              const content = cl.editedCoverLetter || cl.coverLetterResult?.content;
              const alreadyExists = drafts.some((d) => d.content === content);
              if (!alreadyExists && content.trim().length > 0) {
                drafts.push({
                  id: `migrated-${s.id}`,
                  userId,
                  title: `${s.company_name || s.companyName || 'Company'} — ${s.job_title || s.jobTitle || 'Role'} (Imported Draft)`,
                  resumeId: s.resume_id || s.resumeId || null,
                  resumeTitle: s.resume_title || s.resumeTitle,
                  jobTitle: s.job_title || s.jobTitle || 'Software Engineer',
                  companyName: s.company_name || s.companyName || 'Hiring Company',
                  hiringManagerName: cl.hiringManagerName || 'Hiring Team',
                  jobDescription: s.job_description || s.jobDescription || '',
                  tone: 'professional',
                  additionalContext: cl.additionalCoverLetterContext || '',
                  subjectLine: cl.coverLetterResult?.subjectLine || `Application for ${s.job_title || 'Role'}`,
                  content,
                  originalGeneratedContent: cl.coverLetterResult?.content,
                  usedResumeEvidence: cl.coverLetterResult?.usedResumeEvidence || [],
                  isDeterministic: Boolean(cl.coverLetterResult?.isDeterministic),
                  provider: cl.coverLetterResult?.provider || 'legacy-migrated',
                  createdAt: s.created_at || s.createdAt || new Date().toISOString(),
                  updatedAt: s.updated_at || s.updatedAt || new Date().toISOString(),
                });
              }
            }
          }
        }
      }
    } catch {
      // Ignore legacy migration errors
    }

    // Sort descending by updatedAt
    return drafts.sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }

  /**
   * Saves or updates a draft in localStorage
   */
  static saveDraft(userId: string, draft: Partial<CoverLetterDraft> & { content: string; jobTitle: string; companyName: string }): CoverLetterDraft {
    const existingDrafts = this.getDrafts(userId);
    const now = new Date().toISOString();

    let savedDraft: CoverLetterDraft;

    if (draft.id) {
      const idx = existingDrafts.findIndex((d) => d.id === draft.id);
      if (idx !== -1) {
        savedDraft = {
          ...existingDrafts[idx],
          ...draft,
          updatedAt: now,
        };
        existingDrafts[idx] = savedDraft;
      } else {
        savedDraft = {
          id: draft.id,
          userId,
          title: draft.title || `${draft.companyName} — ${draft.jobTitle}`,
          resumeId: draft.resumeId || null,
          resumeTitle: draft.resumeTitle,
          jobTitle: draft.jobTitle,
          companyName: draft.companyName,
          hiringManagerName: draft.hiringManagerName,
          jobDescription: draft.jobDescription || '',
          tone: draft.tone || 'professional',
          additionalContext: draft.additionalContext,
          subjectLine: draft.subjectLine || `Application for ${draft.jobTitle}`,
          content: draft.content,
          originalGeneratedContent: draft.originalGeneratedContent,
          usedResumeEvidence: draft.usedResumeEvidence || [],
          isDeterministic: draft.isDeterministic ?? true,
          provider: draft.provider || 'deterministic',
          createdAt: draft.createdAt || now,
          updatedAt: now,
        };
        existingDrafts.unshift(savedDraft);
      }
    } else {
      savedDraft = {
        id: crypto.randomUUID(),
        userId,
        title: draft.title || `${draft.companyName} — ${draft.jobTitle}`,
        resumeId: draft.resumeId || null,
        resumeTitle: draft.resumeTitle,
        jobTitle: draft.jobTitle,
        companyName: draft.companyName,
        hiringManagerName: draft.hiringManagerName,
        jobDescription: draft.jobDescription || '',
        tone: draft.tone || 'professional',
        additionalContext: draft.additionalContext,
        subjectLine: draft.subjectLine || `Application for ${draft.jobTitle}`,
        content: draft.content,
        originalGeneratedContent: draft.originalGeneratedContent,
        usedResumeEvidence: draft.usedResumeEvidence || [],
        isDeterministic: draft.isDeterministic ?? true,
        provider: draft.provider || 'deterministic',
        createdAt: now,
        updatedAt: now,
      };
      existingDrafts.unshift(savedDraft);
    }

    try {
      localStorage.setItem(getStorageKey(userId), JSON.stringify(existingDrafts));
    } catch (err) {
      console.warn('[CoverLetterService] Failed to save draft:', err);
    }

    return savedDraft;
  }

  /**
   * Deletes a draft by ID
   */
  static deleteDraft(userId: string, draftId: string): boolean {
    const existing = this.getDrafts(userId);
    const filtered = existing.filter((d) => d.id !== draftId);
    try {
      localStorage.setItem(getStorageKey(userId), JSON.stringify(filtered));
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Retrieves a draft by ID
   */
  static getDraftById(userId: string, draftId: string): CoverLetterDraft | null {
    const drafts = this.getDrafts(userId);
    return drafts.find((d) => d.id === draftId) || null;
  }
}

