export type InterviewType = 'behavioral' | 'technical' | 'hr' | 'situational' | 'mixed';
export type InterviewDifficulty = 'beginner' | 'intermediate' | 'advanced';
export type InterviewSessionStatus = 'in_progress' | 'completed' | 'paused';

export interface StarEvaluation {
  situationPresent: boolean;
  taskPresent: boolean;
  actionPresent: boolean;
  resultPresent: boolean;
  notes: string;
}

export interface QuestionFeedback {
  relevanceScore: number; // 0 - 100
  clarityScore: number; // 0 - 100
  strengths: string[];
  improvements: string[];
  starEvaluation?: StarEvaluation;
  suggestedAnswerStructure: string;
  sampleAnswer: string;
  analyzedAt: string;
}

export interface MockInterviewQA {
  id: string;
  sessionId: string;
  questionIndex: number;
  question: string;
  questionType: InterviewType;
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

export interface InterviewSetupConfig {
  interviewType: InterviewType;
  targetRole: string;
  companyName?: string;
  jobDescription?: string;
  difficulty: InterviewDifficulty;
  questionCount: number;
  resumeId?: string | null;
}
