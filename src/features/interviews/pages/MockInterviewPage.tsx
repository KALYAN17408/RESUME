import React from 'react';
import { MessageSquare, Target, CheckSquare, Award } from 'lucide-react';
import { ComingSoonView, type PlannedFeature } from '@/components/ui/ComingSoonView';

const plannedFeatures: PlannedFeature[] = [
  {
    icon: Target,
    title: 'Role-Specific Practice',
    description: 'Realistic behavioral, situational, and technical questions generated specifically for your target domain.',
  },
  {
    icon: CheckSquare,
    title: 'STAR Method Feedback',
    description: 'Objective, constructive coaching evaluating your answers on Situation, Task, Action, and Result completeness.',
  },
  {
    icon: Award,
    title: 'Confidence & Score Tracking',
    description: 'Monitor your communication clarity, response relevance, and overall interview readiness across sessions.',
  },
];

export const MockInterviewPage: React.FC = () => {
  return (
    <ComingSoonView
      title="Mock Interviews"
      badgeLabel="Coming Soon"
      message="Prepare for your next interview with AI-powered practice sessions. We're building realistic interview experiences with personalized feedback to help you improve your confidence."
      accent="teal"
      icon={MessageSquare}
      plannedFeatures={plannedFeatures}
    />
  );
};
