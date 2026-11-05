import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { JobMatchingPage } from '@/features/jobs/pages/JobMatchingPage';
import { ResumeService } from '@/features/resumes/services/resumeService';
import { JobService } from '@/features/jobs/services/jobService';
import type { SavedJob } from '@/features/jobs/types/job.types';
import type { ResumeData } from '@/features/resumes/types/resume.types';

vi.mock('@/features/resumes/services/resumeService');
vi.mock('@/features/jobs/services/jobService');

const mockResume: ResumeData = {
  id: 'res-1',
  userId: 'test-user',
  title: 'Full Stack Engineer Resume',
  templateId: 'jakes-technical',
  sectionOrder: ['personal', 'skills'],
  personalInfo: {
    fullName: 'Alex River',
    professionalTitle: 'Full Stack Engineer',
    email: 'alex@example.com',
    phone: '123',
    location: 'NYC',
    linkedinUrl: '',
    githubUrl: '',
    portfolioUrl: '',
    summary: 'Engineer',
  },
  skillCategories: [
    { id: '1', name: 'Core', skills: ['React', 'TypeScript', 'Node.js'] },
  ],
  experiences: [],
  projects: [],
  educations: [],
  customSections: [],
  customization: {
    accentColor: '#2563EB',
    fontFamily: 'Inter',
    fontSize: 'medium',
    lineSpacing: 'normal',
    margins: 'normal',
  },
  createdAt: '2026-01-01',
  updatedAt: '2026-01-01',
};

const mockJobs: SavedJob[] = [
  {
    id: 'job-1',
    userId: 'test-user',
    title: 'Senior Frontend Developer',
    company: 'Stripe',
    location: 'San Francisco, CA',
    employmentType: 'full-time',
    jobDescription: 'Seeking Senior Frontend Developer proficient in React, TypeScript, and web architecture.',
    status: 'interested',
    matchAnalysis: {
      overallScore: 88,
      skillsMatch: {
        matched: ['React', 'TypeScript'],
        missing: ['GraphQL'],
        criticalMissing: [],
        matchPercentage: 66,
      },
      experienceAlignment: {
        titleAlignment: 'strong',
        relevantRolesFound: ['Full Stack Engineer'],
        yearsEstimated: 3,
        summary: 'Strong title alignment found.',
      },
      keywordAlignment: {
        matchedCount: 2,
        totalJobKeywords: 3,
        topMatches: ['React', 'TypeScript'],
      },
      suggestions: ['Add GraphQL projects'],
      analyzedAt: '2026-01-01',
      disclaimer: 'Algorithmic estimate.',
    },
    createdAt: '2026-01-02T00:00:00Z',
    updatedAt: '2026-01-02T00:00:00Z',
  },
];

describe('JobMatchingPage Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(ResumeService.listResumes).mockResolvedValue([
      { id: 'res-1', title: 'Full Stack Engineer Resume', templateId: 'jakes-technical', updatedAt: '2026-01-01' } as any,
    ]);
    vi.mocked(ResumeService.getResume).mockResolvedValue(mockResume);
    vi.mocked(JobService.listJobs).mockResolvedValue(mockJobs);
  });

  it('renders job matching workspace, metrics, and saved job card', async () => {
    render(
      <BrowserRouter>
        <JobMatchingPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Job Matching & Applications/i)).toBeInTheDocument();
      expect(screen.getByText('Senior Frontend Developer')).toBeInTheDocument();
      expect(screen.getByText('Stripe')).toBeInTheDocument();
      expect(screen.getByText('88%')).toBeInTheDocument();
    });
  });

  it('opens match analysis modal when clicking Analysis button', async () => {
    render(
      <BrowserRouter>
        <JobMatchingPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText('Senior Frontend Developer')).toBeInTheDocument();
    });

    const analysisBtn = screen.getByRole('button', { name: /analysis/i });
    fireEvent.click(analysisBtn);

    await waitFor(() => {
      expect(screen.getByText(/Match Analysis: Senior Frontend Developer/i)).toBeInTheDocument();
      expect(screen.getByText(/Matched Skills/i)).toBeInTheDocument();
      expect(screen.getByText(/Targeted Application Improvements/i)).toBeInTheDocument();
    });
  });

  it('opens add opportunity modal when clicking Add Opportunity button', async () => {
    render(
      <BrowserRouter>
        <JobMatchingPage />
      </BrowserRouter>
    );

    await waitFor(() => {
      expect(screen.getByText(/Job Matching & Applications/i)).toBeInTheDocument();
    });

    const addBtn = screen.getByRole('button', { name: /Add Opportunity/i });
    fireEvent.click(addBtn);

    await waitFor(() => {
      expect(screen.getByText(/Add New Job Opportunity/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Job Title \*/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Company \*/i)).toBeInTheDocument();
    });
  });
});
