import type {
  ResumeData,
  PersonalInfo,
  ExperienceItem,
  EducationItem,
  SkillCategory,
  TemplateId,
} from '../types/resume.types';
import { createEmptyResume } from '../utils/resumeDefaults';
import { extractTextFromPdf } from '@/features/analyzer/services/textExtractor';

/**
 * Common technical skills dictionary for grouping into standard categories
 */
const KNOWN_SKILLS_MAP: Record<string, string> = {
  // Languages
  javascript: 'Languages',
  typescript: 'Languages',
  python: 'Languages',
  java: 'Languages',
  c: 'Languages',
  'c++': 'Languages',
  'c#': 'Languages',
  golang: 'Languages',
  go: 'Languages',
  rust: 'Languages',
  ruby: 'Languages',
  php: 'Languages',
  swift: 'Languages',
  kotlin: 'Languages',
  sql: 'Languages',
  html: 'Languages',
  css: 'Languages',

  // Frameworks & Libraries
  react: 'Frameworks & Libraries',
  'react.js': 'Frameworks & Libraries',
  'next.js': 'Frameworks & Libraries',
  nextjs: 'Frameworks & Libraries',
  vue: 'Frameworks & Libraries',
  'vue.js': 'Frameworks & Libraries',
  angular: 'Frameworks & Libraries',
  node: 'Frameworks & Libraries',
  'node.js': 'Frameworks & Libraries',
  nodejs: 'Frameworks & Libraries',
  express: 'Frameworks & Libraries',
  'express.js': 'Frameworks & Libraries',
  nestjs: 'Frameworks & Libraries',
  django: 'Frameworks & Libraries',
  fastapi: 'Frameworks & Libraries',
  flask: 'Frameworks & Libraries',
  'spring boot': 'Frameworks & Libraries',
  tailwind: 'Frameworks & Libraries',
  tailwindcss: 'Frameworks & Libraries',
  redux: 'Frameworks & Libraries',
  graphql: 'Frameworks & Libraries',

  // Databases & Cloud
  postgresql: 'Databases & Cloud',
  postgres: 'Databases & Cloud',
  mysql: 'Databases & Cloud',
  mongodb: 'Databases & Cloud',
  redis: 'Databases & Cloud',
  sqlite: 'Databases & Cloud',
  dynamodb: 'Databases & Cloud',
  supabase: 'Databases & Cloud',
  firebase: 'Databases & Cloud',
  aws: 'Databases & Cloud',
  gcp: 'Databases & Cloud',
  azure: 'Databases & Cloud',

  // Tools & DevOps
  docker: 'Tools & DevOps',
  kubernetes: 'Tools & DevOps',
  git: 'Tools & DevOps',
  github: 'Tools & DevOps',
  gitlab: 'Tools & DevOps',
  'ci/cd': 'Tools & DevOps',
  'github actions': 'Tools & DevOps',
  linux: 'Tools & DevOps',
  nginx: 'Tools & DevOps',
  terraform: 'Tools & DevOps',
  webpack: 'Tools & DevOps',
  vite: 'Tools & DevOps',
  jest: 'Tools & DevOps',
  vitest: 'Tools & DevOps',
  cypress: 'Tools & DevOps',
};

/**
 * Extracts email address from text
 */
function extractEmail(text: string): string {
  const match = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/i);
  return match ? match[0] : '';
}

/**
 * Extracts phone number from text
 */
function extractPhone(text: string): string {
  const match = text.match(
    /(?:(?:\+?1\s*(?:[.-]\s*)?)?(?:\(\s*([0-9]{3})\s*\)|([0-9]{3}))\s*(?:[.-]\s*)?([0-9]{3})\s*(?:[.-]\s*)?([0-9]{4}))/
  );
  return match ? match[0] : '';
}

/**
 * Extracts URLs (LinkedIn, GitHub, Portfolio)
 */
