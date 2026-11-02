import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ResumeRenderer } from '@/features/resumes/templates/ResumeRenderer';
import { createSampleResume } from '@/features/resumes/utils/resumeDefaults';
import type { TemplateId } from '@/features/resumes/types/resume.types';

describe('ResumeRenderer Integration across all 4 Templates', () => {
  const templates: TemplateId[] = [
    'jakes-technical',
    'harvard-classic',
    'stanford-editorial',
    'modern-tech-clean',
  ];

  it.each(templates)('renders full candidate information in template: %s', (templateId) => {
    const data = createSampleResume('user_test', templateId);
    render(<ResumeRenderer data={data} />);

    // Candidate details
    expect(screen.getByText('Alex Johnson')).toBeInTheDocument();
    expect(screen.getByText(/CloudPlatform Inc\./i)).toBeInTheDocument();
    expect(screen.getByText(/University of California, Berkeley/i)).toBeInTheDocument();
    expect(screen.getAllByText(/PulseQueue/i).length).toBeGreaterThanOrEqual(1);
  });

  it('hides disabled sections gracefully', () => {
    const data = createSampleResume('user_test', 'jakes-technical');
    data.enabledSections.experience = false;

    render(<ResumeRenderer data={data} />);

    expect(screen.getByText('Alex Johnson')).toBeInTheDocument();
    expect(screen.queryByText(/CloudPlatform Inc\./i)).not.toBeInTheDocument();
  });
});
