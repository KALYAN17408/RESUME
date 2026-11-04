import React, { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Spinner } from '@/components/ui/Spinner';
import { PdfUploadZone } from '../components/PdfUploadZone';
import { ResumeSelectorModal } from '../components/ResumeSelectorModal';
import { ReportSummaryView } from '../components/ReportSummaryView';
import { extractTextFromPdf, convertResumeDataToText } from '../services/textExtractor';
import { runAtsAnalysis } from '../services/atsEngine';
import { AtsReportService } from '../services/atsReportService';
import { ResumeService } from '@/features/resumes/services/resumeService';
import type { InputSourceType, AtsReport, AtsAnalysisInput } from '../types/analyzer.types';
import type { ResumeListItem, ResumeData } from '@/features/resumes/types/resume.types';
import {
  ScanSearch,
  FileText,
  UploadCloud,
  Sparkles,
  AlertCircle,
  Briefcase,
  Building,
  History,
  Trash2,
  ArrowRight,
} from 'lucide-react';
import { cn } from '@/utils/cn';

const SAMPLE_JOB_DESCRIPTION = `Senior Full-Stack Software Engineer

About the Role:
We are looking for an experienced Senior Full-Stack Software Engineer to design, architect, and scale our core SaaS platform. You will lead technical initiatives across our React, TypeScript, and Node.js microservices stack deployed on AWS.

Responsibilities:
• Architect, build, and maintain high-throughput web applications using React, Next.js, and TypeScript.
• Design robust REST APIs and GraphQL microservices powered by Node.js and PostgreSQL.
• Implement automated CI/CD pipelines with GitHub Actions and Docker containerization.
• Optimize application performance, caching with Redis, and reducing database query latency.
• Collaborate closely with cross-functional teams, product managers, and UI/UX designers in an Agile/Scrum environment.
• Mentor junior engineers and uphold engineering excellence through comprehensive code reviews.

Qualifications:
• 5+ years of software engineering experience building production web applications.
• Strong proficiency in TypeScript, JavaScript, React, and Node.js.
• Hands-on expertise with relational databases (PostgreSQL) and caching layers (Redis).
• Familiarity with cloud infrastructure (AWS or GCP), Docker, and Kubernetes.
• Solid grasp of system design, distributed systems, and clean code architecture.
• Experience with automated testing suites (Jest, Vitest, Cypress, or Playwright).
• Excellent problem-solving, communication, and cross-functional collaboration skills.
• Bachelor’s degree in Computer Science, Software Engineering, or equivalent practical experience.`;

