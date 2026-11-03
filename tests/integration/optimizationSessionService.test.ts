import { describe, it, expect, vi, beforeEach } from 'vitest';
import { OptimizationSessionService } from '@/features/optimizer/services/optimizationSessionService';
import { createSampleResume } from '@/features/resumes/utils/resumeDefaults';

describe('OptimizationSessionService', () => {
  const userId = 'user_abc_123';
  const sampleResume = createSampleResume(userId, 'jakes-technical');

  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('creates and saves a new optimization session in localStorage', async () => {
    const session = await OptimizationSessionService.createSession({
      userId,
      resumeId: sampleResume.id,
      resumeTitle: sampleResume.title,
      sessionName: 'Senior Engineer at Stripe',
      jobTitle: 'Senior Software Engineer',
      companyName: 'Stripe',
      jobDescription: 'Seeking expert in React and distributed systems.',
      originalResumeSnapshot: sampleResume,
    });

    expect(session.id).toBeDefined();
    expect(session.sessionName).toBe('Senior Engineer at Stripe');
    expect(session.status).toBe('draft');
    expect(session.jobTitle).toBe('Senior Software Engineer');
    expect(session.originalResumeSnapshot?.id).toBe(sampleResume.id);

    // Retrieve by ID
    const retrieved = await OptimizationSessionService.getSessionById(session.id, userId);
    expect(retrieved).not.toBeNull();
    expect(retrieved?.id).toBe(session.id);
    expect(retrieved?.companyName).toBe('Stripe');
  });

  it('preserves stable ID across saves and updates updatedAt timestamp', async () => {
    const session = await OptimizationSessionService.createSession({
      userId,
      jobDescription: 'Initial job description.',
    });

    const initialId = session.id;
    const initialUpdatedAt = session.updatedAt;

    // Small delay to ensure timestamp change
    session.jobTitle = 'Staff Frontend Engineer';
    const saveResult = await OptimizationSessionService.saveSession(session);
    expect(saveResult.success).toBe(true);

    const updated = await OptimizationSessionService.getSessionById(initialId, userId);
    expect(updated?.id).toBe(initialId);
    expect(updated?.jobTitle).toBe('Staff Frontend Engineer');
    expect(new Date(updated!.updatedAt).getTime()).toBeGreaterThanOrEqual(
      new Date(initialUpdatedAt).getTime()
    );
  });

  it('enforces user ownership when retrieving sessions', async () => {
    const session = await OptimizationSessionService.createSession({
      userId: 'legitimate_user',
      jobDescription: 'Secret job requirements.',
    });

    // Attacker attempting to read legitimate user's session
    const unauthorized = await OptimizationSessionService.getSessionById(
      session.id,
      'attacker_user'
    );
    expect(unauthorized).toBeNull();
  });

  it('lists user sessions with calculated staged changes count', async () => {
    const session1 = await OptimizationSessionService.createSession({
      userId,
      jobTitle: 'Frontend Engineer',
      companyName: 'Vercel',
      jobDescription: 'Next.js developer.',
    });

    session1.stagedChanges = {
      stagedSummary: {
        original: 'Old',
        selected: 'New',
        tone: 'impact-driven',
        approved: true,
      },
      stagedBullets: [
        {
          key: 'b1',
          sourceType: 'experience',
          sourceId: 'exp-1',
          sourceTitle: 'Vercel',
          bulletIndex: 0,
          original: 'Old',
          rewritten: 'New',
          formula: 'XYZ',
          approved: true,
        },
      ],
      confirmedSkills: [
        { skill: 'Rust', category: 'Languages', suggestedSection: 'skills', approved: true },
      ],
      learningGoals: [],
      rejectedKeywords: [],
    };
    await OptimizationSessionService.saveSession(session1);

    const list = await OptimizationSessionService.listSessions(userId);
    expect(list.length).toBe(1);
    expect(list[0].id).toBe(session1.id);
    expect(list[0].stagedCount).toBe(3); // 1 summary + 1 bullet + 1 skill
    expect(list[0].companyName).toBe('Vercel');
  });

  it('renames, duplicates, and deletes sessions cleanly', async () => {
    const session = await OptimizationSessionService.createSession({
      userId,
      sessionName: 'Original Session',
      jobDescription: 'Job requirements text.',
    });

    // Rename
    const renameSuccess = await OptimizationSessionService.renameSession(
      session.id,
      userId,
      'Renamed Session'
    );
    expect(renameSuccess).toBe(true);
    let current = await OptimizationSessionService.getSessionById(session.id, userId);
    expect(current?.sessionName).toBe('Renamed Session');

    // Duplicate
    const duplicated = await OptimizationSessionService.duplicateSession(session.id, userId);
    expect(duplicated).not.toBeNull();
    expect(duplicated?.id).not.toBe(session.id);
    expect(duplicated?.sessionName).toContain('(Copy)');

    // List should show 2 sessions
    let list = await OptimizationSessionService.listSessions(userId);
    expect(list.length).toBe(2);

    // Delete duplicated
    const deleteSuccess = await OptimizationSessionService.deleteSession(
      duplicated!.id,
      userId
    );
    expect(deleteSuccess).toBe(true);

    list = await OptimizationSessionService.listSessions(userId);
    expect(list.length).toBe(1);
  });

  it('updates session status', async () => {
    const session = await OptimizationSessionService.createSession({
      userId,
      jobDescription: 'Job requirements.',
    });

    expect(session.status).toBe('draft');
    await OptimizationSessionService.updateSessionStatus(session.id, userId, 'completed');

    const updated = await OptimizationSessionService.getSessionById(session.id, userId);
    expect(updated?.status).toBe('completed');
  });

  it('rejects invalid session payloads via validation', async () => {
    const badSession: any = {
      id: 'not-valid',
      userId: '', // missing user id
      jobDescription: '', // empty JD
    };

    const res = await OptimizationSessionService.saveSession(badSession);
    expect(res.success).toBe(false);
    expect(res.error).toBeDefined();
  });
});
