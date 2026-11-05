import React, { useState } from 'react';
import type {
  InterviewSetupConfig,
  InterviewType,
  InterviewDifficulty,
} from '../types/interview.types';
import type { ResumeData } from '@/features/resumes/types/resume.types';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Briefcase, Building2 } from 'lucide-react';

interface InterviewSetupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onStart: (config: InterviewSetupConfig, selectedResume?: ResumeData) => Promise<void>;
  resumes: ResumeData[];
  defaultRole?: string;
}

export const InterviewSetupModal: React.FC<InterviewSetupModalProps> = ({
  isOpen,
  onClose,
  onStart,
  resumes,
  defaultRole = 'Full Stack Engineer',
}) => {
  const [targetRole, setTargetRole] = useState(defaultRole);
  const [companyName, setCompanyName] = useState('');
  const [interviewType, setInterviewType] = useState<InterviewType>('mixed');
  const [difficulty, setDifficulty] = useState<InterviewDifficulty>('intermediate');
  const [questionCount, setQuestionCount] = useState<number>(3);
  const [resumeId, setResumeId] = useState<string>(resumes[0]?.id || '');
  const [jobDescription, setJobDescription] = useState('');
  const [isStarting, setIsStarting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetRole.trim()) {
      setError('Target role is required');
      return;
    }

    setIsStarting(true);
    setError('');
    try {
      const selectedResume = resumes.find((r) => r.id === resumeId);
      await onStart(
        {
          targetRole: targetRole.trim(),
          companyName: companyName.trim(),
          interviewType,
          difficulty,
          questionCount,
          resumeId: resumeId || undefined,
          jobDescription: jobDescription.trim() || undefined,
        },
        selectedResume
      );
      onClose();
    } catch (err) {
      console.error(err);
      setError('Failed to initialize session. Please try again.');
    } finally {
      setIsStarting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Configure Mock Interview"
      description="Practice role-specific interview questions with real-time feedback."
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-left max-h-[75vh] overflow-y-auto pr-1">
        {/* Target Role & Company */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Input
            label="Target Role *"
            placeholder="e.g. Senior React Developer"
            value={targetRole}
            onChange={(e) => setTargetRole(e.target.value)}
            error={error}
            leftIcon={<Briefcase className="w-4 h-4" />}
          />
          <Input
            label="Company (Optional)"
            placeholder="e.g. Stripe, Netflix, Startup"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            leftIcon={<Building2 className="w-4 h-4" />}
          />
        </div>

        {/* Interview Type & Difficulty */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">Interview Track</label>
            <select
              value={interviewType}
              onChange={(e) => setInterviewType(e.target.value as InterviewType)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 shadow-2xs focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
            >
              <option value="mixed">Mixed (Behavioral + Technical)</option>
              <option value="behavioral">Behavioral (STAR Method)</option>
              <option value="technical">Technical & Architecture</option>
              <option value="situational">HR & Situational Scenarios</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">Difficulty Level</label>
            <select
              value={difficulty}
              onChange={(e) => setDifficulty(e.target.value as InterviewDifficulty)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 shadow-2xs focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
            >
              <option value="beginner">Beginner (Foundational Concepts)</option>
              <option value="intermediate">Intermediate (Trade-offs & Scenarios)</option>
              <option value="advanced">Advanced (System Scale & Leadership)</option>
            </select>
          </div>
        </div>

        {/* Question Count & Resume Grounding */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">Number of Questions</label>
            <select
              value={questionCount}
              onChange={(e) => setQuestionCount(Number(e.target.value))}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 shadow-2xs focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
            >
              <option value={3}>3 Questions (Quick Drill ~ 10 mins)</option>
              <option value={5}>5 Questions (Standard ~ 20 mins)</option>
              <option value={7}>7 Questions (Comprehensive ~ 30 mins)</option>
            </select>
          </div>

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">Resume Grounding</label>
            <select
              value={resumeId}
              onChange={(e) => setResumeId(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 shadow-2xs focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
            >
              <option value="">No Resume Context</option>
              {resumes.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.title || r.personalInfo.fullName}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Job Description (Optional) */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700">
            Target Job Description (Optional)
          </label>
          <textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            rows={3}
            placeholder="Paste target job requirements to tailor interview questions specifically to the company's expectations..."
            className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-800 placeholder-slate-400 shadow-2xs focus:border-teal-500 focus:ring-1 focus:ring-teal-500"
          />
        </div>

        <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
          <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isStarting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm" disabled={isStarting} className="bg-teal-600 hover:bg-teal-700">
            {isStarting ? 'Preparing Session...' : 'Start Practice Session'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
