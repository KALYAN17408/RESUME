import { ZodError } from 'zod';
import { supabase } from '@/lib/supabase/client';
import { getSupabaseEnv } from '@/lib/supabase/env';
import type {
  OptimizationSession,
  OptimizationSessionListItem,
  OptimizationSessionStatus,
  OptimizationResultsState,
  StagedChangesState,
  CoverLetterState,
} from '../types/optimizer.types';
import type { ResumeData } from '@/features/resumes/types/resume.types';
import { saveSessionInputSchema } from '../validation/optimizerSchemas';

const STORAGE_PREFIX = 'resumax_opt_sessions_';

function getStorageKey(userId: string): string {
  return `${STORAGE_PREFIX}${userId || 'anonymous'}`;
}

function getLocalSessions(userId: string): OptimizationSession[] {
  try {
    const raw = localStorage.getItem(getStorageKey(userId));
    if (!raw) return [];
    return JSON.parse(raw) as OptimizationSession[];
  } catch (err) {
    console.warn('Failed to read optimization sessions from localStorage:', err);
    return [];
  }
}

function setLocalSessions(userId: string, sessions: OptimizationSession[]): void {
  try {
    localStorage.setItem(getStorageKey(userId), JSON.stringify(sessions));
  } catch (err) {
    console.warn('Failed to write optimization sessions to localStorage:', err);
  }
}

export class OptimizationSessionService {
  /**
   * Check whether remote Supabase persistence is active
   */
  static isRemoteConfigured(): boolean {
    const env = getSupabaseEnv();
    return env.isConfigured;
  }

  /**
   * Create a new optimization session object
   */
  static async createSession(params: {
    userId: string;
    resumeId?: string | null;
    resumeTitle?: string;
    sessionName?: string;
    jobTitle?: string;
    companyName?: string;
    jobDescription: string;
    originalResumeSnapshot?: ResumeData | null;
    resumeVersionId?: string | null;
  }): Promise<OptimizationSession> {
    const now = new Date().toISOString();
    const id = crypto.randomUUID();

    const initialOptimizationResults: OptimizationResultsState = {
      summaryResult: null,
      bulletResults: {},
      keywordResult: null,
    };

    const initialStagedChanges: StagedChangesState = {
      stagedSummary: null,
      stagedBullets: [],
      confirmedSkills: [],
      learningGoals: [],
      rejectedKeywords: [],
    };

    const initialCoverLetter: CoverLetterState = {
      coverLetterResult: null,
      editedCoverLetter: '',
      hiringManagerName: '',
      additionalCoverLetterContext: '',
      stagedCoverLetter: null,
    };

    const session: OptimizationSession = {
      id,
      userId: params.userId,
      resumeId: params.resumeId || null,
      resumeTitle: params.resumeTitle,
      sessionName:
        params.sessionName ||
        (params.jobTitle
          ? `${params.jobTitle} Optimization`
          : 'Untitled Optimization'),
      jobTitle: params.jobTitle || '',
      companyName: params.companyName || '',
      jobDescription: params.jobDescription,
      resumeVersionId: params.resumeVersionId || null,
      originalResumeSnapshot: params.originalResumeSnapshot || null,
      optimizationResults: initialOptimizationResults,
      stagedChanges: initialStagedChanges,
      coverLetter: initialCoverLetter,
      status: 'draft',
      createdAt: now,
      updatedAt: now,
      lastOpenedAt: now,
    };

    await this.saveSession(session);
    return session;
  }

