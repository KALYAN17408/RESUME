import type { ResumeData } from '@/features/resumes/types/resume.types';

export type MessageRole = 'user' | 'assistant' | 'system';

export interface CareerMessageMetadata {
  usedResumeId?: string;
  usedResumeTitle?: string;
  actionableSuggestions?: string[];
  processingTimeMs?: number;
  isFallback?: boolean;
  topic?: 'resume_review' | 'skill_gap' | 'interview_prep' | 'career_roadmap' | 'general';
}

export interface CareerMessage {
  id: string;
  conversationId: string;
  userId: string;
  role: MessageRole;
  content: string;
  metadata?: CareerMessageMetadata;
  createdAt: string;
}

export interface CareerConversation {
  id: string;
  userId: string;
  resumeId?: string | null;
  resumeTitle?: string | null;
  title: string;
  messages: CareerMessage[];
  createdAt: string;
  updatedAt: string;
}

export interface CopilotGenerateParams {
  prompt: string;
  conversationHistory: CareerMessage[];
  resumeData?: ResumeData | null;
  topic?: string;
}

export interface CopilotGenerateResult {
  content: string;
  metadata?: CareerMessageMetadata;
}
