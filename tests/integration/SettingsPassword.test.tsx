import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { SettingsPage } from '@/pages/SettingsPage';
import { useAuthStore } from '@/stores/authStore';
import { AuthService } from '@/features/auth/services/authService';

vi.mock('@/features/auth/services/authService', () => ({
  AuthService: {
    updatePassword: vi.fn().mockResolvedValue({ id: 'usr-123' }),
    resetPasswordForEmail: vi.fn().mockResolvedValue(undefined),
  },
}));

describe('SettingsPage Password Management Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    useAuthStore.setState({
      user: { id: 'usr-123', email: 'alex@example.com' } as any,
      profile: { id: 'usr-123', email: 'alex@example.com', full_name: 'Alex' },
      session: { access_token: 'fake-token' } as any,
      isLoading: false,
      isInitialized: true,
      error: null,
    });
  });

  it('renders Security & Password card with Reset Password and Send Reset Email buttons', () => {
    render(
      <MemoryRouter>
        <SettingsPage />
      </MemoryRouter>
    );

    expect(screen.getByText(/Security & Password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Reset Password/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Send Reset Email/i })).toBeInTheDocument();
  });

  it('opens password update modal when clicking Reset Password', async () => {
    render(
      <MemoryRouter>
        <SettingsPage />
      </MemoryRouter>
    );

    const resetBtn = screen.getByRole('button', { name: /Reset Password/i });
    fireEvent.click(resetBtn);

    // Modal should now be open
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByLabelText(/^New Password$/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/^Confirm New Password$/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Update Password/i })).toBeInTheDocument();
  });

  it('validates password length and match before updating', async () => {
    render(
      <MemoryRouter>
        <SettingsPage />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole('button', { name: /Reset Password/i }));

    const newPassInput = screen.getByLabelText(/^New Password$/i);
    const confirmPassInput = screen.getByLabelText(/^Confirm New Password$/i);
    const updateBtn = screen.getByRole('button', { name: /Update Password/i });

    // Try short password
    fireEvent.change(newPassInput, { target: { value: 'short' } });
    fireEvent.change(confirmPassInput, { target: { value: 'short' } });
    fireEvent.click(updateBtn);

    expect(screen.getByText(/Password must be at least 8 characters long/i)).toBeInTheDocument();
    expect(AuthService.updatePassword).not.toHaveBeenCalled();

    // Try mismatching passwords
    fireEvent.change(newPassInput, { target: { value: 'ValidPass123!' } });
    fireEvent.change(confirmPassInput, { target: { value: 'DifferentPass123!' } });
    fireEvent.click(updateBtn);

    expect(screen.getByText(/Passwords do not match/i)).toBeInTheDocument();
    expect(AuthService.updatePassword).not.toHaveBeenCalled();
  });

  it('successfully updates password and closes modal on valid submission', async () => {
    render(
      <MemoryRouter>
        <SettingsPage />
      </MemoryRouter>
    );

    fireEvent.click(screen.getByRole('button', { name: /Reset Password/i }));

    const newPassInput = screen.getByLabelText(/^New Password$/i);
    const confirmPassInput = screen.getByLabelText(/^Confirm New Password$/i);
    const updateBtn = screen.getByRole('button', { name: /Update Password/i });

    fireEvent.change(newPassInput, { target: { value: 'SuperSecret123!' } });
    fireEvent.change(confirmPassInput, { target: { value: 'SuperSecret123!' } });
    fireEvent.click(updateBtn);

    await waitFor(() => {
      expect(AuthService.updatePassword).toHaveBeenCalledWith('SuperSecret123!');
    });

    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });

  it('sends recovery email to active user when Send Reset Email is clicked', async () => {
    render(
      <MemoryRouter>
        <SettingsPage />
      </MemoryRouter>
    );

    const sendEmailBtn = screen.getByRole('button', { name: /Send Reset Email/i });
    fireEvent.click(sendEmailBtn);

    await waitFor(() => {
      expect(AuthService.resetPasswordForEmail).toHaveBeenCalledWith('alex@example.com');
    });
  });
});
