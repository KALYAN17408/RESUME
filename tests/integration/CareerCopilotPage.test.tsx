import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { CareerCopilotPage } from '@/features/copilot/pages/CareerCopilotPage';

describe('CareerCopilotPage Coming Soon Screen', () => {
  it('renders AI Career Copilot Coming Soon UI with badge, title, and descriptive message', () => {
    render(
      <MemoryRouter initialEntries={['/dashboard/copilot']}>
        <Routes>
          <Route path="/dashboard/copilot" element={<CareerCopilotPage />} />
        </Routes>
      </MemoryRouter>
    );

    // Title & Badge
    expect(screen.getByRole('heading', { level: 1, name: 'AI Career Copilot' })).toBeInTheDocument();
    expect(screen.getByText('Coming Soon')).toBeInTheDocument();

    // Suggested Content Message
    expect(
      screen.getByText(/Your personal AI career assistant is on its way/i)
    ).toBeInTheDocument();
    expect(
      screen.getByText(/This feature is currently under active development/i)
    ).toBeInTheDocument();

    // Planned capabilities
    expect(screen.getByText('Grounded Career Guidance')).toBeInTheDocument();
    expect(screen.getByText('Resume Quantification')).toBeInTheDocument();
    expect(screen.getByText('Interview & Offer Strategy')).toBeInTheDocument();
  });

  it('provides Back to Dashboard action button that navigates back to /dashboard', () => {
    render(
      <MemoryRouter initialEntries={['/dashboard/copilot']}>
        <Routes>
          <Route path="/dashboard/copilot" element={<CareerCopilotPage />} />
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
      <MemoryRouter initialEntries={['/dashboard/copilot']}>
        <Routes>
          <Route path="/dashboard/copilot" element={<CareerCopilotPage />} />
        </Routes>
      </MemoryRouter>
    );

    expect(fetchSpy).not.toHaveBeenCalled();
    fetchSpy.mockRestore();
  });
});
