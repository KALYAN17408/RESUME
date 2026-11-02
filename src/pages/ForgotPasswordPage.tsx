import React from 'react';
import { AuthLayout } from '@/features/auth/components/AuthLayout';
import { ForgotPasswordForm } from '@/features/auth/components/ForgotPasswordForm';

export const ForgotPasswordPage: React.FC = () => {
  return (
    <AuthLayout
      title="Reset your password"
      subtitle="Enter your registered email address and we'll send you recovery instructions."
    >
      <ForgotPasswordForm />
    </AuthLayout>
  );
};
