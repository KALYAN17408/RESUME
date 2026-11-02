export type TemplateId =
  | 'jakes-technical'
  | 'harvard-classic'
  | 'stanford-editorial'
  | 'modern-tech-clean';

export type SectionType =
  | 'personal'
  | 'summary'
  | 'experience'
  | 'education'
  | 'skills'
  | 'projects'
  | 'certifications'
  | 'achievements'
  | 'languages'
  | 'publications'
  | 'volunteer'
  | 'interests';

export type SaveStatus = 'idle' | 'saving' | 'saved' | 'error' | 'offline';

export interface PersonalInfo {
  fullName: string;
  professionalTitle: string;
  email: string;
  phone: string;
  location: string;
  linkedinUrl: string;
  githubUrl: string;
  portfolioUrl: string;
  summary: string;
}

export interface ExperienceItem {
  id: string;
  jobTitle: string;
  company: string;
  location: string;
  startDate: string;
  endDate: string;
  current: boolean;
  highlights: string[];
  employmentType?: string; // Full-time, Contract, Internship, etc.
}

export interface EducationItem {
  id: string;
  degree: string;
  institution: string;
  location: string;
  startDate: string;
  endDate: string;
  current?: boolean;
  gpa?: string;
  honors?: string;
  description?: string;
}

export interface SkillCategory {
  id: string;
  name: string; // e.g. "Languages", "Frameworks & Libraries", "Databases & Cloud"
  skills: string[]; // e.g. ["TypeScript", "React", "Python"]
}

export interface ProjectItem {
  id: string;
  name: string;
  description: string;
  technologies: string[];
  url?: string;
  githubUrl?: string;
  startDate?: string;
  endDate?: string;
}

export interface CertificationItem {
  id: string;
  name: string;
  issuer: string;
  issueDate: string;
  expiryDate?: string;
  credentialUrl?: string;
}

export interface AchievementItem {
  id: string;
  title: string;
  issuer?: string;
  date?: string;
  description?: string;
}

export interface LanguageItem {
  id: string;
  language: string;
  proficiency: 'Native' | 'Fluent' | 'Professional' | 'Conversational' | 'Elementary' | string;
}

export interface PublicationItem {
  id: string;
  title: string;
  publisher?: string;
  date?: string;
  url?: string;
  description?: string;
}

export interface VolunteerItem {
  id: string;
  role: string;
  organization: string;
  startDate?: string;
  endDate?: string;
  current?: boolean;
  description?: string;
}

export interface InterestItem {
  id: string;
  name: string;
}

export interface ResumeCustomization {
  accentColor: string;
  fontFamily: 'Inter' | 'Merriweather' | 'Roboto' | 'Playfair Display' | string;
  fontSize: 'small' | 'medium' | 'large';
  lineSpacing: 'compact' | 'normal' | 'relaxed';
  margins: 'compact' | 'normal' | 'relaxed';
}

export interface ResumeData {
  id: string;
  userId: string;
  title: string;
  targetRole?: string;
  templateId: TemplateId;
  createdAt: string;
  updatedAt: string;
  customization: ResumeCustomization;
  personalInfo: PersonalInfo;
  sectionsOrder: SectionType[];
  enabledSections: Record<SectionType, boolean>;
  experiences: ExperienceItem[];
  educations: EducationItem[];
  skillCategories: SkillCategory[];
  projects: ProjectItem[];
  certifications: CertificationItem[];
  achievements: AchievementItem[];
  languages: LanguageItem[];
  publications: PublicationItem[];
  volunteer: VolunteerItem[];
  interests: InterestItem[];
  atsScore?: number;
}

export interface ResumeListItem {
  id: string;
  userId: string;
  title: string;
  targetRole?: string;
  templateId: TemplateId;
  updatedAt: string;
  createdAt: string;
  atsScore?: number;
}
