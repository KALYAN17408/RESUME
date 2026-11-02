import { describe, it, expect } from 'vitest';
import { loginSchema } from '@/features/auth/components/LoginForm';
import { signupSchema } from '@/features/auth/components/SignupForm';
import { forgotPasswordSchema } from '@/features/auth/components/ForgotPasswordForm';
import { resetPasswordSchema } from '@/features/auth/components/ResetPasswordForm';

describe('Auth Form Zod Schemas Validation', () => {
  describe('loginSchema', () => {
    it('passes with valid email and password >= 6 chars', () => {
      const result = loginSchema.safeParse({
        email: 'alex@example.com',
        password: 'password123',
      });
      expect(result.success).toBe(true);
    });

    it('fails when email is invalid', () => {
      const result = loginSchema.safeParse({
        email: 'invalid-email',
        password: 'password123',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('valid email');
      }
    });

    it('fails when password is too short', () => {
      const result = loginSchema.safeParse({
        email: 'alex@example.com',
        password: '123',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('6 characters');
      }
    });
  });

  describe('signupSchema', () => {
    it('passes with valid full name, email, and matching passwords >= 8 chars', () => {
      const result = signupSchema.safeParse({
        fullName: 'Alex Johnson',
        email: 'alex@example.com',
        password: 'SecurePassword123!',
        confirmPassword: 'SecurePassword123!',
      });
      expect(result.success).toBe(true);
    });

    it('fails when passwords do not match', () => {
      const result = signupSchema.safeParse({
        fullName: 'Alex Johnson',
        email: 'alex@example.com',
        password: 'SecurePassword123!',
        confirmPassword: 'DifferentPassword123!',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe('Passwords do not match');
      }
    });

    it('fails when password is shorter than 8 characters', () => {
      const result = signupSchema.safeParse({
        fullName: 'Alex Johnson',
        email: 'alex@example.com',
        password: 'pass1',
        confirmPassword: 'pass1',
      });
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain('8 characters');
      }
    });
  });

  describe('forgotPasswordSchema', () => {
    it('validates correct email', () => {
      expect(forgotPasswordSchema.safeParse({ email: 'alex@test.com' }).success).toBe(true);
      expect(forgotPasswordSchema.safeParse({ email: 'bad' }).success).toBe(false);
    });
  });

  describe('resetPasswordSchema', () => {
    it('ensures passwords match and are at least 8 chars', () => {
      expect(
        resetPasswordSchema.safeParse({
          password: 'newPassword123!',
          confirmPassword: 'newPassword123!',
        }).success
      ).toBe(true);

      expect(
        resetPasswordSchema.safeParse({
          password: 'newPassword123!',
          confirmPassword: 'mismatchPassword!',
        }).success
      ).toBe(false);
    });
  });
});
