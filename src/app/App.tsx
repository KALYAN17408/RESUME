import React, { useEffect } from 'react';
import { AppRouter } from './router';
import { useAuthStore } from '@/stores/authStore';

export const App: React.FC = () => {
  const initializeAuth = useAuthStore((state) => state.initialize);

  useEffect(() => {
    initializeAuth();
  }, [initializeAuth]);

  return <AppRouter />;
};
