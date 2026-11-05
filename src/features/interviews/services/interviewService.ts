import { supabase } from '@/lib/supabase/client';
import { getSupabaseEnv } from '@/lib/supabase/env';
import type { ResumeData } from '@/features/resumes/types/resume.types';
import type {
  MockInterviewSession,
  InterviewSetupConfig,
  QuestionFeedback,
  MockInterviewQA,
} from '../types/interview.types';
import { generateInterviewQuestions } from './interviewQuestionGenerator';
import { evaluateAnswer } from './interviewFeedbackEngine';

const STORAGE_PREFIX = 'resumax_interviews_';

function getLocalSessions(userId: string): MockInterviewSession[] {
  try {
    const raw = localStorage.getItem(`${STORAGE_PREFIX}${userId}`);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.warn('[InterviewService] Failed to read from localStorage:', err);
    return [];
  }
}

function saveLocalSessions(userId: string, sessions: MockInterviewSession[]): void {
  try {
    localStorage.setItem(`${STORAGE_PREFIX}${userId}`, JSON.stringify(sessions));
  } catch (err) {
    console.warn('[InterviewService] Failed to write to localStorage:', err);
  }
}

export class InterviewService {
  /**
   * List all interview sessions for the user
   */
  static async listSessions(userId: string): Promise<MockInterviewSession[]> {
    const { isConfigured } = getSupabaseEnv();

    if (isConfigured) {
      try {
        const { data, error } = await supabase
          .from('mock_interview_sessions')
          .select(`
            id,
            user_id,
            resume_id,
            resume_title,
            interview_type,
            target_role,
            company_name,
            job_description,
            difficulty,
            total_questions,
            current_question_index,
            status,
            overall_feedback,
            created_at,
            updated_at,
            mock_interview_qa (
              id,
              session_id,
              question_index,
              question,
              question_type,
              user_answer,
              feedback,
              created_at
            )
          `)
          .eq('user_id', userId)
          .order('updated_at', { ascending: false });

        if (!error && data) {
          const mapped: MockInterviewSession[] = data.map((d: any) => ({
            id: d.id,
            userId: d.user_id,
            resumeId: d.resume_id,
            resumeTitle: d.resume_title,
            interviewType: d.interview_type,
            targetRole: d.target_role,
            companyName: d.company_name,
            jobDescription: d.job_description,
            difficulty: d.difficulty,
            totalQuestions: d.total_questions,
            currentQuestionIndex: d.current_question_index,
            status: d.status,
            overallFeedback: d.overall_feedback,
            questions: (d.mock_interview_qa || []).sort(
              (a: any, b: any) => a.question_index - b.question_index
            ),
            createdAt: d.created_at,
            updatedAt: d.updated_at,
          }));

          saveLocalSessions(userId, mapped);
          return mapped;
        }
      } catch (err) {
        console.warn('[InterviewService] Supabase error, falling back to local storage:', err);
      }
    }

    return getLocalSessions(userId);
  }

  /**
   * Create a new interview session
   */
  static async createSession(
    config: InterviewSetupConfig,
    userId: string,
    resumeData?: ResumeData | null
  ): Promise<MockInterviewSession> {
    const { isConfigured } = getSupabaseEnv();
    const sessionId = crypto.randomUUID();
    const now = new Date().toISOString();

    // 1. Generate questions tailored to config
    const generatedQuestions = generateInterviewQuestions(
      config.interviewType,
      config.targetRole,
      config.difficulty,
      config.questionCount,
      resumeData,
      config.jobDescription
    );

    const questionsWithSessionId = generatedQuestions.map((q) => ({
      ...q,
      sessionId,
    }));

    const session: MockInterviewSession = {
      id: sessionId,
      userId,
      resumeId: config.resumeId || null,
      resumeTitle: resumeData?.title || resumeData?.personalInfo.fullName || null,
      interviewType: config.interviewType,
      targetRole: config.targetRole.trim(),
      companyName: config.companyName?.trim() || '',
      jobDescription: config.jobDescription?.trim() || '',
      difficulty: config.difficulty,
      totalQuestions: questionsWithSessionId.length,
      currentQuestionIndex: 0,
      status: 'in_progress',
      questions: questionsWithSessionId,
      createdAt: now,
      updatedAt: now,
    };

    if (isConfigured) {
      try {
        await supabase.from('mock_interview_sessions').insert({
          id: session.id,
          user_id: session.userId,
          resume_id: session.resumeId,
          resume_title: session.resumeTitle,
          interview_type: session.interviewType,
          target_role: session.targetRole,
          company_name: session.companyName,
          job_description: session.jobDescription,
          difficulty: session.difficulty,
          total_questions: session.totalQuestions,
          current_question_index: session.currentQuestionIndex,
          status: session.status,
          created_at: session.createdAt,
          updated_at: session.updatedAt,
        });

        // Insert initial questions
        const qaInserts = questionsWithSessionId.map((q) => ({
          id: q.id,
          session_id: sessionId,
          user_id: userId,
          question_index: q.questionIndex,
          question: q.question,
          question_type: q.questionType,
          created_at: q.createdAt,
        }));

        await supabase.from('mock_interview_qa').insert(qaInserts);
      } catch (err) {
        console.warn('[InterviewService] Supabase insert error:', err);
      }
    }

    const current = getLocalSessions(userId);
    saveLocalSessions(userId, [session, ...current]);
    return session;
  }

