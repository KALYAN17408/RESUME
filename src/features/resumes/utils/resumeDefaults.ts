import type { ResumeData, SectionType, ResumeCustomization, TemplateId } from '../types/resume.types';

export const DEFAULT_SECTIONS_ORDER: SectionType[] = [
  'personal',
  'summary',
  'experience',
  'education',
  'skills',
  'projects',
  'certifications',
  'achievements',
  'languages',
  'publications',
  'volunteer',
  'interests',
];

export const DEFAULT_ENABLED_SECTIONS: Record<SectionType, boolean> = {
  personal: true,
  summary: true,
  experience: true,
  education: true,
  skills: true,
  projects: true,
  certifications: true,
  achievements: false,
  languages: false,
  publications: false,
  volunteer: false,
  interests: false,
};

export const DEFAULT_CUSTOMIZATION: ResumeCustomization = {
  accentColor: '#0f172a',
  fontFamily: 'Inter',
  fontSize: 'medium',
  lineSpacing: 'normal',
  margins: 'normal',
};

export function createEmptyResume(
  userId: string,
  title = 'Untitled Resume',
  templateId: TemplateId = 'jakes-technical'
): ResumeData {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    userId,
    title,
    targetRole: '',
    templateId,
    createdAt: now,
    updatedAt: now,
    customization: { ...DEFAULT_CUSTOMIZATION },
    personalInfo: {
      fullName: '',
      professionalTitle: '',
      email: '',
      phone: '',
      location: '',
      linkedinUrl: '',
      githubUrl: '',
      portfolioUrl: '',
      summary: '',
    },
    sectionsOrder: [...DEFAULT_SECTIONS_ORDER],
    enabledSections: { ...DEFAULT_ENABLED_SECTIONS },
    experiences: [],
    educations: [],
    skillCategories: [
      { id: crypto.randomUUID(), name: 'Languages', skills: [] },
      { id: crypto.randomUUID(), name: 'Frameworks & Tools', skills: [] },
    ],
    projects: [],
    certifications: [],
    achievements: [],
    languages: [],
    publications: [],
    volunteer: [],
    interests: [],
    atsScore: 0,
  };
}

