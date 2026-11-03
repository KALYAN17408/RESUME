import { describe, it, expect } from 'vitest';
import { ResumeMergeService } from '@/features/optimizer/services/resumeMergeService';
import { createSampleResume } from '@/features/resumes/utils/resumeDefaults';
import type { ResumeData } from '@/features/resumes/types/resume.types';

describe('ResumeMergeService', () => {
  const getBaselineResume = (): ResumeData => {
    const resume = createSampleResume('user_123', 'jakes-technical');
    resume.personalInfo.summary = 'Old original summary.';
    resume.experiences = [
      {
        id: 'exp-1',
        jobTitle: 'Senior Software Engineer',
        company: 'Stripe',
        location: 'San Francisco, CA',
        startDate: '2021-01',
        endDate: 'Present',
        current: true,
        highlights: [
          'Built internal payment infrastructure.',
          'Reduced latency by 15% through caching.',
        ],
      },
    ];
    resume.projects = [
      {
        id: 'proj-1',
        name: 'Distributed KV Store',
        description: 'Simple distributed key value store written in Go.',
        technologies: ['Go', 'Raft'],
      },
    ];
    resume.skillCategories = [
      {
        id: 'cat-1',
        name: 'Languages',
        skills: ['TypeScript', 'Go', 'Python'],
      },
    ];
    return resume;
  };

  it('validates merge inputs and rejects malformed resume structure', () => {
    const validResume = getBaselineResume();
    const result = ResumeMergeService.validateMergeInputs(validResume, {});
    expect(result.isValid).toBe(true);

    const badResume = { ...validResume, id: '' };
    const badResult = ResumeMergeService.validateMergeInputs(badResume, {});
    expect(badResult.isValid).toBe(false);
    expect(badResult.errors[0]).toContain('mandatory identity fields');

    const invalidBulletResult = ResumeMergeService.validateMergeInputs(validResume, {
      bullets: [
        {
          key: 'b1',
          sourceType: 'experience',
          sourceId: 'exp-nonexistent',
          sourceTitle: 'Unknown Role',
          bulletIndex: 0,
          original: 'Old',
          rewritten: 'New',
        },
      ],
    });
    expect(invalidBulletResult.isValid).toBe(false);
    expect(invalidBulletResult.errors[0]).toContain('non-existent experience ID');
  });

  it('applies approved summary rewrite immutably preserving other personal info', () => {
    const original = getBaselineResume();
    const originalClone = JSON.parse(JSON.stringify(original));

    const result = ResumeMergeService.mergeApprovedChanges(original, {
      summary: {
        original: 'Old original summary.',
        selected: 'Results-driven Senior Engineer architecting high-throughput payment systems.',
        tone: 'impact-driven',
      },
    });

    expect(result.appliedCount).toBe(1);
    expect(result.appliedDetails.summaryApplied).toBe(true);
    expect(result.updatedResume.personalInfo.summary).toBe(
      'Results-driven Senior Engineer architecting high-throughput payment systems.'
    );
    // Preserves unrelated personal info
    expect(result.updatedResume.personalInfo.fullName).toBe(original.personalInfo.fullName);
    expect(result.updatedResume.personalInfo.email).toBe(original.personalInfo.email);

    // Deep immutability verification
    expect(original.personalInfo.summary).toBe('Old original summary.');
    expect(original).toEqual(originalClone);
  });

  it('applies approved experience bullet rewrite without affecting other highlights', () => {
    const original = getBaselineResume();
    const originalClone = JSON.parse(JSON.stringify(original));

    const result = ResumeMergeService.mergeApprovedChanges(original, {
      bullets: [
        {
          key: 'exp_exp-1_0',
          sourceType: 'experience',
          sourceId: 'exp-1',
          sourceTitle: 'Senior Software Engineer at Stripe',
          bulletIndex: 0,
          original: 'Built internal payment infrastructure.',
          rewritten: 'Architected and deployed resilient payment infrastructure supporting 10M+ daily events.',
        },
      ],
    });

    expect(result.appliedCount).toBe(1);
    expect(result.appliedDetails.bulletsAppliedCount).toBe(1);
    expect(result.updatedResume.experiences[0].highlights[0]).toBe(
      'Architected and deployed resilient payment infrastructure supporting 10M+ daily events.'
    );
    // Second bullet preserved intact
    expect(result.updatedResume.experiences[0].highlights[1]).toBe(
      'Reduced latency by 15% through caching.'
    );
    // Other fields preserved
    expect(result.updatedResume.experiences[0].jobTitle).toBe('Senior Software Engineer');
    expect(result.updatedResume.experiences[0].company).toBe('Stripe');

    // Immutability
    expect(original.experiences[0].highlights[0]).toBe('Built internal payment infrastructure.');
    expect(original).toEqual(originalClone);
  });

  it('applies approved project bullet rewrite to project description', () => {
    const original = getBaselineResume();

    const result = ResumeMergeService.mergeApprovedChanges(original, {
      bullets: [
        {
          key: 'proj_proj-1_0',
          sourceType: 'project',
          sourceId: 'proj-1',
          sourceTitle: 'Distributed KV Store',
          bulletIndex: 0,
          original: 'Simple distributed key value store written in Go.',
          rewritten: 'Engineered high-performance distributed key-value store using Raft consensus algorithm.',
        },
      ],
    });

    expect(result.appliedCount).toBe(1);
    expect(result.appliedDetails.bulletsAppliedCount).toBe(1);
    expect(result.updatedResume.projects[0].description).toBe(
      'Engineered high-performance distributed key-value store using Raft consensus algorithm.'
    );
    expect(result.updatedResume.projects[0].technologies).toEqual(['Go', 'Raft']);
  });

  it('inserts approved confirmed skills and prevents duplicates', () => {
    const original = getBaselineResume();

    const result = ResumeMergeService.mergeApprovedChanges(original, {
      skills: [
        // Already exists in Languages (case-insensitive test)
        { skill: 'typescript', category: 'Languages', suggestedSection: 'skills' },
        // New skill in existing category
        { skill: 'Rust', category: 'Languages', suggestedSection: 'skills' },
        // New skill in new category
        { skill: 'Docker', category: 'Databases & Cloud', suggestedSection: 'skills' },
      ],
    });

    // 1 duplicate skipped, 2 added
    expect(result.appliedDetails.skillsAppliedCount).toBe(2);
    expect(result.warnings.length).toBe(1);
    expect(result.warnings[0]).toContain('already exists in resume');

    const languagesCat = result.updatedResume.skillCategories.find((c) => c.name === 'Languages');
    expect(languagesCat?.skills).toContain('Rust');
    expect(languagesCat?.skills.filter((s) => s.toLowerCase() === 'typescript').length).toBe(1);

    const cloudCat = result.updatedResume.skillCategories.find((c) => c.name === 'Databases & Cloud');
    expect(cloudCat).toBeDefined();
    expect(cloudCat?.skills).toContain('Docker');
  });

  it('combines multiple approved changes in a single atomic merge operation', () => {
    const original = getBaselineResume();

    const result = ResumeMergeService.mergeApprovedChanges(original, {
      summary: {
        original: 'Old original summary.',
        selected: 'New Executive Summary.',
        tone: 'executive',
      },
      bullets: [
        {
          key: 'b1',
          sourceType: 'experience',
          sourceId: 'exp-1',
          sourceTitle: 'Stripe',
          bulletIndex: 1,
          original: 'Reduced latency by 15% through caching.',
          rewritten: 'Reduced tail latency by 45% by implementing Redis caching layer.',
        },
      ],
      skills: [
        { skill: 'Kubernetes', category: 'Databases & Cloud', suggestedSection: 'skills' },
      ],
    });

    expect(result.appliedCount).toBe(3);
    expect(result.appliedDetails.summaryApplied).toBe(true);
    expect(result.appliedDetails.bulletsAppliedCount).toBe(1);
    expect(result.appliedDetails.skillsAppliedCount).toBe(1);
    expect(result.updatedResume.personalInfo.summary).toBe('New Executive Summary.');
    expect(result.updatedResume.experiences[0].highlights[1]).toBe(
      'Reduced tail latency by 45% by implementing Redis caching layer.'
    );
  });
});
