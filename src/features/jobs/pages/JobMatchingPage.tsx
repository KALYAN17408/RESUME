import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import { ResumeService } from '@/features/resumes/services/resumeService';
import type { ResumeData } from '@/features/resumes/types/resume.types';
import type { SavedJob, JobFormData } from '../types/job.types';
import { JobService } from '../services/jobService';
import { analyzeJobMatch } from '../services/jobMatchingEngine';
import { JobCard } from '../components/JobCard';
import { JobMatchModal } from '../components/JobMatchModal';
import { JobFormModal } from '../components/JobFormModal';
import { JobFilterBar, type StatusFilterOption, type SortOption } from '../components/JobFilterBar';
import { ConfirmationDialog } from '@/components/ui/ConfirmationDialog';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import {
  Briefcase,
  Plus,
  Sparkles,
  FileText,
  Building2,
  CheckCircle2,
  Clock,
  Layers,
} from 'lucide-react';
import { Link } from 'react-router-dom';

export const JobMatchingPage: React.FC = () => {
  const { user } = useAuthStore();
  const { addToast } = useUIStore();
  const userId = user?.id || 'demo_user';

  // Resumes state
  const [resumes, setResumes] = useState<ResumeData[]>([]);
  const [selectedResumeId, setSelectedResumeId] = useState<string | null>(null);
  const [isLoadingResumes, setIsLoadingResumes] = useState(true);

  // Jobs state
  const [jobs, setJobs] = useState<SavedJob[]>([]);
  const [isLoadingJobs, setIsLoadingJobs] = useState(true);

  // Filters & Sorting
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilterOption>('all');
  const [sortBy, setSortBy] = useState<SortOption>('date_desc');

  // Modals state
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingJob, setEditingJob] = useState<SavedJob | null>(null);
  const [analyzingJob, setAnalyzingJob] = useState<SavedJob | null>(null);
  const [deletingJob, setDeletingJob] = useState<SavedJob | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isReanalyzing, setIsReanalyzing] = useState(false);

  // Selected resume object
  const activeResume = useMemo(() => {
    return resumes.find((r) => r.id === selectedResumeId) || resumes[0] || null;
  }, [resumes, selectedResumeId]);

  // Load resumes
  useEffect(() => {
    let isMounted = true;
    async function fetchResumes() {
      setIsLoadingResumes(true);
      try {
        const items = await ResumeService.listResumes(userId);
        const fullList: ResumeData[] = [];
        for (const it of items) {
          const r = await ResumeService.getResume(it.id, userId);
          if (r) fullList.push(r);
        }
        if (isMounted) {
          setResumes(fullList);
          if (fullList.length > 0 && !selectedResumeId) {
            setSelectedResumeId(fullList[0].id);
          }
        }
      } catch (err) {
        console.warn('Failed to load resumes:', err);
      } finally {
        if (isMounted) setIsLoadingResumes(false);
      }
    }

    fetchResumes();
    return () => {
      isMounted = false;
    };
  }, [userId]);

  // Load saved jobs
  const loadJobs = useCallback(async () => {
    setIsLoadingJobs(true);
    try {
      const list = await JobService.listJobs(userId);
      setJobs(list);
    } catch (err) {
      console.warn('Failed to load jobs:', err);
    } finally {
      setIsLoadingJobs(false);
    }
  }, [userId]);

  useEffect(() => {
    loadJobs();
  }, [loadJobs]);

  // Filter & Sort jobs
  const filteredJobs = useMemo(() => {
    return jobs
      .filter((job) => {
        // Search query filter
        if (searchQuery.trim()) {
          const q = searchQuery.toLowerCase();
          const matchTitle = job.title.toLowerCase().includes(q);
          const matchCompany = job.company.toLowerCase().includes(q);
          const matchLocation = (job.location || '').toLowerCase().includes(q);
          if (!matchTitle && !matchCompany && !matchLocation) return false;
        }

        // Status filter
        if (statusFilter !== 'all') {
          if (statusFilter === 'rejected') {
            return job.status === 'rejected' || job.status === 'withdrawn';
          }
          return job.status === statusFilter;
        }

        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'score_desc') {
          const scoreA = a.matchAnalysis?.overallScore || 0;
          const scoreB = b.matchAnalysis?.overallScore || 0;
          return scoreB - scoreA;
        }
        if (sortBy === 'company_asc') {
          return a.company.localeCompare(b.company);
        }
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });
  }, [jobs, searchQuery, statusFilter, sortBy]);

  // Status counts for pills
  const counts = useMemo(() => {
    const c: Record<string, number> = {
      all: jobs.length,
      interested: 0,
      applied: 0,
      interviewing: 0,
      offer: 0,
      rejected: 0,
    };
    for (const j of jobs) {
      if (j.status === 'interested') c.interested++;
      else if (j.status === 'applied') c.applied++;
      else if (j.status === 'interviewing') c.interviewing++;
      else if (j.status === 'offer') c.offer++;
      else if (j.status === 'rejected' || j.status === 'withdrawn') c.rejected++;
    }
    return c;
  }, [jobs]);

  // Handle Save (Create or Update)
  const handleSaveJob = async (formData: JobFormData, chosenResume?: ResumeData) => {
    const resumeToUse = chosenResume || activeResume;

    let analysis;
    if (resumeToUse && formData.jobDescription) {
      analysis = analyzeJobMatch(resumeToUse, formData.jobDescription, formData.title);
    }

    if (editingJob) {
      await JobService.updateJob(editingJob.id, formData, userId, analysis);
      addToast({
        type: 'success',
        title: 'Job Updated',
        message: `Successfully updated "${formData.title}" at ${formData.company}.`,
      });
    } else {
      await JobService.createJob(
        formData,
        userId,
        analysis,
        resumeToUse?.title || resumeToUse?.personalInfo.fullName
      );
      addToast({
        type: 'success',
        title: 'Opportunity Saved',
        message: `Added "${formData.title}" at ${formData.company} with match analysis.`,
      });
    }

    setEditingJob(null);
    await loadJobs();
  };

  // Handle Re-analysis
  const handleReanalyze = async () => {
    if (!analyzingJob || !activeResume) return;
    setIsReanalyzing(true);
    try {
      const newAnalysis = analyzeJobMatch(
        activeResume,
        analyzingJob.jobDescription,
        analyzingJob.title
      );
      const updated = await JobService.updateJob(
        analyzingJob.id,
        {
          resumeId: activeResume.id,
        },
        userId,
        newAnalysis
      );
      setAnalyzingJob(updated);
      addToast({
        type: 'success',
        title: 'Analysis Updated',
        message: `Re-analyzed match against "${activeResume.title || 'Selected Resume'}".`,
      });
      await loadJobs();
    } catch (err) {
      console.error(err);
    } finally {
      setIsReanalyzing(false);
    }
  };

  // Handle Delete
  const handleConfirmDelete = async () => {
    if (!deletingJob) return;
    setIsDeleting(true);
    try {
      await JobService.deleteJob(deletingJob.id, userId);
      addToast({
        type: 'info',
        title: 'Job Removed',
        message: `Removed "${deletingJob.title}" from your saved jobs.`,
      });
      setDeletingJob(null);
      await loadJobs();
    } catch (err) {
      console.error(err);
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="space-y-6 text-left">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-100 text-blue-700">
              <Briefcase className="w-4 h-4" />
            </span>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">Job Matching & Applications</h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Compare target job descriptions against your verified resume, evaluate ATS alignment, and manage your pipeline.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          {/* Active Resume Selector Context */}
          {resumes.length > 0 && (
            <div className="flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-xs shadow-2xs">
              <FileText className="w-3.5 h-3.5 text-blue-600 shrink-0" />
              <span className="text-slate-500 font-medium">Resume:</span>
              <select
                value={selectedResumeId || ''}
                onChange={(e) => setSelectedResumeId(e.target.value)}
                className="font-semibold text-slate-800 bg-transparent border-none focus:outline-hidden text-xs max-w-[140px] truncate"
              >
                {resumes.map((r) => (
                  <option key={r.id} value={r.id}>
                    {r.title || r.personalInfo.fullName || 'Untitled'}
                  </option>
                ))}
              </select>
            </div>
          )}

          <Button
            variant="primary"
            size="sm"
            onClick={() => {
              setEditingJob(null);
              setIsFormOpen(true);
            }}
          >
            <Plus className="w-4 h-4 mr-1" />
            Add Opportunity
          </Button>
        </div>
      </div>

      {/* Resumes Notice if none exist */}
      {resumes.length === 0 && !isLoadingResumes && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50/70 p-4 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Sparkles className="w-5 h-5 text-amber-600 shrink-0" />
            <p className="text-xs text-amber-900 leading-relaxed">
              You haven’t created a resume yet. To unlock automated qualification matching and skill gap analysis, create your first resume.
            </p>
          </div>
          <Link to="/dashboard/resumes/new">
            <Button variant="outline" size="sm" className="bg-white shrink-0">
              Create Resume
            </Button>
          </Link>
        </div>
      )}

      {/* Quick Metrics Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="rounded-xl border border-slate-200/80 bg-white p-3.5 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Total Tracked</span>
          <p className="text-xl font-black text-slate-900 mt-0.5">{counts.all}</p>
        </div>
        <div className="rounded-xl border border-blue-200/80 bg-blue-50/40 p-3.5 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-700">Applied</span>
          <p className="text-xl font-black text-blue-900 mt-0.5">{counts.applied}</p>
        </div>
        <div className="rounded-xl border border-teal-200/80 bg-teal-50/40 p-3.5 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-teal-700">Interviewing</span>
          <p className="text-xl font-black text-teal-900 mt-0.5">{counts.interviewing}</p>
        </div>
        <div className="rounded-xl border border-emerald-200/80 bg-emerald-50/40 p-3.5 shadow-2xs">
          <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">Offers</span>
          <p className="text-xl font-black text-emerald-900 mt-0.5">{counts.offer}</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <JobFilterBar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        statusFilter={statusFilter}
        onStatusFilterChange={setStatusFilter}
        sortBy={sortBy}
        onSortByChange={setSortBy}
        counts={counts}
      />

      {/* Jobs Grid or Empty State */}
      {isLoadingJobs ? (
        <div className="py-16 text-center space-y-3">
          <Spinner size="md" />
          <p className="text-xs text-slate-500 font-medium">Loading saved opportunities...</p>
        </div>
      ) : filteredJobs.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredJobs.map((job) => (
            <JobCard
              key={job.id}
              job={job}
              onViewAnalysis={(j) => setAnalyzingJob(j)}
              onEdit={(j) => {
                setEditingJob(j);
                setIsFormOpen(true);
              }}
              onDelete={(j) => setDeletingJob(j)}
            />
          ))}
        </div>
      ) : (
        <div className="rounded-2xl border border-dashed border-slate-200 bg-white py-14 px-6 text-center space-y-3">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-slate-100 text-slate-400">
            <Building2 className="w-6 h-6" />
          </div>
          <div className="space-y-1">
            <h3 className="font-bold text-slate-900 text-sm">No job opportunities found</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto leading-relaxed">
              {searchQuery || statusFilter !== 'all'
                ? 'Try clearing your search query or switching status filters.'
                : 'Start tracking jobs and comparing qualifications by adding your first opportunity.'}
            </p>
          </div>
          {searchQuery || statusFilter !== 'all' ? (
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('all');
              }}
            >
              Reset Filters
            </Button>
          ) : (
            <Button
              variant="primary"
              size="sm"
              onClick={() => {
                setEditingJob(null);
                setIsFormOpen(true);
              }}
            >
              <Plus className="w-4 h-4 mr-1" />
              Add Opportunity
            </Button>
          )}
        </div>
      )}

      {/* Job Form Modal */}
      <JobFormModal
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setEditingJob(null);
        }}
        onSave={handleSaveJob}
        editingJob={editingJob}
        resumes={resumes}
        selectedResumeId={selectedResumeId}
      />

      {/* Match Analysis Modal */}
      <JobMatchModal
        job={analyzingJob}
        isOpen={!!analyzingJob}
        onClose={() => setAnalyzingJob(null)}
        onReanalyze={handleReanalyze}
        isReanalyzing={isReanalyzing}
      />

      {/* Delete Confirmation Dialog */}
      <ConfirmationDialog
        isOpen={!!deletingJob}
        onClose={() => setDeletingJob(null)}
        onConfirm={handleConfirmDelete}
        title="Delete Job Opportunity"
        message={`Are you sure you want to remove "${deletingJob?.title}" at ${deletingJob?.company}? This will permanently remove its tracking details and match analysis.`}
        confirmText={isDeleting ? 'Deleting...' : 'Delete Job'}
        type="danger"
      />
    </div>
  );
};
