import { describe, it, expect, beforeEach } from 'vitest';
import { CoverLetterService } from '@/features/cover-letter/services/coverLetterService';

describe('CoverLetterService — Draft Persistence & Legacy Migration', () => {
  const userId = 'user_cl_test';

  beforeEach(() => {
    localStorage.clear();
  });

  it('saves and retrieves cover letter drafts with timestamps and metadata', () => {
    const saved = CoverLetterService.saveDraft(userId, {
      title: 'Stripe — Senior Backend Engineer',
      jobTitle: 'Senior Backend Engineer',
      companyName: 'Stripe',
      tone: 'confident',
      content: 'Dear Hiring Team,\n\nI am thrilled to apply...',
      subjectLine: 'Application for Senior Backend Engineer',
    });

    expect(saved.id).toBeDefined();
    expect(saved.userId).toBe(userId);
    expect(saved.title).toBe('Stripe — Senior Backend Engineer');
    expect(saved.updatedAt).toBeDefined();

    const drafts = CoverLetterService.getDrafts(userId);
    expect(drafts).toHaveLength(1);
    expect(drafts[0].companyName).toBe('Stripe');
  });

  it('updates existing draft when id is provided', () => {
    const initial = CoverLetterService.saveDraft(userId, {
      title: 'Google — Cloud Engineer',
      jobTitle: 'Cloud Engineer',
      companyName: 'Google',
      content: 'Initial content',
    });

    const updated = CoverLetterService.saveDraft(userId, {
      id: initial.id,
      title: 'Google — Cloud Engineer (Final Draft)',
      jobTitle: 'Cloud Engineer',
      companyName: 'Google',
      content: 'Updated and edited content with new accomplishments',
    });

    expect(updated.id).toBe(initial.id);
    expect(updated.title).toBe('Google — Cloud Engineer (Final Draft)');
    expect(updated.content).toContain('Updated and edited content');

    const drafts = CoverLetterService.getDrafts(userId);
    expect(drafts).toHaveLength(1);
  });

  it('deletes draft by id cleanly', () => {
    const d1 = CoverLetterService.saveDraft(userId, {
      jobTitle: 'Engineer 1',
      companyName: 'Company 1',
      content: 'Content 1',
    });
    const d2 = CoverLetterService.saveDraft(userId, {
      jobTitle: 'Engineer 2',
      companyName: 'Company 2',
      content: 'Content 2',
    });

    expect(CoverLetterService.getDrafts(userId)).toHaveLength(2);

    const deleted = CoverLetterService.deleteDraft(userId, d1.id);
    expect(deleted).toBe(true);

    const remaining = CoverLetterService.getDrafts(userId);
    expect(remaining).toHaveLength(1);
    expect(remaining[0].id).toBe(d2.id);
  });

  it('automatically preserves and migrates legacy optimizer cover letters without data loss', () => {
    // Simulate legacy optimizer session in localStorage
    const legacySession = {
      id: 'legacy-opt-session-123',
      user_id: userId,
      company_name: 'Netflix',
      job_title: 'Distributed Systems Engineer',
      cover_letter: {
        editedCoverLetter: 'Dear Netflix Team,\n\nI have extensive experience in high-concurrency streaming architectures...',
        additionalCoverLetterContext: 'Referred by alumni',
        coverLetterResult: {
          subjectLine: 'Application for Distributed Systems Engineer — Alex',
          usedResumeEvidence: ['Golang', 'Kubernetes'],
          isDeterministic: true,
        },
      },
      updated_at: '2026-11-01T10:00:00.000Z',
    };

    localStorage.setItem(`resumax_opt_sessions_${userId}`, JSON.stringify([legacySession]));

    const drafts = CoverLetterService.getDrafts(userId);
    expect(drafts.length).toBeGreaterThanOrEqual(1);
    const netflixDraft = drafts.find((d) => d.companyName === 'Netflix');
    expect(netflixDraft).toBeDefined();
    expect(netflixDraft?.content).toContain('high-concurrency streaming architectures');
    expect(netflixDraft?.jobTitle).toBe('Distributed Systems Engineer');
  });
});
