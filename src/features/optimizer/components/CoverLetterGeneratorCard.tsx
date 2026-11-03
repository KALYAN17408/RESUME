import React, { useState } from 'react';
import type { GenerateCoverLetterResult } from '../types/optimizer.types';
import type { StagedCoverLetterItem } from '../hooks/useOptimizer';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { useUIStore } from '@/stores/uiStore';
import {
  Mail,
  Copy,
  Check,
  Download,
  RotateCcw,
  Sparkles,
  Building,
  Briefcase,
  User,
  AlertTriangle,
  CheckCircle2,
} from 'lucide-react';

interface CoverLetterGeneratorCardProps {
  jobTitle: string;
  companyName: string;
  hiringManagerName: string;
  additionalContext: string;
  coverLetterResult: GenerateCoverLetterResult | null;
  editedCoverLetter: string;
  isLoading: boolean;
  error: string | null;
  stagedCoverLetter: StagedCoverLetterItem | null;
  onJobTitleChange: (val: string) => void;
  onCompanyNameChange: (val: string) => void;
  onHiringManagerChange: (val: string) => void;
  onAdditionalContextChange: (val: string) => void;
  onCoverLetterTextChange: (val: string) => void;
  onGenerate: () => void;
  onResetToGenerated: () => void;
  onStageCoverLetter: () => void;
  onUnstageCoverLetter: () => void;
}

