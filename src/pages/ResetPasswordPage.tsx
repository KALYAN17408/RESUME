import React from 'react';
import { AuthLayout } from '@/features/auth/components/AuthLayout';
import { ResetPasswordForm } from '@/features/auth/components/ResetPasswordForm';

export const ResetPasswordPage: React.FC = () => {
  return (
    <AuthLayout
      title="Set new password"
      subtitle="Choose a strong, secure password with at least 8 characters."
    >
      <ResetPasswordForm />
    </AuthLayout>
  );
};
