import React from 'react';
import { Outlet, Link, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { useUIStore } from '@/stores/uiStore';
import { useAuthStore } from '@/stores/authStore';
import { Menu, Bell, ShieldCheck } from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Tooltip } from '@/components/ui/Tooltip';
import { cn } from '@/utils/cn';

export const DashboardLayout: React.FC = () => {
  const { toggleSidebar } = useUIStore();
  const { user } = useAuthStore();
  const location = useLocation();

  // Dynamic route-aware breadcrumb resolution
  const getBreadcrumbs = () => {
    const path = location.pathname;
    if (path === '/dashboard' || path === '/dashboard/') {
      return [{ label: 'Workspace', href: '/dashboard' }, { label: 'Overview' }];
    }
    if (path === '/dashboard/resumes') {
      return [{ label: 'Workspace', href: '/dashboard' }, { label: 'My Resumes' }];
    }
    if (path.startsWith('/dashboard/resumes/')) {
      return [
        { label: 'Workspace', href: '/dashboard' },
        { label: 'My Resumes', href: '/dashboard/resumes' },
        { label: 'Resume Editor' },
      ];
    }
    if (path.startsWith('/dashboard/analyzer')) {
      return [{ label: 'Workspace', href: '/dashboard' }, { label: 'ATS Scanner' }];
    }
    if (path.startsWith('/dashboard/cover-letter')) {
      return [{ label: 'Workspace', href: '/dashboard' }, { label: 'Cover Letter Generator' }];
    }
    if (path.startsWith('/dashboard/settings') || path.startsWith('/dashboard/profile')) {
      return [{ label: 'Workspace', href: '/dashboard' }, { label: 'Account Settings' }];
    }
    return [{ label: 'Workspace', href: '/dashboard' }, { label: 'Dashboard' }];
  };

  const breadcrumbs = getBreadcrumbs();

  return (
    <div className="flex h-screen bg-slate-50 text-slate-900 overflow-hidden">
      {/* Sidebar */}
      <Sidebar />

      {/* Main viewport */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex h-16 items-center justify-between border-b border-slate-200/80 bg-white/90 px-4 sm:px-6 backdrop-blur-md">
          <div className="flex items-center gap-3 sm:gap-4">
            <button
              onClick={toggleSidebar}
              className="p-2 rounded-radius-sm text-slate-500 hover:text-slate-900 hover:bg-slate-100 transition-colors focus-ring"
              aria-label="Toggle sidebar"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Dynamic Breadcrumbs */}
            <nav aria-label="Breadcrumb" className="flex items-center">
              <ol className="flex items-center gap-1.5 sm:gap-2 text-xs font-medium text-slate-500">
                {breadcrumbs.map((crumb, idx) => {
                  const isLast = idx === breadcrumbs.length - 1;
                  return (
                    <li key={idx} className="flex items-center gap-1.5 sm:gap-2">
                      {idx > 0 && <span className="text-slate-300" aria-hidden="true">/</span>}
                      {crumb.href && !isLast ? (
                        <Link to={crumb.href} className="hover:text-slate-900 transition-colors">
                          {crumb.label}
                        </Link>
                      ) : (
                        <span
                          className={cn(isLast ? 'text-slate-900 font-semibold' : 'text-slate-500')}
                          aria-current={isLast ? 'page' : undefined}
                        >
                          {crumb.label}
                        </span>
                      )}
                    </li>
                  );
                })}
              </ol>
            </nav>
          </div>

          <div className="flex items-center gap-3 sm:gap-4">
            <Badge variant="success" size="sm" className="hidden sm:inline-flex gap-1 py-1 px-2.5">
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Cloud Sync Verified</span>
            </Badge>

            <Tooltip content="No unread notifications">
              <button
                aria-label="Notifications"
                className="p-2 rounded-radius-sm text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors relative focus-ring"
              >
                <Bell className="w-4 h-4" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-slate-900" />
              </button>
            </Tooltip>

            <div className="h-4 w-px bg-slate-200" />

            <div className="text-right hidden sm:block">
              <p className="text-xs font-semibold text-slate-900 truncate max-w-[150px]">
                {user?.user_metadata?.full_name || user?.email?.split('@')[0]}
              </p>
              <p className="text-[10px] text-slate-500">Authenticated Session</p>
            </div>
          </div>
        </header>

        {/* Content Viewport */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <div className="max-w-6xl mx-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
