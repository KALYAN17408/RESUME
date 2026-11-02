import { describe, it, expect } from 'vitest';
import { formatResumeDate, formatResumeDateRange } from '@/features/resumes/utils/formatDate';

describe('formatDate utility', () => {
  it('formats YYYY-MM correctly into Mon YYYY', () => {
    expect(formatResumeDate('2023-01')).toBe('Jan 2023');
    expect(formatResumeDate('2021-12')).toBe('Dec 2021');
    expect(formatResumeDate('2024-06')).toBe('Jun 2024');
  });

  it('formats YYYY into YYYY', () => {
    expect(formatResumeDate('2023')).toBe('2023');
  });

  it('handles current job status as Present', () => {
    expect(formatResumeDate('2023-01', true)).toBe('Present');
    expect(formatResumeDate('', true)).toBe('Present');
  });

  it('handles empty or invalid date gracefully', () => {
    expect(formatResumeDate('')).toBe('');
    expect(formatResumeDate(undefined)).toBe('');
  });

  it('formats date ranges correctly', () => {
    expect(formatResumeDateRange('2022-01', '2023-06')).toBe('Jan 2022 – Jun 2023');
    expect(formatResumeDateRange('2023-01', '', true)).toBe('Jan 2023 – Present');
    expect(formatResumeDateRange('2018-08', '2022-05', false)).toBe('Aug 2018 – May 2022');
  });

  it('handles partial date ranges', () => {
    expect(formatResumeDateRange('2023-01', '')).toBe('Jan 2023');
    expect(formatResumeDateRange('', '2024-05')).toBe('May 2024');
    expect(formatResumeDateRange('', '')).toBe('');
  });
});
