import { describe, it, expect, beforeEach, vi } from 'vitest';
import { validatePdfFile, convertResumeDataToText } from '@/features/analyzer/services/textExtractor';
import { AtsReportService } from '@/features/analyzer/services/atsReportService';
import { createSampleResume } from '@/features/resumes/utils/resumeDefaults';
import type { AtsReport } from '@/features/analyzer/types/analyzer.types';

describe('ATS Text Extractor & Report Persistence Services', () => {
  const userId = 'ats_audit_user_890';

  beforeEach(() => {
    localStorage.clear();
    vi.spyOn(AtsReportService, 'isRemoteConfigured').mockReturnValue(false);
  });

  describe('validatePdfFile', () => {
    it('approves valid PDF file', () => {
      const file = new File(['%PDF-1.4 sample content'], 'my_resume.pdf', { type: 'application/pdf' });
      const result = validatePdfFile(file);
      expect(result.valid).toBe(true);
      expect(result.error).toBeUndefined();
    });

    it('rejects non-PDF files', () => {
      const file = new File(['text content'], 'resume.docx', { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
      const result = validatePdfFile(file);
      expect(result.valid).toBe(false);
      expect(result.error).toMatch(/only pdf documents/i);
    });

    it('rejects empty 0-byte files', () => {
      const emptyFile = new File([], 'empty.pdf', { type: 'application/pdf' });
      const result = validatePdfFile(emptyFile);
      expect(result.valid).toBe(false);
      expect(result.error).toMatch(/empty/i);
    });

    it('rejects files exceeding 10MB', () => {
      // Create a mock large file
      const largeFile = {
        name: 'huge.pdf',
        type: 'application/pdf',
        size: 15 * 1024 * 1024, // 15MB
      } as File;

      const result = validatePdfFile(largeFile);
      expect(result.valid).toBe(false);
      expect(result.error).toMatch(/exceeds maximum allowed limit/i);
    });
  });

  describe('convertResumeDataToText', () => {
    it('converts structured ResumeData into delimited sections with contact and skills', () => {
      const resume = createSampleResume(userId, 'jakes-technical');
      const text = convertResumeDataToText(resume);

      expect(text).toContain('=== CONTACT INFORMATION ===');
      expect(text).toContain(resume.personalInfo.fullName);
      expect(text).toContain(resume.personalInfo.email);
      expect(text).toContain('=== WORK EXPERIENCE ===');
      expect(text).toContain('=== EDUCATION ===');
      expect(text).toContain('=== TECHNICAL SKILLS ===');
      expect(text).toContain('=== PROJECTS ===');
    });
  });

  describe('AtsReportService (Local Fallback Persistence)', () => {
    const mockReport: AtsReport = {
      id: 'report_123',
      userId,
      resumeTitle: 'Senior SWE 2026',
      jobTitle: 'Principal Architect',
      jobDescription: 'Build systems at scale',
      createdAt: new Date().toISOString(),
      scores: {
        overallScore: 88,
        keywordScore: 90,
        skillsScore: 85,
        sectionScore: 100,
        formattingScore: 80,
        scoreGrade: 'Excellent',
        explanation: 'Score explanation',
      },
      matchedKeywords: [],
      missingKeywords: [],
      allDetectedKeywords: [],
      sections: [],
      formatting: [],
      recommendations: [],
      wordCount: 520,
      actionVerbCount: 12,
      metricCount: 6,
    };

    it('saves and lists reports in local cache when remote is not configured', async () => {
      const listBefore = await AtsReportService.listReports(userId);
      expect(listBefore).toHaveLength(0);

      const saveResult = await AtsReportService.saveReport(mockReport);
      expect(saveResult.success).toBe(true);
      expect(saveResult.isRemote).toBe(false);

      const listAfter = await AtsReportService.listReports(userId);
      expect(listAfter).toHaveLength(1);
      expect(listAfter[0].id).toBe('report_123');
      expect(listAfter[0].scores.overallScore).toBe(88);
    });

    it('deletes report from storage', async () => {
      await AtsReportService.saveReport(mockReport);
      const list = await AtsReportService.listReports(userId);
      expect(list).toHaveLength(1);

      await AtsReportService.deleteReport('report_123', userId);
      const afterDelete = await AtsReportService.listReports(userId);
      expect(afterDelete).toHaveLength(0);
    });
  });
});
