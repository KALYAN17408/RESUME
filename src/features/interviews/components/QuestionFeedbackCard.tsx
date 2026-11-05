import React, { useState } from 'react';
import type { QuestionFeedback } from '../types/interview.types';
import { Button } from '@/components/ui/Button';
import {
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  ChevronDown,
  ChevronUp,
  ArrowRight,
  ShieldCheck,
} from 'lucide-react';
import { cn } from '@/utils/cn';

interface QuestionFeedbackCardProps {
  feedback: QuestionFeedback;
  isLastQuestion: boolean;
  onNext: () => void;
}

export const QuestionFeedbackCard: React.FC<QuestionFeedbackCardProps> = ({
  feedback,
  isLastQuestion,
  onNext,
}) => {
  const [showSample, setShowSample] = useState(false);

  return (
    <div className="rounded-2xl border border-teal-200/80 bg-teal-50/20 p-5 space-y-4 text-left shadow-xs">
      {/* Top Header & Scores */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-teal-100 pb-3">
        <div className="flex items-center gap-2">
          <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-100 text-teal-700">
            <Sparkles className="w-4 h-4" />
          </span>
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-teal-900">
              Answer Assessment & Feedback
            </h4>
            <span className="text-[10px] text-slate-500">Real-time evaluated criteria</span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Relevance</span>
            <span className="text-xs font-black text-slate-800">{feedback.relevanceScore}%</span>
          </div>
          <div className="h-6 w-px bg-slate-200" />
          <div className="text-right">
            <span className="text-[10px] uppercase font-bold text-slate-400 block">Clarity</span>
            <span className="text-xs font-black text-slate-800">{feedback.clarityScore}%</span>
          </div>
        </div>
      </div>

      {/* Behavioral STAR Checklist (if present) */}
      {feedback.starEvaluation && (
        <div className="rounded-xl border border-slate-200/90 bg-white p-3.5 space-y-2">
          <h5 className="text-[11px] font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
            <ShieldCheck className="w-4 h-4 text-teal-600" />
            STAR Method Framework Adherence
          </h5>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1">
            {[
              { label: 'Situation', ok: feedback.starEvaluation.situationPresent },
              { label: 'Task', ok: feedback.starEvaluation.taskPresent },
              { label: 'Action', ok: feedback.starEvaluation.actionPresent },
              { label: 'Result', ok: feedback.starEvaluation.resultPresent },
            ].map((item, idx) => (
              <div
                key={idx}
                className={cn(
                  'flex items-center gap-1.5 rounded-lg px-2.5 py-1 text-xs font-semibold border',
                  item.ok
                    ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                    : 'bg-amber-50 text-amber-800 border-amber-200'
                )}
              >
                {item.ok ? (
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                ) : (
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                )}
                <span>{item.label}</span>
              </div>
            ))}
          </div>
          <p className="text-[11px] text-slate-600 mt-1 leading-relaxed">
            {feedback.starEvaluation.notes}
          </p>
        </div>
      )}

      {/* Strengths & Improvements Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {/* Strengths */}
        <div className="rounded-xl border border-emerald-200/80 bg-white p-3.5 space-y-2">
          <h5 className="text-[11px] font-bold uppercase tracking-wider text-emerald-900 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            Identified Strengths
          </h5>
          <ul className="space-y-1.5 text-xs text-slate-700">
            {feedback.strengths.map((str, idx) => (
              <li key={idx} className="flex items-start gap-1.5 leading-relaxed">
                <span className="text-emerald-500 font-bold">•</span>
                <span>{str}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Improvement Areas */}
        <div className="rounded-xl border border-amber-200/80 bg-white p-3.5 space-y-2">
          <h5 className="text-[11px] font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
            Areas for Refinement
          </h5>
          <ul className="space-y-1.5 text-xs text-slate-700">
            {feedback.improvements.map((imp, idx) => (
              <li key={idx} className="flex items-start gap-1.5 leading-relaxed">
                <span className="text-amber-500 font-bold">•</span>
                <span>{imp}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Suggested Model Answer Accordion */}
      <div className="rounded-xl border border-slate-200 bg-white overflow-hidden">
        <button
          onClick={() => setShowSample(!showSample)}
          className="flex w-full items-center justify-between p-3 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
        >
          <span>View Recommended Answer Framework & Example</span>
          {showSample ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
        </button>
        {showSample && (
          <div className="border-t border-slate-100 p-3.5 space-y-2 bg-slate-50/50 text-xs text-slate-700 leading-relaxed font-mono">
            <p className="font-semibold text-slate-900 font-sans">{feedback.suggestedAnswerStructure}</p>
            <div className="rounded-lg bg-white p-3 border border-slate-200 text-slate-800 whitespace-pre-wrap text-[11px]">
              {feedback.sampleAnswer}
            </div>
            <p className="text-[10px] text-slate-400 font-sans">
              Note: This model answer is for structural reference. Adapt it with your genuine project background.
            </p>
          </div>
        )}
      </div>

      {/* Action to proceed */}
      <div className="flex justify-end pt-2">
        <Button variant="primary" size="sm" onClick={onNext} className="bg-teal-600 hover:bg-teal-700">
          <span>{isLastQuestion ? 'Complete Interview & View Summary' : 'Proceed to Next Question'}</span>
          <ArrowRight className="w-4 h-4 ml-1.5" />
        </Button>
      </div>
    </div>
  );
};
