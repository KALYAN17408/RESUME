import React from 'react';
import { AuthLayout } from '@/features/auth/components/AuthLayout';
import { LoginForm } from '@/features/auth/components/LoginForm';

export const LoginPage: React.FC = () => {
  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Sign in to your free workspace to build resumes, analyze ATS scores, and generate cover letters."
    >
      <LoginForm />
    </AuthLayout>
  );
};