  /**
   * Save (create or update) an optimization session
   */
  static async saveSession(session: OptimizationSession): Promise<{
    success: boolean;
    isRemote: boolean;
    error?: string;
  }> {
    // 1. Validate session input
    try {
      saveSessionInputSchema.parse(session);
    } catch (valErr: unknown) {
      const msg =
        valErr instanceof ZodError
          ? valErr.errors[0]?.message || 'Invalid session payload'
          : valErr instanceof Error
          ? valErr.message
          : 'Invalid session payload';
      return { success: false, isRemote: false, error: msg };
    }

    const updatedSession: OptimizationSession = {
      ...session,
      updatedAt: new Date().toISOString(),
    };

    // 2. Always persist to localStorage cache
    const local = getLocalSessions(updatedSession.userId);
    const existingIdx = local.findIndex((s) => s.id === updatedSession.id);
    if (existingIdx >= 0) {
      local[existingIdx] = updatedSession;
    } else {
      local.unshift(updatedSession);
    }
    setLocalSessions(updatedSession.userId, local);

    // 3. Persist to Supabase if remote configured
    if (this.isRemoteConfigured()) {
      try {
        const { error } = await (supabase as any)
          .from('resume_optimization_sessions')
          .upsert(
            {
              id: updatedSession.id,
              user_id: updatedSession.userId,
              resume_id: updatedSession.resumeId || null,
              session_name: updatedSession.sessionName,
              job_title: updatedSession.jobTitle || null,
              company_name: updatedSession.companyName || null,
              job_description: updatedSession.jobDescription,
              resume_version_id: updatedSession.resumeVersionId || null,
              original_resume_snapshot: updatedSession.originalResumeSnapshot || {},
              optimization_results: updatedSession.optimizationResults,
              staged_changes: updatedSession.stagedChanges,
              cover_letter: updatedSession.coverLetter,
              status: updatedSession.status,
              updated_at: updatedSession.updatedAt,
              last_opened_at: updatedSession.lastOpenedAt,
            },
            { onConflict: 'id' }
          );

        if (error) {
          console.warn('Supabase session save error:', error.message);
          return { success: true, isRemote: false, error: error.message };
        }

        return { success: true, isRemote: true };
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        console.warn('Supabase remote session write failed, saved locally:', message);
        return { success: true, isRemote: false, error: message };
      }
    }

    return { success: true, isRemote: false };
  }

  /**
   * Get an optimization session by ID with ownership enforcement
   */
  static async getSessionById(
    id: string,
    userId: string
  ): Promise<OptimizationSession | null> {
    if (this.isRemoteConfigured()) {
      try {
        const { data, error } = await (supabase as any)
          .from('resume_optimization_sessions')
          .select('*')
          .eq('id', id)
          .eq('user_id', userId)
          .maybeSingle();

        if (!error && data) {
          const session: OptimizationSession = {
            id: data.id,
            userId: data.user_id,
            resumeId: data.resume_id,
            sessionName: data.session_name,
            jobTitle: data.job_title || '',
            companyName: data.company_name || '',
            jobDescription: data.job_description,
            resumeVersionId: data.resume_version_id,
            originalResumeSnapshot: data.original_resume_snapshot,
            optimizationResults: data.optimization_results,
            stagedChanges: data.staged_changes,
            coverLetter: data.cover_letter,
            status: data.status,
            createdAt: data.created_at,
            updatedAt: data.updated_at,
            lastOpenedAt: new Date().toISOString(),
          };

          // Update last_opened_at
          this.saveSession(session).catch(() => {});
          return session;
        }
      } catch (err) {
        console.warn('Failed to fetch remote session, checking local storage:', err);
      }
    }

    // Local storage lookup
    const local = getLocalSessions(userId);
    const found = local.find((s) => s.id === id && s.userId === userId);
    if (found) {
      found.lastOpenedAt = new Date().toISOString();
      setLocalSessions(userId, local);
      return found;
    }
    return null;
  }

