import React from 'react';
import type { SavedJob, JobApplicationStatus } from '../types/job.types';
import { Badge } from '@/components/ui/Badge';
import {
  Building2,
  MapPin,
  Calendar,
  ExternalLink,
  Sparkles,
  MoreVertical,
  CheckCircle2,
  Clock,
  Briefcase,
} from 'lucide-react';
import { cn } from '@/utils/cn';

interface JobCardProps {
  job: SavedJob;
  onViewAnalysis: (job: SavedJob) => void;
  onEdit: (job: SavedJob) => void;
  onDelete: (job: SavedJob) => void;
}

const STATUS_CONFIG: Record<
  JobApplicationStatus,
  { label: string; variant: 'default' | 'brand' | 'success' | 'warning' | 'error' | 'violet' | 'teal' | 'amber' }
> = {
  interested: { label: 'Interested', variant: 'brand' },
  applied: { label: 'Applied', variant: 'violet' },
  interviewing: { label: 'Interviewing', variant: 'teal' },
  offer: { label: 'Offer Received', variant: 'success' },
  rejected: { label: 'Not Selected', variant: 'error' },
  withdrawn: { label: 'Withdrawn', variant: 'default' },
};

export const JobCard: React.FC<JobCardProps> = ({ job, onViewAnalysis, onEdit, onDelete }) => {
  const statusInfo = STATUS_CONFIG[job.status] || { label: job.status, variant: 'default' };
  const score = job.matchAnalysis?.overallScore;

  return (
    <div className="group relative rounded-2xl border border-slate-200/90 bg-white p-5 shadow-xs transition-all hover:border-blue-200 hover:shadow-md">
      {/* Top row: Role, Company & Status */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1 text-left flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h3 className="font-bold text-slate-900 text-sm truncate group-hover:text-blue-600 transition-colors">
              {job.title}
            </h3>
            {job.jobUrl && (
              <a
                href={job.jobUrl}
                target="_blank"
                rel="noreferrer"
                className="text-slate-400 hover:text-blue-600 transition-colors"
                title="Open original job posting"
              >
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-slate-500">
            <span className="flex items-center gap-1 font-medium text-slate-700">
              <Building2 className="w-3.5 h-3.5 text-slate-400" />
              {job.company}
            </span>
            {job.location && (
              <span className="flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-slate-400" />
                {job.location}
              </span>
            )}
            {job.employmentType && (
              <span className="capitalize px-1.5 py-0.5 rounded-md bg-slate-100 text-slate-600 text-[10px] font-semibold">
                {job.employmentType.replace('-', ' ')}
              </span>
            )}
          </div>
        </div>

        {/* Status badge */}
        <Badge variant={statusInfo.variant} className="shrink-0 text-[10px] uppercase font-bold tracking-wider">
          {statusInfo.label}
        </Badge>
      </div>

      {/* Middle row: Match Score & Matched Skills */}
      <div className="my-4 rounded-xl border border-slate-100 bg-slate-50/70 p-3 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          {score !== undefined ? (
            <div
              className={cn(
                'flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-black text-xs shadow-xs',
                score >= 80
                  ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                  : score >= 60
                  ? 'bg-blue-50 text-blue-700 border border-blue-200'
                  : 'bg-amber-50 text-amber-700 border border-amber-200'
              )}
            >
              {score}%
            </div>
          ) : (
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-400 font-bold text-xs">
              --
            </div>
          )}

          <div className="text-left">
            <p className="text-[11px] font-bold text-slate-800">
              {score !== undefined ? (score >= 80 ? 'Strong Match' : score >= 60 ? 'Moderate Match' : 'Potential Match') : 'Not Analyzed'}
            </p>
            <p className="text-[10px] text-slate-500">
              {job.matchAnalysis
                ? `${job.matchAnalysis.skillsMatch.matched.length} of ${
                    job.matchAnalysis.skillsMatch.matched.length +
                    job.matchAnalysis.skillsMatch.missing.length
                  } skills detected`
                : 'Run analysis against selected resume'}
            </p>
          </div>
        </div>

        {job.matchAnalysis ? (
          <button
            onClick={() => onViewAnalysis(job)}
            className="flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-semibold text-blue-600 hover:bg-blue-50 transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Analysis</span>
          </button>
        ) : (
          <button
            onClick={() => onViewAnalysis(job)}
            className="rounded-lg px-2.5 py-1 text-xs font-medium text-slate-600 hover:bg-slate-200/60 transition-colors"
          >
            Analyze Now
          </button>
        )}
      </div>

      {/* Matched skills pill preview */}
      {job.matchAnalysis?.skillsMatch.matched && job.matchAnalysis.skillsMatch.matched.length > 0 && (
        <div className="mb-4 flex flex-wrap gap-1.5">
          {job.matchAnalysis.skillsMatch.matched.slice(0, 4).map((skill, i) => (
            <span
              key={i}
              className="inline-flex items-center gap-1 rounded-md bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 border border-emerald-100"
            >
              <CheckCircle2 className="w-3 h-3 text-emerald-600" />
              {skill}
            </span>
          ))}
          {job.matchAnalysis.skillsMatch.matched.length > 4 && (
            <span className="text-[10px] text-slate-400 self-center font-medium">
              +{job.matchAnalysis.skillsMatch.matched.length - 4} more
            </span>
          )}
        </div>
      )}

      {/* Bottom meta & action buttons */}
      <div className="flex items-center justify-between border-t border-slate-100 pt-3 text-[11px] text-slate-500">
        <div className="flex items-center gap-2">
          {job.appliedDate ? (
            <span className="flex items-center gap-1 text-slate-600">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              Applied {new Date(job.appliedDate).toLocaleDateString()}
            </span>
          ) : (
            <span className="flex items-center gap-1 text-slate-400">
              <Calendar className="w-3.5 h-3.5" />
              Added {new Date(job.createdAt).toLocaleDateString()}
            </span>
          )}
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => onEdit(job)}
            className="rounded-lg px-2.5 py-1 font-semibold text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-colors"
          >
            Edit
          </button>
          <button
            onClick={() => onDelete(job)}
            className="rounded-lg px-2.5 py-1 font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};
