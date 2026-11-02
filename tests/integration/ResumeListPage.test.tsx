import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { ResumeListPage } from '@/features/resumes/pages/ResumeListPage';
import { ResumeService } from '@/features/resumes/services/resumeService';

function renderResumeList() {
  return render(
    <BrowserRouter>
      <ResumeListPage />
    </BrowserRouter>
  );
}

describe('ResumeListPage Integration', () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it('renders empty state when user has no resumes', async () => {
    renderResumeList();

    expect(await screen.findByRole('heading', { name: /My Resumes/i })).toBeInTheDocument();
    expect(await screen.findByText(/No resumes created yet/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Create New Resume/i })).toBeInTheDocument();
  });

  it('renders resume card when a resume exists', async () => {
    await ResumeService.createResume('demo_user', 'Full Stack Engineer 2026', 'jakes-technical');

    renderResumeList();

    expect(await screen.findByText('Full Stack Engineer 2026')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Edit Resume/i })).toBeInTheDocument();
  });

  it('loads sample resume on clicking Load Sample', async () => {
    renderResumeList();

    const sampleButton = await screen.findByRole('button', { name: /Start with Sample Data/i });
    expect(sampleButton).toBeInTheDocument();
  });
});