  /**
   * List all optimization sessions for an authenticated user
   */
  static async listSessions(userId: string): Promise<OptimizationSessionListItem[]> {
    if (this.isRemoteConfigured()) {
      try {
        const { data, error } = await (supabase as any)
          .from('resume_optimization_sessions')
          .select('id, user_id, resume_id, session_name, job_title, company_name, staged_changes, status, created_at, updated_at, last_opened_at')
          .eq('user_id', userId)
          .order('updated_at', { ascending: false });

        if (!error && data) {
          return (data as any[]).map((item) => {
            const staged = item.staged_changes || {};
            const stagedCount =
              (staged.stagedSummary ? 1 : 0) +
              (staged.stagedBullets?.length || 0) +
              (staged.confirmedSkills?.length || 0);

            return {
              id: item.id,
              userId: item.user_id,
              resumeId: item.resume_id,
              sessionName: item.session_name,
              jobTitle: item.job_title || undefined,
              companyName: item.company_name || undefined,
              status: (item.status as OptimizationSessionStatus) || 'draft',
              stagedCount,
              createdAt: item.created_at,
              updatedAt: item.updated_at,
              lastOpenedAt: item.last_opened_at || item.updated_at,
            };
          });
        }
      } catch (remoteError) {
        console.warn('Remote Supabase session list failed; falling back to local storage:', remoteError);
      }
    }

    // Local storage fallback
    const local = getLocalSessions(userId);
    return local
      .filter((s) => s.userId === userId)
      .map((s) => {
        const staged = s.stagedChanges || ({} as any);
        const stagedCount =
          (staged.stagedSummary ? 1 : 0) +
          (staged.stagedBullets?.length || 0) +
          (staged.confirmedSkills?.length || 0);

        return {
          id: s.id,
          userId: s.userId,
          resumeId: s.resumeId || null,
          resumeTitle: s.resumeTitle,
          sessionName: s.sessionName,
          jobTitle: s.jobTitle,
          companyName: s.companyName,
          status: s.status,
          stagedCount,
          createdAt: s.createdAt,
          updatedAt: s.updatedAt,
          lastOpenedAt: s.lastOpenedAt || s.updatedAt,
        };
      })
      .sort((a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime());
  }

  /**
   * Delete an optimization session with ownership enforcement
   */
  static async deleteSession(id: string, userId: string): Promise<boolean> {
    // 1. Remove from local storage
    const local = getLocalSessions(userId);
    const filtered = local.filter((s) => !(s.id === id && s.userId === userId));
    setLocalSessions(userId, filtered);

    // 2. Remove from Supabase if configured
    if (this.isRemoteConfigured()) {
      try {
        const { error } = await (supabase as any)
          .from('resume_optimization_sessions')
          .delete()
          .eq('id', id)
          .eq('user_id', userId);

        if (error) {
          console.warn('Remote session deletion error:', error.message);
        }
      } catch (err) {
        console.warn('Remote session deletion failed:', err);
      }
    }

    return true;
  }

  /**
   * Rename a session
   */
  static async renameSession(
    id: string,
    userId: string,
    newName: string
  ): Promise<boolean> {
    const session = await this.getSessionById(id, userId);
    if (!session) return false;

    session.sessionName = newName.trim() || 'Untitled Optimization';
    await this.saveSession(session);
    return true;
  }

  /**
   * Duplicate an existing session
   */
  static async duplicateSession(
    id: string,
    userId: string
  ): Promise<OptimizationSession | null> {
    const session = await this.getSessionById(id, userId);
    if (!session) return null;

    const duplicated: OptimizationSession = {
      ...JSON.parse(JSON.stringify(session)),
      id: crypto.randomUUID(),
      sessionName: `${session.sessionName} (Copy)`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      lastOpenedAt: new Date().toISOString(),
      status: 'draft',
    };

    await this.saveSession(duplicated);
    return duplicated;
  }

  /**
   * Update session status
   */
  static async updateSessionStatus(
    id: string,
    userId: string,
    status: OptimizationSessionStatus
  ): Promise<boolean> {
    const session = await this.getSessionById(id, userId);
    if (!session) return false;

    session.status = status;
    await this.saveSession(session);
    return true;
  }
}
