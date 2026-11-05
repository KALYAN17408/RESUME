import React from 'react';
import { Bot, Compass, Sparkles, TrendingUp } from 'lucide-react';
import { ComingSoonView, type PlannedFeature } from '@/components/ui/ComingSoonView';

const plannedFeatures: PlannedFeature[] = [
  {
    icon: Compass,
    title: 'Grounded Career Guidance',
    description: 'Receive strategic career guidance, trajectory planning, and skill roadmaps grounded in your active resume.',
  },
  {
    icon: Sparkles,
    title: 'Resume Quantification',
    description: 'Get high-impact bullet suggestions and metric-driven achievements tailored to your specific field.',
  },
  {
    icon: TrendingUp,
    title: 'Interview & Offer Strategy',
    description: 'Preparation coaching, targeted questions, and salary negotiation frameworks suited to your experience level.',
  },
];

export const CareerCopilotPage: React.FC = () => {
  return (
    <ComingSoonView
      title="AI Career Copilot"
      badgeLabel="Coming Soon"
      message="Your personal AI career assistant is on its way. Get career guidance, resume improvement suggestions, interview preparation support, and personalized recommendations."
      accent="violet"
      icon={Bot}
      plannedFeatures={plannedFeatures}
    />
  );
};
