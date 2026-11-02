import { describe, it, expect, beforeEach } from 'vitest';
import { useUIStore } from '@/stores/uiStore';
import { useAuthStore } from '@/stores/authStore';

describe('Zustand State Stores', () => {
  beforeEach(() => {
    useUIStore.setState({ sidebarOpen: true, toasts: [], theme: 'light' });
    useAuthStore.setState({ user: null, session: null, profile: null, isLoading: false, isInitialized: true, error: null });
  });

  describe('useUIStore', () => {
    it('toggles sidebar state', () => {
      expect(useUIStore.getState().sidebarOpen).toBe(true);
      useUIStore.getState().toggleSidebar();
      expect(useUIStore.getState().sidebarOpen).toBe(false);
      useUIStore.getState().toggleSidebar();
      expect(useUIStore.getState().sidebarOpen).toBe(true);
    });

    it('adds and removes toasts properly', () => {
      expect(useUIStore.getState().toasts).toHaveLength(0);
      useUIStore.getState().addToast({
        type: 'success',
        title: 'Test Toast',
        message: 'Test message description',
        duration: 0,
      });

      const toasts = useUIStore.getState().toasts;
      expect(toasts).toHaveLength(1);
      expect(toasts[0].title).toBe('Test Toast');

      useUIStore.getState().removeToast(toasts[0].id);
      expect(useUIStore.getState().toasts).toHaveLength(0);
    });
  });

  describe('useAuthStore', () => {
    it('sets and clears user state on sign out', async () => {
      const mockUser = { id: 'usr-123', email: 'alex@example.com' } as any;
      const mockSession = { user: mockUser, access_token: 'token-123' } as any;

      useAuthStore.getState().setUser(mockUser, mockSession);
      expect(useAuthStore.getState().user?.email).toBe('alex@example.com');

      await useAuthStore.getState().signOut();
      expect(useAuthStore.getState().user).toBeNull();
      expect(useAuthStore.getState().session).toBeNull();
    });
  });
});