function extractLinks(text: string): {
  linkedinUrl: string;
  githubUrl: string;
  portfolioUrl: string;
} {
  let linkedinUrl = '';
  let githubUrl = '';
  let portfolioUrl = '';

  const linkedinMatch = text.match(/(?:https?:\/\/)?(?:www\.)?linkedin\.com\/in\/[a-zA-Z0-9_.-]+/i);
  if (linkedinMatch) linkedinUrl = linkedinMatch[0].startsWith('http') ? linkedinMatch[0] : `https://${linkedinMatch[0]}`;

  const githubMatch = text.match(/(?:https?:\/\/)?(?:www\.)?github\.com\/[a-zA-Z0-9_.-]+/i);
  if (githubMatch) githubUrl = githubMatch[0].startsWith('http') ? githubMatch[0] : `https://${githubMatch[0]}`;

  const genericUrlMatch = text.match(/(?:https?:\/\/)(?:www\.)?[a-zA-Z0-9_.-]+\.[a-zA-Z]{2,}(?:\/[^\s]*)?/i);
  if (genericUrlMatch && !genericUrlMatch[0].includes('linkedin') && !genericUrlMatch[0].includes('github')) {
    portfolioUrl = genericUrlMatch[0];
  }

  return { linkedinUrl, githubUrl, portfolioUrl };
}

/**
 * Extracts full candidate name from header
 */
function extractCandidateName(lines: string[]): string {
  for (const line of lines.slice(0, 5)) {
    const trimmed = line.trim();
    // Filter out common metadata lines
    if (!trimmed) continue;
    if (trimmed.includes('@')) continue;
    if (trimmed.toLowerCase().includes('http') || trimmed.toLowerCase().includes('linkedin')) continue;
    if (/\d{3}[-.)]/.test(trimmed)) continue;
    if (trimmed.toLowerCase().includes('resume') || trimmed.toLowerCase().includes('curriculum')) continue;

    // Check if line looks like a valid name (2-4 words, alphabet letters)
    const words = trimmed.split(/\s+/);
    if (words.length >= 2 && words.length <= 4 && /^[a-zA-Z\s.'-]+$/.test(trimmed)) {
      return trimmed;
    }
  }
  return 'Imported Candidate';
}

/**
 * Splits document text into named sections based on common headings
 */
function splitIntoSections(rawText: string): Record<string, string[]> {
  const sections: Record<string, string[]> = {
    header: [],
    summary: [],
    experience: [],
    education: [],
    skills: [],
    projects: [],
    other: [],
  };

  const lines = rawText.split(/\r?\n/).map((l) => l.trim());
  let currentSection = 'header';

  const headingPatterns: Array<{ key: string; regex: RegExp }> = [
    { key: 'summary', regex: /^(professional\s+)?(summary|profile|about(\s+me)?|objective)[\s:]*$/i },
    { key: 'experience', regex: /^(work\s+|professional\s+|employment\s+)?(experience|history|employment)[\s:]*$/i },
    { key: 'education', regex: /^(education|academic(\s+background)?|degrees)[\s:]*$/i },
    { key: 'skills', regex: /^(technical\s+|core\s+)?(skills|technologies|competencies)[\s:]*$/i },
    { key: 'projects', regex: /^(key\s+|personal\s+|academic\s+)?(projects)[\s:]*$/i },
  ];

  for (const line of lines) {
    if (!line) continue;

    // Check if this line is a section header
    let matchedKey: string | null = null;
    for (const hp of headingPatterns) {
      if (hp.regex.test(line)) {
        matchedKey = hp.key;
        break;
      }
    }

    if (matchedKey) {
      currentSection = matchedKey;
    } else {
      sections[currentSection].push(line);
    }
  }

  return sections;
}

/**
 * Parses skill lines into grouped SkillCategory items
 */
function parseSkillCategories(lines: string[]): SkillCategory[] {
  const categoriesMap: Record<string, string[]> = {
    Languages: [],
    'Frameworks & Libraries': [],
    'Databases & Cloud': [],
    'Tools & DevOps': [],
  };

  const rawTokens: string[] = [];
  for (const line of lines) {
    // Check if line has a category prefix, e.g. "Languages: Python, Go, C++"
    const colonSplit = line.split(':');
    const content = colonSplit.length > 1 ? colonSplit.slice(1).join(':') : line;

    // Split on commas, bullets, slashes
    const parts = content.split(/[,•|/·]/).map((p) => p.trim()).filter((p) => p.length >= 2 && p.length < 35);
    rawTokens.push(...parts);
  }

  // Deduplicate tokens
  const uniqueSkills = Array.from(new Set(rawTokens));

  for (const skill of uniqueSkills) {
    const lower = skill.toLowerCase();
    const category = KNOWN_SKILLS_MAP[lower];
    if (category && categoriesMap[category]) {
      if (!categoriesMap[category].includes(skill)) {
        categoriesMap[category].push(skill);
      }
    } else {
      // Default to Languages or Frameworks
      if (!categoriesMap['Languages'].includes(skill)) {
        categoriesMap['Languages'].push(skill);
      }
    }
  }

  const result: SkillCategory[] = [];
  for (const [name, skills] of Object.entries(categoriesMap)) {
    if (skills.length > 0) {
      result.push({
        id: crypto.randomUUID(),
        name,
        skills,
      });
    }
  }

  if (result.length === 0 && uniqueSkills.length > 0) {
    result.push({
      id: crypto.randomUUID(),
      name: 'Technical Skills',
      skills: uniqueSkills.slice(0, 15),
    });
  }

  return result;
}

