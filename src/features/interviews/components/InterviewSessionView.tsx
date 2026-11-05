import React, { useState } from 'react';
import type { MockInterviewSession, QuestionFeedback } from '../types/interview.types';
import { QuestionFeedbackCard } from './QuestionFeedbackCard';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import {
  Briefcase,
  Building2,
  Pause,
  StopCircle,
  Send,
  HelpCircle,
  Award,
} from 'lucide-react';
import { cn } from '@/utils/cn';

interface InterviewSessionViewProps {
  session: MockInterviewSession;
  onSubmitAnswer: (answer: string) => Promise<QuestionFeedback>;
  onNextQuestion: () => void;
  onPause: () => void;
  onEndEarly: () => void;
}

export const InterviewSessionView: React.FC<InterviewSessionViewProps> = ({
  session,
  onSubmitAnswer,
  onNextQuestion,
  onPause,
  onEndEarly,
}) => {
  const currentQIndex = Math.min(session.currentQuestionIndex, session.totalQuestions - 1);
  const currentQ = session.questions[currentQIndex];

  const [answerText, setAnswerText] = useState(currentQ?.userAnswer || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentFeedback, setCurrentFeedback] = useState<QuestionFeedback | null>(
    currentQ?.feedback || null
  );

  const wordCount = answerText.split(/\s+/).filter(Boolean).length;
  const isLastQuestion = currentQIndex === session.totalQuestions - 1;
  const progressPercent = Math.round(((currentQIndex + 1) / session.totalQuestions) * 100);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!answerText.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const fb = await onSubmitAnswer(answerText.trim());
      setCurrentFeedback(fb);
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = () => {
    setCurrentFeedback(null);
    setAnswerText('');
    onNextQuestion();
  };

  return (
    <div className="space-y-6 text-left max-w-4xl mx-auto">
      {/* Session Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl border border-slate-200/90 bg-white p-4 shadow-xs">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-bold text-slate-900">{session.targetRole}</h2>
            {session.companyName && (
              <span className="flex items-center gap-1 text-xs text-slate-500">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                {session.companyName}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Badge variant="teal" className="capitalize text-[10px]">
              {session.interviewType} Track
            </Badge>
            <Badge variant="brand" className="capitalize text-[10px]">
              {session.difficulty} Level
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <Button variant="outline" size="sm" onClick={onPause}>
            <Pause className="w-3.5 h-3.5 mr-1" />
            Pause
          </Button>
          <Button variant="outline" size="sm" onClick={onEndEarly} className="text-rose-600 hover:bg-rose-50">
            <StopCircle className="w-3.5 h-3.5 mr-1" />
            End Early
          </Button>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="space-y-1.5">
        <div className="flex items-center justify-between text-xs text-slate-600 font-semibold">
          <span>Question {currentQIndex + 1} of {session.totalQuestions}</span>
          <span>{progressPercent}% Complete</span>
        </div>
        <div className="h-2 w-full rounded-full bg-slate-200 overflow-hidden">
          <div
            className="h-full bg-teal-600 transition-all duration-300 rounded-full"
            style={{ width: `${progressPercent}%` }}
          />
        </div>
      </div>

      {/* Question Card */}
      <div className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs space-y-3">
        <div className="flex items-center gap-2">
          <span className="flex h-6 w-6 items-center justify-center rounded-md bg-teal-50 text-teal-700 font-bold text-xs">
            Q{currentQIndex + 1}
          </span>
          <span className="capitalize text-[11px] font-bold tracking-wider text-slate-400 uppercase">
            {currentQ?.questionType || session.interviewType} Question
          </span>
        </div>
        <h3 className="text-base font-bold text-slate-900 leading-snug">
          {currentQ?.question}
        </h3>
      </div>

      {/* Candidate Answer Workspace OR Feedback View */}
      {currentFeedback ? (
        <QuestionFeedbackCard
          feedback={currentFeedback}
          isLastQuestion={isLastQuestion}
          onNext={handleNext}
        />
      ) : (
        <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200/90 bg-white p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold uppercase tracking-wider text-slate-700">
              Your Spoken / Written Response
            </label>
            <span
              className={cn(
                'text-[11px] font-semibold',
                wordCount >= 80 ? 'text-emerald-600' : 'text-slate-400'
              )}
            >
              {wordCount} words (Target: 80–250 words)
            </span>
          </div>

          <textarea
            value={answerText}
            onChange={(e) => setAnswerText(e.target.value)}
            rows={8}
            disabled={isSubmitting}
            placeholder="Type your response as you would speak it in a live interview. Structure your answer with clear context, specific actions you took, and measurable results..."
            className="w-full rounded-xl border border-slate-200 bg-slate-50/40 p-4 text-xs text-slate-900 placeholder-slate-400 shadow-2xs focus:border-teal-500 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-teal-500 leading-relaxed font-sans"
          />

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-100">
            <div className="flex items-center gap-1.5 text-[11px] text-slate-500">
              <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
              <span>Tip: Mention technical trade-offs and quantified outcomes to maximize relevance.</span>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="sm"
              disabled={!answerText.trim() || isSubmitting}
              className="bg-teal-600 hover:bg-teal-700 shrink-0"
            >
              {isSubmitting ? (
                <>
                  <Spinner size="sm" />
                  <span className="ml-2">Evaluating Response...</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5 mr-1.5" />
                  Submit Response
                </>
              )}
            </Button>
          </div>
        </form>
      )}
    </div>
  );
};
