import React, { useState, useEffect } from 'react';
import type { SavedJob, JobFormData, EmploymentType, JobApplicationStatus } from '../types/job.types';
import type { ResumeData } from '@/features/resumes/types/resume.types';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Building2, Briefcase, MapPin, Globe, Calendar } from 'lucide-react';

interface JobFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: JobFormData, selectedResume?: ResumeData) => Promise<void>;
  editingJob?: SavedJob | null;
  resumes: ResumeData[];
  selectedResumeId?: string | null;
}

export const JobFormModal: React.FC<JobFormModalProps> = ({
  isOpen,
  onClose,
  onSave,
  editingJob,
  resumes,
  selectedResumeId,
}) => {
  const [title, setTitle] = useState('');
  const [company, setCompany] = useState('');
  const [location, setLocation] = useState('');
  const [employmentType, setEmploymentType] = useState<EmploymentType>('full-time');
  const [jobUrl, setJobUrl] = useState('');
  const [jobDescription, setJobDescription] = useState('');
  const [status, setStatus] = useState<JobApplicationStatus>('interested');
  const [resumeId, setResumeId] = useState<string>('');
  const [appliedDate, setAppliedDate] = useState('');
  const [nextActionDate, setNextActionDate] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (editingJob) {
      setTitle(editingJob.title || '');
      setCompany(editingJob.company || '');
      setLocation(editingJob.location || '');
      setEmploymentType(editingJob.employmentType || 'full-time');
      setJobUrl(editingJob.jobUrl || '');
      setJobDescription(editingJob.jobDescription || '');
      setStatus(editingJob.status || 'interested');
      setResumeId(editingJob.resumeId || selectedResumeId || (resumes[0]?.id || ''));
      setAppliedDate(editingJob.appliedDate ? editingJob.appliedDate.split('T')[0] : '');
      setNextActionDate(editingJob.nextActionDate ? editingJob.nextActionDate.split('T')[0] : '');
      setNotes(editingJob.notes || '');
    } else {
      setTitle('');
      setCompany('');
      setLocation('');
      setEmploymentType('full-time');
      setJobUrl('');
      setJobDescription('');
      setStatus('interested');
      setResumeId(selectedResumeId || (resumes[0]?.id || ''));
      setAppliedDate('');
      setNextActionDate('');
      setNotes('');
    }
    setErrors({});
  }, [editingJob, isOpen, selectedResumeId, resumes]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (!title.trim()) newErrors.title = 'Job title is required';
    if (!company.trim()) newErrors.company = 'Company name is required';
    if (!jobDescription.trim()) newErrors.jobDescription = 'Job description is required for matching analysis';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    setIsSubmitting(true);
    try {
      const selectedResume = resumes.find((r) => r.id === resumeId);
      await onSave(
        {
          title: title.trim(),
          company: company.trim(),
          location: location.trim(),
          employmentType,
          jobUrl: jobUrl.trim(),
          jobDescription: jobDescription.trim(),
          status,
          resumeId: resumeId || undefined,
          appliedDate: appliedDate ? new Date(appliedDate).toISOString() : undefined,
          nextActionDate: nextActionDate ? new Date(nextActionDate).toISOString() : undefined,
          notes: notes.trim(),
        },
        selectedResume
      );
      onClose();
    } catch (err) {
      console.error('Failed to save job:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={editingJob ? 'Edit Saved Job' : 'Add New Job Opportunity'}
      description="Track job applications and evaluate match compatibility against your resume."
    >
      <form onSubmit={handleSubmit} className="space-y-4 text-left max-h-[75vh] overflow-y-auto pr-1">
        {/* Title & Company */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Input
            label="Job Title *"
            placeholder="e.g. Senior Frontend Engineer"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            error={errors.title}
            leftIcon={<Briefcase className="w-4 h-4" />}
          />
          <Input
            label="Company *"
            placeholder="e.g. Stripe, Google, Linear"
            value={company}
            onChange={(e) => setCompany(e.target.value)}
            error={errors.company}
            leftIcon={<Building2 className="w-4 h-4" />}
          />
        </div>

        {/* Location & Employment Type */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Input
            label="Location"
            placeholder="e.g. Remote, San Francisco, CA"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            leftIcon={<MapPin className="w-4 h-4" />}
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">Employment Type</label>
            <select
              value={employmentType}
              onChange={(e) => setEmploymentType(e.target.value as EmploymentType)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 shadow-2xs focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              <option value="full-time">Full-time</option>
              <option value="part-time">Part-time</option>
              <option value="contract">Contract</option>
              <option value="remote">Remote</option>
              <option value="internship">Internship</option>
            </select>
          </div>
        </div>

        {/* Job URL & Application Status */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Input
            label="Job Posting URL"
            placeholder="https://jobs.example.com/posting/123"
            value={jobUrl}
            onChange={(e) => setJobUrl(e.target.value)}
            leftIcon={<Globe className="w-4 h-4" />}
          />

          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">Application Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value as JobApplicationStatus)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 shadow-2xs focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              <option value="interested">Interested (Saved)</option>
              <option value="applied">Applied</option>
              <option value="interviewing">Interviewing</option>
              <option value="offer">Offer Received</option>
              <option value="rejected">Not Selected</option>
              <option value="withdrawn">Withdrawn</option>
            </select>
          </div>
        </div>

        {/* Selected Resume for Matching */}
        {resumes.length > 0 && (
          <div className="space-y-1.5">
            <label className="block text-xs font-semibold text-slate-700">Resume to Match Against</label>
            <select
              value={resumeId}
              onChange={(e) => setResumeId(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 shadow-2xs focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
            >
              {resumes.map((r) => (
                <option key={r.id} value={r.id}>
                  {r.title || r.personalInfo.fullName || 'Untitled Resume'} (Template: {r.templateId})
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Dates (Applied & Next Action) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <Input
            label="Date Applied"
            type="date"
            value={appliedDate}
            onChange={(e) => setAppliedDate(e.target.value)}
            leftIcon={<Calendar className="w-4 h-4" />}
          />
          <Input
            label="Next Action / Follow-up Date"
            type="date"
            value={nextActionDate}
            onChange={(e) => setNextActionDate(e.target.value)}
            leftIcon={<Calendar className="w-4 h-4" />}
          />
        </div>

        {/* Job Description (required for matching) */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="block text-xs font-semibold text-slate-700">Job Description *</label>
            <span className="text-[10px] text-slate-400">{jobDescription.length} characters</span>
          </div>
          <textarea
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            rows={5}
            placeholder="Paste the full job description here. The matching engine will analyze required qualifications, skills, and tools against your resume..."
            className="w-full rounded-xl border border-slate-200 bg-white p-3 text-xs text-slate-800 placeholder-slate-400 shadow-2xs focus:border-blue-500 focus:ring-1 focus:ring-blue-500 font-mono"
          />
          {errors.jobDescription && (
            <p className="text-[11px] text-rose-600 font-medium">{errors.jobDescription}</p>
          )}
        </div>

        {/* Notes */}
        <div className="space-y-1.5">
          <label className="block text-xs font-semibold text-slate-700">Application Notes</label>
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            rows={2}
            placeholder="e.g. Recruiter contact, referral details, interview schedule, questions to ask..."
            className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-800 placeholder-slate-400 shadow-2xs focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </div>

        {/* Modal Buttons */}
        <div className="flex justify-end gap-2.5 pt-3 border-t border-slate-100">
          <Button type="button" variant="outline" size="sm" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" size="sm" disabled={isSubmitting}>
            {isSubmitting ? 'Saving & Analyzing...' : editingJob ? 'Update Opportunity' : 'Save & Match Opportunity'}
          </Button>
        </div>
      </form>
    </Modal>
  );
};
