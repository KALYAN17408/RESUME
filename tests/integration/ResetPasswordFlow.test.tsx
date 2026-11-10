import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ResetPasswordForm } from '@/features/auth/components/ResetPasswordForm';
import { AuthService } from '@/features/auth/services/authService';
import { useAuthStore } from '@/stores/authStore';

vi.mock('@/features/auth/services/authService', () => ({
  AuthService: {
    getSession: vi.fn(),
    exchangeCodeForSession: vi.fn(),
    verifyRecoveryToken: vi.fn(),
    setSession: vi.fn(),
    updatePassword: vi.fn(),
  },
}));

describe('ResetPasswordForm Integration Tests', () => {
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

  it('exchanges code for session and renders password inputs', async () => {
    vi.mocked(AuthService.getSession).mockResolvedValue(null);
    vi.mocked(AuthService.exchangeCodeForSession).mockResolvedValueOnce({
      user: { id: 'usr-reset-1', email: 'test@example.com' } as any,
      session: { user: { id: 'usr-reset-1' }, access_token: 'dummy-token' } as any,
    });

    render(
      <MemoryRouter initialEntries={['/reset-password?code=valid-pkce-code']}>
        <ResetPasswordForm />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/^New Password$/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Confirm New Password/i)).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /Update Password/i })).toBeInTheDocument();
    });

    expect(AuthService.exchangeCodeForSession).toHaveBeenCalledWith('valid-pkce-code');
  });

  it('renders invalid/expired link UI if no code or session is available', async () => {
    vi.mocked(AuthService.getSession).mockResolvedValue(null);

    render(
      <MemoryRouter initialEntries={['/reset-password']}>
        <ResetPasswordForm />
      </MemoryRouter>
    );

    await waitFor(
      () => {
        expect(screen.getByText(/Reset Link Expired or Invalid/i)).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /Request New Reset Link/i })).toBeInTheDocument();
      },
      { timeout: 2000 }
    );
  });

  it('successfully updates password when active session is present', async () => {
    const mockUser = { id: 'usr-reset-2', email: 'alex@example.com' } as any;
    const mockSession = { user: mockUser, access_token: 'valid-session-token' } as any;

    vi.mocked(AuthService.getSession).mockResolvedValue(mockSession);
    vi.mocked(AuthService.updatePassword).mockResolvedValueOnce(mockUser);

    render(
      <MemoryRouter initialEntries={['/reset-password']}>
        <ResetPasswordForm />
      </MemoryRouter>
    );

    await waitFor(() => {
      expect(screen.getByLabelText(/^New Password$/i)).toBeInTheDocument();
    });

    fireEvent.change(screen.getByLabelText(/^New Password$/i), { target: { value: 'Secret1234!' } });
    fireEvent.change(screen.getByLabelText(/Confirm New Password/i), { target: { value: 'Secret1234!' } });

    fireEvent.click(screen.getByRole('button', { name: /Update Password/i }));

    await waitFor(() => {
      expect(AuthService.updatePassword).toHaveBeenCalledWith('Secret1234!');
      expect(screen.getByText(/Password Updated!/i)).toBeInTheDocument();
    });
  });
});
