import React from 'react';
import { AuthLayout } from '@/features/auth/components/AuthLayout';
import { SignupForm } from '@/features/auth/components/SignupForm';

export const SignupPage: React.FC = () => {
  return (
    <AuthLayout
      title="Create your account"
      subtitle="Start building recruiter-approved, ATS-safe engineering resumes."
    >
      <SignupForm />
    </AuthLayout>
  );
};
