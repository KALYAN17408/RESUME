import type { TemplateId } from '../types/resume.types';

export interface TemplateDefinition {
  id: TemplateId;
  name: string;
  category: 'tech' | 'academic' | 'modern';
  description: string;
  badge: string;
  recommendedRole: string;
  defaultFont: string;
  defaultAccent: string;
}

export const TEMPLATE_REGISTRY: Record<TemplateId, TemplateDefinition> = {
  'jakes-technical': {
    id: 'jakes-technical',
    name: "Jake's Technical",
    category: 'tech',
    description:
      'Minimalist, high-density engineering resume favored by top tech recruiters. Single-column, black-and-white, zero parsing tables.',
    badge: 'Tech Gold Standard',
    recommendedRole: 'Software Engineers, Systems Architects, DevOps, Data Scientists',
    defaultFont: 'Inter',
    defaultAccent: '#0f172a',
  },
  'harvard-classic': {
    id: 'harvard-classic',
    name: 'Harvard Classic',
    category: 'academic',
    description:
      'Timeless serif design with formal centered header, balanced margins, and traditional academic section dividers.',
    badge: 'Executive & Academic',
    recommendedRole: 'Engineering Management, Academia, Financial Tech, Legal/Consulting',
    defaultFont: 'Merriweather',
    defaultAccent: '#1e293b',
  },
  'stanford-editorial': {
    id: 'stanford-editorial',
    name: 'Stanford Editorial',
    category: 'modern',
    description:
      'Refined editorial hierarchy with crisp modern typography, left-aligned layout, and subtle ink accent lines.',
    badge: 'Editorial & Modern',
    recommendedRole: 'Product Managers, Tech Leads, Engineering Directors, Researchers',
    defaultFont: 'Inter',
    defaultAccent: '#4338ca',
  },
  'modern-tech-clean': {
    id: 'modern-tech-clean',
    name: 'Modern Tech Clean',
    category: 'modern',
    description:
      'Contemporary layout featuring crisp sans-serif headings, subtle accent color highlights, and clean skills tags.',
    badge: 'Modern Tech',
    recommendedRole: 'Frontend Engineers, Full-Stack Developers, UI/UX Technologists',
    defaultFont: 'Inter',
    defaultAccent: '#2563eb',
  },
};

export const TEMPLATE_LIST: TemplateDefinition[] = Object.values(TEMPLATE_REGISTRY);
