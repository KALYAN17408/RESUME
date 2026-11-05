import React from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { type LucideIcon, ArrowLeft, Clock, Sparkles } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/utils/cn';

export interface PlannedFeature {
  icon: LucideIcon;
  title: string;
  description: string;
}

export interface ComingSoonViewProps {
  title: string;
  badgeLabel?: string;
  message: string;
  accent: 'blue' | 'violet' | 'teal';
  icon: LucideIcon;
  plannedFeatures: PlannedFeature[];
}

const accentConfig = {
  blue: {
    gradient: 'from-blue-600 via-indigo-600 to-blue-500',
    iconWrapper: 'bg-blue-50 text-blue-600 border-blue-200 shadow-blue-500/10',
    badgeVariant: 'brand' as const,
    featureIconWrapper: 'text-blue-600 bg-blue-50/80 border-blue-100',
  },
  violet: {
    gradient: 'from-violet-600 via-purple-600 to-indigo-500',
    iconWrapper: 'bg-violet-50 text-violet-600 border-violet-200 shadow-violet-500/10',
    badgeVariant: 'violet' as const,
    featureIconWrapper: 'text-violet-600 bg-violet-50/80 border-violet-100',
  },
  teal: {
    gradient: 'from-teal-600 via-emerald-600 to-teal-500',
    iconWrapper: 'bg-teal-50 text-teal-600 border-teal-200 shadow-teal-500/10',
    badgeVariant: 'teal' as const,
    featureIconWrapper: 'text-teal-600 bg-teal-50/80 border-teal-100',
  },
};

export const ComingSoonView: React.FC<ComingSoonViewProps> = ({
  title,
  badgeLabel = 'Coming Soon',
  message,
  accent,
  icon: Icon,
  plannedFeatures,
}) => {
  const navigate = useNavigate();
  const config = accentConfig[accent];

  return (
    <div className="max-w-3xl mx-auto py-6 sm:py-10 px-4 space-y-6">
      {/* Top breadcrumb navigation */}
      <div>
        <Link
          to="/dashboard"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          Back to Dashboard
        </Link>
      </div>

      {/* Main card */}
      <Card className="overflow-hidden border-slate-200/90 shadow-card p-0">
        {/* Accent Top Bar */}
        <div className={cn('h-1.5 w-full bg-gradient-to-r', config.gradient)} />

        <div className="p-6 sm:p-10 md:p-12 text-center">
          {/* Main Feature Icon */}
          <div
            className={cn(
              'w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-5 border shadow-sm',
              config.iconWrapper
            )}
          >
            <Icon className="w-8 h-8" />
          </div>

          {/* Badge */}
          <div className="flex justify-center mb-3">
            <Badge
              variant={config.badgeVariant}
              size="md"
              className="gap-1.5 font-semibold uppercase tracking-wider text-[11px]"
            >
              <Sparkles className="w-3 h-3" />
              {badgeLabel}
            </Badge>
          </div>

          {/* Feature Title */}
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-slate-900 mb-4">
            {title}
          </h1>

          {/* Feature Message / Description */}
          <p className="text-sm sm:text-base text-slate-600 max-w-xl mx-auto leading-relaxed mb-6">
            {message}
          </p>

          {/* Coming Soon Notice Banner */}
          <div className="rounded-xl bg-slate-50 border border-slate-200/80 p-4 max-w-lg mx-auto mb-8 text-center">
            <div className="flex items-center justify-center gap-2 text-xs sm:text-sm text-slate-900 font-bold uppercase tracking-wider">
              <Clock className="w-4 h-4 text-slate-500 shrink-0" />
              <span>COMING SOON</span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              This feature is coming soon. Stay tuned for upcoming updates!
            </p>
          </div>

          {/* Planned Functionality Cards */}
          {plannedFeatures && plannedFeatures.length > 0 && (
            <div className="mb-8">
              <h2 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">
                What to Expect
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5 text-left">
                {plannedFeatures.map((feat, idx) => {
                  const FeatIcon = feat.icon;
                  return (
                    <div
                      key={idx}
                      className="rounded-xl border border-slate-100 bg-slate-50/70 p-4 transition-all hover:bg-slate-50/90"
                    >
                      <div
                        className={cn(
                          'w-7 h-7 rounded-lg border flex items-center justify-center mb-2.5 shadow-2xs',
                          config.featureIconWrapper
                        )}
                      >
                        <FeatIcon className="w-3.5 h-3.5" />
                      </div>
                      <h3 className="text-xs font-bold text-slate-900 mb-1">{feat.title}</h3>
                      <p className="text-[11px] text-slate-600 leading-relaxed">{feat.description}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Action Button */}
          <div className="flex justify-center pt-2">
            <Button
              variant="outline"
              size="md"
              onClick={() => navigate('/dashboard')}
              leftIcon={<ArrowLeft className="w-4 h-4" />}
              className="font-semibold shadow-xs"
            >
              Back to Dashboard
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

