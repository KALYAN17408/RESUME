import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useOptimizer } from '@/features/optimizer/hooks/useOptimizer';
import { OptimizationSessionService } from '@/features/optimizer/services/optimizationSessionService';
import { ResumeService } from '@/features/resumes/services/resumeService';
import { createSampleResume } from '@/features/resumes/utils/resumeDefaults';
import type { ResumeData } from '@/features/resumes/types/resume.types';
import type { OptimizationSession } from '@/features/optimizer/types/optimizer.types';

describe('Optimizer Session Persistence & Restoration Safety', () => {
  let sampleResume: ResumeData;

  beforeEach(() => {
    vi.restoreAllMocks();
    sampleResume = createSampleResume('user_persist', 'jakes-technical');
    sampleResume.id = 'res-persist-100';
    sampleResume.updatedAt = '2026-11-01T12:00:00Z';
    sampleResume.personalInfo.summary = 'Initial engineering summary.';
  });

  it('saves current session with all staged items, summaries, bullets, and cover letter', async () => {
    const saveSessionSpy = vi.spyOn(OptimizationSessionService, 'saveSession').mockResolvedValue({
      success: true,
      isRemote: false,
    });

    const { result } = renderHook(() => useOptimizer({ userId: 'user_persist' }));

    act(() => {
      result.current.selectResume(sampleResume);
    });

    act(() => {
      result.current.setJobTitle('Senior Architect');
      result.current.setCompanyName('Stripe');
      result.current.setJobDescription('Design payment systems with high reliability.');
      result.current.stageSummary('Architected resilient distributed payments infrastructure.');
      result.current.stageConfirmedSkill('PostgreSQL', 'Databases & Cloud', 'skills');
    });

    let saveResult: any;
    await act(async () => {
      saveResult = await result.current.saveCurrentSession('user_persist');
    });

    expect(saveResult.success).toBe(true);
    expect(saveSessionSpy).toHaveBeenCalledTimes(1);

    const savedPayload = saveSessionSpy.mock.calls[0][0];
    expect(savedPayload.userId).toBe('user_persist');
    expect(savedPayload.resumeId).toBe('res-persist-100');
    expect(savedPayload.jobTitle).toBe('Senior Architect');
    expect(savedPayload.companyName).toBe('Stripe');
    expect(savedPayload.stagedChanges.stagedSummary?.selected).toBe('Architected resilient distributed payments infrastructure.');
    expect(savedPayload.stagedChanges.confirmedSkills).toHaveLength(1);
    expect(savedPayload.stagedChanges.confirmedSkills[0].skill).toBe('PostgreSQL');

    expect(result.current.saveStatus).toBe('saved');
    expect(result.current.currentSessionId).toBeTruthy();
  });

  it('restores all session state without mutating or saving ResumeData', async () => {
    const resumeSaveSpy = vi.spyOn(ResumeService, 'saveResume');

    const mockSavedSession: OptimizationSession = {
      id: 'session-restored-999',
      userId: 'user_persist',
      resumeId: sampleResume.id,
      resumeTitle: sampleResume.title,
      sessionName: 'Restored Cloud Architect Session',
      jobTitle: 'Cloud Architect',
      companyName: 'AWS',
      jobDescription: 'Architecting large-scale serverless systems.',
      resumeVersionId: sampleResume.id,
      originalResumeSnapshot: sampleResume,
      optimizationResults: {
        summaryResult: {
          originalSummary: 'Initial engineering summary.',
          alternatives: [
            {
              id: 'alt-1',
              text: 'Summary option A',
              tone: 'executive',
              keywordsUsed: ['AWS', 'Serverless'],
              rationale: 'Strong leadership focus.',
              requiresConfirmation: false,
              suggestedPlaceholders: [],
            },
          ],
          provider: 'deterministic',
          isDeterministic: true,
          processingTimeMs: 120,
        },
        bulletResults: {},
        keywordResult: null,
      },
      stagedChanges: {
        stagedSummary: {
          original: 'Initial engineering summary.',
          selected: 'Summary option A',
          tone: 'executive',
          approved: true,
        },
        stagedBullets: [
          {
            key: 'exp_exp-1_0',
            sourceType: 'experience',
            sourceId: 'exp-1',
            sourceTitle: 'Software Engineer',
            bulletIndex: 0,
            original: 'Built APIs.',
            rewritten: 'Engineered high-throughput GraphQL APIs reducing latency by 45%.',
            formula: 'XYZ',
            approved: true,
          },
        ],
        confirmedSkills: [
          {
            skill: 'Terraform',
            category: 'Tools & DevOps',
            suggestedSection: 'skills',
            approved: true,
          },
        ],
        learningGoals: ['Docker'],
        rejectedKeywords: ['Fortran'],
      },
      coverLetter: {
        coverLetterResult: null,
        editedCoverLetter: 'Dear AWS Team,\n\nI am thrilled to apply...',
        hiringManagerName: 'Jane Smith',
        additionalCoverLetterContext: '10 years cloud experience.',
        stagedCoverLetter: {
          content: 'Dear AWS Team,\n\nI am thrilled to apply...',
          subjectLine: 'Application for Cloud Architect — Candidate',
          companyName: 'AWS',
          jobTitle: 'Cloud Architect',
          hiringManagerName: 'Jane Smith',
          approved: true,
        },
      },
      status: 'in_progress',
      createdAt: '2026-11-01T10:00:00Z',
      updatedAt: '2026-11-02T15:00:00Z',
      lastOpenedAt: '2026-11-02T15:00:00Z',
    };

    const { result } = renderHook(() => useOptimizer({ userId: 'user_persist' }));

    // Load the session
    act(() => {
      result.current.loadSession(mockSavedSession, sampleResume);
    });

    // Check that state was faithfully restored
    expect(result.current.currentSessionId).toBe('session-restored-999');
    expect(result.current.sessionName).toBe('Restored Cloud Architect Session');
    expect(result.current.jobTitle).toBe('Cloud Architect');
    expect(result.current.companyName).toBe('AWS');
    expect(result.current.jobDescription).toBe('Architecting large-scale serverless systems.');

    // Staged items restored
    expect(result.current.stagedSummary?.selected).toBe('Summary option A');
    expect(result.current.stagedBullets).toHaveLength(1);
    expect(result.current.stagedBullets[0].rewritten).toContain('Engineered high-throughput GraphQL APIs');
    expect(result.current.confirmedSkills).toHaveLength(1);
    expect(result.current.confirmedSkills[0].skill).toBe('Terraform');

    // Independent cover letter restored
    expect(result.current.stagedCoverLetter?.companyName).toBe('AWS');
    expect(result.current.editedCoverLetter).toContain('Dear AWS Team');

    // Total staged count
    expect(result.current.totalStagedCount).toBe(4); // summary + bullet + skill + cover letter

    // CRITICAL: ResumeService.saveResume must NEVER have been called during session restore
    expect(resumeSaveSpy).not.toHaveBeenCalled();
    // Resume summary should remain untouched in active resume until user reviews and merges
    expect(result.current.selectedResume?.personalInfo.summary).toBe('Initial engineering summary.');
  });

  it('detects stale resume version when underlying resume was modified elsewhere', () => {
    const originalSnapshot: ResumeData = {
      ...sampleResume,
      updatedAt: '2026-11-01T10:00:00Z',
    };

    const modifiedFreshResume: ResumeData = {
      ...sampleResume,
      updatedAt: '2026-11-03T18:00:00Z', // Modified later in Resume Builder
      personalInfo: {
        ...sampleResume.personalInfo,
        summary: 'Newly updated summary from Resume Builder.',
      },
    };

    const sessionWithOlderSnapshot: OptimizationSession = {
      id: 'session-stale-test',
      userId: 'user_persist',
      resumeId: sampleResume.id,
      sessionName: 'Old Session',
      jobTitle: 'Developer',
      companyName: 'Acme',
      jobDescription: 'Job description text.',
      resumeVersionId: sampleResume.id,
      originalResumeSnapshot: originalSnapshot,
      optimizationResults: {
        summaryResult: null,
        bulletResults: {},
        keywordResult: null,
      },
      stagedChanges: {
        stagedSummary: null,
        stagedBullets: [],
        confirmedSkills: [],
        learningGoals: [],
        rejectedKeywords: [],
      },
      coverLetter: {
        coverLetterResult: null,
        editedCoverLetter: '',
        hiringManagerName: '',
        additionalCoverLetterContext: '',
        stagedCoverLetter: null,
      },
      status: 'in_progress',
      createdAt: '2026-11-01T10:00:00Z',
      updatedAt: '2026-11-01T10:30:00Z',
      lastOpenedAt: '2026-11-01T10:30:00Z',
    };

    const { result } = renderHook(() => useOptimizer({ userId: 'user_persist' }));

    act(() => {
      result.current.loadSession(sessionWithOlderSnapshot, modifiedFreshResume);
    });

    // Expect stale resume version warning flag to be set
    expect(result.current.isStaleResumeVersion).toBe(true);

    // User can dismiss warning
    act(() => {
      result.current.dismissStaleResumeWarning();
    });

    expect(result.current.isStaleResumeVersion).toBe(false);
  });
});
