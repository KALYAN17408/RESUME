import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { MockInterviewPage } from '@/features/interviews/pages/MockInterviewPage';

describe('MockInterviewPage Coming Soon Screen', () => {
  it('renders Mock Interviews Coming Soon UI with badge, title, and descriptive message', () => {
    render(
      <MemoryRouter initialEntries={['/dashboard/interviews']}>
        <Routes>
          <Route path="/dashboard/interviews" element={<MockInterviewPage />} />
        </Routes>
      </MemoryRouter>
    );

    // Title & Badge
    expect(screen.getByRole('heading', { level: 1, name: 'Mock Interviews' })).toBeInTheDocument();
    expect(screen.getByText('Coming Soon')).toBeInTheDocument();

    // Suggested Content Message
    expect(
      screen.getByText(/Prepare for your next interview with AI-powered practice sessions/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/This feature is currently under active development/i)
    ).toBeInTheDocument();

    // Planned capabilities
    expect(screen.getByText('Role-Specific Practice')).toBeInTheDocument();
    expect(screen.getByText('STAR Method Feedback')).toBeInTheDocument();
    expect(screen.getByText('Confidence & Score Tracking')).toBeInTheDocument();
  });

  it('provides Back to Dashboard action button that navigates back to /dashboard', () => {
    render(
      <MemoryRouter initialEntries={['/dashboard/interviews']}>
        <Routes>
          <Route path="/dashboard/interviews" element={<MockInterviewPage />} />
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
      <MemoryRouter initialEntries={['/dashboard/interviews']}>
        <Routes>
          <Route path="/dashboard/interviews" element={<MockInterviewPage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(fetchSpy).not.toHaveBeenCalled();
    fetchSpy.mockRestore();
  });
});
