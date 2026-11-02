import React from 'react';
import { AuthLayout } from '@/features/auth/components/AuthLayout';
import { LoginForm } from '@/features/auth/components/LoginForm';

export const LoginPage: React.FC = () => {
  return (
    <AuthLayout
      title="Welcome back"
      subtitle="Enter your credentials to access your career workspace and resumes."
    >
      <LoginForm />
    </AuthLayout>
  );
};