/**
 * Parses experience lines into structured ExperienceItem array
 */
function parseExperiences(lines: string[]): ExperienceItem[] {
  const experiences: ExperienceItem[] = [];
  let currentExp: Partial<ExperienceItem> | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    if (!line) continue;

    const isBullet = line.startsWith('•') || line.startsWith('-') || line.startsWith('*');

    // Date range detector e.g., "Jan 2021 - Present" or "2019 - 2023"
    const hasDateRange = /(?:19|20)\d{2}\s*[-–—to]+\s*(?:present|(?:19|20)\d{2})/i.test(line);

    if (hasDateRange || (!isBullet && !currentExp)) {
      // Start a new experience block
      if (currentExp && currentExp.jobTitle) {
        experiences.push({
          id: crypto.randomUUID(),
          jobTitle: currentExp.jobTitle || 'Software Professional',
          company: currentExp.company || 'Company',
          location: currentExp.location || '',
          startDate: currentExp.startDate || '2021',
          endDate: currentExp.endDate || 'Present',
          current: currentExp.current ?? true,
          highlights: currentExp.highlights && currentExp.highlights.length > 0
            ? currentExp.highlights
            : ['Led development of core features and improved team workflows.'],
        });
      }

      currentExp = {
        highlights: [],
        current: /present/i.test(line),
      };

      // Try extracting title and company from line
      const atSplit = line.split(/\s+at\s+|\s+@\s+|\s*\|\s*|\s*,\s*/i);
      if (atSplit.length >= 2) {
        currentExp.jobTitle = atSplit[0].trim();
        currentExp.company = atSplit[1].replace(/(?:19|20)\d{2}.*/i, '').trim();
      } else {
        currentExp.jobTitle = line.replace(/(?:19|20)\d{2}.*/i, '').trim() || 'Software Engineer';
        currentExp.company = 'Company';
      }

      // Extract date match
      const dateMatch = line.match(/((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+)?(19\d{2}|20\d{2})\s*[-–—to]+\s*(Present|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+)?(19\d{2}|20\d{2})?/i);
      if (dateMatch) {
        currentExp.startDate = dateMatch[2] || '2021';
        currentExp.endDate = /present/i.test(dateMatch[0]) ? 'Present' : dateMatch[4] || '2023';
      }
    } else if (isBullet && currentExp) {
      const bulletText = line.replace(/^[•\-*]\s*/, '').trim();
      if (bulletText.length > 5) {
        currentExp.highlights = currentExp.highlights || [];
        currentExp.highlights.push(bulletText);
      }
    } else if (currentExp && !isBullet && line.length > 15) {
      // Could be an un-bulleted highlight line
      currentExp.highlights = currentExp.highlights || [];
      currentExp.highlights.push(line);
    }
  }

  // Push the last open experience
  if (currentExp && (currentExp.jobTitle || currentExp.highlights?.length)) {
    experiences.push({
      id: crypto.randomUUID(),
      jobTitle: currentExp.jobTitle || 'Software Engineer',
      company: currentExp.company || 'Company',
      location: currentExp.location || '',
      startDate: currentExp.startDate || '2021',
      endDate: currentExp.endDate || 'Present',
      current: currentExp.current ?? true,
      highlights: currentExp.highlights && currentExp.highlights.length > 0
        ? currentExp.highlights
        : ['Designed, tested, and shipped key software features.'],
    });
  }

  return experiences;
}

/**
 * Helper to safely read file content as string across all environments (browser, jsdom, node)
 */
