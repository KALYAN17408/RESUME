import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { LandingPage } from '@/pages/LandingPage';

describe('LandingPage Integration Test', () => {
  it('renders main hero headline and primary CTA buttons', () => {
    render(
      <BrowserRouter>
        <LandingPage />
      </BrowserRouter>
    );

    // Hero title
    expect(screen.getByText(/Land Your Dream Job with an/i)).toBeInTheDocument();
    expect(screen.getByText(/AI-Powered Resume/i)).toBeInTheDocument();

    // CTA buttons
    expect(screen.getByRole('link', { name: /Build Your Resume Free/i })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Explore ATS Templates/i })).toBeInTheDocument();

    // Feature highlights
    expect(screen.getByRole('heading', { name: /AI Resume Builder/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /ATS Resume Analyzer/i })).toBeInTheDocument();
    expect(screen.getByRole('heading', { name: /Cover Letter Generator/i })).toBeInTheDocument();
  });
});
