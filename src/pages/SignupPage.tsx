import React from 'react';
import { AuthLayout } from '@/features/auth/components/AuthLayout';
import { SignupForm } from '@/features/auth/components/SignupForm';

export const SignupPage: React.FC = () => {
  return (
    <AuthLayout
      title="Create your account"
      subtitle="100% free forever. Build ATS-safe resumes, analyze compatibility, and generate cover letters."
    >
      <SignupForm />
    </AuthLayout>
  );
};
