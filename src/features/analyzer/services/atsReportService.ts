import { supabase } from '@/lib/supabase/client';
import { getSupabaseEnv } from '@/lib/supabase/env';
import type { AtsReport } from '../types/analyzer.types';

const STORAGE_PREFIX = 'resumax_ats_reports_';

function getStorageKey(userId: string): string {
  return `${STORAGE_PREFIX}${userId || 'anonymous'}`;
}

function getLocalReports(userId: string): AtsReport[] {
  try {
    const raw = localStorage.getItem(getStorageKey(userId));
    if (!raw) return [];
    return JSON.parse(raw) as AtsReport[];
  } catch (err) {
    console.error('Failed to read ATS reports from localStorage:', err);
    return [];
  }
}

function setLocalReports(userId: string, reports: AtsReport[]): void {
  try {
    localStorage.setItem(getStorageKey(userId), JSON.stringify(reports));
  } catch (err) {
    console.error('Failed to write ATS reports to localStorage:', err);
  }
}

export class AtsReportService {
  /**
   * Check whether remote Supabase persistence is active
   */
  static isRemoteConfigured(): boolean {
    const env = getSupabaseEnv();
    return env.isConfigured;
  }

  /**
   * Save an ATS analysis report
   */
  static async saveReport(report: AtsReport): Promise<{
    success: boolean;
    isRemote: boolean;
    error?: string;
  }> {
    // 1. Always update local storage cache for offline reliability
    const local = getLocalReports(report.userId);
    const existingIndex = local.findIndex((r) => r.id === report.id);
    if (existingIndex >= 0) {
      local[existingIndex] = report;
    } else {
      local.unshift(report);
    }
    setLocalReports(report.userId, local);

    // 2. Synchronize to Supabase if configured
    if (this.isRemoteConfigured()) {
      try {
        const { error } = await (supabase as any).from('ats_reports').upsert(
          {
            id: report.id,
            user_id: report.userId,
            resume_id: report.resumeId || null,
            resume_title: report.resumeTitle || null,
            file_name: report.fileName || null,
            job_title: report.jobTitle || null,
            company_name: report.companyName || null,
            job_description: report.jobDescription,
            overall_score: report.scores.overallScore,
            keyword_score: report.scores.keywordScore,
            skills_score: report.scores.skillsScore,
            section_score: report.scores.sectionScore,
            formatting_score: report.scores.formattingScore,
            scores: report.scores as any,
            matched_keywords: report.matchedKeywords as any,
            missing_keywords: report.missingKeywords as any,
            sections: report.sections as any,
            formatting: report.formatting as any,
            recommendations: report.recommendations as any,
            word_count: report.wordCount,
            created_at: report.createdAt,
            updated_at: new Date().toISOString(),
          },
          { onConflict: 'id' }
        );

        if (error) {
          console.warn('Supabase ats_reports table write error:', error.message);
          return { success: true, isRemote: false, error: error.message };
        }

        return { success: true, isRemote: true };
      } catch (err: unknown) {
        const message = err instanceof Error ? err.message : String(err);
        console.warn('Remote sync to ats_reports encountered an issue; cached locally:', message);
        return { success: true, isRemote: false, error: message };
      }
    }

    return { success: true, isRemote: false };
  }

  /**
   * List all ATS reports for a user
   */
  static async listReports(userId: string): Promise<AtsReport[]> {
    if (this.isRemoteConfigured()) {
      try {
        const { data, error } = await (supabase as any)
          .from('ats_reports')
          .select('*')
          .eq('user_id', userId)
          .order('created_at', { ascending: false });

        if (!error && data && data.length > 0) {
          return data.map((d: any) => ({
            id: d.id,
            userId: d.user_id,
            resumeId: d.resume_id || undefined,
            resumeTitle: d.resume_title || undefined,
            fileName: d.file_name || undefined,
            jobTitle: d.job_title || undefined,
            companyName: d.company_name || undefined,
            jobDescription: d.job_description,
            createdAt: d.created_at,
            scores: d.scores,
            matchedKeywords: d.matched_keywords || [],
            missingKeywords: d.missing_keywords || [],
            allDetectedKeywords: [...(d.matched_keywords || []), ...(d.missing_keywords || [])],
            sections: d.sections || [],
            formatting: d.formatting || [],
            recommendations: d.recommendations || [],
            wordCount: d.word_count || 0,
            actionVerbCount: 0,
            metricCount: 0,
          }));
        }
      } catch (remoteError) {
        console.warn('Remote ATS report fetch failed; falling back to local storage:', remoteError);
      }
    }

    return getLocalReports(userId);
  }

  /**
   * Delete an ATS report
   */
  static async deleteReport(id: string, userId: string): Promise<boolean> {
    const local = getLocalReports(userId);
    setLocalReports(userId, local.filter((r) => r.id !== id));

    if (this.isRemoteConfigured()) {
      try {
        await (supabase as any)
          .from('ats_reports')
          .delete()
          .eq('id', id)
          .eq('user_id', userId);
      } catch (err) {
        console.warn('Remote ATS report deletion failed:', err);
      }
    }

    return true;
  }
}
