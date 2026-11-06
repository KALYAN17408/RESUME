import { describe, it, expect, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { AppRouter } from '@/app/router';
import { useAuthStore } from '@/stores/authStore';

describe('App Routing & Route Guards', () => {
  beforeEach(() => {
    useAuthStore.setState({
      user: null,
      session: null,
      profile: null,
      isLoading: false,
      isInitialized: true,
      error: null,
    });
  });

  it('redirects unauthenticated user from /dashboard to /login', () => {
    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <AppRouter />
      </MemoryRouter>
    );

    // Should redirect to login screen
    expect(screen.getByText(/Welcome back/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Sign In/i })).toBeInTheDocument();
  });

  it('allows authenticated user to view /dashboard overview', () => {
    useAuthStore.setState({
      user: { id: 'usr-123', email: 'alex@example.com' } as any,
      session: { access_token: 'token' } as any,
      profile: { id: 'usr-123', email: 'alex@example.com', full_name: 'Alex' },
      isLoading: false,
      isInitialized: true,
    });

    render(
      <MemoryRouter initialEntries={['/dashboard']}>
        <AppRouter />
      </MemoryRouter>
    );

    expect(screen.getByText(/Welcome back, Alex/i)).toBeInTheDocument();
    expect(screen.getByText(/Account Metrics/i)).toBeInTheDocument();
    expect(screen.getByText(/Tools & Applications/i)).toBeInTheDocument();
  });

  it('allows authenticated user to access /forgot-password without bouncing to /dashboard', () => {
    useAuthStore.setState({
      user: { id: 'usr-123', email: 'alex@example.com' } as any,
      session: { access_token: 'token' } as any,
      profile: { id: 'usr-123', email: 'alex@example.com', full_name: 'Alex' },
      isLoading: false,
      isInitialized: true,
    });

    render(
      <MemoryRouter initialEntries={['/forgot-password']}>
        <AppRouter />
      </MemoryRouter>
    );

    expect(screen.getByText(/Reset your password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Send Reset Instructions/i })).toBeInTheDocument();
  });

  it('renders auth callback page when navigating to /auth/callback', () => {
    render(
      <MemoryRouter initialEntries={['/auth/callback']}>
        <AppRouter />
      </MemoryRouter>
    );

    expect(screen.getByText(/Completing Secure Sign-In/i)).toBeInTheDocument();
  });
});
