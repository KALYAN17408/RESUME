import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import {
  Sparkles,
  LayoutDashboard,
  FileText,
  ScanSearch,
  Briefcase,
  Bot,
  MessageSquare,
  Settings,
  LogOut,
  X,
  User as UserIcon,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/utils/cn';

export const Sidebar: React.FC = () => {
  const location = useLocation();
  const { user, profile, signOut } = useAuthStore();
  const { sidebarOpen, setSidebarOpen } = useUIStore();

  const navigation = [
    { name: 'Overview', href: '/dashboard', icon: LayoutDashboard },
    { name: 'Resume Builder', href: '/dashboard/builder', icon: FileText, badge: 'Phase 2' },
    { name: 'ATS Analyzer', href: '/dashboard/analyzer', icon: ScanSearch, badge: 'Phase 3' },
    { name: 'Job Matching', href: '/dashboard/jobs', icon: Briefcase, badge: 'Phase 4' },
    { name: 'AI Career Copilot', href: '/dashboard/copilot', icon: Bot, badge: 'Phase 5' },
    { name: 'Mock Interviews', href: '/dashboard/interviews', icon: MessageSquare, badge: 'Phase 5' },
    { name: 'Account Settings', href: '/dashboard/settings', icon: Settings },
  ];

  const userEmail = user?.email || 'user@example.com';
  const userName = profile?.full_name || user?.user_metadata?.full_name || userEmail.split('@')[0];
  const userTier = profile?.tier || 'free';

  return (
    <>
      {/* Mobile backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-50 flex w-72 flex-col border-r border-slate-200/80 bg-white transition-transform duration-200 ease-in-out lg:static lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Brand header */}
        <div className="flex h-16 items-center justify-between px-6 border-b border-slate-100">
          <Link to="/" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-brand-600 flex items-center justify-center text-white shadow-sm shadow-brand-500/20">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="text-base font-black tracking-tight text-slate-900">
              ResuMax <span className="text-brand-600">AI</span>
            </span>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation links */}
        <nav className="flex-1 space-y-1 px-3 py-4 overflow-y-auto">
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            const Icon = item.icon;

            return (
              <Link
                key={item.name}
                to={item.href}
                className={cn(
                  'flex items-center justify-between rounded-xl px-3.5 py-2.5 text-xs font-medium transition-colors',
                  isActive
                    ? 'bg-brand-50 text-brand-700 font-semibold shadow-xs'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                )}
              >
                <div className="flex items-center gap-3">
                  <Icon className={cn('w-4 h-4 shrink-0', isActive ? 'text-brand-600' : 'text-slate-400')} />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <Badge variant="default" size="sm" className="text-[10px] py-0 px-1.5 bg-slate-100 text-slate-500">
                    {item.badge}
                  </Badge>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User profile & footer */}
        <div className="border-t border-slate-100 p-3.5">
          <div className="flex items-center gap-3 p-2 rounded-xl bg-slate-50 border border-slate-100">
            <div className="w-9 h-9 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-xs uppercase shrink-0">
              {userName.charAt(0) || <UserIcon className="w-4 h-4" />}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-semibold text-slate-900 truncate">{userName}</p>
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-[10px] text-slate-500 truncate max-w-[110px]">{userEmail}</span>
                <Badge variant="brand" size="sm" className="text-[9px] px-1 py-0 uppercase">
                  {userTier}
                </Badge>
              </div>
            </div>
            <button
              onClick={() => signOut()}
              title="Sign out"
              aria-label="Sign out"
              className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg hover:bg-rose-50 transition-colors"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
};
