import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link } from 'react-router-dom';
import { AuthService } from '../services/authService';
import { useUIStore } from '@/stores/uiStore';
import { Input } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Mail, AlertCircle, CheckCircle2, ArrowRight } from 'lucide-react';
import { ConfigMissingBanner } from './ConfigMissingBanner';

export const forgotPasswordSchema = z.object({
  email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
});

export type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>;

export const ForgotPasswordForm: React.FC = () => {
  const { addToast } = useUIStore();
  const [authError, setAuthError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sentSuccess, setSentSuccess] = useState(false);
  const [targetEmail, setTargetEmail] = useState('');

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: '',
    },
  });

  const onSubmit = async (data: ForgotPasswordFormData) => {
    setAuthError(null);
    setIsSubmitting(true);

    try {
      await AuthService.resetPasswordForEmail(data.email);
      setSentSuccess(true);
      setTargetEmail(data.email);
      addToast({
        type: 'success',
        title: 'Reset Link Sent',
        message: 'Check your email for the password recovery link.',
      });
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : 'Could not send recovery email.';
      setAuthError(message);
      addToast({
        type: 'error',
        title: 'Error',
        message,
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  if (sentSuccess) {
    return (
      <div className="space-y-6 text-center py-4">
        <div className="mx-auto w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-600 flex items-center justify-center">
          <CheckCircle2 className="w-6 h-6" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-bold text-slate-900">Recovery email sent</h3>
          <p className="text-xs text-slate-600 leading-relaxed max-w-sm mx-auto">
            We sent instructions to reset your password to{' '}
            <span className="font-semibold text-slate-900">{targetEmail}</span>. The link will expire shortly.
          </p>
        </div>
        <div className="pt-2">
          <Link to="/login">
            <Button variant="outline" className="w-full">
              Back to Sign In
            </Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <ConfigMissingBanner />

      {authError && (
        <div className="flex items-start gap-2.5 rounded-xl border border-rose-200 bg-rose-50 p-3 text-left">
          <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
          <p className="text-xs text-rose-700 leading-relaxed">{authError}</p>
        </div>
      )}

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
        <Input
          label="Email address"
          type="email"
          placeholder="you@company.com"
          leftIcon={<Mail className="w-4 h-4" />}
          error={errors.email?.message}
          {...register('email')}
        />

        <Button
          type="submit"
          variant="primary"
          className="w-full py-3"
          isLoading={isSubmitting}
          rightIcon={<ArrowRight className="w-4 h-4" />}
        >
          Send Reset Instructions
        </Button>
      </form>

      <p className="text-center text-xs text-slate-500">
        Remember your password?{' '}
        <Link to="/login" className="font-semibold text-black hover:underline">
          Back to Sign In
        </Link>
      </p>
    </div>
  );
};
