import { z } from 'zod';

export const personalInfoSchema = z.object({
  fullName: z.string().default(''),
  professionalTitle: z.string().default(''),
  email: z.string().email('Invalid email address').or(z.literal('')).default(''),
  phone: z.string().default(''),
  location: z.string().default(''),
  linkedinUrl: z.string().url('Invalid LinkedIn URL').or(z.literal('')).default(''),
  githubUrl: z.string().url('Invalid GitHub URL').or(z.literal('')).default(''),
  portfolioUrl: z.string().url('Invalid Portfolio URL').or(z.literal('')).default(''),
  summary: z.string().default(''),
});

export const experienceItemSchema = z.object({
  id: z.string(),
  jobTitle: z.string().default(''),
  company: z.string().default(''),
  location: z.string().default(''),
  startDate: z.string().default(''),
  endDate: z.string().default(''),
  current: z.boolean().default(false),
  highlights: z.array(z.string()).default([]),
  employmentType: z.string().optional(),
});

export const educationItemSchema = z.object({
  id: z.string(),
  degree: z.string().default(''),
  institution: z.string().default(''),
  location: z.string().default(''),
  startDate: z.string().default(''),
  endDate: z.string().default(''),
  current: z.boolean().optional().default(false),
  gpa: z.string().optional().default(''),
  honors: z.string().optional().default(''),
  description: z.string().optional().default(''),
});

export const skillCategorySchema = z.object({
  id: z.string(),
  name: z.string().default(''),
  skills: z.array(z.string()).default([]),
});

export const projectItemSchema = z.object({
  id: z.string(),
  name: z.string().default(''),
  description: z.string().default(''),
  technologies: z.array(z.string()).default([]),
  url: z.string().url().or(z.literal('')).optional().default(''),
  githubUrl: z.string().url().or(z.literal('')).optional().default(''),
  startDate: z.string().optional().default(''),
  endDate: z.string().optional().default(''),
});

export const certificationItemSchema = z.object({
  id: z.string(),
  name: z.string().default(''),
  issuer: z.string().default(''),
  issueDate: z.string().default(''),
  expiryDate: z.string().optional().default(''),
  credentialUrl: z.string().url().or(z.literal('')).optional().default(''),
});

export const achievementItemSchema = z.object({
  id: z.string(),
  title: z.string().default(''),
  issuer: z.string().optional().default(''),
  date: z.string().optional().default(''),
  description: z.string().optional().default(''),
});

export const languageItemSchema = z.object({
  id: z.string(),
  language: z.string().default(''),
  proficiency: z.string().default('Fluent'),
});

export const publicationItemSchema = z.object({
  id: z.string(),
  title: z.string().default(''),
  publisher: z.string().optional().default(''),
  date: z.string().optional().default(''),
  url: z.string().url().or(z.literal('')).optional().default(''),
  description: z.string().optional().default(''),
});

export const volunteerItemSchema = z.object({
  id: z.string(),
  role: z.string().default(''),
  organization: z.string().default(''),
  startDate: z.string().optional().default(''),
  endDate: z.string().optional().default(''),
  current: z.boolean().optional().default(false),
  description: z.string().optional().default(''),
});

export const interestItemSchema = z.object({
  id: z.string(),
  name: z.string().default(''),
});

export const resumeCustomizationSchema = z.object({
  accentColor: z.string().default('#0f172a'),
  fontFamily: z.string().default('Inter'),
  fontSize: z.enum(['small', 'medium', 'large']).default('medium'),
  lineSpacing: z.enum(['compact', 'normal', 'relaxed']).default('normal'),
  margins: z.enum(['compact', 'normal', 'relaxed']).default('normal'),
});

export const templateIdSchema = z.enum([
  'jakes-technical',
  'harvard-classic',
  'stanford-editorial',
  'modern-tech-clean',
]);

export const resumeDataSchema = z.object({
  id: z.string().uuid().or(z.string()),
  userId: z.string(),
  title: z.string().min(1, 'Title is required').default('Untitled Resume'),
  targetRole: z.string().optional(),
  templateId: templateIdSchema.default('jakes-technical'),
  createdAt: z.string(),
  updatedAt: z.string(),
  customization: resumeCustomizationSchema,
  personalInfo: personalInfoSchema,
  sectionsOrder: z.array(z.string()),
  enabledSections: z.record(z.boolean()),
  experiences: z.array(experienceItemSchema).default([]),
  educations: z.array(educationItemSchema).default([]),
  skillCategories: z.array(skillCategorySchema).default([]),
  projects: z.array(projectItemSchema).default([]),
  certifications: z.array(certificationItemSchema).default([]),
  achievements: z.array(achievementItemSchema).default([]),
  languages: z.array(languageItemSchema).default([]),
  publications: z.array(publicationItemSchema).default([]),
  volunteer: z.array(volunteerItemSchema).default([]),
  interests: z.array(interestItemSchema).default([]),
  atsScore: z.number().min(0).max(100).optional(),
});
