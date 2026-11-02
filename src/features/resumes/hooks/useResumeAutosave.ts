import { useState, useEffect, useRef, useCallback } from 'react';
import type { ResumeData, SaveStatus } from '../types/resume.types';
import { ResumeService } from '../services/resumeService';

interface UseResumeAutosaveOptions {
  debounceMs?: number;
  onSaveSuccess?: (isRemote: boolean) => void;
  onSaveError?: (error: string) => void;
}

export function useResumeAutosave(
  resumeData: ResumeData | null,
  options: UseResumeAutosaveOptions = {}
) {
  const { debounceMs = 800, onSaveSuccess, onSaveError } = options;
  const [saveStatus, setSaveStatus] = useState<SaveStatus>('saved');
  const [lastSavedAt, setLastSavedAt] = useState<Date | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const latestDataRef = useRef<ResumeData | null>(resumeData);
  const isInitialMount = useRef(true);
  const saveSequenceRef = useRef(0);

  // Keep latestDataRef current
  useEffect(() => {
    latestDataRef.current = resumeData;
  }, [resumeData]);

  const executeSave = useCallback(async (dataToSave: ResumeData) => {
    if (!dataToSave || !dataToSave.id) return;

    const currentSequence = ++saveSequenceRef.current;
    setSaveStatus('saving');
    setErrorMessage(null);

    try {
      const result = await ResumeService.saveResume(dataToSave);

      // Prevent race conditions: check if this was the latest save request
      if (currentSequence === saveSequenceRef.current) {
        if (result.success) {
          setSaveStatus(result.isRemote ? 'saved' : 'offline');
          setLastSavedAt(new Date());
          onSaveSuccess?.(result.isRemote);
        } else {
          setSaveStatus('error');
          setErrorMessage(result.error || 'Failed to save changes');
          onSaveError?.(result.error || 'Failed to save changes');
        }
      }
    } catch (err: unknown) {
      if (currentSequence === saveSequenceRef.current) {
        const msg = err instanceof Error ? err.message : 'Save error';
        setSaveStatus('error');
        setErrorMessage(msg);
        onSaveError?.(msg);
      }
    }
  }, [onSaveSuccess, onSaveError]);

  // Force immediate save (e.g. before navigating, on section switch, or template change)
  const saveImmediately = useCallback(async (overrideData?: ResumeData) => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = null;
    }
    const data = overrideData || latestDataRef.current;
    if (data) {
      await executeSave(data);
    }
  }, [executeSave]);

  // Watch for changes and trigger debounced auto-save
  useEffect(() => {
    if (isInitialMount.current) {
      isInitialMount.current = false;
      return;
    }

    if (!resumeData) return;

    setSaveStatus('saving');

    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    timerRef.current = setTimeout(() => {
      executeSave(resumeData);
    }, debounceMs);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [resumeData, debounceMs, executeSave]);

  // Flush pending save before window unload
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (latestDataRef.current && timerRef.current) {
        // Synchronous or best-effort save
        ResumeService.saveResume(latestDataRef.current);
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  return {
    saveStatus,
    lastSavedAt,
    errorMessage,
    saveImmediately,
  };
}
