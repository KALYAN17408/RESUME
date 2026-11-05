import React from 'react';
import type { SavedJob } from '../types/job.types';
import { Modal } from '@/components/ui/Modal';
import { Button } from '@/components/ui/Button';
import {
  CheckCircle2,
  AlertTriangle,
  Lightbulb,
  Briefcase,
  ShieldAlert,
  Sparkles,
} from 'lucide-react';
import { cn } from '@/utils/cn';

interface JobMatchModalProps {
  job: SavedJob | null;
  isOpen: boolean;
  onClose: () => void;
  onReanalyze?: () => void;
  isReanalyzing?: boolean;
}

export const JobMatchModal: React.FC<JobMatchModalProps> = ({
  job,
  isOpen,
  onClose,
  onReanalyze,
  isReanalyzing = false,
}) => {
  if (!job) return null;

  const analysis = job.matchAnalysis;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={`Match Analysis: ${job.title}`}
      description={`${job.company} • Selected Resume: ${job.resumeTitle || 'Active Resume'}`}
    >
      <div className="space-y-6 text-left max-h-[75vh] overflow-y-auto pr-1">
        {analysis ? (
          <>
            {/* Top Score Banner */}
            <div className="rounded-2xl border border-slate-200/80 bg-gradient-to-r from-blue-50/70 via-indigo-50/40 to-slate-50 p-5 flex items-center justify-between gap-6">
              <div className="space-y-1">
                <span className="text-[11px] font-bold uppercase tracking-wider text-blue-700">
                  Overall Alignment Score
                </span>
                <h4 className="text-xl font-black text-slate-900">
                  {analysis.overallScore >= 80
                    ? 'Excellent Match'
                    : analysis.overallScore >= 60
                    ? 'Solid Match with Addressable Gaps'
                    : 'Requires Strategic Tailoring'}
                </h4>
                <p className="text-xs text-slate-600 leading-relaxed max-w-md">
                  Calculated using resume skills, project technologies, and role relevance against target requirements.
                </p>
              </div>

              <div
                className={cn(
                  'flex h-16 w-16 shrink-0 flex-col items-center justify-center rounded-2xl border-2 font-black shadow-xs',
                  analysis.overallScore >= 80
                    ? 'border-emerald-500 bg-white text-emerald-700'
                    : analysis.overallScore >= 60
                    ? 'border-blue-500 bg-white text-blue-700'
                    : 'border-amber-500 bg-white text-amber-700'
                )}
              >
                <span className="text-2xl leading-none">{analysis.overallScore}</span>
                <span className="text-[9px] font-bold uppercase text-slate-400">Score</span>
              </div>
            </div>

            {/* Matched & Missing Skills Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Matched Skills */}
              <div className="rounded-xl border border-emerald-200/70 bg-emerald-50/40 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h5 className="flex items-center gap-1.5 text-xs font-bold text-emerald-900 uppercase tracking-wider">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    Matched Skills ({analysis.skillsMatch.matched.length})
                  </h5>
                  <span className="text-[11px] font-semibold text-emerald-700">
                    {analysis.skillsMatch.matchPercentage}% match
                  </span>
                </div>

                {analysis.skillsMatch.matched.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {analysis.skillsMatch.matched.map((skill, i) => (
                      <span
                        key={i}
                        className="rounded-md bg-white px-2.5 py-1 text-xs font-semibold text-emerald-800 border border-emerald-200 shadow-2xs"
                      >
                        {skill}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic">No exact skill matches detected.</p>
                )}
              </div>

              {/* Missing Skills */}
              <div className="rounded-xl border border-amber-200/70 bg-amber-50/40 p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h5 className="flex items-center gap-1.5 text-xs font-bold text-amber-900 uppercase tracking-wider">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    Missing in Resume ({analysis.skillsMatch.missing.length})
                  </h5>
                  {analysis.skillsMatch.criticalMissing.length > 0 && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-100 text-rose-700">
                      {analysis.skillsMatch.criticalMissing.length} Critical
                    </span>
                  )}
                </div>

                {analysis.skillsMatch.missing.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {analysis.skillsMatch.missing.map((skill, i) => {
                      const isCritical = analysis.skillsMatch.criticalMissing.includes(skill);
                      return (
                        <span
                          key={i}
                          className={cn(
                            'rounded-md px-2.5 py-1 text-xs font-semibold shadow-2xs border',
                            isCritical
                              ? 'bg-rose-50 text-rose-700 border-rose-200'
                              : 'bg-white text-amber-800 border-amber-200'
                          )}
                        >
                          {skill} {isCritical && '★'}
                        </span>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 italic">All detected job skills covered in your resume!</p>
                )}
              </div>
            </div>

            {/* Experience Alignment */}
            <div className="rounded-xl border border-slate-200/80 bg-white p-4 space-y-2">
              <h5 className="flex items-center gap-1.5 text-xs font-bold text-slate-900 uppercase tracking-wider">
                <Briefcase className="w-4 h-4 text-blue-600" />
                Role & Experience Alignment
              </h5>
              <p className="text-xs text-slate-600 leading-relaxed">
                {analysis.experienceAlignment.summary}
              </p>
              {analysis.experienceAlignment.relevantRolesFound.length > 0 && (
                <div className="flex items-center gap-2 pt-1 text-xs text-slate-700">
                  <span className="font-semibold text-slate-900">Directly Related Roles:</span>
                  <span className="text-slate-600 font-medium">
                    {analysis.experienceAlignment.relevantRolesFound.join(', ')}
                  </span>
                </div>
              )}
            </div>

            {/* Actionable Suggestions */}
            {analysis.suggestions && analysis.suggestions.length > 0 && (
              <div className="rounded-xl border border-blue-200/80 bg-blue-50/30 p-4 space-y-3">
                <h5 className="flex items-center gap-1.5 text-xs font-bold text-blue-900 uppercase tracking-wider">
                  <Lightbulb className="w-4 h-4 text-blue-600" />
                  Targeted Application Improvements
                </h5>
                <ul className="space-y-2.5">
                  {analysis.suggestions.map((suggestion, idx) => (
                    <li key={idx} className="flex items-start gap-2.5 text-xs text-slate-700 leading-relaxed">
                      <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-100 text-[11px] font-bold text-blue-700">
                        {idx + 1}
                      </span>
                      <span>{suggestion}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Legal Disclaimer */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-[11px] text-slate-500 flex items-start gap-2 leading-relaxed">
              <ShieldAlert className="w-4 h-4 text-slate-400 shrink-0 mt-0.5" />
              <span>{analysis.disclaimer}</span>
            </div>
          </>
        ) : (
          <div className="py-8 text-center space-y-3">
            <p className="text-xs text-slate-600">
              This job has not been analyzed against a resume yet. Run analysis now to see your match score, skills breakdown, and recommendations.
            </p>
            {onReanalyze && (
              <Button variant="primary" size="sm" onClick={onReanalyze} disabled={isReanalyzing}>
                <Sparkles className="w-4 h-4 mr-1.5" />
                {isReanalyzing ? 'Analyzing...' : 'Run Match Analysis'}
              </Button>
            )}
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
          {onReanalyze && analysis && (
            <Button variant="outline" size="sm" onClick={onReanalyze} disabled={isReanalyzing}>
              <Sparkles className="w-4 h-4 mr-1.5" />
              {isReanalyzing ? 'Re-analyzing...' : 'Re-run Analysis'}
            </Button>
          )}
          <Button variant="primary" size="sm" onClick={onClose}>
            Done
          </Button>
        </div>
      </div>
    </Modal>
  );
};
