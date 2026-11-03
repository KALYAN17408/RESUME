import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useResumeAutosave } from '@/features/resumes/hooks/useResumeAutosave';
import { ResumeService } from '@/features/resumes/services/resumeService';
import { createSampleResume } from '@/features/resumes/utils/resumeDefaults';
import type { ResumeData } from '@/features/resumes/types/resume.types';

describe('Auto-Save & Persistence Audit Suite', () => {
  const userId = 'audit_user_456';
  let initialResume: ResumeData;

  beforeEach(() => {
    vi.useFakeTimers();
    localStorage.clear();
    vi.spyOn(ResumeService, 'isRemoteConfigured').mockReturnValue(false);
    initialResume = createSampleResume(userId, 'jakes-technical');
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it('1. Debounces auto-save after exactly 800ms', async () => {
    const saveSpy = vi.spyOn(ResumeService, 'saveResume').mockResolvedValue({
      success: true,
      isRemote: true,
    });

    const { result, rerender } = renderHook(
      ({ data }) => useResumeAutosave(data, { debounceMs: 800 }),
      { initialProps: { data: initialResume } }
    );

    // Initial mount should NOT trigger save
    expect(saveSpy).not.toHaveBeenCalled();
    expect(result.current.saveStatus).toBe('saved');

    // Trigger edit
    const modified = { ...initialResume, title: 'Updated SWE Title' };
    rerender({ data: modified });

    expect(result.current.saveStatus).toBe('saving');

    // Advance 500ms (below debounce threshold)
    act(() => {
      vi.advanceTimersByTime(500);
    });
    expect(saveSpy).not.toHaveBeenCalled();

    // Advance remaining 300ms (total 800ms)
    await act(async () => {
      vi.advanceTimersByTime(300);
    });

    expect(saveSpy).toHaveBeenCalledTimes(1);
    expect(saveSpy).toHaveBeenCalledWith(modified);
    expect(result.current.saveStatus).toBe('saved');
  });

  it('2. Coalesces rapid successive edits into a single save with the latest data', async () => {
    const saveSpy = vi.spyOn(ResumeService, 'saveResume').mockResolvedValue({
      success: true,
      isRemote: true,
    });

    const { result, rerender } = renderHook(
      ({ data }) => useResumeAutosave(data, { debounceMs: 800 }),
      { initialProps: { data: initialResume } }
    );

    // Make 5 rapid edits 100ms apart
    for (let i = 1; i <= 5; i++) {
      act(() => {
        vi.advanceTimersByTime(100);
      });
      rerender({
        data: {
          ...initialResume,
          personalInfo: {
            ...initialResume.personalInfo,
            fullName: `Alex Johnson Edit ${i}`,
          },
        },
      });
      expect(result.current.saveStatus).toBe('saving');
    }

    // Now wait the full 800ms debounce
    await act(async () => {
      vi.advanceTimersByTime(800);
    });

    // Exactly one save executed with Edit 5 data
    expect(saveSpy).toHaveBeenCalledTimes(1);
    const savedData = saveSpy.mock.calls[0][0];
    expect(savedData.personalInfo.fullName).toBe('Alex Johnson Edit 5');
    expect(result.current.saveStatus).toBe('saved');
  });

  it('3. Prevents race conditions when an older save completes after a newer one', async () => {
    let resolveFirstSave: (val: any) => void;
    let resolveSecondSave: (val: any) => void;

    const firstPromise = new Promise((resolve) => {
      resolveFirstSave = resolve;
    });
    const secondPromise = new Promise((resolve) => {
      resolveSecondSave = resolve;
    });

    const saveSpy = vi.spyOn(ResumeService, 'saveResume')
      .mockImplementationOnce(() => firstPromise as any)
      .mockImplementationOnce(() => secondPromise as any);

    const { result, rerender } = renderHook(
      ({ data }) => useResumeAutosave(data, { debounceMs: 800 }),
      { initialProps: { data: initialResume } }
    );

    // Edit 1
    rerender({ data: { ...initialResume, title: 'Title 1' } });
    await act(async () => {
      vi.advanceTimersByTime(800);
    });
    expect(saveSpy).toHaveBeenCalledTimes(1);

    // Edit 2 before Edit 1 completes
    rerender({ data: { ...initialResume, title: 'Title 2' } });
    await act(async () => {
      vi.advanceTimersByTime(800);
    });
    expect(saveSpy).toHaveBeenCalledTimes(2);

    // Resolve Edit 2 (newer) first
    await act(async () => {
      resolveSecondSave({ success: true, isRemote: true });
    });
    expect(result.current.saveStatus).toBe('saved');

    // Resolve Edit 1 (stale older) second
    await act(async () => {
      resolveFirstSave({ success: false, isRemote: false, error: 'Stale network error' });
    });

    // Older error must NOT overwrite the newer successful status!
    expect(result.current.saveStatus).toBe('saved');
    expect(result.current.errorMessage).toBeNull();
  });

  it('4. Handles offline network interruption by maintaining localStorage fallback with offline status', async () => {
    // Simulate remote network failure with local storage fallback
    vi.spyOn(ResumeService, 'saveResume').mockImplementation(async (data) => {
      localStorage.setItem(`resumax_resumes_${userId}`, JSON.stringify([data]));
      return { success: true, isRemote: false };
    });

    const { result, rerender } = renderHook(
      ({ data }) => useResumeAutosave(data, { debounceMs: 800 }),
      { initialProps: { data: initialResume } }
    );

    const modified = { ...initialResume, title: 'Offline Persisted Resume' };
    rerender({ data: modified });

    await act(async () => {
      vi.advanceTimersByTime(800);
    });

    // In offline fallback mode, status is 'offline' and data is cached in localStorage
    expect(result.current.saveStatus).toBe('offline');

    // Verify localStorage has the modified data
    const localResumes = JSON.parse(localStorage.getItem(`resumax_resumes_${userId}`) || '[]');
    expect(localResumes.length).toBeGreaterThan(0);
    expect(localResumes[0].title).toBe('Offline Persisted Resume');
  });

  it('5. Allows immediate save and retry on error', async () => {
    const saveSpy = vi.spyOn(ResumeService, 'saveResume')
      .mockResolvedValueOnce({ success: false, isRemote: false, error: 'Network timeout' })
      .mockResolvedValueOnce({ success: true, isRemote: true });

    const { result, rerender } = renderHook(
      ({ data }) => useResumeAutosave(data, { debounceMs: 800 }),
      { initialProps: { data: initialResume } }
    );

    rerender({ data: { ...initialResume, title: 'Retry Test' } });
    await act(async () => {
      vi.advanceTimersByTime(800);
    });

    expect(result.current.saveStatus).toBe('error');
    expect(result.current.errorMessage).toBe('Network timeout');

    // Manual retry via saveImmediately
    await act(async () => {
      await result.current.saveImmediately();
    });

    expect(saveSpy).toHaveBeenCalledTimes(2);
    expect(result.current.saveStatus).toBe('saved');
    expect(result.current.errorMessage).toBeNull();
  });

  it('6. Reopening resume loads the cached state after browser refresh', async () => {
    // Save to local storage directly simulating prior session
    await ResumeService.saveResume({ ...initialResume, title: 'Refreshed Session Resume' });

    // Simulate browser reload: get resume by ID
    const retrieved = await ResumeService.getResume(initialResume.id, userId);
    expect(retrieved).not.toBeNull();
    expect(retrieved?.title).toBe('Refreshed Session Resume');
  });
});
