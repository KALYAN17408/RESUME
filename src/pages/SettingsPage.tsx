import React from 'react';
import { useAuthStore } from '@/stores/authStore';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { User, Mail, Shield, KeyRound, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

export const SettingsPage: React.FC = () => {
  const { user, profile, signOut } = useAuthStore();

  const userEmail = user?.email || 'user@example.com';
  const userName = profile?.full_name || user?.user_metadata?.full_name || userEmail.split('@')[0];
  const userTier = profile?.tier || 'free';

  return (
    <div className="space-y-6 text-left max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-black text-slate-900 tracking-tight">Account & Workspace Settings</h1>
        <p className="text-xs text-slate-500 mt-1">Manage your profile, security, and subscription tier.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="md:col-span-2">
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="w-5 h-5 text-black" />
              <CardTitle>Profile Details</CardTitle>
            </div>
            <CardDescription>Your personal profile associated with your authenticated account.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
              <div className="space-y-1">
                <span className="font-semibold text-slate-500 uppercase tracking-wider text-[10px]">Full Name</span>
                <p className="font-medium text-slate-900 bg-slate-50 p-2.5 rounded-xl border border-slate-100">{userName}</p>
              </div>
              <div className="space-y-1">
                <span className="font-semibold text-slate-500 uppercase tracking-wider text-[10px]">Email Address</span>
                <p className="font-medium text-slate-900 bg-slate-50 p-2.5 rounded-xl border border-slate-100 flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-400" />
                  <span className="truncate">{userEmail}</span>
                </p>
              </div>
            </div>

            <div className="pt-2">
              <span className="font-semibold text-slate-500 uppercase tracking-wider text-[10px]">User Identifier (UUID)</span>
              <p className="font-mono text-[11px] text-slate-600 bg-slate-50 p-2.5 rounded-xl border border-slate-100 break-all select-all mt-1">
                {user?.id || 'Local Development Session'}
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Subscription Plan Card */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Subscription</CardTitle>
              <Badge variant="brand" className="uppercase text-[10px]">
                {userTier}
              </Badge>
            </div>
            <CardDescription>Your current tier and quota limits.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 text-xs">
            <div className="rounded-xl border border-slate-100 bg-slate-50 p-3.5 space-y-2">
              <div className="flex justify-between text-slate-600">
                <span>Resumes:</span>
                <span className="font-semibold text-slate-900">0 / 3</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>ATS Scans:</span>
                <span className="font-semibold text-slate-900">0 / 1 mo</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>Copilot Turns:</span>
                <span className="font-semibold text-slate-900">Preview</span>
              </div>
            </div>

            <Button
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => alert('Subscription billing upgrades will be integrated in Phase 6 with Stripe.')}
              rightIcon={<ExternalLink className="w-3.5 h-3.5" />}
            >
              Upgrade to Pro ($29/mo)
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Security & Password */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-black" />
            <CardTitle>Security & Password</CardTitle>
          </div>
          <CardDescription>Manage credentials and session access.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-900">Password Recovery</p>
            <p className="text-xs text-slate-500">Need to update your password? Request a secure password reset email.</p>
          </div>
          <Link to="/forgot-password">
            <Button variant="outline" size="sm" leftIcon={<KeyRound className="w-4 h-4" />}>
              Reset Password
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* Danger Zone */}
      <Card className="border-rose-200 bg-rose-50/20">
        <CardHeader>
          <CardTitle className="text-rose-700">Session Controls</CardTitle>
          <CardDescription>Sign out of your active session.</CardDescription>
        </CardHeader>
        <CardContent className="flex items-center justify-between">
          <p className="text-xs text-slate-600">Terminate your authenticated browser session on this device.</p>
          <Button variant="danger" size="sm" onClick={() => signOut()}>
            Sign Out
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};
