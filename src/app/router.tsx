import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { LandingPage } from '@/pages/LandingPage';
import { LoginPage } from '@/pages/LoginPage';
import { SignupPage } from '@/pages/SignupPage';
import { ForgotPasswordPage } from '@/pages/ForgotPasswordPage';
import { ResetPasswordPage } from '@/pages/ResetPasswordPage';
import { NotFoundPage } from '@/pages/NotFoundPage';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { DashboardOverview } from '@/features/dashboard/components/DashboardOverview';
import { SettingsPage } from '@/pages/SettingsPage';
import { ResumeListPage } from '@/features/resumes/pages/ResumeListPage';
import { ResumeEditorPage } from '@/features/resumes/pages/ResumeEditorPage';
import { Spinner } from '@/components/ui/Spinner';
import { Sparkles } from 'lucide-react';

export const ProtectedRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { user, isLoading } = useAuthStore();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-slate-50 gap-4">
        <div className="w-12 h-12 rounded-2xl bg-black flex items-center justify-center text-white shadow-md shadow-black/20">
          <Sparkles className="w-6 h-6" />
        </div>
        <Spinner size="md" />
        <p className="text-xs text-slate-500 font-medium">Verifying session...</p>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};

export const PublicOnlyRoute: React.FC<{ children: React.ReactElement }> = ({ children }) => {
  const { user, isLoading } = useAuthStore();

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col justify-center items-center bg-slate-50 gap-4">
        <Spinner size="md" />
      </div>
    );
  }

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

export const AppRouter: React.FC = () => {
  return (
    <Routes>
      {/* Public Routes */}
      <Route path="/" element={<LandingPage />} />

      {/* Guest/Auth-Only Routes */}
      <Route
        path="/login"
        element={
          <PublicOnlyRoute>
            <LoginPage />
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/signup"
        element={
          <PublicOnlyRoute>
            <SignupPage />
          </PublicOnlyRoute>
        }
      />
      <Route
        path="/forgot-password"
        element={
          <PublicOnlyRoute>
            <ForgotPasswordPage />
          </PublicOnlyRoute>
        }
      />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      {/* Protected Standalone Resume Editor Routes */}
      <Route
        path="/dashboard/resumes/new"
        element={
          <ProtectedRoute>
            <ResumeEditorPage />
          </ProtectedRoute>
        }
      />
      <Route
        path="/dashboard/resumes/:resumeId/edit"
        element={
          <ProtectedRoute>
            <ResumeEditorPage />
          </ProtectedRoute>
        }
      />

      {/* Protected Dashboard Routes */}
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<DashboardOverview />} />
        <Route path="resumes" element={<ResumeListPage />} />
        <Route path="settings" element={<SettingsPage />} />
        {/* Module A route redirect */}
        <Route path="builder" element={<Navigate to="/dashboard/resumes" replace />} />
        <Route path="analyzer" element={<DashboardOverview />} />
        <Route path="jobs" element={<DashboardOverview />} />
        <Route path="copilot" element={<DashboardOverview />} />
        <Route path="interviews" element={<DashboardOverview />} />
      </Route>

      {/* 404 Fallback */}
      <Route path="*" element={<NotFoundPage />} />
    </Routes>
  );
};
