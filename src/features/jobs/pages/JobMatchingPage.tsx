import React from 'react';
import { Briefcase, Target, SearchCheck, BookmarkCheck } from 'lucide-react';
import { ComingSoonView, type PlannedFeature } from '@/components/ui/ComingSoonView';

const plannedFeatures: PlannedFeature[] = [
  {
    icon: Target,
    title: 'Intelligent Match Scoring',
    description: 'Evaluate how well your resume matches job descriptions with a clear alignment percentage and keyword breakdown.',
  },
  {
    icon: SearchCheck,
    title: 'Skills Gap Detection',
    description: 'Identify missing keywords, required credentials, and prioritized skills to strengthen before applying.',
  },
  {
    icon: BookmarkCheck,
    title: 'Application Tracker',
    description: 'Organize and monitor your job pipeline seamlessly across Interested, Applied, Interviewing, and Offer stages.',
  },
];

export const JobMatchingPage: React.FC = () => {
  return (
    <ComingSoonView
      title="Job Matching"
      badgeLabel="Coming Soon"
      message="Find opportunities that match your skills and career goals. We're working on intelligent job matching to help you discover relevant opportunities and track your applications."
      accent="blue"
      icon={Briefcase}
      plannedFeatures={plannedFeatures}
    />
  );
};
