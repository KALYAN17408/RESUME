import { describe, it, expect } from 'vitest';
import {
  createEmptyResume,
  createSampleResume,
  DEFAULT_SECTIONS_ORDER,
  DEFAULT_ENABLED_SECTIONS,
} from '@/features/resumes/utils/resumeDefaults';
import { resumeDataSchema } from '@/features/resumes/services/resumeValidation';

describe('resumeDefaults utility', () => {
  it('creates an empty resume with valid unique ID and default order', () => {
    const resume = createEmptyResume('user-123', 'My New Resume', 'jakes-technical');
    expect(resume.id).toBeTruthy();
    expect(resume.userId).toBe('user-123');
    expect(resume.title).toBe('My New Resume');
    expect(resume.templateId).toBe('jakes-technical');
    expect(resume.sectionsOrder).toEqual(DEFAULT_SECTIONS_ORDER);
    expect(resume.enabledSections).toEqual(DEFAULT_ENABLED_SECTIONS);
    expect(resume.experiences).toEqual([]);
    expect(resume.educations).toEqual([]);

    // Validate with Zod schema
    const parseResult = resumeDataSchema.safeParse(resume);
    expect(parseResult.success).toBe(true);
  });

  it('creates a sample resume populated with realistic SWE achievements and metrics', () => {
    const resume = createSampleResume('user-123', 'jakes-technical');
    expect(resume.personalInfo.fullName).toBe('Alex Johnson');
    expect(resume.personalInfo.email).toBe('alex.johnson@example.com');
    expect(resume.experiences.length).toBeGreaterThanOrEqual(2);
    expect(resume.educations.length).toBeGreaterThanOrEqual(1);
    expect(resume.skillCategories.length).toBeGreaterThanOrEqual(3);
    expect(resume.projects.length).toBeGreaterThanOrEqual(2);
    expect(resume.certifications.length).toBeGreaterThanOrEqual(1);

    // Validate with Zod schema
    const parseResult = resumeDataSchema.safeParse(resume);
    expect(parseResult.success).toBe(true);
  });
});
