import React from 'react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { ArrowRight, CheckCircle2 } from 'lucide-react';

export interface ModuleCardProps {
  id: string;
  title: string;
  moduleTag: string;
  phaseBadge: string;
  description: string;
  features: string[];
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  badgeVariant?: 'default' | 'brand' | 'violet' | 'teal' | 'amber' | 'success';
  onExplore?: () => void;
}

export const ModuleCard: React.FC<ModuleCardProps> = ({
  title,
  moduleTag,
  phaseBadge,
  description,
  features,
  icon: Icon,
  color,
  badgeVariant = 'brand',
  onExplore,
}) => {
  return (
    <Card className="flex flex-col justify-between hover:border-slate-300 transition-all hover:shadow-elevated">
      <div>
        <CardHeader>
          <div className="flex items-center justify-between gap-2">
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border ${color}`}>
              <Icon className="w-5 h-5" />
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" size="sm" className="text-[10px] uppercase font-mono">
                {moduleTag}
              </Badge>
              <Badge variant={badgeVariant} size="sm" className="text-[10px] font-bold">
                {phaseBadge}
              </Badge>
            </div>
          </div>
          <CardTitle className="text-base sm:text-lg pt-2 text-left">{title}</CardTitle>
          <CardDescription className="text-xs text-left leading-relaxed">{description}</CardDescription>
        </CardHeader>

        <CardContent>
          <div className="space-y-2 text-left">
            <p className="text-[11px] font-bold text-slate-700 uppercase tracking-wider">Planned Capabilities:</p>
            <ul className="space-y-1.5 text-xs text-slate-600">
              {features.map((feature, i) => (
                <li key={i} className="flex items-start gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 text-blue-600 shrink-0 mt-0.5" />
                  <span className="leading-tight">{feature}</span>
                </li>
              ))}
            </ul>
          </div>
        </CardContent>
      </div>

      <CardFooter className="justify-between">
        <span className="text-[11px] font-medium text-slate-400">Scheduled for implementation</span>
        <Button variant="ghost" size="sm" onClick={onExplore} rightIcon={<ArrowRight className="w-3.5 h-3.5" />}>
          View Spec
        </Button>
      </CardFooter>
    </Card>
  );
};
