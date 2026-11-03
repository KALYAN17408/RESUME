import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useOptimizer } from '@/features/optimizer/hooks/useOptimizer';
import { ResumeService } from '@/features/resumes/services/resumeService';
import { createSampleResume } from '@/features/resumes/utils/resumeDefaults';
import type { ResumeData } from '@/features/resumes/types/resume.types';

describe('Optimizer Apply Changes & Snapshot-First Persistence', () => {
  let sampleResume: ResumeData;

  beforeEach(() => {
    vi.restoreAllMocks();
    sampleResume = createSampleResume('user_456', 'jakes-technical');
    sampleResume.id = 'res-test-123';
    sampleResume.personalInfo.summary = 'Original plain summary.';
    sampleResume.experiences = [
      {
        id: 'exp-1',
        jobTitle: 'Software Engineer',
        company: 'Vercel',
        location: 'Remote',
        startDate: '2022-01',
        endDate: 'Present',
        current: true,
        highlights: ['Built serverless edge rendering system.'],
      },
    ];
    sampleResume.skillCategories = [
      {
        id: 'cat-1',
        name: 'Languages',
        skills: ['TypeScript', 'JavaScript'],
      },
    ];

    // Mock ResumeService methods
    vi.spyOn(ResumeService, 'getResume').mockResolvedValue(sampleResume);
    vi.spyOn(ResumeService, 'createSnapshot').mockResolvedValue({
      success: true,
      versionNumber: 2,
      versionId: 'snap-123',
    });
    vi.spyOn(ResumeService, 'saveResume').mockResolvedValue({
      success: true,
      isRemote: true,
    });
  });

  it('creates version snapshot before persisting and applies approved modifications', async () => {
    const { result } = renderHook(() => useOptimizer());

    // Select resume
    act(() => {
      result.current.selectResume(sampleResume);
    });

    // Stage summary
    act(() => {
      result.current.stageSummary(
        'Engineered high-performance web applications using modern cloud microservices.',
        'technical-focus'
      );
    });

    // Stage bullet
    act(() => {
      result.current.stageBullet({
        sourceType: 'experience',
        sourceId: 'exp-1',
        sourceTitle: 'Software Engineer at Vercel',
        bulletIndex: 0,
        original: 'Built serverless edge rendering system.',
        rewritten:
          'Architected serverless edge rendering system reducing cold starts by 40% using Edge Functions.',
        formula: 'XYZ',
      });
    });

    // Stage confirmed skill
    act(() => {
      result.current.stageConfirmedSkill('Rust', 'Languages', 'skills');
    });

    // Stage cover letter (must remain separate and untouched)
    act(() => {
      result.current.setEditedCoverLetter('Dear Team, exciting to apply...');
      result.current.setJobTitle('Staff Engineer');
      result.current.setCompanyName('Vercel');
    });

    act(() => {
      result.current.stageCoverLetter();
    });

    expect(result.current.totalStagedCount).toBe(4);
    expect(result.current.stagedResumeChangesCount).toBe(3);

    // Apply approved changes
    let mergeRes: any;
    await act(async () => {
      mergeRes = await result.current.applyApprovedChanges(
        {
          summary: {
            original: 'Original plain summary.',
            selected: 'Engineered high-performance web applications using modern cloud microservices.',
            tone: 'technical-focus',
          },
          bullets: [
            {
              key: 'experience_exp-1_0',
              sourceType: 'experience',
              sourceId: 'exp-1',
              sourceTitle: 'Software Engineer at Vercel',
              bulletIndex: 0,
              original: 'Built serverless edge rendering system.',
              rewritten: 'Architected serverless edge rendering system reducing cold starts by 40% using Edge Functions.',
            },
          ],
          skills: [{ skill: 'Rust', category: 'Languages', suggestedSection: 'skills' }],
        },
        'user_456'
      );
    });

    // Assert Snapshot was created FIRST
    expect(ResumeService.createSnapshot).toHaveBeenCalledTimes(1);
    expect(ResumeService.saveResume).toHaveBeenCalledTimes(1);

    // Verify updated content in memory
    expect(mergeRes.appliedCount).toBe(3);
    expect(result.current.selectedResume?.personalInfo.summary).toBe(
      'Engineered high-performance web applications using modern cloud microservices.'
    );
    expect(result.current.selectedResume?.experiences[0].highlights[0]).toBe(
      'Architected serverless edge rendering system reducing cold starts by 40% using Edge Functions.'
    );
    expect(
      result.current.selectedResume?.skillCategories[0].skills
    ).toContain('Rust');

    // Applied items are cleared from staging
    expect(result.current.stagedSummary).toBeNull();
    expect(result.current.stagedBullets.length).toBe(0);
    expect(result.current.confirmedSkills.length).toBe(0);

    // Cover letter remains staged and untouched!
    expect(result.current.stagedCoverLetter).not.toBeNull();
    expect(result.current.stagedCoverLetter?.companyName).toBe('Vercel');
  });

  it('aborts update and does not mutate resume if snapshot creation fails', async () => {
    vi.spyOn(ResumeService, 'createSnapshot').mockResolvedValue({
      success: false,
      error: 'Supabase snapshot table locked or unavailable',
    });

    const { result } = renderHook(() => useOptimizer());

    act(() => {
      result.current.selectResume(sampleResume);
    });
    act(() => {
      result.current.stageSummary('New summary.', 'executive');
    });

    let thrownError: any;
    await act(async () => {
      try {
        await result.current.applyApprovedChanges(
          {
            summary: { original: 'Old', selected: 'New summary.', tone: 'executive' },
          },
          'user_456'
        );
      } catch (err) {
        thrownError = err;
      }
    });

    expect(thrownError).toBeDefined();
    expect(thrownError.message).toMatch(/Failed to create resume version snapshot/i);

    // Save should NOT have been called
    expect(ResumeService.saveResume).not.toHaveBeenCalled();
    // Staged summary remains untouched
    expect(result.current.stagedSummary).not.toBeNull();
  });

  it('enforces authenticated user ownership checks', async () => {
    const { result } = renderHook(() => useOptimizer());

    act(() => {
      result.current.selectResume(sampleResume);
    });
    act(() => {
      result.current.stageSummary('New summary.', 'executive');
    });

    // Different user ID attempting to modify resume
    let thrownError: any;
    await act(async () => {
      try {
        await result.current.applyApprovedChanges(
          {
            summary: { original: 'Old', selected: 'New summary.', tone: 'executive' },
          },
          'malicious_attacker_789'
        );
      } catch (err) {
        thrownError = err;
      }
    });

    expect(thrownError).toBeDefined();
    expect(thrownError.message).toMatch(/Unauthorized: Resume does not belong to the active user/i);

    expect(ResumeService.createSnapshot).not.toHaveBeenCalled();
    expect(ResumeService.saveResume).not.toHaveBeenCalled();
  });

  it('rejects stale or missing resume on storage lookup', async () => {
    vi.spyOn(ResumeService, 'getResume').mockResolvedValue(null);

    const { result } = renderHook(() => useOptimizer());

    act(() => {
      result.current.selectResume(sampleResume);
    });
    act(() => {
      result.current.stageSummary('New summary.', 'executive');
    });

    let thrownError: any;
    await act(async () => {
      try {
        await result.current.applyApprovedChanges(
          {
            summary: { original: 'Old', selected: 'New summary.', tone: 'executive' },
          },
          'user_456'
        );
      } catch (err) {
        thrownError = err;
      }
    });

    expect(thrownError).toBeDefined();
    expect(thrownError.message).toMatch(/Selected resume could not be retrieved from storage/i);

    expect(ResumeService.createSnapshot).not.toHaveBeenCalled();
    expect(ResumeService.saveResume).not.toHaveBeenCalled();
  });
});