async function readFileText(file: File): Promise<string> {
  if (typeof file.text === 'function') {
    try {
      return await file.text();
    } catch {
      // fallback
    }
  }
  if (typeof FileReader !== 'undefined') {
    return new Promise<string>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(String(reader.result || ''));
      reader.onerror = () => reject(reader.error || new Error('Failed to read file'));
      reader.readAsText(file);
    });
  }
  if (typeof (file as any).arrayBuffer === 'function') {
    try {
      const buffer = await (file as any).arrayBuffer();
      return new TextDecoder().decode(buffer);
    } catch {
      // fallback
    }
  }
  return '';
}

/**
 * Helper to safely read file content as ArrayBuffer across all environments
 */
async function readFileArrayBuffer(file: File): Promise<ArrayBuffer> {
  if (typeof (file as any).arrayBuffer === 'function') {
    try {
      return await (file as any).arrayBuffer();
    } catch {
      // fallback
    }
  }
  if (typeof FileReader !== 'undefined') {
    return new Promise<ArrayBuffer>((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => resolve(reader.result as ArrayBuffer);
      reader.onerror = () => reject(reader.error || new Error('Failed to read arrayBuffer'));
      reader.readAsArrayBuffer(file);
    });
  }
  return new ArrayBuffer(0);
}

/**
 * Parses education lines into structured EducationItem array
 */
function parseEducations(lines: string[]): EducationItem[] {
  const educations: EducationItem[] = [];

  for (const line of lines) {
    if (!line) continue;

    // Check for degree keywords
    const isDegree = /(bachelor|master|ph\.?d|b\.?s|b\.?a|m\.?s|m\.?tech|b\.?tech|degree|diploma)/i.test(line);
    const isInstitution = /(university|college|institute|school|academy)/i.test(line);

    if (isDegree || isInstitution) {
      // Year match
      const yearMatch = line.match(/(19\d{2}|20\d{2})/g);
      const startYear = yearMatch?.[0] || '2017';
      const endYear = yearMatch?.[1] || (yearMatch?.[0] ? String(Number(yearMatch[0]) + 4) : '2021');

      // Strip date parts to avoid splitting on date separators
      const cleanLine = line
        .replace(/\(?\s*(?:19\d{2}|20\d{2})\s*[-–—to]+\s*(?:Present|19\d{2}|20\d{2})?\s*\)?/gi, '')
        .replace(/\((?:19\d{2}|20\d{2})\)/g, '')
        .trim();

      // Split primarily by dash, pipe, en-dash, em-dash, or ' at '
      let parts = cleanLine.split(/\s*[-–—|]\s+|\s+at\s+/i).map((p) => p.trim()).filter(Boolean);
      if (parts.length < 2) {
        // Fallback to comma if no dash/pipe found
        parts = cleanLine.split(/,\s*/).map((p) => p.trim()).filter(Boolean);
      }

      let degree = 'Bachelor of Science';
      let institution = 'University';

      if (parts.length >= 2) {
        if (isDegree && !/(university|college|institute|school|academy)/i.test(parts[0])) {
          degree = parts[0];
          institution = parts.slice(1).join(', ');
        } else if (/(university|college|institute|school|academy)/i.test(parts[0])) {
          institution = parts[0];
          degree = parts.slice(1).join(', ');
        } else {
          degree = parts[0];
          institution = parts.slice(1).join(', ');
        }
      } else if (parts.length === 1) {
        if (isInstitution) {
          institution = parts[0];
        } else {
          degree = parts[0];
        }
      }

      educations.push({
        id: crypto.randomUUID(),
        degree,
        institution,
        location: '',
        startDate: startYear,
        endDate: endYear,
        current: false,
      });
    }
  }

  return educations;
}

/**
 * Main Text-to-Resume Parser
 */
export function parseResumeFromText(
  rawText: string,
  userId = 'demo_user',
  templateId: TemplateId = 'jakes-technical',
  title = 'Imported Resume'
): ResumeData {
  const sections = splitIntoSections(rawText);
  const allLines = rawText.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);

  // Extract candidate profile information
  const fullName = extractCandidateName(allLines);
  const email = extractEmail(rawText);
  const phone = extractPhone(rawText);
  const { linkedinUrl, githubUrl, portfolioUrl } = extractLinks(rawText);

  // Summary
  const summaryText = sections.summary.join(' ').trim();

  // Skills
  const skillCategories = parseSkillCategories(sections.skills);

  // Experience
  const experiences = parseExperiences(sections.experience);

  // Education
  const educations = parseEducations(sections.education);

  // Construct empty base resume
  const base = createEmptyResume(userId, title, templateId);

  const personalInfo: PersonalInfo = {
    fullName: fullName || base.personalInfo.fullName,
    professionalTitle: experiences[0]?.jobTitle || 'Software Engineer',
    email,
    phone,
    location: '',
    linkedinUrl,
    githubUrl,
    portfolioUrl,
    summary: summaryText,
  };

  return {
    ...base,
    title,
    targetRole: experiences[0]?.jobTitle || '',
    personalInfo,
    experiences: experiences.length > 0 ? experiences : base.experiences,
    educations: educations.length > 0 ? educations : base.educations,
    skillCategories: skillCategories.length > 0 ? skillCategories : base.skillCategories,
  };
}

