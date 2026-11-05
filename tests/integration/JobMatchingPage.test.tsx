import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { JobMatchingPage } from '@/features/jobs/pages/JobMatchingPage';

describe('JobMatchingPage Coming Soon Screen', () => {
  it('renders Job Matching Coming Soon UI with badge, title, and descriptive message', () => {
    render(
      <MemoryRouter initialEntries={['/dashboard/jobs']}>
        <Routes>
          <Route path="/dashboard/jobs" element={<JobMatchingPage />} />
        </Routes>
      </MemoryRouter>
    );

    // Title & Badge
    expect(screen.getByRole('heading', { level: 1, name: 'Job Matching' })).toBeInTheDocument();
    expect(screen.getByText('Coming Soon')).toBeInTheDocument();

    // Suggested Content Message
    expect(
      screen.getByText(/Find opportunities that match your skills and career goals/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/This feature is coming soon/i)
    ).toBeInTheDocument();

    // Planned capabilities
    expect(screen.getByText('Intelligent Match Scoring')).toBeInTheDocument();
    expect(screen.getByText('Skills Gap Detection')).toBeInTheDocument();
    expect(screen.getByText('Application Tracker')).toBeInTheDocument();
  });

  it('provides Back to Dashboard action button that navigates back to /dashboard', () => {
    render(
      <MemoryRouter initialEntries={['/dashboard/jobs']}>
        <Routes>
          <Route path="/dashboard/jobs" element={<JobMatchingPage />} />
          <Route path="/dashboard" element={<div data-testid="dashboard-view">Dashboard View</div>} />
        </Routes>
      </MemoryRouter>
    );

    const backButton = screen.getByRole('button', { name: /Back to Dashboard/i });
    expect(backButton).toBeInTheDocument();

    fireEvent.click(backButton);
    expect(screen.getByTestId('dashboard-view')).toBeInTheDocument();
  });

  it('does not trigger any background API or network calls', () => {
    const fetchSpy = vi.spyOn(window, 'fetch');
    render(
      <MemoryRouter initialEntries={['/dashboard/jobs']}>
        <Routes>
          <Route path="/dashboard/jobs" element={<JobMatchingPage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(fetchSpy).not.toHaveBeenCalled();
    fetchSpy.mockRestore();
  });
});
