export type InputSourceType = 'existing_resume' | 'uploaded_pdf';

export interface AtsAnalysisInput {
  sourceType: InputSourceType;
  resumeId?: string;
  resumeTitle?: string;
  fileName?: string;
  jobTitle?: string;
  companyName?: string;
  jobDescription: string;
  resumeText: string;
}

export type KeywordCategory =
  | 'technical'
  | 'framework'
  | 'database'
  | 'cloud_devops'
  | 'methodology'
  | 'soft_skill'
  | 'tool'
  | 'education';

export type KeywordImportance = 'critical' | 'important' | 'nice_to_have';

export interface KeywordMatch {
  term: string;
  normalized: string;
  category: KeywordCategory;
  importance: KeywordImportance;
  countInJob: number;
  countInResume: number;
  matched: boolean;
}

export type SectionStatus = 'complete' | 'partial' | 'missing';

export interface SectionCheck {
  id: string;
  name: string;
  found: boolean;
  status: SectionStatus;
  feedback: string;
  details?: string;
}

export type FormattingStatus = 'pass' | 'warning' | 'fail';

export interface FormattingCheck {
  id: string;
  title: string;
  status: FormattingStatus;
  score: number; // 0-100
  detail: string;
  recommendation?: string;
}

export type RecommendationSeverity = 'high' | 'medium' | 'low';
export type RecommendationType =
  | 'missing_keyword'
  | 'weak_action_verb'
  | 'formatting'
  | 'section'
  | 'quantifiable_metric'
  | 'brevity';

export interface AtsRecommendation {
  id: string;
  type: RecommendationType;
  severity: RecommendationSeverity;
  title: string;
  description: string;
  suggestion: string;
  actionableExample?: string;
}

export interface AtsScoreBreakdown {
  overallScore: number; // 0 - 100
  keywordScore: number; // 0 - 100 (weight 40%)
  skillsScore: number; // 0 - 100 (weight 25%)
  sectionScore: number; // 0 - 100 (weight 15%)
  formattingScore: number; // 0 - 100 (weight 20%)
  scoreGrade: 'Excellent' | 'Strong' | 'Moderate' | 'Needs Improvement';
  explanation: string;
}

export interface AtsReport {
  id: string;
  userId: string;
  resumeId?: string;
  resumeTitle?: string;
  fileName?: string;
  jobTitle?: string;
  companyName?: string;
  jobDescription: string;
  createdAt: string;
  scores: AtsScoreBreakdown;
  matchedKeywords: KeywordMatch[];
  missingKeywords: KeywordMatch[];
  allDetectedKeywords: KeywordMatch[];
  sections: SectionCheck[];
  formatting: FormattingCheck[];
  recommendations: AtsRecommendation[];
  wordCount: number;
  actionVerbCount: number;
  metricCount: number;
  isScannedPdf?: boolean;
}

export interface AnalysisState {
  isAnalyzing: boolean;
  currentStep: string;
  error: string | null;
  report: AtsReport | null;
}
