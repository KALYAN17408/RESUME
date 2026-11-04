import type { ResumeData } from '@/features/resumes/types/resume.types';

export type CoverLetterTone = 'professional' | 'confident' | 'concise' | 'enthusiastic';

export interface CoverLetterToneOption {
  id: CoverLetterTone;
  name: string;
  description: string;
  tagline: string;
}

export const COVER_LETTER_TONES: CoverLetterToneOption[] = [
  {
    id: 'professional',
    name: 'Professional',
    description: 'Balanced, respectful, and authoritative with standard corporate etiquette.',
    tagline: 'Standard & Authoritative',
  },
  {
    id: 'confident',
    name: 'Confident',
    description: 'Direct and achievement-forward, emphasizing verified capabilities and readiness.',
    tagline: 'Bold & Impact-Driven',
  },
  {
    id: 'concise',
    name: 'Concise',
    description: 'High-density, punchy 3-paragraph format optimized for rapid executive review.',
    tagline: 'Short & High-Density',
  },
  {
    id: 'enthusiastic',
    name: 'Enthusiastic',
    description: 'High energy and mission-driven, highlighting passion for the company and role.',
    tagline: 'Passionate & Mission-Aligned',
  },
];

export interface CoverLetterDraft {
  id: string;
  userId: string;
  title: string;
  resumeId: string | null;
  resumeTitle?: string;
  jobTitle: string;
  companyName: string;
  hiringManagerName?: string;
  jobDescription: string;
  tone: CoverLetterTone;
  additionalContext?: string;
  subjectLine: string;
  content: string; // The edited/final content
  originalGeneratedContent?: string;
  usedResumeEvidence: string[];
  isDeterministic: boolean;
  provider: string;
  createdAt: string;
  updatedAt: string;
}

export interface GenerateCoverLetterParams {
  candidateName?: string;
  professionalTitle?: string;
  email?: string;
  phone?: string;
  location?: string;
  linkedinUrl?: string;
  githubUrl?: string;
  portfolioUrl?: string;
  resumeData?: ResumeData | null;
  jobTitle: string;
  companyName: string;
  hiringManagerName?: string;
  jobDescription?: string;
  tone?: CoverLetterTone;
  additionalContext?: string;
  previousGenerations?: string[];
}

export interface CoverLetterGenerationResult {
  content: string;
  subjectLine: string;
  usedResumeEvidence: string[];
  isDeterministic: boolean;
  provider: string;
  tone: CoverLetterTone;
  fallbackReason?: string;
  processingTimeMs: number;
}
