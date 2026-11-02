import React from 'react';
import type { ResumeData } from '../types/resume.types';
import { JakesTechnicalTemplate } from './JakesTechnicalTemplate';
import { HarvardClassicTemplate } from './HarvardClassicTemplate';
import { StanfordEditorialTemplate } from './StanfordEditorialTemplate';
import { ModernTechCleanTemplate } from './ModernTechCleanTemplate';

interface ResumeRendererProps {
  data: ResumeData;
}

export const ResumeRenderer: React.FC<ResumeRendererProps> = ({ data }) => {
  switch (data.templateId) {
    case 'harvard-classic':
      return <HarvardClassicTemplate data={data} />;
    case 'stanford-editorial':
      return <StanfordEditorialTemplate data={data} />;
    case 'modern-tech-clean':
      return <ModernTechCleanTemplate data={data} />;
    case 'jakes-technical':
    default:
      return <JakesTechnicalTemplate data={data} />;
  }
};
