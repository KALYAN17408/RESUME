import { describe, it, expect } from 'vitest';
import { reorderArray, moveItemUp, moveItemDown } from '@/features/resumes/utils/reorderSections';

describe('reorderSections utility', () => {
  const sections = ['personal', 'summary', 'experience', 'education', 'skills'];

  it('reorders array correctly from start to end index', () => {
    const result = reorderArray(sections, 1, 3);
    expect(result).toEqual(['personal', 'experience', 'education', 'summary', 'skills']);
  });

  it('moves item up correctly', () => {
    const result = moveItemUp(sections, 2);
    expect(result).toEqual(['personal', 'experience', 'summary', 'education', 'skills']);
  });

  it('does nothing when moving top item up', () => {
    const result = moveItemUp(sections, 0);
    expect(result).toEqual(sections);
  });

  it('moves item down correctly', () => {
    const result = moveItemDown(sections, 1);
    expect(result).toEqual(['personal', 'experience', 'summary', 'education', 'skills']);
  });

  it('does nothing when moving bottom item down', () => {
    const result = moveItemDown(sections, sections.length - 1);
    expect(result).toEqual(sections);
  });
});
