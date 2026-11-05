import type {
  ResumeData,
  PersonalInfo,
  ExperienceItem,
  EducationItem,
  SkillCategory,
  ProjectItem,
  CertificationItem,
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
  // Support international codes (+91 9000469422, +1 (555) 234-5678, etc.) or standard 10-digit
  const match = text.match(
    /(?:\+\d{1,3}[\s-]*)?(?:\(?\d{2,5}\)?[\s-]*)?\d{3,5}[\s-]?\d{4,5}/
  );
  if (!match) return '';
  const digitsOnly = match[0].replace(/\D/g, '');
  if (digitsOnly.length >= 7 && digitsOnly.length <= 15) {
    return match[0].trim();
  }
  return '';
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

  // Find portfolio or personal site (e.g. netlify.app, vercel.app, github.io, .dev, .me, etc.)
  // Tokenize words to cleanly separate email addresses from URLs
  const tokens = text.split(/[\s|—]+/).map((t) => t.trim().replace(/[),;]+$/, ''));
  for (const rawToken of tokens) {
    if (rawToken.includes('@')) continue;
    const cleanToken = rawToken.replace(/^https?:\/\//i, '');
    if (cleanToken.toLowerCase().includes('linkedin.com')) continue;
    if (cleanToken.toLowerCase().includes('github.com')) continue;
    if (
      /\.(?:netlify\.app|vercel\.app|github\.io|dev|app|me|io|org|com|in)(?:\/.*)?$/i.test(cleanToken)
    ) {
      if (!/^(gmail|yahoo|outlook|hotmail|email|mail)\./i.test(cleanToken)) {
        portfolioUrl = rawToken.startsWith('http') ? rawToken : `https://${cleanToken}`;
        break;
      }
    }
  }

  return { linkedinUrl, githubUrl, portfolioUrl };
}

/**
 * Extracts full candidate name from header
 */
