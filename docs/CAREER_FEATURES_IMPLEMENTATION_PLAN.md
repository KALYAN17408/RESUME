# RESUME AI — Career Features Implementation Plan
**Modules:** Job Matching, AI Career Copilot & Mock Interviews  
**Project:** `D:\RESUMAX_AI`  
**Date:** November 5, 2026  
**Status:** Architecture & Implementation Plan (Phase 0 Audit Complete)

---

## 1. Executive Overview

This plan details the end-to-end architecture, data models, component hierarchy, service contracts, and verification strategy to elevate the three "Coming Soon" modules in **RESUME AI** into production-ready features:

1. **Job Matching** (`/dashboard/jobs`) — Accent: Primary Blue (`#2563EB`)
2. **AI Career Copilot** (`/dashboard/copilot`) — Accent: Secondary Violet (`#7C3AED`)
3. **Mock Interviews** (`/dashboard/interviews`) — Accent: Teal (`#0D9488`)

All three features inherit the existing BAMA UX Design System tokens, user authentication, resume data store, local-first offline resilience, and Supabase RLS security architecture.

---

## 2. Architecture & Reuse Mapping

| Feature | New Module Path | Existing Services Reused | Storage Strategy |
| :--- | :--- | :--- | :--- |
| **Job Matching** | `src/features/jobs/` | `ResumeService` (resume retrieval)<br>`extractKeywordsFromJob`, `SKILLS_TAXONOMY` from `atsEngine.ts`<br>`ConfirmationDialog`, `Badge`, `Modal` | Supabase `saved_jobs` table + `localStorage` (`resumax_saved_jobs_${userId}`) |
| **AI Career Copilot** | `src/features/copilot/` | `ResumeService` (resume context)<br>`getSupabaseEnv` (config detection)<br>`supabase.functions.invoke` with offline grounded synthesis fallback | Supabase `career_conversations` & `career_messages` tables + `localStorage` (`resumax_copilot_conversations_${userId}`) |
| **Mock Interviews** | `src/features/interviews/` | `ResumeService` (optional resume grounding)<br>`extractKeywordsFromJob` (role-specific terms)<br>`Button`, `Badge`, `Input`, `Modal` | Supabase `mock_interview_sessions` & `mock_interview_qa` tables + `localStorage` (`resumax_interviews_${userId}`) |

---

## 3. Data Models & Schemas

### A. Job Matching (`saved_jobs`)
```typescript
export type JobApplicationStatus = 
  | 'interested' 
  | 'applied' 
  | 'interviewing' 
  | 'offer' 
  | 'rejected' 
  | 'withdrawn';

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
  };
  keywordAlignment: {
    matchedCount: number;
    totalJobKeywords: number;
    topMatches: string[];
  };
  suggestions: string[];
  analyzedAt: string;
}

export interface SavedJob {
  id: string;
  userId: string;
  resumeId?: string;
  resumeTitle?: string;
  title: string;
  company: string;
  location?: string;
  employmentType?: 'full-time' | 'part-time' | 'contract' | 'remote' | 'internship';
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
```

### B. AI Career Copilot (`career_conversations` & `career_messages`)
```typescript
export interface CareerMessage {
  id: string;
  conversationId: string;
  userId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  metadata?: {
    usedResumeId?: string;
    usedResumeTitle?: string;
    actionableSuggestions?: string[];
    processingTimeMs?: number;
    isFallback?: boolean;
  };
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
```

### C. Mock Interviews (`mock_interview_sessions` & `mock_interview_qa`)
```typescript
export type InterviewType = 'behavioral' | 'technical' | 'hr' | 'situational';
export type InterviewDifficulty = 'beginner' | 'intermediate' | 'advanced';
export type InterviewSessionStatus = 'in_progress' | 'completed' | 'paused';

export interface QuestionFeedback {
  relevanceScore: number; // 0 - 100
  clarityScore: number; // 0 - 100
  specificityScore: number; // 0 - 100
  strengths: string[];
  improvements: string[];
  starEvaluation?: {
    situationPresent: boolean;
    taskPresent: boolean;
    actionPresent: boolean;
    resultPresent: boolean;
    notes: string;
  };
  suggestedAnswerStructure: string;
  sampleAnswer: string;
}

export interface MockInterviewQA {
  id: string;
  sessionId: string;
  questionIndex: number;
  question: string;
  questionType: string;
  userAnswer?: string;
  feedback?: QuestionFeedback;
  createdAt: string;
}

export interface MockInterviewSession {
  id: string;
  userId: string;
  resumeId?: string | null;
  resumeTitle?: string | null;
  interviewType: InterviewType;
  targetRole: string;
  companyName?: string;
  jobDescription?: string;
  difficulty: InterviewDifficulty;
  totalQuestions: number;
  currentQuestionIndex: number;
  status: InterviewSessionStatus;
  questions: MockInterviewQA[];
  overallFeedback?: {
    overallScore: number;
    strengthsSummary: string[];
    priorityImprovements: string[];
    summaryNote: string;
  };
  createdAt: string;
  updatedAt: string;
}
```

