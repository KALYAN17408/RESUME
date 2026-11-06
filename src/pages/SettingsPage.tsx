import React, { useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useUIStore } from '@/stores/uiStore';
import { AuthService } from '@/features/auth/services/authService';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { User, Mail, Shield, KeyRound, ExternalLink, Lock, AlertCircle } from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { user, profile, signOut } = useAuthStore();
  const { addToast } = useUIStore();

  const userEmail = user?.email || 'user@example.com';
  const userName = profile?.full_name || user?.user_metadata?.full_name || userEmail.split('@')[0];
  const userTier = profile?.tier || 'free';

  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [isSendingEmail, setIsSendingEmail] = useState(false);

  const handleOpenPasswordModal = () => {
    setNewPassword('');
    setConfirmPassword('');
    setPasswordError(null);
    setIsPasswordModalOpen(true);
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);

    if (!newPassword || newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters long');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('Passwords do not match');
      return;
    }

    setIsUpdatingPassword(true);
    try {
      await AuthService.updatePassword(newPassword);
      addToast({
        type: 'success',
        title: 'Password Updated',
        message: 'Your password has been successfully updated.',
      });
      setIsPasswordModalOpen(false);
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to update password.';
      setPasswordError(msg);
      addToast({
        type: 'error',
        title: 'Update Failed',
        message: msg,
      });
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const handleSendResetEmail = async () => {
    if (!user?.email) {
      addToast({
        type: 'error',
        title: 'Error',
        message: 'No email found for active session.',
      });
      return;
    }

    setIsSendingEmail(true);
    try {
      await AuthService.resetPasswordForEmail(user.email);
      addToast({
        type: 'success',
        title: 'Recovery Email Sent',
        message: `Password reset instructions sent to ${user.email}.`,
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Could not send recovery email.';
      addToast({
        type: 'error',
        title: 'Error',
        message: msg,
      });
    } finally {
      setIsSendingEmail(false);
    }
  };

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
          <CardDescription>Manage credentials, authentication, and session access.</CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <p className="text-xs font-semibold text-slate-900">Password Recovery & Updates</p>
            <p className="text-xs text-slate-500">
              Need to change your credentials? Update your password directly or request a recovery email to {userEmail}.
            </p>
          </div>
          <div className="flex items-center gap-2.5 flex-wrap">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSendResetEmail}
              isLoading={isSendingEmail}
              leftIcon={<Mail className="w-4 h-4" />}
            >
              Send Reset Email
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={handleOpenPasswordModal}
              leftIcon={<KeyRound className="w-4 h-4" />}
            >
              Reset Password
            </Button>
          </div>
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

      {/* Password Update Modal */}
      <Modal
        isOpen={isPasswordModalOpen}
        onClose={() => setIsPasswordModalOpen(false)}
        title="Reset Password"
        description="Choose a new secure password with at least 8 characters."
      >
        <form onSubmit={handleUpdatePassword} className="space-y-4 pt-2">
          {passwordError && (
            <div className="flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-3 text-left">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
              <p className="text-xs text-rose-700 leading-relaxed">{passwordError}</p>
            </div>
          )}

          <Input
            label="New Password"
            type="password"
            placeholder="At least 8 characters"
            leftIcon={<Lock className="w-4 h-4" />}
            value={newPassword}
            onChange={(e) => setNewPassword(e.target.value)}
            required
            autoComplete="new-password"
          />

          <Input
            label="Confirm New Password"
            type="password"
            placeholder="Re-enter new password"
            leftIcon={<Lock className="w-4 h-4" />}
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            autoComplete="new-password"
          />

          <div className="pt-2 flex items-center justify-between gap-3">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setIsPasswordModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isUpdatingPassword}
              rightIcon={<KeyRound className="w-4 h-4" />}
            >
              Update Password
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
