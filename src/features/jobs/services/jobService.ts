import { supabase } from '@/lib/supabase/client';
import { getSupabaseEnv } from '@/lib/supabase/env';
import type { SavedJob, JobFormData, JobMatchAnalysis } from '../types/job.types';

const STORAGE_PREFIX = 'resumax_saved_jobs_';
const dbJobs = () => (supabase as any).from('saved_jobs');

function getLocalJobs(userId: string): SavedJob[] {
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${userId}`);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.warn('[JobService] Failed to read from localStorage:', err);
    return [];
  }
}

function saveLocalJobs(userId: string, jobs: SavedJob[]): void {
  try {
    localStorage.setItem(`${STORAGE_PREFIX}${userId}`, JSON.stringify(jobs));
  } catch (err) {
    console.warn('[JobService] Failed to write to localStorage:', err);
  }
}

export class JobService {
  /**
   * List all saved jobs for the specified user
   */
  static async listJobs(userId: string): Promise<SavedJob[]> {
    const { isConfigured } = getSupabaseEnv();

    if (isConfigured) {
      try {
        const { data, error } = await dbJobs()
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (!error && data) {
          // Map DB columns to SavedJob model
          const mapped: SavedJob[] = data.map((d: any) => ({
            id: d.id,
            userId: d.user_id,
            resumeId: d.resume_id,
            resumeTitle: d.resume_title,
            title: d.title,
            company: d.company,
            location: d.location,
            employmentType: d.employment_type,
            jobUrl: d.job_url,
            jobDescription: d.job_description,
            status: d.status,
            appliedDate: d.applied_date,
            nextActionDate: d.next_action_date,
            notes: d.notes,
            matchAnalysis: d.match_analysis,
            createdAt: d.created_at,
            updatedAt: d.updated_at,
          }));

          // Sync local storage mirror
          saveLocalJobs(userId, mapped);
          return mapped;
        }
      } catch (err) {
        console.warn('[JobService] Supabase listJobs error, falling back to local storage:', err);
      }
    }

    return getLocalJobs(userId);
  }

  /**
   * Get a single saved job by ID
   */
  static async getJob(jobId: string, userId: string): Promise<SavedJob | null> {
    const jobs = await this.listJobs(userId);
    return jobs.find((j) => j.id === jobId) || null;
  }

  /**
   * Create a new saved job
   */
  static async createJob(
    data: JobFormData,
    userId: string,
    matchAnalysis?: JobMatchAnalysis,
    resumeTitle?: string
  ): Promise<SavedJob> {
    const { isConfigured } = getSupabaseEnv();
    const newId = crypto.randomUUID();
    const now = new Date().toISOString();

    const newJob: SavedJob = {
      id: newId,
      userId,
      resumeId: data.resumeId,
      resumeTitle,
      title: data.title.trim(),
      company: data.company.trim(),
      location: data.location?.trim() || '',
      employmentType: data.employmentType || 'full-time',
      jobUrl: data.jobUrl?.trim() || '',
      jobDescription: data.jobDescription.trim(),
      status: data.status || 'interested',
      appliedDate: data.appliedDate || (data.status === 'applied' ? now : undefined),
      nextActionDate: data.nextActionDate,
      notes: data.notes?.trim() || '',
      matchAnalysis,
      createdAt: now,
      updatedAt: now,
    };

    if (isConfigured) {
      try {
        const { error } = await dbJobs().insert({
          id: newJob.id,
          user_id: newJob.userId,
          resume_id: newJob.resumeId || null,
          resume_title: newJob.resumeTitle || null,
          title: newJob.title,
          company: newJob.company,
          location: newJob.location,
          employment_type: newJob.employmentType,
          job_url: newJob.jobUrl,
          job_description: newJob.jobDescription,
          status: newJob.status,
          applied_date: newJob.appliedDate || null,
          next_action_date: newJob.nextActionDate || null,
          notes: newJob.notes,
          match_analysis: newJob.matchAnalysis || null,
          created_at: newJob.createdAt,
          updated_at: newJob.updatedAt,
        });

        if (error) {
          console.warn('[JobService] Supabase insert error, saving locally:', error);
        }
      } catch (err) {
        console.warn('[JobService] Remote error, persisting locally:', err);
      }
    }

    // Update local mirror
    const current = getLocalJobs(userId);
    saveLocalJobs(userId, [newJob, ...current]);

    return newJob;
  }

  /**
   * Update an existing job
   */
  static async updateJob(
    jobId: string,
    updates: Partial<JobFormData>,
    userId: string,
    matchAnalysis?: JobMatchAnalysis
  ): Promise<SavedJob> {
    const { isConfigured } = getSupabaseEnv();
    const current = getLocalJobs(userId);
    const existingIndex = current.findIndex((j) => j.id === jobId);

    if (existingIndex === -1 && !isConfigured) {
      throw new Error('Job not found');
    }

    const now = new Date().toISOString();
    const existing = current[existingIndex] || {
      id: jobId,
      userId,
      createdAt: now,
    };

    const updated: SavedJob = {
      ...existing,
      ...updates,
      matchAnalysis: matchAnalysis !== undefined ? matchAnalysis : existing.matchAnalysis,
      updatedAt: now,
    };

    if (isConfigured) {
      try {
        const dbPayload: any = {
          updated_at: now,
        };
        if (updates.title !== undefined) dbPayload.title = updates.title;
        if (updates.company !== undefined) dbPayload.company = updates.company;
        if (updates.location !== undefined) dbPayload.location = updates.location;
        if (updates.employmentType !== undefined) dbPayload.employment_type = updates.employmentType;
        if (updates.jobUrl !== undefined) dbPayload.job_url = updates.jobUrl;
        if (updates.jobDescription !== undefined) dbPayload.job_description = updates.jobDescription;
        if (updates.status !== undefined) dbPayload.status = updates.status;
        if (updates.appliedDate !== undefined) dbPayload.applied_date = updates.appliedDate;
        if (updates.nextActionDate !== undefined) dbPayload.next_action_date = updates.nextActionDate;
        if (updates.notes !== undefined) dbPayload.notes = updates.notes;
        if (updates.resumeId !== undefined) dbPayload.resume_id = updates.resumeId;
        if (matchAnalysis !== undefined) dbPayload.match_analysis = matchAnalysis;

        await dbJobs()
          .update(dbPayload)
          .eq('id', jobId)
          .eq('user_id', userId);
      } catch (err) {
        console.warn('[JobService] Supabase update error:', err);
      }
    }

    if (existingIndex !== -1) {
      current[existingIndex] = updated;
      saveLocalJobs(userId, current);
    } else {
      saveLocalJobs(userId, [updated, ...current]);
    }

    return updated;
  }

  /**
   * Delete a job
   */
  static async deleteJob(jobId: string, userId: string): Promise<boolean> {
    const { isConfigured } = getSupabaseEnv();

    if (isConfigured) {
      try {
        await dbJobs()
          .delete()
          .eq('id', jobId)
          .eq('user_id', userId);
      } catch (err) {
        console.warn('[JobService] Supabase delete error:', err);
      }
    }

    const current = getLocalJobs(userId);
    const filtered = current.filter((j) => j.id !== jobId);
    saveLocalJobs(userId, filtered);

    return true;
  }
}
