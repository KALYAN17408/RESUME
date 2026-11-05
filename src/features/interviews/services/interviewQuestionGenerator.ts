import type {
  InterviewType,
  InterviewDifficulty,
  MockInterviewQA,
} from '../types/interview.types';
import type { ResumeData } from '@/features/resumes/types/resume.types';

const BEHAVIORAL_QUESTIONS = [
  'Describe a situation where you had a fundamental disagreement with a technical lead or product manager regarding architecture or timeline. How did you handle the discussion, and what was the outcome?',
  'Tell me about a time you led or significantly contributed to resolving a critical production incident or major bug under tight time constraints.',
  'Can you describe a scenario where project requirements changed drastically midway through development? How did you adapt your plan and communicate with stakeholders?',
  'Walk me through a time when you had to balance technical debt against the pressure to ship features quickly. How did you prioritize and justify your trade-offs?',
  'Describe an accomplishment where you went above and beyond your standard responsibilities to mentor a colleague or improve team engineering practices.',
  'Tell me about a project that did not go according to plan or failed to meet expectations. What went wrong, and what key lessons did you take away?',
  'Give an example of how you handled a situation where team members had conflicting priorities or communication breakdowns.',
];

const TECHNICAL_QUESTIONS = [
  'How do you approach designing a scalable, distributed architecture for high-concurrency systems? What considerations guide your choice of caching, databases, and message brokers?',
  'Walk me through how you diagnose and resolve memory leaks or severe performance degradation in modern web applications and APIs.',
  'Explain how you ensure data consistency across multiple services or microservices without introducing distributed transaction deadlocks.',
  'Compare SQL relational databases against NoSQL document stores. Under what specific access patterns and data shapes would you select one over the other?',
  'How do you design and enforce API versioning, backwards compatibility, and idempotent mutations for public-facing client applications?',
  'Describe your approach to comprehensive automated testing (unit, integration, and end-to-end) in a continuous deployment pipeline.',
  'How do you evaluate and implement security best practices (e.g., authentication, authorization, CSRF, XSS, rate limiting, and secret management) in production services?',
];

const HR_SITUATIONAL_QUESTIONS = [
  'What motivates you to pursue this specific role, and what engineering values are most important to you in a high-performing engineering culture?',
  'How do you typically organize your daily workflow, handle competing deadlines, and maintain focus when context switching is unavoidable?',
  'If you were assigned to a codebase with minimal documentation and legacy dependencies, what would be your step-by-step approach to onboarding and contributing safely?',
  'How do you approach giving constructive code review feedback to peers without creating friction or defensive reactions?',
  'Where do you see your engineering focus evolving over the next two to three years, and how does this role support your professional trajectory?',
  'Describe how you stay current with rapidly evolving frameworks, language specifications, and software engineering methodologies.',
  'If a stakeholder requested a feature with an unrealistic deadline, how would you scope and negotiate deliverables without compromising system quality?',
];

/**
 * Generates tailored interview questions based on role, type, difficulty, and candidate context
 */
export function generateInterviewQuestions(
  interviewType: InterviewType,
  targetRole: string,
  difficulty: InterviewDifficulty,
  count: number,
  resumeData?: ResumeData | null,
  jobDescription?: string
): MockInterviewQA[] {
  const questions: { question: string; type: InterviewType }[] = [];

  // Extract candidate technologies or job keywords if available
  const skills: string[] = [];
  if (resumeData?.skillCategories) {
    for (const cat of resumeData.skillCategories) {
      for (const s of cat.skills) {
        if (!skills.includes(s)) skills.push(s);
      }
    }
  }

  // If JD provided and skills are empty, extract key technical terms from JD
  if (skills.length === 0 && jobDescription) {
    const jdWords = jobDescription.match(/\b(React|TypeScript|Node\.js|Python|AWS|Docker|Kubernetes|Go|PostgreSQL|GraphQL)\b/gi) || [];
    jdWords.forEach((w) => {
      if (!skills.includes(w)) skills.push(w);
    });
  }

  const primaryTech = skills.length > 0 ? skills.slice(0, 3).join(' and ') : 'modern software stacks';
  const roleName = targetRole.trim() || 'Software Engineer';
  const isAdvanced = difficulty === 'advanced';

  // Role-specific targeted question
  if (interviewType === 'technical' || interviewType === 'mixed') {
    questions.push({
      question: isAdvanced
        ? `In your work as a ${roleName}, how do you evaluate architectural trade-offs and disaster recovery strategies when designing large-scale systems using ${primaryTech}?`
        : `In your work as a ${roleName}, how have you leveraged ${primaryTech} to solve performance bottlenecks or architectural complexity?`,
      type: 'technical',
    });
  }

  if (interviewType === 'behavioral' || interviewType === 'mixed') {
    questions.push({
      question: `As a ${roleName}, describe a time you had to deliver a critical milestone under ambiguous requirements. What was the situation, and how did you drive clarity?`,
      type: 'behavioral',
    });
  }

  // Populate remaining questions from banks
  let pool: { question: string; type: InterviewType }[] = [];

  if (interviewType === 'behavioral') {
    pool = BEHAVIORAL_QUESTIONS.map((q) => ({ question: q, type: 'behavioral' as InterviewType }));
  } else if (interviewType === 'technical') {
    pool = TECHNICAL_QUESTIONS.map((q) => ({ question: q, type: 'technical' as InterviewType }));
  } else if (interviewType === 'hr' || interviewType === 'situational') {
    pool = HR_SITUATIONAL_QUESTIONS.map((q) => ({ question: q, type: 'situational' as InterviewType }));
  } else {
    // Mixed: interleave behavioral, technical, and situational
    const maxLen = Math.max(BEHAVIORAL_QUESTIONS.length, TECHNICAL_QUESTIONS.length, HR_SITUATIONAL_QUESTIONS.length);
    for (let i = 0; i < maxLen; i++) {
      if (BEHAVIORAL_QUESTIONS[i]) pool.push({ question: BEHAVIORAL_QUESTIONS[i], type: 'behavioral' });
      if (TECHNICAL_QUESTIONS[i]) pool.push({ question: TECHNICAL_QUESTIONS[i], type: 'technical' });
      if (HR_SITUATIONAL_QUESTIONS[i]) pool.push({ question: HR_SITUATIONAL_QUESTIONS[i], type: 'situational' });
    }
  }

  for (const item of pool) {
    if (questions.length >= count) break;
    if (!questions.some((q) => q.question === item.question)) {
      questions.push(item);
    }
  }

  // Format as MockInterviewQA entities
  const now = new Date().toISOString();
  return questions.slice(0, count).map((item, index) => ({
    id: crypto.randomUUID(),
    sessionId: '',
    questionIndex: index,
    question: item.question,
    questionType: item.type,
    createdAt: now,
  }));
}
