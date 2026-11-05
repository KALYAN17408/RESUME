import React from 'react';
import type { MockInterviewSession } from '../types/interview.types';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import { Award, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';
import { cn } from '@/utils/cn';

interface InterviewSummaryModalProps {
  session: MockInterviewSession | null;
  isOpen: boolean;
  onClose: () => void;
  onRestart: () => void;
}

export const InterviewSummaryModal: React.FC<InterviewSummaryModalProps> = ({
  session,
  isOpen,
  onClose,
  onRestart,
}) => {
  if (!session) return null;

  const summary = session.overallFeedback;
  const score = summary?.overallScore || 75;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Interview Session Summary"
      description={`${session.targetRole} • ${session.totalQuestions} Questions Completed`}
    >
      <div className="space-y-6 text-left max-h-[75vh] overflow-y-auto pr-1">
        {/* Score Banner */}
        <div className="rounded-2xl border border-teal-200/80 bg-gradient-to-r from-teal-50/70 via-emerald-50/30 to-slate-50 p-5 flex items-center justify-between gap-6">
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-teal-800">
              Overall Performance Rating
            </span>
            <h4 className="text-xl font-black text-slate-900">
              {score >= 80 ? 'Interview Ready' : score >= 60 ? 'Competent with Growth Areas' : 'Needs Practice'}
            </h4>
            <p className="text-xs text-slate-600 leading-relaxed max-w-md">
              {summary?.summaryNote || 'Comprehensive text interview practice session completed.'}
            </p>
          </div>

          <div
            className={cn(
              'flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-2xl border-2 font-black shadow-xs',
              score >= 80
                ? 'border-emerald-500 bg-white text-emerald-700'
                : score >= 60
                ? 'border-teal-500 bg-white text-teal-700'
                : 'border-amber-500 bg-white text-amber-700'
            )}
          >
            <span className="text-2xl leading-none">{score}</span>
            <span className="text-[9px] font-bold uppercase text-slate-400">Rating</span>
          </div>
        </div>

        {/* Strengths & Improvements */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-xl border border-emerald-200/80 bg-emerald-50/30 p-4 space-y-2">
            <h5 className="flex items-center gap-1.5 text-xs font-bold text-emerald-900 uppercase tracking-wider">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              Key Strengths Demonstrated
            </h5>
            <ul className="space-y-1.5 text-xs text-slate-700">
              {(summary?.strengthsSummary || ['Direct responses', 'Good technical foundation']).map((s, i) => (
                <li key={i} className="flex items-start gap-1.5 leading-relaxed">
                  <span className="text-emerald-500 font-bold">•</span>
                  <span>{s}</span>
                </li>
              ))}
            </ul>
          </div>

          <div className="rounded-xl border border-amber-200/80 bg-amber-50/30 p-4 space-y-2">
            <h5 className="flex items-center gap-1.5 text-xs font-bold text-amber-900 uppercase tracking-wider">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              High-Priority Practice Areas
            </h5>
            <ul className="space-y-1.5 text-xs text-slate-700">
              {(summary?.priorityImprovements || ['Add concrete metrics', 'Structure using STAR']).map((imp, i) => (
                <li key={i} className="flex items-start gap-1.5 leading-relaxed">
                  <span className="text-amber-500 font-bold">•</span>
                  <span>{imp}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Detailed Questions & Answers Breakdown */}
        <div className="space-y-3">
          <h5 className="text-xs font-bold uppercase tracking-wider text-slate-800">
            Session Q&A Transcript
          </h5>
          <div className="space-y-3">
            {session.questions.map((q, idx) => (
              <div key={idx} className="rounded-xl border border-slate-200 bg-white p-3.5 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="font-bold text-slate-900">
                    Q{idx + 1}: {q.question}
                  </span>
                  {q.feedback && (
                    <span className="text-[11px] font-semibold text-teal-700">
                      Score: {Math.round((q.feedback.relevanceScore + q.feedback.clarityScore) / 2)}%
                    </span>
                  )}
                </div>
                {q.userAnswer && (
                  <p className="text-slate-600 italic bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                    "{q.userAnswer}"
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Modal Buttons */}
        <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
          <Button variant="outline" size="sm" onClick={onRestart}>
            Practice Again
          </Button>
          <Button variant="primary" size="sm" onClick={onClose} className="bg-teal-600 hover:bg-teal-700">
            Done
          </Button>
        </div>
      </div>
    </Modal>
  );
};