export const CoverLetterGeneratorCard: React.FC<CoverLetterGeneratorCardProps> = ({
  jobTitle,
  companyName,
  hiringManagerName,
  additionalContext,
  coverLetterResult,
  editedCoverLetter,
  isLoading,
  error,
  stagedCoverLetter,
  onJobTitleChange,
  onCompanyNameChange,
  onHiringManagerChange,
  onAdditionalContextChange,
  onCoverLetterTextChange,
  onGenerate,
  onResetToGenerated,
  onStageCoverLetter,
  onUnstageCoverLetter,
}) => {
  const { addToast } = useUIStore();
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(editedCoverLetter);
    setCopied(true);
    addToast({ message: 'Cover letter copied to clipboard!', type: 'success' });
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownloadTxt = () => {
    const filename = `Cover_Letter_${(companyName || 'Company').replace(/\s+/g, '_')}_${(jobTitle || 'Role').replace(/\s+/g, '_')}.txt`;
    const fullText = `${coverLetterResult?.subjectLine || `Application for ${jobTitle} at ${companyName}`}\n\n${editedCoverLetter}`;
    const blob = new Blob([fullText], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    addToast({ message: `Downloaded ${filename}`, type: 'success' });
  };

  return (
    <div className="space-y-6">
      {/* Top Banner & Generation CTA */}
      <div className="p-6 rounded-3xl bg-white border border-zinc-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-zinc-900 tracking-tight">
              AI Cover Letter Generator
            </h2>
            {coverLetterResult?.isDeterministic && (
              <Badge variant="outline" size="sm" className="font-mono text-[10px]">
                Grounded Heuristics
              </Badge>
            )}
          </div>
          <p className="text-xs text-zinc-500 mt-0.5">
            Construct a personalized, professional cover letter grounded strictly in your verified qualifications and target job posting.
          </p>
        </div>

        <Button
          variant="primary"
          size="sm"
          onClick={onGenerate}
          disabled={isLoading}
          className="gap-2 shrink-0 text-xs"
        >
          {isLoading ? (
            <>
              <Spinner size="sm" />
              <span>Generating Cover Letter...</span>
            </>
          ) : (
            <>
              <Sparkles className="w-3.5 h-3.5" />
              <span>{coverLetterResult ? 'Regenerate Cover Letter' : 'Generate Cover Letter'}</span>
            </>
          )}
        </Button>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Main Grid: Parameters vs Editor */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Role Details & Context Inputs */}
        <div className="lg:col-span-4 p-6 rounded-3xl bg-white border border-zinc-200 shadow-xs space-y-4">
          <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">
            Cover Letter Parameters
          </h3>

          <div className="space-y-3">
            <div>
              <label className="block text-[11px] font-semibold text-zinc-700 mb-1">
                Target Role Title *
              </label>
              <div className="relative">
                <Briefcase className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type="text"
                  placeholder="e.g. Senior Full-Stack Engineer"
                  value={jobTitle}
                  onChange={(e) => onJobTitleChange(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-zinc-200 focus:outline-none focus:ring-1 focus:ring-black"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-zinc-700 mb-1">
                Target Company Name *
              </label>
              <div className="relative">
                <Building className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type="text"
                  placeholder="e.g. Stripe, Google, Datadog"
                  value={companyName}
                  onChange={(e) => onCompanyNameChange(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-zinc-200 focus:outline-none focus:ring-1 focus:ring-black"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-zinc-700 mb-1">
                Hiring Manager Name (Optional)
              </label>
              <div className="relative">
                <User className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                <input
                  type="text"
                  placeholder="e.g. Alex Rivera (defaults to Hiring Team)"
                  value={hiringManagerName}
                  onChange={(e) => onHiringManagerChange(e.target.value)}
                  className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-zinc-200 focus:outline-none focus:ring-1 focus:ring-black"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-zinc-700 mb-1">
                Additional Notes or Context (Optional)
              </label>
              <textarea
                rows={4}
                placeholder="e.g. Referred by Sarah; eager to work on distributed database scalability..."
                value={additionalContext}
                onChange={(e) => onAdditionalContextChange(e.target.value)}
                className="w-full p-2.5 text-xs rounded-xl border border-zinc-200 focus:outline-none focus:ring-1 focus:ring-black leading-relaxed resize-y"
              />
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={onGenerate}
              disabled={isLoading}
              className="w-full text-xs mt-2"
            >
              Update & Regenerate Letter
            </Button>
          </div>

          {stagedCoverLetter && (
            <div className="p-4 rounded-2xl bg-zinc-900 text-white space-y-2 mt-4">
              <div className="flex items-center justify-between text-xs font-bold">
                <span className="flex items-center gap-1.5 text-white">
                  <CheckCircle2 className="w-4 h-4 text-white" />
                  Staged for Export
                </span>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300">
                  Ready
                </span>
              </div>
              <p className="text-[11px] text-zinc-300 truncate">
                {stagedCoverLetter.subjectLine}
              </p>
              <div className="pt-1 flex justify-end">
                <button
                  onClick={onUnstageCoverLetter}
                  className="text-[11px] text-zinc-400 hover:text-white underline"
                >
                  Remove from Staging
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Column: Editable Cover Letter Area */}
        <div className="lg:col-span-8 space-y-4">
          {!coverLetterResult && !isLoading ? (
            <div className="p-12 text-center rounded-3xl border border-dashed border-zinc-200 bg-white space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-zinc-100 text-zinc-900 flex items-center justify-center mx-auto">
                <Mail className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-zinc-900">Cover Letter Not Yet Generated</h3>
                <p className="text-xs text-zinc-500 mt-1 max-w-sm mx-auto">
                  Click "Generate Cover Letter" to craft an aligned, grounded letter based on your verified resume history.
                </p>
              </div>
              <Button variant="outline" size="sm" onClick={onGenerate}>
                Generate Letter
              </Button>
            </div>
          ) : isLoading ? (
            <div className="p-16 text-center rounded-3xl bg-white border border-zinc-200 shadow-xs space-y-3">
              <Spinner size="lg" className="mx-auto" />
              <p className="text-xs font-semibold text-zinc-800">
                Crafting personalized cover letter from verified qualifications...
              </p>
              <p className="text-[11px] text-zinc-400">
                Preserving truthful achievements and target role alignment
              </p>
            </div>
          ) : (
            <div className="p-6 rounded-3xl bg-white border border-zinc-200 shadow-xs space-y-4">
              {/* Subject Line Strip */}
              {coverLetterResult?.subjectLine && (
                <div className="p-3 rounded-xl bg-zinc-50 border border-zinc-200 flex items-center justify-between text-xs">
                  <span className="font-bold text-zinc-900 truncate">
                    Subject: {coverLetterResult.subjectLine}
                  </span>
                  <span className="text-[10px] text-zinc-400 font-mono shrink-0">
                    {editedCoverLetter.length} chars
                  </span>
                </div>
              )}

              {/* Editable Text Area */}
              <div>
                <textarea
                  rows={16}
                  value={editedCoverLetter}
                  onChange={(e) => onCoverLetterTextChange(e.target.value)}
                  placeholder="Generated cover letter content..."
                  className="w-full p-4 text-xs font-serif rounded-2xl border border-zinc-200 focus:outline-none focus:ring-1 focus:ring-black leading-relaxed resize-y"
                />
              </div>

              {/* Metric / Confirmation Notice */}
              {coverLetterResult?.requiresConfirmation && (
                <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2">
                  <AlertTriangle className="w-3.5 h-3.5 text-amber-700 shrink-0 mt-0.5" />
                  <p className="text-[11px] leading-relaxed">
                    Bracketed placeholders like <code className="bg-amber-100 px-1 py-0.5 rounded text-amber-900 font-mono text-[10px]">[describe a notable project accomplishment...]</code> were included to ensure truthful candidate representation. Please review and tailor before sending.
                  </p>
                </div>
              )}

              {/* Action Toolbar */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-zinc-100">
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleCopy}
                    className="gap-1.5 text-xs"
                  >
                    {copied ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-zinc-900" />
                        <span>Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy to Clipboard</span>
                      </>
                    )}
                  </Button>

                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDownloadTxt}
                    className="gap-1.5 text-xs"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download TXT</span>
                  </Button>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onResetToGenerated}
                    className="gap-1.5 text-xs text-zinc-500 hover:text-black"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reset to Generated</span>
                  </Button>
                </div>

                <div>
                  {stagedCoverLetter ? (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={onUnstageCoverLetter}
                      className="gap-1.5 text-xs border-zinc-900 text-zinc-900"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-black" />
                      <span>Staged (Click to Unstage)</span>
                    </Button>
                  ) : (
                    <Button
                      variant="primary"
                      size="sm"
                      onClick={onStageCoverLetter}
                      className="gap-1.5 text-xs"
                    >
                      <Check className="w-3.5 h-3.5" />
                      <span>Stage Cover Letter</span>
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
