import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import type { AtsReport } from '../types/analyzer.types';
import { ScoreGauge } from './ScoreGauge';
import { KeywordPillList } from './KeywordPillList';
import { SectionCheckList } from './SectionCheckList';
import { FormattingReportCard } from './FormattingReportCard';
import { RecommendationCard } from './RecommendationCard';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { useUIStore } from '@/stores/uiStore';
import {
  Copy,
  Check,
  RotateCcw,
  Edit3,
  AlertTriangle,
  Info,
  CheckCircle2,
  Mail,
} from 'lucide-react';
import { cn } from '@/utils/cn';

interface ReportSummaryViewProps {
  report: AtsReport;
  onReset: () => void;
}

export const ReportSummaryView: React.FC<ReportSummaryViewProps> = ({ report, onReset }) => {
  const navigate = useNavigate();
  const { addToast } = useUIStore();
  const [activeTab, setActiveTab] = useState<'keywords' | 'recommendations' | 'sections' | 'formatting'>('keywords');
  const [copied, setCopied] = useState(false);

  const handleCopyReport = () => {
    const summaryText = `
RESUME AI — ATS Compatibility Report
Generated: ${new Date(report.createdAt).toLocaleString()}
Resume: ${report.resumeTitle || report.fileName || 'Uploaded Resume'}
Target Role: ${report.jobTitle || 'Unspecified'} ${report.companyName ? `at ${report.companyName}` : ''}

=== SCORES ===
Overall Estimated ATS Score: ${report.scores.overallScore}/100 (${report.scores.scoreGrade})
- Keywords Match: ${report.scores.keywordScore}/100 (Weight: 40%)
- Technical Skills: ${report.scores.skillsScore}/100 (Weight: 25%)
- Section Completeness: ${report.scores.sectionScore}/100 (Weight: 15%)
- Formatting & Readability: ${report.scores.formattingScore}/100 (Weight: 20%)

=== TOP MISSING KEYWORDS ===
${report.missingKeywords.slice(0, 8).map((k) => `• ${k.term} (${k.importance})`).join('\n')}

=== ACTIONABLE RECOMMENDATIONS ===
${report.recommendations.map((r, i) => `${i + 1}. [${r.severity.toUpperCase()}] ${r.title}\n   ${r.suggestion}`).join('\n\n')}

Note: Estimated ATS compatibility score based on keyword match, skills, structure, and readability metrics. RESUME AI does not claim affiliation with any commercial ATS platform.
`.trim();

    navigator.clipboard.writeText(summaryText);
    setCopied(true);
    addToast({ message: 'ATS Report copied to clipboard!', type: 'success' });
    setTimeout(() => setCopied(false), 2500);
  };

  const highPriorityRecs = report.recommendations.filter((r) => r.severity === 'high');

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Scanned PDF Alert Banner */}
      {report.isScannedPdf && (
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-amber-700 shrink-0 mt-0.5" />
          <div className="text-xs">
            <h4 className="font-bold">Scanned or Rasterized PDF Detected</h4>
            <p className="mt-0.5 text-amber-800 leading-relaxed">
              This PDF contains scanned images rather than selectable text. Most applicant tracking systems cannot read text from flat images and may discard the file. We recommend uploading a PDF with selectable text or creating your resume in RESUME AI.
            </p>
          </div>
        </div>
      )}

      {/* Main Score Hero Card */}
      <div className="p-6 sm:p-8 rounded-3xl bg-white border border-zinc-200 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-zinc-100 pb-6">
          <div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" size="sm" className="font-mono text-[10px]">
                Estimated ATS Compatibility
              </Badge>
              {report.resumeId && (
                <span className="text-[10px] text-zinc-500 bg-zinc-100 px-2 py-0.5 rounded-md font-medium">
                  Linked to Saved Resume
                </span>
              )}
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-zinc-900 tracking-tight mt-1.5">
              {report.resumeTitle || report.fileName || 'Resume Analysis Report'}
            </h2>
            <p className="text-xs text-zinc-500 mt-1">
              Targeting: <span className="font-semibold text-zinc-800">{report.jobTitle || 'Target Position'}</span>
              {report.companyName && <span> at <span className="font-semibold text-zinc-800">{report.companyName}</span></span>}
              {' • Evaluated on ' + new Date(report.createdAt).toLocaleDateString()}
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyReport}
              className="gap-1.5"
            >
              {copied ? <Check className="w-3.5 h-3.5 text-zinc-900" /> : <Copy className="w-3.5 h-3.5" />}
              <span>{copied ? 'Copied' : 'Copy Report'}</span>
            </Button>

            {report.resumeId && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate(`/dashboard/resumes/${report.resumeId}/edit`)}
                className="gap-1.5"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Edit in Builder</span>
              </Button>
            )}

            <Button
              variant="outline"
              size="sm"
              onClick={() =>
                navigate('/dashboard/cover-letter', {
                  state: {
                    resumeId: report.resumeId,
                    jobDescription: report.jobDescription,
                    jobTitle: report.jobTitle,
                    companyName: report.companyName,
                  },
                })
              }
              className="gap-1.5"
            >
              <Mail className="w-3.5 h-3.5" />
              <span>Generate Cover Letter</span>
            </Button>

            <Button
              variant="violet"
              size="sm"
              onClick={onReset}
              className="gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>New Analysis</span>
            </Button>
          </div>
        </div>

        {/* Score Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          {/* Big Score Gauge */}
          <div className="lg:col-span-4 flex flex-col items-center justify-center p-6 bg-gradient-to-b from-violet-50/50 to-indigo-50/30 rounded-3xl border border-violet-100 shadow-xs">
            <ScoreGauge
              score={report.scores.overallScore}
              size="lg"
              variant="violet"
              label="Overall ATS Score"
              grade={report.scores.scoreGrade}
              subtitle="ATS compatibility score"
            />
          </div>

          {/* Sub-scores breakdown */}
          <div className="lg:col-span-8 grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 flex flex-col items-center justify-between text-center hover:border-violet-200 transition-colors">
              <ScoreGauge
                score={report.scores.keywordScore}
                size="sm"
                variant="dynamic"
                label="Keywords"
              />
              <p className="text-[10px] text-slate-400 font-bold uppercase mt-2">Weight: 40%</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 flex flex-col items-center justify-between text-center hover:border-violet-200 transition-colors">
              <ScoreGauge
                score={report.scores.skillsScore}
                size="sm"
                variant="dynamic"
                label="Tech Skills"
              />
              <p className="text-[10px] text-slate-400 font-bold uppercase mt-2">Weight: 25%</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 flex flex-col items-center justify-between text-center hover:border-violet-200 transition-colors">
              <ScoreGauge
                score={report.scores.sectionScore}
                size="sm"
                variant="dynamic"
                label="Sections"
              />
              <p className="text-[10px] text-slate-400 font-bold uppercase mt-2">Weight: 15%</p>
            </div>

            <div className="p-4 rounded-2xl bg-slate-50/80 border border-slate-200/80 flex flex-col items-center justify-between text-center hover:border-violet-200 transition-colors">
              <ScoreGauge
                score={report.scores.formattingScore}
                size="sm"
                variant="dynamic"
                label="Formatting"
              />
              <p className="text-[10px] text-slate-400 font-bold uppercase mt-2">Weight: 20%</p>
            </div>
          </div>
        </div>

        {/* Commercial Disclaimer Notice */}
        <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 flex items-start gap-2.5 text-slate-600 text-[11px] leading-relaxed">
          <Info className="w-4 h-4 text-violet-600 shrink-0 mt-0.5" />
          <p>
            <span className="font-bold text-slate-900">Estimated ATS Score: </span>
            {report.scores.explanation}
          </p>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="border-b border-slate-200 flex gap-2">
        <button
          onClick={() => setActiveTab('keywords')}
          className={cn(
            'pb-3 px-3 text-xs font-bold transition-all relative',
            activeTab === 'keywords'
              ? 'text-violet-700'
              : 'text-slate-500 hover:text-slate-900'
          )}
        >
          <span>Keywords & Skills</span>
          <span className={cn('ml-1.5 text-[10px] px-1.5 py-0.2 rounded-full font-mono', activeTab === 'keywords' ? 'bg-violet-100 text-violet-700' : 'bg-slate-100 text-slate-600')}>
            {report.matchedKeywords.length}/{report.allDetectedKeywords.length}
          </span>
          {activeTab === 'keywords' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-violet-600 rounded-full" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('recommendations')}
          className={cn(
            'pb-3 px-3 text-xs font-bold transition-all relative',
            activeTab === 'recommendations'
              ? 'text-violet-700'
              : 'text-slate-500 hover:text-slate-900'
          )}
        >
          <span>Actionable Fixes</span>
          {highPriorityRecs.length > 0 && (
            <span className="ml-1.5 text-[10px] px-1.5 py-0.2 rounded-full bg-violet-600 text-white font-mono">
              {highPriorityRecs.length} high
            </span>
          )}
          {activeTab === 'recommendations' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-violet-600 rounded-full" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('sections')}
          className={cn(
            'pb-3 px-3 text-xs font-bold transition-all relative',
            activeTab === 'sections'
              ? 'text-violet-700'
              : 'text-slate-500 hover:text-slate-900'
          )}
        >
          <span>Section Completeness</span>
          {activeTab === 'sections' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-violet-600 rounded-full" />
          )}
        </button>

        <button
          onClick={() => setActiveTab('formatting')}
          className={cn(
            'pb-3 px-3 text-xs font-bold transition-all relative',
            activeTab === 'formatting'
              ? 'text-violet-700'
              : 'text-slate-500 hover:text-slate-900'
          )}
        >
          <span>Formatting & Metrics</span>
          {activeTab === 'formatting' && (
            <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-violet-600 rounded-full" />
          )}
        </button>
      </div>

      {/* Tab Panels */}
      <div className="pt-2">
        {activeTab === 'keywords' && (
          <div className="p-6 bg-white rounded-3xl border border-zinc-200 space-y-4">
            <div>
              <h3 className="text-sm font-bold text-zinc-900">Keyword Match Analysis</h3>
              <p className="text-xs text-zinc-500 mt-0.5">
                Compare keywords from your target job description with those found in your resume.
              </p>
            </div>
            <KeywordPillList
              matchedKeywords={report.matchedKeywords}
              missingKeywords={report.missingKeywords}
            />
          </div>
        )}

        {activeTab === 'recommendations' && (
          <div className="space-y-3">
            {report.recommendations.length === 0 ? (
              <div className="p-12 text-center bg-white rounded-3xl border border-zinc-200">
                <CheckCircle2 className="w-10 h-10 text-zinc-900 mx-auto mb-2" />
                <h4 className="text-sm font-bold text-zinc-900">Outstanding Alignment!</h4>
                <p className="text-xs text-zinc-500 mt-1">
                  Your resume demonstrates near-perfect keyword coverage, strong leadership action verbs, and quantifiable impact metrics.
                </p>
              </div>
            ) : (
              report.recommendations.map((rec) => (
                <RecommendationCard key={rec.id} recommendation={rec} />
              ))
            )}
          </div>
        )}

        {activeTab === 'sections' && (
          <div className="p-6 bg-white rounded-3xl border border-zinc-200 space-y-4">
            <div>
              <h3 className="text-sm font-bold text-zinc-900">Standard ATS Section Completeness</h3>
              <p className="text-xs text-zinc-500 mt-0.5">
                Ensures standard single-column sections required by enterprise ATS parsers are clearly present.
              </p>
            </div>
            <SectionCheckList sections={report.sections} />
          </div>
        )}

        {activeTab === 'formatting' && (
          <div className="p-6 bg-white rounded-3xl border border-zinc-200 space-y-4">
            <div>
              <h3 className="text-sm font-bold text-zinc-900">Readability, Verbs & Impact Metrics</h3>
              <p className="text-xs text-zinc-500 mt-0.5">
                Evaluates executive word count bounds, high-impact action verbs, and Google XYZ quantified achievements.
              </p>
            </div>
            <FormattingReportCard
              formatting={report.formatting}
              wordCount={report.wordCount}
              actionVerbCount={report.actionVerbCount}
              metricCount={report.metricCount}
            />
          </div>
        )}
      </div>
    </div>
  );
};
