import React, { useState, useEffect, useCallback } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import { ResumeService } from '@/features/resumes/services/resumeService';
import type { ResumeData } from '@/features/resumes/types/resume.types';
import type {
  MockInterviewSession,
  InterviewSetupConfig,
  QuestionFeedback,
} from '../types/interview.types';
import { InterviewService } from '../services/interviewService';
import { InterviewSetupModal } from '../components/InterviewSetupModal';
import { InterviewSessionView } from '../components/InterviewSessionView';
import { InterviewSummaryModal } from '../components/InterviewSummaryModal';
import { PastSessionsList } from '../components/PastSessionsList';
import { ConfirmationDialog } from '@/components/ui/ConfirmationDialog';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import {
  MessageSquare,
  Plus,
  Award,
  CheckCircle2,
  Clock,
  Sparkles,
  Layers,
} from 'lucide-react';

export const MockInterviewPage: React.FC = () => {
  const { user } = useAuthStore();
  const { addToast } = useUIStore();
  const userId = user?.id || 'demo_user';

  // Resumes state
  const [resumes, setResumes] = useState<ResumeData[]>([]);

  // Sessions state
  const [sessions, setSessions] = useState<MockInterviewSession[]>([]);
  const [activeSession, setActiveSession] = useState<MockInterviewSession | null>(null);
  const [isLoadingSessions, setIsLoadingSessions] = useState(true);

  // Modals state
  const [isSetupOpen, setIsSetupOpen] = useState(false);
  const [summarySession, setSummarySession] = useState<MockInterviewSession | null>(null);
  const [deletingSession, setDeletingSession] = useState<MockInterviewSession | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Load resumes
  useEffect(() => {
    let isMounted = true;
    async function fetchResumes() {
      try {
        const items = await ResumeService.listResumes(userId);
        const fullList: ResumeData[] = [];
        for (const it of items) {
          const r = await ResumeService.getResume(it.id, userId);
          if (r) fullList.push(r);
        }
        if (isMounted) setResumes(fullList);
      } catch (err) {
        console.warn('Failed to load resumes:', err);
      }
    }
    fetchResumes();
    return () => {
      isMounted = false;
    };
  }, [userId]);

  // Load sessions
  const loadSessions = useCallback(async () => {
    setIsLoadingSessions(true);
    try {
      const list = await InterviewService.listSessions(userId);
      setSessions(list);
    } catch (err) {
      console.warn('Failed to load interview sessions:', err);
    } finally {
      setIsLoadingSessions(false);
    }
  }, [userId]);

  useEffect(() => {
    loadSessions();
  }, [loadSessions]);

  // Start new session handler
  const handleStartSession = async (config: InterviewSetupConfig, resume?: ResumeData) => {
    const newSession = await InterviewService.createSession(config, userId, resume);
    setActiveSession(newSession);
    addToast({
      type: 'success',
      title: 'Interview Ready',
      message: `Started ${newSession.totalQuestions}-question ${newSession.interviewType} session for ${newSession.targetRole}.`,
    });
    await loadSessions();
  };

  // Submit answer
  const handleSubmitAnswer = async (answer: string): Promise<QuestionFeedback> => {
    if (!activeSession) throw new Error('No active session');
    const { session: updated, feedback } = await InterviewService.submitAnswer(
      activeSession.id,
      activeSession.currentQuestionIndex,
      answer,
      userId
    );
    setActiveSession({ ...updated });
    await loadSessions();
    return feedback;
  };

  // Next question / complete session
  const handleNextQuestion = () => {
    if (!activeSession) return;
    if (activeSession.currentQuestionIndex >= activeSession.totalQuestions) {
      setSummarySession(activeSession);
      setActiveSession(null);
    }
  };

  // Pause session
  const handlePauseSession = async () => {
    if (!activeSession) return;
    await InterviewService.pauseSession(activeSession.id, userId);
    addToast({
      type: 'info',
      title: 'Session Paused',
      message: 'Your progress has been saved. You can resume anytime from Session History.',
    });
    setActiveSession(null);
    await loadSessions();
  };

  // End early
  const handleEndEarly = async () => {
    if (!activeSession) return;
    setSummarySession(activeSession);
    setActiveSession(null);
    await loadSessions();
  };

  // Delete session
  const handleConfirmDelete = async () => {
    if (!deletingSession) return;
    setIsDeleting(true);
    try {
      await InterviewService.deleteSession(deletingSession.id, userId);
      addToast({
        type: 'info',
        title: 'Session Removed',
        message: 'Deleted interview session from history.',
      });
      setDeletingSession(null);
      await loadSessions();
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 text-left">
      {/* If active session in progress, show active session view */}
      {activeSession ? (
        <InterviewSessionView
          session={activeSession}
          onSubmitAnswer={handleSubmitAnswer}
          onNextQuestion={handleNextQuestion}
          onPause={handlePauseSession}
          onEndEarly={handleEndEarly}
        />
      ) : (
        <>
          {/* Main Interview Hub Page Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2">
                <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-100 text-teal-700">
                  <MessageSquare className="w-4 h-4" />
                </span>
                <h1 className="text-xl font-bold tracking-tight text-slate-900">
                  Interactive Mock Interviews
                </h1>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                Practice role-specific behavioral, technical, and situational interview questions with automated STAR feedback.
              </p>
            </div>

            <Button
              variant="primary"
              size="sm"
              onClick={() => setIsSetupOpen(true)}
              className="bg-teal-600 hover:bg-teal-700 shrink-0"
            >
              <Plus className="w-4 h-4 mr-1" />
              New Mock Interview
            </Button>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Drills</span>
              <p className="text-xl font-black text-slate-900 mt-0.5">{sessions.length}</p>
            </div>
            <div className="rounded-xl border border-teal-200/80 bg-teal-50/40 p-3.5 shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700">Completed</span>
              <p className="text-xl font-black text-teal-900 mt-0.5">
                {sessions.filter((s) => s.status === 'completed').length}
              </p>
            </div>
            <div className="rounded-xl border border-amber-200/80 bg-amber-50/40 p-3.5 shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700">In Progress</span>
              <p className="text-xl font-black text-amber-900 mt-0.5">
                {sessions.filter((s) => s.status === 'paused' || s.status === 'in_progress').length}
              </p>
            </div>
            <div className="rounded-xl border border-emerald-200/80 bg-emerald-50/40 p-3.5 shadow-2xs">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">Avg Rating</span>
              <p className="text-xl font-black text-emerald-900 mt-0.5">
                {sessions.filter((s) => s.overallFeedback?.overallScore).length > 0
                  ? Math.round(
                      sessions
                        .filter((s) => s.overallFeedback?.overallScore)
                        .reduce((a, b) => a + (b.overallFeedback?.overallScore || 0), 0) /
                        sessions.filter((s) => s.overallFeedback?.overallScore).length
                    ) + '%'
                  : '--'}
              </p>
            </div>
          </div>

          {/* Past Sessions List */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Practice Session History
              </h2>
              <span className="text-xs text-slate-500 font-medium">
                {sessions.length} recorded session(s)
              </span>
            </div>

            {isLoadingSessions ? (
              <div className="py-16 text-center space-y-3">
                <Spinner size="md" />
                <p className="text-xs text-slate-500 font-medium">Loading interview sessions...</p>
              </div>
            ) : (
              <PastSessionsList
                sessions={sessions}
                onResumeSession={(s) => setActiveSession(s)}
                onReviewSummary={(s) => setSummarySession(s)}
                onDeleteSession={(s) => setDeletingSession(s)}
                onNewSession={() => setIsSetupOpen(true)}
              />
            )}
          </div>
        </>
      )}

      {/* Setup Modal */}
      <InterviewSetupModal
        isOpen={isSetupOpen}
        onClose={() => setIsSetupOpen(false)}
        onStart={handleStartSession}
        resumes={resumes}
        defaultRole={resumes[0]?.personalInfo.professionalTitle || 'Software Engineer'}
      />

      {/* Summary Modal */}
      <InterviewSummaryModal
        session={summarySession}
        isOpen={!!summarySession}
        onClose={() => setSummarySession(null)}
        onRestart={() => {
          setSummarySession(null);
          setIsSetupOpen(true);
        }}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={!!deletingSession}
        onClose={() => setDeletingSession(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Interview Session"
        message={`Are you sure you want to delete this ${deletingSession?.interviewType} mock interview for ${deletingSession?.targetRole}? All answers and feedback will be removed.`}
        confirmText={isDeleting ? 'Deleting...' : 'Delete Session'}
        type="danger"
      />
    </div>
  );
};