/**
 * Imports a resume from an uploaded File object (PDF, JSON, or TXT)
 */
export async function parseResumeFromFile(
  file: File,
  userId = 'demo_user',
  templateId: TemplateId = 'jakes-technical',
  customTitle?: string
): Promise<ResumeData> {
  const fileNameWithoutExt = file.name.replace(/\.[^/.]+$/, '');
  const resumeTitle = customTitle?.trim() || `Imported - ${fileNameWithoutExt}`;

  // Case 1: JSON File
  if (file.type === 'application/json' || file.name.endsWith('.json')) {
    const text = await readFileText(file);
    const json = JSON.parse(text);

    // If it's already a ResuMax AI format
    if (json.personalInfo && json.sectionsOrder) {
      return {
        ...json,
        id: crypto.randomUUID(),
        userId,
        title: resumeTitle,
        templateId: templateId || json.templateId || 'jakes-technical',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
    }

    // JSON Resume standard mapping (basics, work, education, skills)
    if (json.basics) {
      const base = createEmptyResume(userId, resumeTitle, templateId);
      base.personalInfo = {
        fullName: json.basics.name || '',
        professionalTitle: json.basics.label || '',
        email: json.basics.email || '',
        phone: json.basics.phone || '',
        location: json.basics.location?.city || '',
        linkedinUrl: json.basics.profiles?.find((p: any) => p.network?.toLowerCase() === 'linkedin')?.url || '',
        githubUrl: json.basics.profiles?.find((p: any) => p.network?.toLowerCase() === 'github')?.url || '',
        portfolioUrl: json.basics.url || '',
        summary: json.basics.summary || '',
      };
      if (Array.isArray(json.work)) {
        base.experiences = json.work.map((w: any) => ({
          id: crypto.randomUUID(),
          jobTitle: w.position || 'Engineer',
          company: w.name || 'Company',
          location: w.location || '',
          startDate: w.startDate || '2021',
          endDate: w.endDate || 'Present',
          current: !w.endDate,
          highlights: w.highlights || [w.summary].filter(Boolean),
        }));
      }
      if (Array.isArray(json.education)) {
        base.educations = json.education.map((e: any) => ({
          id: crypto.randomUUID(),
          degree: `${e.studyType || ''} ${e.area || ''}`.trim() || 'Degree',
          institution: e.institution || 'University',
          location: '',
          startDate: e.startDate || '2017',
          endDate: e.endDate || '2021',
          current: false,
          gpa: e.score || '',
        }));
      }
      if (Array.isArray(json.skills)) {
        base.skillCategories = [
          {
            id: crypto.randomUUID(),
            name: 'Technical Skills',
            skills: json.skills.flatMap((s: any) => s.keywords || [s.name]),
          },
        ];
      }
      return base;
    }

    // Fallback: convert JSON to text and parse
    return parseResumeFromText(JSON.stringify(json, null, 2), userId, templateId, resumeTitle);
  }

  // Case 2: PDF File
  if (file.type === 'application/pdf' || file.name.endsWith('.pdf')) {
    const arrayBuffer = await readFileArrayBuffer(file);
    const pdfResult = await extractTextFromPdf(arrayBuffer);

    if (pdfResult.isScannedPdf || !pdfResult.text.trim()) {
      throw new Error(
        'The uploaded PDF appears to be an image or scanned document without selectable text. Please upload a vector/text PDF or text file.'
      );
    }

    return parseResumeFromText(pdfResult.text, userId, templateId, resumeTitle);
  }

  // Case 3: Plain text / Markdown
  const rawText = await readFileText(file);
  return parseResumeFromText(rawText, userId, templateId, resumeTitle);
}
