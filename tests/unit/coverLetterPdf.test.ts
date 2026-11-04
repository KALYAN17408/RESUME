import { describe, it, expect } from 'vitest';
import { generateCoverLetterPdfBlob } from '@/features/cover-letter/services/coverLetterPdf';
import { createSampleResume } from '@/features/resumes/utils/resumeDefaults';

describe('CoverLetterPdf Service (@react-pdf/renderer)', () => {
  const sampleResume = createSampleResume('user_1', 'jakes-technical');

  it('generates a valid, non-empty vector PDF Blob from edited cover letter text', async () => {
    const content = `Dear Hiring Team,

I am writing to express my strong interest in the Senior Full-Stack Engineer role at Datadog. With extensive experience building distributed React and Node.js systems, I am confident in my ability to make an immediate contribution to your infrastructure.

Throughout my career, I have prioritized high-throughput query optimization and clean, maintainable microservice architecture. In my recent work, I spearheaded key API performance initiatives that improved end-to-end reliability.

Thank you very much for your time and consideration.

Sincerely,
Alex Morgan
Senior Full-Stack Engineer`;

    const blob = await generateCoverLetterPdfBlob({
      content,
      subjectLine: 'Application for Senior Full-Stack Engineer — Alex Morgan',
      candidateName: 'Alex Morgan',
      candidateTitle: 'Senior Full-Stack Engineer',
      recipientName: 'Engineering Hiring Team',
      companyName: 'Datadog',
      resumeData: sampleResume,
    });

    expect(blob).toBeDefined();
    expect(blob.size).toBeGreaterThan(1000);
    expect(blob.type).toBe('application/pdf');
  });

  it('rejects empty or whitespace-only content with a clear descriptive error', async () => {
    await expect(
      generateCoverLetterPdfBlob({
        content: '   ',
        companyName: 'Test Corp',
      })
    ).rejects.toThrow(/Cannot export empty cover letter content/i);
  });

  it('supports multi-page cover letters without crashing or clipping', async () => {
    // Generate a long 8-paragraph cover letter
    const longParagraph =
      'Throughout my professional tenure, I have consistently focused on building scalable, resilient software architectures that deliver measurable value. My approach integrates rigorous automated testing, modular clean code principles, and proactive cross-functional communication to ship features reliably.';
    const longContent = Array(8).fill(longParagraph).join('\n\n');

    const blob = await generateCoverLetterPdfBlob({
      content: longContent,
      subjectLine: 'Multi-Page Executive Application',
      candidateName: 'Alex Morgan',
      resumeData: sampleResume,
    });

    expect(blob).toBeDefined();
    expect(blob.size).toBeGreaterThan(2000);
  });
});