export function createSampleResume(
  userId: string,
  templateId: TemplateId = 'jakes-technical'
): ResumeData {
  const now = new Date().toISOString();
  return {
    id: crypto.randomUUID(),
    userId,
    title: 'Senior Software Engineer — Sample',
    targetRole: 'Senior Full Stack Software Engineer',
    templateId,
    createdAt: now,
    updatedAt: now,
    customization: {
      accentColor: '#000000',
      fontFamily: templateId === 'harvard-classic' ? 'Merriweather' : 'Inter',
      fontSize: 'medium',
      lineSpacing: 'normal',
      margins: 'normal',
    },
    personalInfo: {
      fullName: 'Alex Johnson',
      professionalTitle: 'Senior Full Stack Software Engineer',
      email: 'alex.johnson@example.com',
      phone: '+1 (555) 342-8901',
      location: 'San Francisco, CA',
      linkedinUrl: 'https://linkedin.com/in/alex-johnson-swe',
      githubUrl: 'https://github.com/alexjohnson',
      portfolioUrl: 'https://alexjohnson.dev',
      summary:
        'Results-driven Senior Software Engineer with 6+ years of expertise designing fault-tolerant distributed systems, scalable web applications, and high-performance cloud architectures. Proven track record leading cross-functional teams to improve p99 API latency by 42% and reduce cloud infrastructure costs by $180K annually.',
    },
    sectionsOrder: [...DEFAULT_SECTIONS_ORDER],
    enabledSections: {
      personal: true,
      summary: true,
      experience: true,
      education: true,
      skills: true,
      projects: true,
      certifications: true,
      achievements: true,
      languages: true,
      publications: false,
      volunteer: false,
      interests: false,
    },
    experiences: [
      {
        id: crypto.randomUUID(),
        jobTitle: 'Senior Software Engineer',
        company: 'CloudPlatform Inc.',
        location: 'San Francisco, CA',
        startDate: '2023-01',
        endDate: '',
        current: true,
        employmentType: 'Full-time',
        highlights: [
          'Spearheaded migration of 14 monolithic microservices to Kubernetes and Go, reducing p99 API response latency by 42% across 1.2M daily active users.',
          'Architected an event-driven Redis distributed caching layer that slashed database query loads by 65%, saving $180K in annual AWS infrastructure spend.',
          'Mentored 6 junior and mid-level engineers through weekly code reviews and architecture design sessions, increasing sprint story completion velocity by 25%.',
          'Authored high-throughput Kafka ingestion pipelines handling 50,000 events/sec with zero data loss over an 18-month production window.',
        ],
      },
      {
        id: crypto.randomUUID(),
        jobTitle: 'Software Engineer',
        company: 'Nexus Data Systems',
        location: 'Austin, TX',
        startDate: '2020-06',
        endDate: '2022-12',
        current: false,
        employmentType: 'Full-time',
        highlights: [
          'Engineered full-stack analytics dashboards using TypeScript, React, Next.js, and PostgreSQL, increasing monthly active user retention by 34%.',
          'Implemented end-to-end automated testing suites with Playwright and Vitest, expanding test coverage from 48% to 92% and cutting bug regressions by 80%.',
          'Built secure OAuth2/OpenID Connect identity workflows with role-based access control (RBAC) supporting 250,000+ enterprise accounts.',
        ],
      },
      {
        id: crypto.randomUUID(),
        jobTitle: 'Junior Software Engineer',
        company: 'Vanguard Tech Labs',
        location: 'Boston, MA',
        startDate: '2018-08',
        endDate: '2020-05',
        current: false,
        employmentType: 'Full-time',
        highlights: [
          'Collaborated with product designers to develop reusable UI component libraries adopted by 4 internal development teams.',
          'Optimized PostgreSQL complex queries and database indexes, reducing average API response times from 850ms to 120ms.',
        ],
      },
    ],
    educations: [
      {
        id: crypto.randomUUID(),
        degree: 'Bachelor of Science in Computer Science',
        institution: 'University of California, Berkeley',
        location: 'Berkeley, CA',
        startDate: '2014-08',
        endDate: '2018-05',
        current: false,
        gpa: '3.85 / 4.0',
        honors: 'Magna Cum Laude, Dean’s Honors List',
        description: 'Relevant Coursework: Distributed Systems, Algorithms & Data Structures, Database Systems, Computer Networking.',
      },
    ],
    skillCategories: [
      {
        id: crypto.randomUUID(),
        name: 'Languages',
        skills: ['TypeScript', 'JavaScript (ES6+)', 'Go', 'Python', 'SQL', 'HTML5/CSS3'],
      },
      {
        id: crypto.randomUUID(),
        name: 'Frameworks & Libraries',
        skills: ['React', 'Next.js', 'Node.js', 'Express', 'Tailwind CSS', 'Redux', 'TanStack Query'],
      },
      {
        id: crypto.randomUUID(),
        name: 'Cloud & Infrastructure',
        skills: ['AWS (ECS, S3, RDS, Lambda)', 'Docker', 'Kubernetes', 'PostgreSQL', 'Redis', 'Kafka', 'Terraform', 'CI/CD (GitHub Actions)'],
      },
      {
        id: crypto.randomUUID(),
        name: 'Methodologies & Practices',
        skills: ['Distributed Systems', 'RESTful APIs', 'Microservices', 'Unit & E2E Testing (Vitest, Playwright)', 'Agile / Scrum', 'System Design'],
      },
    ],
    projects: [
      {
        id: crypto.randomUUID(),
        name: 'Distributed Job Scheduler (PulseQueue)',
        description:
          'Engineered an open-source distributed background job scheduler in Go and Redis with dead-letter queuing, priority routing, and automatic exponential backoff retries.',
        technologies: ['Go', 'Redis', 'Docker', 'Prometheus', 'Grafana'],
        url: 'https://pulsequeue.dev',
        githubUrl: 'https://github.com/alexjohnson/pulsequeue',
        startDate: '2023-03',
        endDate: '2023-09',
      },
      {
        id: crypto.randomUUID(),
        name: 'Real-time Collaborative Code Editor',
        description:
          'Constructed a low-latency web-based collaborative code editor utilizing WebSockets and Conflict-Free Replicated Data Types (CRDTs) to support 50+ concurrent editors per room.',
        technologies: ['TypeScript', 'React', 'Node.js', 'WebSockets', 'Yjs'],
        url: 'https://codecraft-live.app',
        githubUrl: 'https://github.com/alexjohnson/codecraft',
        startDate: '2022-01',
        endDate: '2022-07',
      },
    ],
    certifications: [
      {
        id: crypto.randomUUID(),
        name: 'AWS Certified Solutions Architect – Associate',
        issuer: 'Amazon Web Services',
        issueDate: '2023-04',
        expiryDate: '2026-04',
        credentialUrl: 'https://aws.amazon.com/verification',
      },
      {
        id: crypto.randomUUID(),
        name: 'Certified Kubernetes Administrator (CKA)',
        issuer: 'Cloud Native Computing Foundation (CNCF)',
        issueDate: '2022-10',
        expiryDate: '2025-10',
        credentialUrl: 'https://cncf.io/certification',
      },
    ],
    achievements: [
      {
        id: crypto.randomUUID(),
        title: '1st Place Winner — HackMIT FinTech Track',
        issuer: 'MIT',
        date: '2019-09',
        description: 'Built a real-time micro-lending risk assessment engine using automated credit telemetry.',
      },
    ],
    languages: [
      { id: crypto.randomUUID(), language: 'English', proficiency: 'Native / Bilingual' },
      { id: crypto.randomUUID(), language: 'Spanish', proficiency: 'Professional Working' },
    ],
    publications: [],
    volunteer: [],
    interests: [
      { id: crypto.randomUUID(), name: 'Open-Source Systems' },
      { id: crypto.randomUUID(), name: 'Marathon Running' },
      { id: crypto.randomUUID(), name: 'Specialty Coffee Roasting' },
    ],
    atsScore: 96,
  };
}