export const AtsAnalyzerPage: React.FC = () => {
  const { user } = useAuthStore();
  const { addToast } = useUIStore();

  const [sourceType, setSourceType] = useState<InputSourceType>('existing_resume');
  const [selectedResumeItem, setSelectedResumeItem] = useState<ResumeListItem | null>(null);
  const [fullResumeData, setFullResumeData] = useState<ResumeData | null>(null);
  const [uploadedFile, setUploadedFile] = useState<File | null>(null);
  const [jobTitle, setJobTitle] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [jobDescription, setJobDescription] = useState('');

  const [isSelectorOpen, setIsSelectorOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState('');
  const [error, setError] = useState<string | null>(null);

  const [currentReport, setCurrentReport] = useState<AtsReport | null>(null);
  const [pastReports, setPastReports] = useState<AtsReport[]>([]);
  const [showHistory, setShowHistory] = useState(false);

  // Load user's past reports on mount
  useEffect(() => {
    if (user?.id) {
      AtsReportService.listReports(user.id).then((items) => {
        setPastReports(items);
      });
    }
  }, [user?.id]);

  // Handle selection of existing resume
  const handleSelectResume = async (resume: ResumeListItem) => {
    setSelectedResumeItem(resume);
    setError(null);
    if (!jobTitle && resume.targetRole) {
      setJobTitle(resume.targetRole);
    }

    if (user?.id) {
      const full = await ResumeService.getResume(resume.id, user.id);
      if (full) {
        setFullResumeData(full);
      }
    }
  };

  const handleLoadSampleJd = () => {
    setJobTitle('Senior Full-Stack Engineer');
    setCompanyName('TechScale Global');
    setJobDescription(SAMPLE_JOB_DESCRIPTION);
    addToast({ message: 'Sample job description loaded.', type: 'info' });
  };

  const handleRunAnalysis = async () => {
    setError(null);

    if (!jobDescription.trim()) {
      setError('Please paste a job description to analyze.');
      return;
    }

    if (sourceType === 'existing_resume' && !selectedResumeItem) {
      setError('Please select a saved resume from your account.');
      return;
    }

    if (sourceType === 'uploaded_pdf' && !uploadedFile) {
      setError('Please upload a resume PDF file.');
      return;
    }

    setIsAnalyzing(true);

    try {
      let extractedResumeText = '';
      let isScannedPdf = false;

      if (sourceType === 'existing_resume') {
        setAnalysisStep('Ingesting structured resume sections...');
        let resumeToUse = fullResumeData;
        if (!resumeToUse && user?.id && selectedResumeItem) {
          resumeToUse = await ResumeService.getResume(selectedResumeItem.id, user.id);
        }
        if (!resumeToUse) {
          throw new Error('Could not load selected resume data.');
        }
        extractedResumeText = convertResumeDataToText(resumeToUse);
      } else if (sourceType === 'uploaded_pdf' && uploadedFile) {
        setAnalysisStep('Extracting vector text from uploaded PDF...');
        const arrayBuffer = await uploadedFile.arrayBuffer();
        const extracted = await extractTextFromPdf(arrayBuffer);
        extractedResumeText = extracted.text;
        isScannedPdf = extracted.isScannedPdf;
      }

      setAnalysisStep('Evaluating keyword density and taxonomy matching...');
      await new Promise((r) => setTimeout(r, 400)); // Smooth UI transition

      setAnalysisStep('Scoring section completeness & impact metrics...');
      await new Promise((r) => setTimeout(r, 400));

      const input: AtsAnalysisInput = {
        sourceType,
        resumeId: selectedResumeItem?.id,
        resumeTitle: selectedResumeItem?.title,
        fileName: uploadedFile?.name,
        jobTitle: jobTitle.trim() || undefined,
        companyName: companyName.trim() || undefined,
        jobDescription: jobDescription.trim(),
        resumeText: extractedResumeText,
      };

      const report = runAtsAnalysis(input, user?.id || 'demo_user');
      report.isScannedPdf = isScannedPdf;

      // Save report
      await AtsReportService.saveReport(report);

      setCurrentReport(report);
      setPastReports((prev) => [report, ...prev]);
      addToast({ message: 'ATS analysis completed successfully!', type: 'success' });
    } catch (err: any) {
      console.error('ATS Analysis Error:', err);
      setError(err.message || 'An unexpected error occurred during analysis.');
    } finally {
      setIsAnalyzing(false);
      setAnalysisStep('');
    }
  };

  const handleReset = () => {
    setCurrentReport(null);
    setError(null);
  };

  const handleDeleteReport = async (reportId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (user?.id) {
      await AtsReportService.deleteReport(reportId, user.id);
      setPastReports((prev) => prev.filter((r) => r.id !== reportId));
      if (currentReport?.id === reportId) {
        setCurrentReport(null);
      }
      addToast({ message: 'Report deleted from history.', type: 'info' });
    }
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-zinc-900 tracking-wider uppercase">
              ATS Optimization Engine
            </span>
            <Badge variant="outline" size="sm" className="font-mono text-[10px]">
              Recruiter-Grade AST
            </Badge>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-zinc-900 mt-1">
            ATS Resume Analyzer
          </h1>
          <p className="text-xs sm:text-sm text-zinc-500 mt-1 max-w-2xl leading-relaxed">
            Audit your resume against real target job descriptions with deterministic keyword density, technical taxonomy matching, and recruiter-grade formatting checks.
          </p>
        </div>

        {pastReports.length > 0 && !currentReport && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowHistory(!showHistory)}
            className="gap-2 shrink-0"
          >
            <History className="w-4 h-4 text-zinc-600" />
            <span>{showHistory ? 'Hide Past Reports' : `Past Reports (${pastReports.length})`}</span>
          </Button>
        )}
      </div>

      {/* Report View Mode */}
      {currentReport ? (
        <ReportSummaryView report={currentReport} onReset={handleReset} />
      ) : showHistory ? (
        /* History Drawer/List */
        <div className="p-6 rounded-3xl bg-white border border-zinc-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between pb-4 border-b border-zinc-100">
            <div>
              <h3 className="text-sm font-bold text-zinc-900">Your Past ATS Reports</h3>
              <p className="text-xs text-zinc-500">Access previously generated ATS diagnostic reports.</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => setShowHistory(false)}>
              Back to Analyzer
            </Button>
          </div>

          <div className="space-y-2">
            {pastReports.map((item) => (
              <div
                key={item.id}
                onClick={() => {
                  setCurrentReport(item);
                  setShowHistory(false);
                }}
                className="p-4 rounded-2xl border border-zinc-200 hover:border-black bg-white hover:bg-zinc-50 cursor-pointer transition-all flex items-center justify-between gap-4"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <div className="w-10 h-10 rounded-2xl bg-black text-white flex items-center justify-center font-black text-xs shrink-0">
                    {item.scores.overallScore}
                  </div>
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-zinc-900 truncate">
                      {item.resumeTitle || item.fileName || 'Resume Analysis'}
                    </p>
                    <p className="text-[11px] text-zinc-500 truncate">
                      {item.jobTitle || 'Target Position'} • {new Date(item.createdAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-zinc-100 text-zinc-800">
                    {item.scores.scoreGrade}
                  </span>
                  <button
                    onClick={(e) => handleDeleteReport(item.id, e)}
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-600 hover:bg-zinc-100 transition-colors"
                    aria-label="Delete report"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                  <ArrowRight className="w-4 h-4 text-zinc-400" />
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Input & Setup Mode */
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left Column: Resume Selection */}
          <div className="lg:col-span-5 space-y-6">
            <div className="p-6 rounded-3xl bg-white border border-zinc-200 shadow-xs space-y-4">
              <div>
                <h2 className="text-sm font-bold text-zinc-900 tracking-tight">
                  1. Select Resume Source
                </h2>
                <p className="text-xs text-zinc-500 mt-0.5">
                  Analyze an existing ResuMax resume or upload a custom PDF document.
                </p>
              </div>

              {/* Source Type Selector */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-zinc-100 rounded-2xl border border-zinc-200">
                <button
                  type="button"
                  onClick={() => setSourceType('existing_resume')}
                  className={cn(
                    'py-2 px-3 text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-2',
                    sourceType === 'existing_resume'
                      ? 'bg-black text-white shadow-sm'
                      : 'text-zinc-600 hover:text-black'
                  )}
                >
                  <FileText className="w-3.5 h-3.5" />
                  <span>Saved Resume</span>
                </button>

                <button
                  type="button"
                  onClick={() => setSourceType('uploaded_pdf')}
                  className={cn(
                    'py-2 px-3 text-xs font-semibold rounded-xl transition-all flex items-center justify-center gap-2',
                    sourceType === 'uploaded_pdf'
                      ? 'bg-black text-white shadow-sm'
                      : 'text-zinc-600 hover:text-black'
                  )}
                >
                  <UploadCloud className="w-3.5 h-3.5" />
                  <span>Upload PDF</span>
                </button>
              </div>

              {/* Source View */}
              {sourceType === 'existing_resume' ? (
                <div className="space-y-3">
                  {selectedResumeItem ? (
                    <div className="p-4 rounded-2xl bg-zinc-50 border border-zinc-200 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-8 h-8 rounded-xl bg-black text-white flex items-center justify-center shrink-0">
                          <FileText className="w-4 h-4" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-bold text-zinc-900 truncate">
                            {selectedResumeItem.title}
                          </p>
                          <p className="text-[10px] text-zinc-500 truncate">
                            {selectedResumeItem.targetRole || 'General Template'}
                          </p>
                        </div>
                      </div>

                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsSelectorOpen(true)}
                        className="text-xs shrink-0"
                      >
                        Change
                      </Button>
                    </div>
                  ) : (
                    <div
                      onClick={() => setIsSelectorOpen(true)}
                      className="border-2 border-dashed border-zinc-200 hover:border-black rounded-2xl p-6 text-center cursor-pointer bg-zinc-50/50 hover:bg-zinc-50 transition-all"
                    >
                      <div className="w-10 h-10 rounded-2xl bg-zinc-200/80 flex items-center justify-center mx-auto text-zinc-900 mb-2">
                        <FileText className="w-5 h-5" />
                      </div>
                      <p className="text-xs font-bold text-zinc-900">Choose from Saved Resumes</p>
                      <p className="text-[11px] text-zinc-500 mt-1">
                        Select a resume you built inside ResuMax AI
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                <PdfUploadZone
                  selectedFile={uploadedFile}
                  onFileSelect={setUploadedFile}
                />
              )}
            </div>

            {/* Optional Target Metadata */}
            <div className="p-6 rounded-3xl bg-white border border-zinc-200 shadow-xs space-y-3">
              <h3 className="text-xs font-bold text-zinc-900 uppercase tracking-wider">
                Optional Target Role Details
              </h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-[11px] font-semibold text-zinc-700 mb-1">
                    Target Job Title
                  </label>
                  <div className="relative">
                    <Briefcase className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                    <input
                      type="text"
                      placeholder="e.g. Senior Full-Stack Engineer"
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-zinc-200 focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-zinc-700 mb-1">
                    Company Name
                  </label>
                  <div className="relative">
                    <Building className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" />
                    <input
                      type="text"
                      placeholder="e.g. Stripe, Google, Datadog"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                      className="w-full pl-8 pr-3 py-2 text-xs rounded-xl border border-zinc-200 focus:outline-none focus:ring-1 focus:ring-black focus:border-black"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Job Description Input */}
          <div className="lg:col-span-7 space-y-6">
            <div className="p-6 sm:p-8 rounded-3xl bg-white border border-zinc-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h2 className="text-sm font-bold text-zinc-900 tracking-tight">
                    2. Target Job Description
                  </h2>
                  <p className="text-xs text-zinc-500 mt-0.5">
                    Paste the complete job posting text to extract key skills and requirements.
                  </p>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLoadSampleJd}
                  className="gap-1.5 text-xs shrink-0"
                >
                  <Sparkles className="w-3.5 h-3.5 text-zinc-600" />
                  <span>Load Sample JD</span>
                </Button>
              </div>

              <div>
                <textarea
                  rows={14}
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste the target job description here (responsibilities, required skills, technical requirements, qualifications)..."
                  className="w-full p-4 text-xs font-mono rounded-2xl border border-zinc-200 focus:outline-none focus:ring-1 focus:ring-black focus:border-black leading-relaxed resize-y placeholder:font-sans"
                />
                <div className="flex items-center justify-between mt-1 text-[11px] text-zinc-400">
                  <span>{jobDescription.length} characters</span>
                  {jobDescription.length > 0 && (
                    <button
                      onClick={() => setJobDescription('')}
                      className="text-zinc-500 hover:text-black underline"
                    >
                      Clear
                    </button>
                  )}
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 text-xs text-rose-600 bg-rose-50 p-3 rounded-2xl border border-rose-200">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              {/* Analysis CTA Button */}
              <div className="pt-2">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={handleRunAnalysis}
                  disabled={isAnalyzing}
                  className="w-full py-3.5 text-sm gap-2"
                >
                  {isAnalyzing ? (
                    <>
                      <Spinner size="sm" />
                      <span>{analysisStep || 'Analyzing Document...'}</span>
                    </>
                  ) : (
                    <>
                      <ScanSearch className="w-4 h-4" />
                      <span>Run ATS Analysis</span>
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Resume Selector Modal */}
      {user?.id && (
        <ResumeSelectorModal
          isOpen={isSelectorOpen}
          onClose={() => setIsSelectorOpen(false)}
          userId={user.id}
          selectedResumeId={selectedResumeItem?.id}
          onSelectResume={handleSelectResume}
        />
      )}
    </div>
  );
};
