import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { LoginForm } from '@/features/auth/components/LoginForm';
import { SignupForm } from '@/features/auth/components/SignupForm';
import { AuthCallbackPage } from '@/pages/AuthCallbackPage';
import { AuthService } from '@/features/auth/services/authService';
import { useAuthStore } from '@/stores/authStore';
import { supabase } from '@/lib/supabase/client';

// Mock AuthService
vi.mock('@/features/auth/services/authService', () => ({
  AuthService: {
    signInWithOAuth: vi.fn(),
    signInWithPassword: vi.fn(),
    signUp: vi.fn(),
    getUserProfile: vi.fn().mockResolvedValue({
      id: 'oauth-usr-1',
      full_name: 'Test OAuth User',
      email: 'oauth@example.com',
      avatar_url: 'https://example.com/avatar.png',
      tier: 'free',
    }),
    getSession: vi.fn().mockResolvedValue(null),
    signOut: vi.fn().mockResolvedValue(undefined),
  },
}));

describe('OAuth Authentication Integration Tests (Google & GitHub)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.setState({
      user: null,
      session: null,
      profile: null,
      isLoading: false,
      isInitialized: true,
      error: null,
    });
  });

  describe('Login Form OAuth Controls', () => {
    it('renders both Google and GitHub OAuth buttons on the login screen', () => {
      render(
        <MemoryRouter initialEntries={['/login']}>
          <LoginForm />
        </MemoryRouter>
      );

      expect(screen.getByRole('button', { name: /Continue with Google/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Continue with GitHub/i })).toBeInTheDocument();
      expect(screen.getByText(/or email/i)).toBeInTheDocument();
    });

    it('triggers AuthService.signInWithOAuth with google provider when Google button is clicked', async () => {
      vi.mocked(AuthService.signInWithOAuth).mockResolvedValueOnce(undefined);

      render(
        <MemoryRouter initialEntries={['/login']}>
          <LoginForm />
        </MemoryRouter>
      );

      const googleBtn = screen.getByRole('button', { name: /Continue with Google/i });
      fireEvent.click(googleBtn);

      await waitFor(() => {
        expect(AuthService.signInWithOAuth).toHaveBeenCalledWith('google');
      });
    });

    it('triggers AuthService.signInWithOAuth with github provider when GitHub button is clicked', async () => {
      vi.mocked(AuthService.signInWithOAuth).mockResolvedValueOnce(undefined);

      render(
        <MemoryRouter initialEntries={['/login']}>
          <LoginForm />
        </MemoryRouter>
      );

      const githubBtn = screen.getByRole('button', { name: /Continue with GitHub/i });
      fireEvent.click(githubBtn);

      await waitFor(() => {
        expect(AuthService.signInWithOAuth).toHaveBeenCalledWith('github');
      });
    });

    it('shows loading state and disables buttons while OAuth connection is in progress', async () => {
      // Mock delayed promise to simulate in-flight OAuth redirect
      let resolveOAuth: () => void;
      const oauthPromise = new Promise<void>((resolve) => {
        resolveOAuth = resolve;
      });
      vi.mocked(AuthService.signInWithOAuth).mockReturnValueOnce(oauthPromise);

      render(
        <MemoryRouter initialEntries={['/login']}>
          <LoginForm />
        </MemoryRouter>
      );

      const googleBtn = screen.getByRole('button', { name: /Continue with Google/i });
      const githubBtn = screen.getByRole('button', { name: /Continue with GitHub/i });

      fireEvent.click(googleBtn);

      // Should show connecting state
      expect(screen.getByText(/Connecting to Google.../i)).toBeInTheDocument();
      expect(googleBtn).toBeDisabled();
      expect(githubBtn).toBeDisabled();

      // Resolve
      resolveOAuth!();
    });

    it('displays error banner if user is redirected back with error query params', () => {
      render(
        <MemoryRouter initialEntries={['/login?error=access_denied&error_description=User+cancelled+sign-in']}>
          <LoginForm />
        </MemoryRouter>
      );

      expect(screen.getByText(/User cancelled sign-in/i)).toBeInTheDocument();
    });
  });

  describe('Signup Form OAuth Controls', () => {
    it('renders both Google and GitHub OAuth buttons on the registration screen', () => {
      render(
        <MemoryRouter initialEntries={['/signup']}>
          <SignupForm />
        </MemoryRouter>
      );

      expect(screen.getByRole('button', { name: /Continue with Google/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Continue with GitHub/i })).toBeInTheDocument();
      expect(screen.getByText(/or register with email/i)).toBeInTheDocument();
    });

    it('triggers Google OAuth on registration screen click', async () => {
      vi.mocked(AuthService.signInWithOAuth).mockResolvedValueOnce(undefined);

      render(
        <MemoryRouter initialEntries={['/signup']}>
          <SignupForm />
        </MemoryRouter>
      );

      fireEvent.click(screen.getByRole('button', { name: /Continue with Google/i }));

      await waitFor(() => {
        expect(AuthService.signInWithOAuth).toHaveBeenCalledWith('google');
      });
    });

    it('triggers GitHub OAuth on registration screen click', async () => {
      vi.mocked(AuthService.signInWithOAuth).mockResolvedValueOnce(undefined);

      render(
        <MemoryRouter initialEntries={['/signup']}>
          <SignupForm />
        </MemoryRouter>
      );

      fireEvent.click(screen.getByRole('button', { name: /Continue with GitHub/i }));

      await waitFor(() => {
        expect(AuthService.signInWithOAuth).toHaveBeenCalledWith('github');
      });
    });

    it('displays error banner on signup if redirected with error params', () => {
      render(
        <MemoryRouter initialEntries={['/signup?error=server_error&error_description=Google+OAuth+failed']}>
          <SignupForm />
        </MemoryRouter>
      );

      expect(screen.getByText(/Google OAuth failed/i)).toBeInTheDocument();
    });
  });

  describe('AuthCallbackPage Handling', () => {
    it('detects URL error params and redirects to /login', async () => {
      render(
        <MemoryRouter initialEntries={['/auth/callback?error=access_denied&error_description=Permissions+declined']}>
          <Routes>
            <Route path="/auth/callback" element={<AuthCallbackPage />} />
            <Route path="/login" element={<div>Login Page Target</div>} />
          </Routes>
        </MemoryRouter>
      );

      expect(screen.getByText(/Sign-in Incomplete/i)).toBeInTheDocument();
      expect(screen.getByText(/Permissions declined/i)).toBeInTheDocument();

      await waitFor(
        () => {
          expect(screen.getByText('Login Page Target')).toBeInTheDocument();
        },
        { timeout: 3000 }
      );
    });

    it('detects active session and navigates to /dashboard', async () => {
      const mockSession = {
        user: { id: 'usr-oauth-99', email: 'verified@example.com' },
        access_token: 'valid-token',
      } as any;

      vi.spyOn(supabase.auth, 'getSession').mockResolvedValueOnce({
        data: { session: mockSession },
        error: null,
      });

      render(
        <MemoryRouter initialEntries={['/auth/callback']}>
          <Routes>
            <Route path="/auth/callback" element={<AuthCallbackPage />} />
            <Route path="/dashboard" element={<div>Dashboard Workspace Target</div>} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText('Dashboard Workspace Target')).toBeInTheDocument();
      });

      expect(useAuthStore.getState().user?.id).toBe('usr-oauth-99');
    });

    it('exchanges code for session when code is present in query parameters', async () => {
      const mockSession = {
        user: { id: 'usr-oauth-exchange-1', email: 'exchanged@example.com' },
        access_token: 'exchange-token',
      } as any;

      vi.spyOn(supabase.auth, 'getSession').mockResolvedValueOnce({
        data: { session: null },
        error: null,
      });

      const exchangeSpy = vi.spyOn(supabase.auth, 'exchangeCodeForSession').mockResolvedValueOnce({
        data: { session: mockSession, user: mockSession.user },
        error: null,
      });

      render(
        <MemoryRouter initialEntries={['/auth/callback?code=test-auth-code-123']}>
          <Routes>
            <Route path="/auth/callback" element={<AuthCallbackPage />} />
            <Route path="/dashboard" element={<div>Dashboard Workspace Target</div>} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(exchangeSpy).toHaveBeenCalledWith('test-auth-code-123');
        expect(screen.getByText('Dashboard Workspace Target')).toBeInTheDocument();
      });

      expect(useAuthStore.getState().user?.id).toBe('usr-oauth-exchange-1');
    });

    it('handles code exchange failure and displays the specific error message', async () => {
      vi.spyOn(supabase.auth, 'getSession').mockResolvedValue({
        data: { session: null },
        error: null,
      });

      vi.spyOn(supabase.auth, 'exchangeCodeForSession').mockResolvedValueOnce({
        data: { session: null, user: null },
        error: new Error('PKCE code verifier not found in storage') as any,
      });

      render(
        <MemoryRouter initialEntries={['/auth/callback?code=invalid-or-expired-code']}>
          <Routes>
            <Route path="/auth/callback" element={<AuthCallbackPage />} />
            <Route path="/login" element={<div>Login Page Target</div>} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText(/Sign-in Incomplete/i)).toBeInTheDocument();
        expect(screen.getByText(/PKCE code verifier not found in storage/i)).toBeInTheDocument();
      });

      await waitFor(
        () => {
          expect(screen.getByText('Login Page Target')).toBeInTheDocument();
        },
        { timeout: 3000 }
      );
    });

    it('immediately redirects to /login when neither session nor auth code is present', async () => {
      vi.spyOn(supabase.auth, 'getSession').mockResolvedValueOnce({
        data: { session: null },
        error: null,
      });

      render(
        <MemoryRouter initialEntries={['/auth/callback']}>
          <Routes>
            <Route path="/auth/callback" element={<AuthCallbackPage />} />
            <Route path="/login" element={<div>Login Page Target</div>} />
          </Routes>
        </MemoryRouter>
      );

      await waitFor(() => {
        expect(screen.getByText(/No authentication session or authorization code found/i)).toBeInTheDocument();
      });

      await waitFor(
        () => {
          expect(screen.getByText('Login Page Target')).toBeInTheDocument();
        },
        { timeout: 3000 }
      );
    });
  });
});