function extractCandidateName(lines: string[]): string {
  for (const line of lines.slice(0, 10)) {
    const trimmed = line.trim();
    if (!trimmed) continue;
    if (trimmed.includes('@')) continue;
    if (trimmed.toLowerCase().includes('http') || trimmed.toLowerCase().includes('linkedin') || trimmed.toLowerCase().includes('github')) continue;
    if (/\+?\d{2,4}[-.\s]?\d{3}/.test(trimmed)) continue;
    if (/^(career|objective|summary|resume|curriculum|education|projects|skills|experience|internship)/i.test(trimmed)) continue;

    // Check if line looks like a valid name (2-5 words, alphabet letters)
    const words = trimmed.split(/\s+/);
    if (words.length >= 2 && words.length <= 5 && /^[a-zA-Z\s.'-]+$/.test(trimmed)) {
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
    certifications: [],
    other: [],
  };

  const lines = rawText.split(/\r?\n/).map((l) => l.trim());
  let currentSection = 'header';

  const headingPatterns: Array<{ key: string; regex: RegExp }> = [
    {
      key: 'summary',
      regex: /^(career\s+|professional\s+|executive\s+)?(summary|profile|about(\s+me)?|objective|statement)(\s+of\s+qualifications)?[\s:]*$/i,
    },
    {
      key: 'experience',
      regex: /^(work\s+|professional\s+|employment\s+)?(experience|history|employment|work|internships?)[\s:]*$/i,
    },
    {
      key: 'education',
      regex: /^(education|academic(\s+background|\s+qualifications)?|degrees|academics)[\s:]*$/i,
    },
    {
      key: 'skills',
      regex: /^(technical\s+|core\s+|key\s+)?(skills|technologies|competencies|tech\s+stack)[\s:]*$/i,
    },
    {
      key: 'projects',
      regex: /^(key\s+|personal\s+|academic\s+|technical\s+)?(projects)[\s:]*$/i,
    },
    {
      key: 'certifications',
      regex: /^(certifications|licenses|certificates|accreditations)[\s:]*$/i,
    },
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
  const detectedCategories: SkillCategory[] = [];
  const uncategorizedTokens: string[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    // Check if line has a category prefix, e.g. "Languages: Python, SQL"
    const colonIdx = trimmed.indexOf(':');
    if (colonIdx > 0 && colonIdx < 35) {
      const catName = trimmed.substring(0, colonIdx).trim();
      const content = trimmed.substring(colonIdx + 1).trim();
      const skills = content
        .split(/[,•|·]/)
        .map((s) => s.trim())
        .filter((s) => s.length >= 1 && s.length < 50);

      if (skills.length > 0) {
        detectedCategories.push({
          id: crypto.randomUUID(),
          name: catName,
          skills,
        });
        continue;
      }
    }

    // Otherwise, split tokens
    const parts = trimmed
      .split(/[,•|/·]/)
      .map((p) => p.replace(/^[•\-*]\s*/, '').trim())
      .filter((p) => p.length >= 2 && p.length < 40);
    uncategorizedTokens.push(...parts);
  }

  // If candidate had explicit categories in their resume, return them directly
  if (detectedCategories.length > 0) {
    if (uncategorizedTokens.length > 0) {
      detectedCategories.push({
        id: crypto.randomUUID(),
        name: 'Additional Skills',
        skills: uncategorizedTokens,
      });
    }
    return detectedCategories;
  }

  // Fallback: group uncategorized tokens using KNOWN_SKILLS_MAP
  const categoriesMap: Record<string, string[]> = {
    Languages: [],
    'Frameworks & Libraries': [],
    'Databases & Cloud': [],
    'Tools & DevOps': [],
  };

  const uniqueSkills = Array.from(new Set(uncategorizedTokens));
  for (const skill of uniqueSkills) {
    const lower = skill.toLowerCase();
    const category = KNOWN_SKILLS_MAP[lower];
    if (category && categoriesMap[category]) {
      if (!categoriesMap[category].includes(skill)) {
        categoriesMap[category].push(skill);
      }
    } else {
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

  return result.length > 0
    ? result
    : [
        { id: crypto.randomUUID(), name: 'Languages', skills: [] },
        { id: crypto.randomUUID(), name: 'Frameworks & Tools', skills: [] },
      ];
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
      if (currentExp && (currentExp.jobTitle || currentExp.highlights?.length)) {
        experiences.push(finalizeExperience(currentExp));
      }

      currentExp = {
        highlights: [],
        current: /present/i.test(line),
      };

      // Try extracting title and company from line
      const atSplit = line.split(/\s+at\s+|\s+@\s+|\s*\|\s*|\s*[-–—]\s*|\s*,\s*/i);
      if (atSplit.length >= 2) {
        currentExp.jobTitle = atSplit[0].trim();
        currentExp.company = atSplit[1].replace(/(?:19|20)\d{2}.*/i, '').trim();
      } else {
        currentExp.jobTitle = line.replace(/(?:19|20)\d{2}.*/i, '').trim() || 'Software Engineer';
        currentExp.company = 'Company';
      }

      if (/intern/i.test(currentExp.jobTitle || '')) {
        currentExp.employmentType = 'Internship';
      }

      // Extract date match
      const dateMatch = line.match(
        /((?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+)?(19\d{2}|20\d{2})\s*[-–—to]+\s*(Present|(?:Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Oct|Nov|Dec)[a-z]*\s+)?(19\d{2}|20\d{2})?/i
      );
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
    } else if (currentExp && currentExp.highlights && currentExp.highlights.length > 0 && !hasDateRange) {
      // Continuation of previous bullet point
      const lastIdx = currentExp.highlights.length - 1;
      currentExp.highlights[lastIdx] = `${currentExp.highlights[lastIdx]} ${line}`;
    }
  }

  // Push the last open experience
  if (currentExp && (currentExp.jobTitle || currentExp.highlights?.length)) {
    experiences.push(finalizeExperience(currentExp));
  }

  return experiences;
}

function finalizeExperience(exp: Partial<ExperienceItem>): ExperienceItem {
  return {
    id: exp.id || crypto.randomUUID(),
    jobTitle: exp.jobTitle || 'Software Engineer',
    company: exp.company || 'Company',
    location: exp.location || '',
    startDate: exp.startDate || '2021',
    endDate: exp.endDate || 'Present',
    current: exp.current ?? true,
    employmentType: exp.employmentType,
    highlights:
      exp.highlights && exp.highlights.length > 0
        ? exp.highlights
        : ['Led development of core features and improved team workflows.'],
  };
}

/**
 * Parses project lines into structured ProjectItem array
 */
function parseProjects(lines: string[]): ProjectItem[] {
  const projects: ProjectItem[] = [];
  let currentProj: Partial<ProjectItem> | null = null;
  const currentBullets: string[] = [];

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    const isBullet = line.startsWith('•') || line.startsWith('-') || line.startsWith('*');

    // Check if line looks like a project header (contains URL, or contains dash/pipe with capitalized words, or uppercase)
    const hasUrl = /(?:https?:\/\/)?(?:www\.)?[a-zA-Z0-9_.-]+\.(?:netlify\.app|vercel\.app|github\.io|in|dev|app|org|com|io)/i.test(line);
    const hasTitleSeparator = /\s*[-–—|]\s*/.test(line);
    const startsWithLowercase = /^[a-z]/.test(line);
    const isContinuation =
      startsWithLowercase ||
      /^(and|with|for|to|while|using|in|on|by|or|of|tend|management|platform)\b/i.test(line);

    const isNewProjectHeader = !isBullet && !isContinuation && (hasUrl || hasTitleSeparator || /^[A-Z0-9\s]{4,}/.test(line));

    if (isNewProjectHeader || (!currentProj && !isBullet)) {
      if (currentProj && (currentProj.name || currentBullets.length > 0)) {
        currentProj.description = currentBullets.join('\n');
        projects.push(finalizeProject(currentProj));
        currentBullets.length = 0;
      }

      currentProj = {
        id: crypto.randomUUID(),
        name: '',
        technologies: [],
        url: '',
        githubUrl: '',
        description: '',
      };

      // Extract URL if present in project title line
      const urlMatch = line.match(
        /(?:https?:\/\/)?(?:www\.)?[a-zA-Z0-9_.-]+\.(?:netlify\.app|vercel\.app|github\.io|in|dev|app|org|com)(?:\/[^\s]*)?/i
      );
      let nameLine = line;
      if (urlMatch) {
        currentProj.url = urlMatch[0].startsWith('http') ? urlMatch[0] : `https://${urlMatch[0]}`;
        nameLine = line.replace(urlMatch[0], '').trim();
      }

      // Check for technologies separated by | or (e.g. "Project Name | React, TypeScript")
      const pipeSplit = nameLine.split(/\s*\|\s*/);
      if (pipeSplit.length > 1) {
        currentProj.name = pipeSplit[0].trim();
        currentProj.technologies = pipeSplit[1].split(/[,/]/).map((t) => t.trim()).filter(Boolean);
      } else {
        currentProj.name = nameLine.trim();
      }
    } else if (isBullet && currentProj) {
      const cleanBullet = line.replace(/^[•\-*]\s*/, '').trim();
      if (cleanBullet) {
        currentBullets.push(`• ${cleanBullet}`);

        // Try extracting technologies mentioned in the bullet points (e.g. React, TypeScript, Vite, Tailwind, Supabase)
        for (const [techKey] of Object.entries(KNOWN_SKILLS_MAP)) {
          const techRegex = new RegExp(`\\b${techKey.replace('+', '\\+')}\\b`, 'i');
          if (techRegex.test(cleanBullet)) {
            const formatted = techKey.charAt(0).toUpperCase() + techKey.slice(1);
            if (!currentProj.technologies?.some((t) => t.toLowerCase() === techKey)) {
              currentProj.technologies = currentProj.technologies || [];
              currentProj.technologies.push(formatted);
            }
          }
        }
      }
    } else if (currentProj && currentBullets.length > 0) {
      // Continuation of previous bullet point
      const lastIdx = currentBullets.length - 1;
      currentBullets[lastIdx] = `${currentBullets[lastIdx]} ${line}`;

      for (const [techKey] of Object.entries(KNOWN_SKILLS_MAP)) {
        const techRegex = new RegExp(`\\b${techKey.replace('+', '\\+')}\\b`, 'i');
        if (techRegex.test(line)) {
          const formatted = techKey.charAt(0).toUpperCase() + techKey.slice(1);
          if (!currentProj.technologies?.some((t) => t.toLowerCase() === techKey)) {
            currentProj.technologies = currentProj.technologies || [];
            currentProj.technologies.push(formatted);
          }
        }
      }
    }
  }

  if (currentProj && (currentProj.name || currentBullets.length > 0)) {
    currentProj.description = currentBullets.join('\n');
    projects.push(finalizeProject(currentProj));
  }

  return projects;
}

function finalizeProject(proj: Partial<ProjectItem>): ProjectItem {
  return {
    id: proj.id || crypto.randomUUID(),
    name: proj.name || 'Featured Project',
    description: proj.description || '',
    technologies: proj.technologies && proj.technologies.length > 0 ? proj.technologies.slice(0, 8) : [],
    url: proj.url || '',
    githubUrl: proj.githubUrl || '',
  };
}

/**
 * Parses certification lines into structured CertificationItem array
 */
function parseCertifications(lines: string[]): CertificationItem[] {
  const certifications: CertificationItem[] = [];

  for (const rawLine of lines) {
    const line = rawLine.replace(/^[•\-*]\s*/, '').trim();
    if (!line) continue;

    const parts = line.split(/\s*[-–—|]\s+|\s+by\s+/i).map((p) => p.trim()).filter(Boolean);
    const name = parts[0] || line;
    const issuer = parts[1] || 'Certification Issuer';

    certifications.push({
      id: crypto.randomUUID(),
      name,
      issuer,
      issueDate: '',
    });
  }

  return certifications;
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
  let currentEdu: Partial<EducationItem> | null = null;

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line) continue;

    const isDegree = /(bachelor|master|ph\.?d|b\.?s|b\.?a|m\.?s|m\.?tech|b\.?tech|b\.?e|degree|diploma|engineering)/i.test(line);
    const isInstitution = /(university|college|institute|school|academy)/i.test(line);
    const dateMatch = line.match(/(?:(?:19|20)\d{2}\s*[-–—to]+\s*(?:Present|(?:19|20)\d{2}))|\b(19\d{2}|20\d{2})\b/gi);
    const gpaMatch = line.match(/(?:cgpa|gpa|grade|score)[\s:]*([0-9.]+(?:\s*\/\s*[0-9.]+)?%?)/i);

    if (isInstitution && currentEdu && currentEdu.institution && !isDegree) {
      educations.push(finalizeEducation(currentEdu));
      currentEdu = null;
    } else if (isDegree && currentEdu && currentEdu.degree && !isInstitution) {
      educations.push(finalizeEducation(currentEdu));
      currentEdu = null;
    }

    if (!currentEdu) {
      currentEdu = {
        id: crypto.randomUUID(),
        institution: '',
        degree: '',
        location: '',
        startDate: '2022',
        endDate: '2026',
        gpa: '',
      };
    }

    if (gpaMatch) {
      currentEdu.gpa = gpaMatch[0].trim();
    }

    if (dateMatch) {
      const yearParts = line.match(/(19\d{2}|20\d{2})/g);
      if (yearParts && yearParts.length >= 2) {
        currentEdu.startDate = yearParts[0];
        currentEdu.endDate = yearParts[1];
      } else if (yearParts && yearParts.length === 1) {
        currentEdu.endDate = yearParts[0];
      }
    }

    const cleanLine = line
      .replace(/(?:cgpa|gpa|grade|score)[\s:]*([0-9.]+(?:\s*\/\s*[0-9.]+)?%?)/gi, '')
      .replace(/\(?\s*(?:19\d{2}|20\d{2})\s*[-–—to]+\s*(?:Present|19\d{2}|20\d{2})?\s*\)?/gi, '')
      .replace(/\((?:19\d{2}|20\d{2})\)/g, '')
      .trim();

    const splitParts = cleanLine.split(/\s*[-–—|]\s+|\s+at\s+/i).map((p) => p.trim()).filter(Boolean);
    if (splitParts.length >= 2) {
      if (/(bachelor|master|b\.?tech|degree|b\.?s)/i.test(splitParts[0])) {
        currentEdu.degree = splitParts[0];
        currentEdu.institution = splitParts.slice(1).join(', ');
      } else {
        currentEdu.institution = splitParts[0];
        currentEdu.degree = splitParts.slice(1).join(', ');
      }
    } else if (isInstitution) {
      const locSplit = cleanLine.split(/,\s*/);
      if (locSplit.length > 1) {
        currentEdu.institution = locSplit[0];
        currentEdu.location = locSplit.slice(1).join(', ');
      } else {
        currentEdu.institution = cleanLine;
      }
    } else if (isDegree) {
      currentEdu.degree = cleanLine;
    }
  }

  if (currentEdu && (currentEdu.institution || currentEdu.degree)) {
    educations.push(finalizeEducation(currentEdu));
  }

  return educations;
}

function finalizeEducation(edu: Partial<EducationItem>): EducationItem {
  return {
    id: edu.id || crypto.randomUUID(),
    institution: edu.institution || 'University',
    degree: edu.degree || 'Bachelor of Science',
    location: edu.location || '',
    startDate: edu.startDate || '2022',
    endDate: edu.endDate || '2026',
    current: false,
    gpa: edu.gpa || '',
  };
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

  // Projects
  const projects = parseProjects(sections.projects);

  // Certifications
  const certifications = parseCertifications(sections.certifications);

  // Construct empty base resume
  const base = createEmptyResume(userId, title, templateId);

  // Derive target title
  let professionalTitle = '';
  const titleMatch = (summaryText || rawText).match(
    /\b(?:Aspiring\s+)?(Software Engineer|Software Developer|Full[- ]Stack (?:Software )?Developer|Frontend Developer|Backend Developer|Web Developer|AI Engineer|Machine Learning Engineer|Data Scientist|Data Analyst)\b/i
  );
  if (titleMatch) {
    professionalTitle = titleMatch[1];
  } else if (experiences[0]?.jobTitle && !/intern/i.test(experiences[0].jobTitle)) {
    professionalTitle = experiences[0].jobTitle;
  } else if (projects.length > 0) {
    professionalTitle = 'Software Developer';
  } else {
    professionalTitle = 'Software Engineer';
  }

  const personalInfo: PersonalInfo = {
    fullName: fullName || base.personalInfo.fullName,
    professionalTitle,
    email,
    phone,
    location: educations[0]?.location || '',
    linkedinUrl,
    githubUrl,
    portfolioUrl,
    summary: summaryText,
  };

  const enabledSections = {
    ...base.enabledSections,
    summary: Boolean(summaryText),
    experience: experiences.length > 0,
    education: educations.length > 0,
    skills: skillCategories.some((c) => c.skills.length > 0),
    projects: projects.length > 0,
    certifications: certifications.length > 0,
  };

  return {
    ...base,
    title,
    targetRole: professionalTitle,
    personalInfo,
    enabledSections,
    experiences: experiences.length > 0 ? experiences : base.experiences,
    educations: educations.length > 0 ? educations : base.educations,
    skillCategories: skillCategories.length > 0 ? skillCategories : base.skillCategories,
    projects: projects.length > 0 ? projects : base.projects,
    certifications: certifications.length > 0 ? certifications : base.certifications,
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

    // If it's already a RESUME AI format
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
