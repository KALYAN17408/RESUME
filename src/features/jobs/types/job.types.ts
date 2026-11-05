import type { ResumeData } from '@/features/resumes/types/resume.types';

export type JobApplicationStatus =
  | 'interested'
  | 'applied'
  | 'interviewing'
  | 'offer'
  | 'rejected'
  | 'withdrawn';

export type EmploymentType =
  | 'full-time'
  | 'part-time'
  | 'contract'
  | 'remote'
  | 'internship';

export interface JobMatchAnalysis {
  overallScore: number; // 0 - 100
  skillsMatch: {
    matched: string[];
    missing: string[];
    criticalMissing: string[];
    matchPercentage: number;
  };
  experienceAlignment: {
    titleAlignment: 'strong' | 'moderate' | 'weak';
    relevantRolesFound: string[];
    yearsEstimated: number;
    summary: string;
  };
  keywordAlignment: {
    matchedCount: number;
    totalJobKeywords: number;
    topMatches: string[];
  };
  suggestions: string[];
  analyzedAt: string;
  disclaimer: string;
}

export interface SavedJob {
  id: string;
  userId: string;
  resumeId?: string;
  resumeTitle?: string;
  title: string;
  company: string;
  location?: string;
  employmentType?: EmploymentType;
  jobUrl?: string;
  jobDescription: string;
  status: JobApplicationStatus;
  appliedDate?: string;
  nextActionDate?: string;
  notes?: string;
  matchAnalysis?: JobMatchAnalysis;
  createdAt: string;
  updatedAt: string;
}

export interface JobFormData {
  title: string;
  company: string;
  location?: string;
  employmentType?: EmploymentType;
  jobUrl?: string;
  jobDescription: string;
  status: JobApplicationStatus;
  resumeId?: string;
  appliedDate?: string;
  nextActionDate?: string;
  notes?: string;
}
