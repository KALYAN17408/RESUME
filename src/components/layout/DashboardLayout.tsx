import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { useUIStore } from '@/stores/uiStore';
import { useAuthStore } from '@/stores/authStore';
import { Menu, Bell, ShieldCheck } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';

export const DashboardLayout: React.FC = () => {
  const { toggleSidebar } = useUIStore();
  const { user } = useAuthStore();

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 overflow-hidden">
      {/* Sidebar */}
      <Sidebar />

      {/* Main viewport */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex h-16 items-center justify-between border-b border-slate-200/80 bg-white/90 px-6 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-xl text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors"
              aria-label="Toggle sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
              <Link to="/dashboard" className="hover:text-slate-900 transition-colors">
                Workspace
              </Link>
              <span>/</span>
              <span className="text-slate-900 font-semibold">Overview</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <Badge variant="success" size="sm" className="hidden sm:inline-flex gap-1 py-1 px-2.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Phase 1 Verified</span>
            </Badge>

            <button
              aria-label="Notifications"
              className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors relative"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-brand-600"></span>
            </button>

            <div className="h-4 w-px bg-slate-200"></div>

            <div className="text-right hidden sm:block">
              <p className="text-xs font-semibold text-slate-900 truncate max-w-[150px]">
                {user?.user_metadata?.full_name || user?.email?.split('@')[0]}
              </p>
              <p className="text-[10px] text-slate-400">Authenticated Session</p>
            </div>
          </div>
        </header>

        {/* Content Viewport */}
        <main className="flex-1 overflow-y-auto p-6 lg:p-8">
          <div className="max-w-6xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
