import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AtsAnalyzerPage } from '@/features/analyzer/pages/AtsAnalyzerPage';
import { AtsReportService } from '@/features/analyzer/services/atsReportService';
import { ResumeService } from '@/features/resumes/services/resumeService';

function renderAnalyzerPage() {
  return render(
    <BrowserRouter>
      <AtsAnalyzerPage />
    </BrowserRouter>
  );
}

describe('AtsAnalyzerPage Integration', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.spyOn(AtsReportService, 'isRemoteConfigured').mockReturnValue(false);
    vi.spyOn(ResumeService, 'isRemoteConfigured').mockReturnValue(false);
  });

  it('renders page header and core options', () => {
    renderAnalyzerPage();

    expect(screen.getByRole('heading', { name: /ATS Resume Analyzer/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Saved Resume/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Upload PDF/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Load Sample JD/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Run ATS Analysis/i })).toBeInTheDocument();
  });

  it('switches to PDF upload zone when Upload PDF tab is clicked', () => {
    renderAnalyzerPage();

    const uploadTab = screen.getByRole('button', { name: /Upload PDF/i });
    fireEvent.click(uploadTab);

    expect(screen.getByText(/Click to upload or drag & drop resume PDF/i)).toBeInTheDocument();
  });

  it('loads sample job description on clicking Load Sample JD button', () => {
    renderAnalyzerPage();

    const sampleButton = screen.getByRole('button', { name: /Load Sample JD/i });
    fireEvent.click(sampleButton);

    const textarea = screen.getByPlaceholderText(/Paste the target job description here/i) as HTMLTextAreaElement;
    expect(textarea.value).toContain('Senior Full-Stack Software Engineer');
    expect(textarea.value).toContain('React');
    expect(textarea.value).toContain('TypeScript');
  });

  it('shows validation error when attempting to analyze with missing inputs', async () => {
    renderAnalyzerPage();

    const analyzeBtn = screen.getByRole('button', { name: /Run ATS Analysis/i });
    fireEvent.click(analyzeBtn);

    expect(await screen.findByText(/Please paste a job description to analyze/i)).toBeInTheDocument();
  });
});
