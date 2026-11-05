import React from 'react';
import type { MockInterviewSession } from '../types/interview.types';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import {
  Calendar,
  Building2,
  Play,
  Eye,
  Trash2,
  Award,
} from 'lucide-react';

interface PastSessionsListProps {
  sessions: MockInterviewSession[];
  onResumeSession: (session: MockInterviewSession) => void;
  onReviewSummary: (session: MockInterviewSession) => void;
  onDeleteSession: (session: MockInterviewSession) => void;
  onNewSession: () => void;
}

export const PastSessionsList: React.FC<PastSessionsListProps> = ({
  sessions,
  onResumeSession,
  onReviewSummary,
  onDeleteSession,
  onNewSession,
}) => {
  if (sessions.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 bg-white py-14 px-6 text-center space-y-3">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-50 text-teal-600">
          <Award className="w-6 h-6" />
        </div>
        <div className="space-y-1">
          <h3 className="font-bold text-slate-900 text-sm">No interview sessions recorded</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
            Practice role-specific behavioral and technical questions to build confidence before real interview loops.
          </p>
        </div>
        <Button variant="primary" size="sm" onClick={onNewSession} className="bg-teal-600 hover:bg-teal-700">
          Start Your First Mock Interview
        </Button>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 text-left">
      {sessions.map((sess) => {
        const isCompleted = sess.status === 'completed';
        const isPaused = sess.status === 'paused' || sess.status === 'in_progress';
        const score = sess.overallFeedback?.overallScore;

        return (
          <div
            key={sess.id}
            className="rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs hover:border-teal-300 hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0 flex-1">
                  <h3 className="font-bold text-slate-900 text-sm truncate">{sess.targetRole}</h3>
                  {sess.companyName && (
                    <span className="flex items-center gap-1 text-xs text-slate-500 mt-0.5">
                      <Building2 className="w-3.5 h-3.5 text-slate-400" />
                      {sess.companyName}
                    </span>
                  )}
                </div>

                <Badge
                  variant={isCompleted ? 'success' : isPaused ? 'amber' : 'default'}
                  className="capitalize text-[10px]"
                >
                  {sess.status.replace('_', ' ')}
                </Badge>
              </div>

              <div className="flex flex-wrap gap-1.5 text-[10px] font-semibold">
                <span className="capitalize px-2 py-0.5 rounded-md bg-teal-50 text-teal-700 border border-teal-100">
                  {sess.interviewType}
                </span>
                <span className="capitalize px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
                  {sess.difficulty}
                </span>
                <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
                  {sess.totalQuestions} Questions
                </span>
              </div>

              {isCompleted && score !== undefined && (
                <div className="rounded-xl border border-emerald-100 bg-emerald-50/50 p-2.5 flex items-center justify-between">
                  <span className="text-xs font-bold text-emerald-900">Performance Rating:</span>
                  <span className="text-xs font-black text-emerald-700">{score}%</span>
                </div>
              )}

              {isPaused && (
                <p className="text-[11px] text-amber-700 bg-amber-50 p-2 rounded-lg border border-amber-100">
                  Paused at Question {sess.currentQuestionIndex + 1} of {sess.totalQuestions}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between border-t border-slate-100 pt-3 mt-4 text-[11px] text-slate-400">
              <span className="flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5" />
                {new Date(sess.createdAt).toLocaleDateString()}
              </span>

              <div className="flex items-center gap-1.5">
                {isPaused ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onResumeSession(sess)}
                    className="text-teal-700 border-teal-200 hover:bg-teal-50"
                  >
                    <Play className="w-3.5 h-3.5 mr-1" />
                    Resume
                  </Button>
                ) : (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => onReviewSummary(sess)}
                  >
                    <Eye className="w-3.5 h-3.5 mr-1" />
                    Review
                  </Button>
                )}

                <button
                  onClick={() => onDeleteSession(sess)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                  title="Delete session"
                  aria-label="Delete session"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
