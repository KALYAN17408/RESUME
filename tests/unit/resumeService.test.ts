import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ResumeService } from '@/features/resumes/services/resumeService';

describe('ResumeService', () => {
  const testUserId = 'test_user_unit';

  beforeEach(() => {
    localStorage.clear();
    vi.spyOn(ResumeService, 'isRemoteConfigured').mockReturnValue(false);
  });

  it('creates and lists resumes', async () => {
    const listBefore = await ResumeService.listResumes(testUserId);
    expect(listBefore).toHaveLength(0);

    const created = await ResumeService.createResume(testUserId, 'Engineering Resume 2026', 'jakes-technical');
    expect(created.id).toBeTruthy();
    expect(created.title).toBe('Engineering Resume 2026');

    const listAfter = await ResumeService.listResumes(testUserId);
    expect(listAfter).toHaveLength(1);
    expect(listAfter[0].id).toBe(created.id);
    expect(listAfter[0].title).toBe('Engineering Resume 2026');
  });

  it('gets a single resume by ID', async () => {
    const created = await ResumeService.createResume(testUserId, 'Harvard Resume', 'harvard-classic');
    const fetched = await ResumeService.getResume(created.id, testUserId);

    expect(fetched).not.toBeNull();
    expect(fetched?.id).toBe(created.id);
    expect(fetched?.templateId).toBe('harvard-classic');
  });

  it('updates and saves resume modifications', async () => {
    const created = await ResumeService.createResume(testUserId, 'Draft', 'jakes-technical');
    created.personalInfo.fullName = 'Jane Doe';
    created.personalInfo.email = 'jane@example.com';

    const saveResult = await ResumeService.saveResume(created);
    expect(saveResult.success).toBe(true);

    const refetched = await ResumeService.getResume(created.id, testUserId);
    expect(refetched?.personalInfo.fullName).toBe('Jane Doe');
    expect(refetched?.personalInfo.email).toBe('jane@example.com');
  });

  it('renames a resume', async () => {
    const created = await ResumeService.createResume(testUserId, 'Old Title', 'jakes-technical');
    const renamed = await ResumeService.renameResume(created.id, testUserId, 'New Better Title');
    expect(renamed).toBe(true);

    const refetched = await ResumeService.getResume(created.id, testUserId);
    expect(refetched?.title).toBe('New Better Title');
  });

  it('duplicates a resume with all nested sections and new IDs', async () => {
    const sample = await ResumeService.createResume(testUserId, 'Original', 'jakes-technical', true);
    const duplicated = await ResumeService.duplicateResume(sample.id, testUserId);

    expect(duplicated).not.toBeNull();
    expect(duplicated?.id).not.toBe(sample.id);
    expect(duplicated?.title).toBe('Original (Copy)');
    expect(duplicated?.experiences.length).toBe(sample.experiences.length);
    // Unique ID on inner items
    expect(duplicated?.experiences[0].id).not.toBe(sample.experiences[0].id);

    const list = await ResumeService.listResumes(testUserId);
    expect(list).toHaveLength(2);
  });

  it('deletes a resume', async () => {
    const created = await ResumeService.createResume(testUserId, 'To Delete', 'jakes-technical');
    expect(await ResumeService.listResumes(testUserId)).toHaveLength(1);

    const deleted = await ResumeService.deleteResume(created.id, testUserId);
    expect(deleted).toBe(true);
    expect(await ResumeService.listResumes(testUserId)).toHaveLength(0);
  });
});
