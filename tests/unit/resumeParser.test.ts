import { describe, it, expect } from 'vitest';
import { parseResumeFromText, parseResumeFromFile } from '@/features/resumes/services/resumeParser';

describe('ResumeParser Service — Import from Device', () => {
  const sampleRawResumeText = `
Alex Morgan
Senior Full-Stack Engineer
alex.morgan@example.com | (555) 234-5678 | San Francisco, CA
https://linkedin.com/in/alexmorgan | https://github.com/alexmorgan

PROFESSIONAL SUMMARY
Dynamic software engineer with 6+ years of experience designing, building, and scaling web applications with React, TypeScript, and Node.js.

TECHNICAL SKILLS
Languages: TypeScript, JavaScript, Python, Go, SQL
Frameworks: React, Next.js, Node.js, Express, TailwindCSS
Databases & Cloud: PostgreSQL, Redis, MongoDB, AWS, Docker
Tools: Git, Vite, Vitest, CI/CD, Kubernetes

WORK EXPERIENCE
Senior Software Engineer at Stripe (2021 - Present)
• Architected and scaled high-throughput payment processing APIs handling $50M+ in transactions.
• Reduced API response latency by 35% through Redis query caching and database indexing.
• Mentored 4 junior software engineers and led agile sprint planning meetings.

Full-Stack Developer at Acme Corp (2018 - 2021)
• Built customer-facing dashboard features using React, TypeScript, and Node.js.
• Migrated legacy monolithic architecture to containerized microservices with Docker.

EDUCATION
Bachelor of Science in Computer Science - University of California, Berkeley (2014 - 2018)
GPA: 3.8 | Dean's Honor List
`;

  it('correctly parses candidate contact information from plain text', () => {
    const resume = parseResumeFromText(sampleRawResumeText, 'user_123', 'jakes-technical', 'Imported Test Resume');

    expect(resume.title).toBe('Imported Test Resume');
    expect(resume.userId).toBe('user_123');
    expect(resume.personalInfo.fullName).toBe('Alex Morgan');
    expect(resume.personalInfo.email).toBe('alex.morgan@example.com');
    expect(resume.personalInfo.phone).toBe('(555) 234-5678');
    expect(resume.personalInfo.linkedinUrl).toContain('linkedin.com/in/alexmorgan');
    expect(resume.personalInfo.githubUrl).toContain('github.com/alexmorgan');
  });

  it('correctly parses professional summary', () => {
    const resume = parseResumeFromText(sampleRawResumeText);

    expect(resume.personalInfo.summary).toContain('Dynamic software engineer with 6+ years of experience');
  });

  it('correctly parses work experiences with job title, company, and highlights', () => {
    const resume = parseResumeFromText(sampleRawResumeText);

    expect(resume.experiences.length).toBeGreaterThanOrEqual(2);

    const firstExp = resume.experiences[0];
    expect(firstExp.jobTitle).toContain('Senior Software Engineer');
    expect(firstExp.company).toContain('Stripe');
    expect(firstExp.highlights.length).toBeGreaterThanOrEqual(3);
    expect(firstExp.highlights[0]).toContain('Architected and scaled high-throughput payment processing APIs');
  });

  it('correctly parses education history', () => {
    const resume = parseResumeFromText(sampleRawResumeText);

    expect(resume.educations.length).toBeGreaterThanOrEqual(1);
    expect(resume.educations[0].degree).toContain('Bachelor of Science');
    expect(resume.educations[0].institution).toContain('University of California, Berkeley');
  });

  it('correctly parses skills and maps them into categories', () => {
    const resume = parseResumeFromText(sampleRawResumeText);

    expect(resume.skillCategories.length).toBeGreaterThan(0);

    const allSkills = resume.skillCategories.flatMap((c) => c.skills);
    expect(allSkills.some((s) => s.toLowerCase().includes('typescript'))).toBe(true);
    expect(allSkills.some((s) => s.toLowerCase().includes('react'))).toBe(true);
  });

  it('imports JSON resume format from a file object', async () => {
    const mockJsonResume = {
      basics: {
        name: 'Jordan Lee',
        label: 'Cloud Architect',
        email: 'jordan@example.com',
        phone: '123-456-7890',
        summary: 'Expert in AWS and Kubernetes.',
      },
      work: [
        {
          name: 'CloudScale Inc',
          position: 'Lead Architect',
          startDate: '2020',
          highlights: ['Built serverless infrastructure.'],
        },
      ],
      education: [
        {
          institution: 'MIT',
          area: 'Computer Science',
          studyType: 'B.S.',
        },
      ],
      skills: [
        {
          name: 'Cloud',
          keywords: ['AWS', 'Kubernetes', 'Terraform'],
        },
      ],
    };

    const file = new File([JSON.stringify(mockJsonResume)], 'jordan_resume.json', {
      type: 'application/json',
    });

    const imported = await parseResumeFromFile(file, 'user_test', 'harvard-classic', 'My Imported JSON');

    expect(imported.title).toBe('My Imported JSON');
    expect(imported.templateId).toBe('harvard-classic');
    expect(imported.personalInfo.fullName).toBe('Jordan Lee');
    expect(imported.personalInfo.email).toBe('jordan@example.com');
    expect(imported.personalInfo.professionalTitle).toBe('Cloud Architect');
    expect(imported.experiences).toHaveLength(1);
    expect(imported.experiences[0].company).toBe('CloudScale Inc');
    expect(imported.educations).toHaveLength(1);
    expect(imported.educations[0].institution).toBe('MIT');
    expect(imported.skillCategories[0].skills).toContain('AWS');
  });
});
