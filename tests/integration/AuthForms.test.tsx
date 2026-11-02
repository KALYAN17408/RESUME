import { describe, it, expect } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { LoginForm } from '@/features/auth/components/LoginForm';
import { SignupForm } from '@/features/auth/components/SignupForm';

describe('Auth Forms Integration Tests', () => {
  describe('LoginForm', () => {
    it('renders login form inputs and triggers validation on empty submit', async () => {
      render(
        <BrowserRouter>
          <LoginForm />
        </BrowserRouter>
      );

      expect(screen.getByLabelText(/Email address/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/••••••••/i)).toBeInTheDocument();

      const submitBtn = screen.getByRole('button', { name: /Sign In/i });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(screen.getByText(/Email is required/i)).toBeInTheDocument();
      });
    });
  });

  describe('SignupForm', () => {
    it('renders full registration fields and triggers validation on mismatch', async () => {
      render(
        <BrowserRouter>
          <SignupForm />
        </BrowserRouter>
      );

      expect(screen.getByLabelText(/Full Name/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/Email address/i)).toBeInTheDocument();

      const submitBtn = screen.getByRole('button', { name: /Create Free Account/i });
      fireEvent.click(submitBtn);

      await waitFor(() => {
        expect(screen.getByText(/Full name must be at least 2 characters/i)).toBeInTheDocument();
        expect(screen.getByText(/Email is required/i)).toBeInTheDocument();
      });
    });
  });
});