  /**
   * Submit an answer for the current question
   */
  static async submitAnswer(
    sessionId: string,
    questionIndex: number,
    userAnswer: string,
    userId: string
  ): Promise<{ session: MockInterviewSession; feedback: QuestionFeedback }> {
    const { isConfigured } = getSupabaseEnv();
    const current = getLocalSessions(userId);
    const session = current.find((s) => s.id === sessionId);

    if (!session) {
      throw new Error('Interview session not found');
    }

    const question = session.questions[questionIndex];
    if (!question) {
      throw new Error(`Question index ${questionIndex} out of bounds`);
    }

    // Evaluate answer
    const feedback = evaluateAnswer(question.question, userAnswer, question.questionType);

    question.userAnswer = userAnswer;
    question.feedback = feedback;

    const nextIndex = questionIndex + 1;
    const isCompleted = nextIndex >= session.totalQuestions;

    session.currentQuestionIndex = nextIndex;
    if (isCompleted) {
      session.status = 'completed';

      // Calculate overall session feedback
      const allFeedbacks = session.questions.map((q) => q.feedback).filter(Boolean) as QuestionFeedback[];
      const avgScore =
        allFeedbacks.length > 0
          ? Math.round(
              allFeedbacks.reduce((acc, f) => acc + (f.relevanceScore + f.clarityScore) / 2, 0) /
                allFeedbacks.length
            )
          : 75;

      const strengths = Array.from(new Set(allFeedbacks.flatMap((f) => f.strengths))).slice(0, 3);
      const improvements = Array.from(new Set(allFeedbacks.flatMap((f) => f.improvements))).slice(0, 3);

      session.overallFeedback = {
        overallScore: avgScore,
        strengthsSummary: strengths,
        priorityImprovements: improvements,
        summaryNote: `Completed ${session.totalQuestions}-question ${session.interviewType} practice session for ${session.targetRole}.`,
      };
    }

    session.updatedAt = new Date().toISOString();

    if (isConfigured) {
      try {
        await supabase
          .from('mock_interview_qa')
          .update({
            user_answer: userAnswer,
            feedback,
          })
          .eq('session_id', sessionId)
          .eq('question_index', questionIndex);

        await supabase
          .from('mock_interview_sessions')
          .update({
            current_question_index: session.currentQuestionIndex,
            status: session.status,
            overall_feedback: session.overallFeedback || null,
            updated_at: session.updatedAt,
          })
          .eq('id', sessionId);
      } catch (err) {
        console.warn('[InterviewService] Supabase update error:', err);
      }
    }

    saveLocalSessions(userId, current);
    return { session, feedback };
  }

  /**
   * Pause an in-progress session
   */
  static async pauseSession(sessionId: string, userId: string): Promise<MockInterviewSession> {
    const { isConfigured } = getSupabaseEnv();
    const current = getLocalSessions(userId);
    const session = current.find((s) => s.id === sessionId);

    if (session) {
      session.status = 'paused';
      session.updatedAt = new Date().toISOString();

      if (isConfigured) {
        try {
          await supabase
            .from('mock_interview_sessions')
            .update({ status: 'paused', updated_at: session.updatedAt })
            .eq('id', sessionId);
        } catch (err) {
          console.warn('[InterviewService] Supabase error:', err);
        }
      }

      saveLocalSessions(userId, current);
    }

    return session!;
  }

  /**
   * Delete an interview session
   */
  static async deleteSession(sessionId: string, userId: string): Promise<boolean> {
    const { isConfigured } = getSupabaseEnv();

    if (isConfigured) {
      try {
        await supabase
          .from('mock_interview_sessions')
          .delete()
          .eq('id', sessionId)
          .eq('user_id', userId);
      } catch (err) {
        console.warn('[InterviewService] Supabase delete error:', err);
      }
    }

    const current = getLocalSessions(userId);
    const filtered = current.filter((s) => s.id !== sessionId);
    saveLocalSessions(userId, filtered);
    return true;
  }
}