---

## 4. Implementation Sequence

### Phase 1: Job Matching & Tracker (`/dashboard/jobs`)
1. Create `src/features/jobs/types/job.types.ts`.
2. Create `src/features/jobs/services/jobMatchingEngine.ts`:
   - Algorithmic evaluation based on resume content + JD keywords.
   - Calculates Overall Match Score, Matched Skills, Missing Skills, and Actionable Suggestions.
3. Create `src/features/jobs/services/jobService.ts`:
   - Supabase CRUD + offline `localStorage` fallback.
4. Create UI components:
   - `src/features/jobs/components/JobCard.tsx`
   - `src/features/jobs/components/JobMatchModal.tsx`
   - `src/features/jobs/components/JobFormModal.tsx`
   - `src/features/jobs/components/JobFilterBar.tsx`
   - `src/features/jobs/pages/JobMatchingPage.tsx`
5. Unit and integration tests: `tests/unit/jobMatchingEngine.test.ts`, `tests/integration/JobMatchingPage.test.tsx`.
6. Commit checkpoint: `feat(jobs): implement job matching and application tracking`.

### Phase 2: AI Career Copilot (`/dashboard/copilot`)
1. Create `src/features/copilot/types/copilot.types.ts`.
2. Create `src/features/copilot/services/careerCopilotService.ts`:
   - AI generation engine supporting conversation context + resume grounding.
   - Grounded career synthesizer for offline/fallback operation.
3. Create `src/features/copilot/services/copilotStorageService.ts`:
   - Supabase conversation/message persistence + `localStorage` fallback.
4. Create UI components:
   - `src/features/copilot/components/ConversationList.tsx`
   - `src/features/copilot/components/ChatWindow.tsx`
   - `src/features/copilot/components/ChatMessageBubble.tsx`
   - `src/features/copilot/components/QuickPromptChips.tsx`
   - `src/features/copilot/pages/CareerCopilotPage.tsx`
5. Unit and integration tests: `tests/unit/careerCopilotService.test.ts`, `tests/integration/CareerCopilotPage.test.tsx`.
6. Commit checkpoint: `feat(copilot): implement AI career copilot`.

### Phase 3: Mock Interviews (`/dashboard/interviews`)
1. Create `src/features/interviews/types/interview.types.ts`.
2. Create `src/features/interviews/services/interviewQuestionGenerator.ts`:
   - Curated + dynamic question banks tailored to role, type, and difficulty.
3. Create `src/features/interviews/services/interviewFeedbackEngine.ts`:
   - STAR evaluation, relevance scoring, strengths, improvement areas.
4. Create `src/features/interviews/services/interviewService.ts`:
   - Supabase session/QA persistence + `localStorage` fallback.
5. Create UI components:
   - `src/features/interviews/components/InterviewSetupModal.tsx`
   - `src/features/interviews/components/InterviewSessionView.tsx`
   - `src/features/interviews/components/QuestionFeedbackCard.tsx`
   - `src/features/interviews/components/InterviewSummaryModal.tsx`
   - `src/features/interviews/components/PastSessionsList.tsx`
   - `src/features/interviews/pages/MockInterviewPage.tsx`
6. Unit and integration tests: `tests/unit/interviewEngine.test.ts`, `tests/integration/MockInterviewPage.test.tsx`.
7. Commit checkpoint: `feat(interviews): implement text-based mock interviews`.

### Phase 4: Shared Navigation, Routing & Dashboard Integration
1. Update `src/app/router.tsx`: Map `/dashboard/jobs`, `/dashboard/copilot`, `/dashboard/interviews` to their page components.
2. Update `src/components/layout/Sidebar.tsx`: Replace `Coming Soon` badges with `Live`.
3. Update `src/features/dashboard/components/DashboardOverview.tsx`: Update module cards and modal CTAs.

### Phase 5: Database Migrations
1. Create `supabase/migrations/20261105000000_create_career_features_schema.sql` covering all new entities with strict RLS policies.
2. Note: **Zero remote database mutations will be executed.**

### Phase 6: Automated Verification & Documentation
1. Run full test suite: `npm test -- --run`.
2. Run TypeScript check: `npx tsc --noEmit`.
3. Run build check: `npm run build`.
4. Create documentation:
   - `docs/JOB_MATCHING_IMPLEMENTATION.md`
   - `docs/CAREER_COPILOT_IMPLEMENTATION.md`
   - `docs/MOCK_INTERVIEWS_IMPLEMENTATION.md`
   - `docs/CAREER_FEATURES_COMPLETION_REPORT.md`
5. Final verification commit: `test(career): verify career features and regression suite`.
