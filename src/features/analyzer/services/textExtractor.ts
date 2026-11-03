import * as pdfjsLib from 'pdfjs-dist/legacy/build/pdf.mjs';
import type { ResumeData } from '@/features/resumes/types/resume.types';

// Configure worker safely for browser and Node test environments
if (typeof window !== 'undefined') {
  try {
    pdfjsLib.GlobalWorkerOptions.workerSrc = new URL(
      'pdfjs-dist/legacy/build/pdf.worker.min.mjs',
      import.meta.url
    ).toString();
  } catch {
    // Fallback if URL resolution fails in specific environments
    pdfjsLib.GlobalWorkerOptions.workerSrc = '';
  }
}

export interface ExtractedPdfResult {
  text: string;
  numPages: number;
  wordCount: number;
  isScannedPdf: boolean;
}

/**
 * Validates an uploaded PDF file before processing
 */
export function validatePdfFile(file: File): { valid: boolean; error?: string } {
  // Max size: 10MB
  const MAX_SIZE_BYTES = 10 * 1024 * 1024;

  if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
    return { valid: false, error: 'Only PDF documents (.pdf) are supported.' };
  }

  if (file.size > MAX_SIZE_BYTES) {
    return { valid: false, error: 'File size exceeds maximum allowed limit of 10MB.' };
  }

  if (file.size === 0) {
    return { valid: false, error: 'The uploaded PDF file is empty (0 bytes).' };
  }

  return { valid: true };
}

/**
 * Extracts plain text from a PDF ArrayBuffer using pdfjs-dist.
 * Accurately detects scanned/rasterized PDFs where text layer is absent.
 */
export async function extractTextFromPdf(arrayBuffer: ArrayBuffer): Promise<ExtractedPdfResult> {
  try {
    const loadingTask = pdfjsLib.getDocument({
      data: new Uint8Array(arrayBuffer),
      useSystemFonts: true,
      disableFontFace: true,
    });

    const pdfDoc = await loadingTask.promise;
    const numPages = pdfDoc.numPages;
    const pageTexts: string[] = [];

    for (let pageNum = 1; pageNum <= numPages; pageNum++) {
      const page = await pdfDoc.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageText = textContent.items
        .map((item: any) => item.str || '')
        .join(' ');
      pageTexts.push(pageText);
    }

    const fullText = pageTexts.join('\n\n').trim();
    const wordCount = fullText.split(/\s+/).filter(Boolean).length;

    // Detection heuristic: If a document has pages but fewer than 20 total words,
    // it is virtually guaranteed to be a scanned image or flat graphic lacking vector text streams.
    const isScannedPdf = numPages > 0 && wordCount < 20;

    return {
      text: fullText,
      numPages,
      wordCount,
      isScannedPdf,
    };
  } catch (error: any) {
    throw new Error(`Failed to extract text from PDF: ${error.message || 'Corrupt or unreadable PDF'}`);
  }
}

/**
 * Converts structured ResumeData into clean, section-delimited text for ATS analysis.
 */
export function convertResumeDataToText(resume: ResumeData): string {
  const parts: string[] = [];

  // Contact Info
  const contactLines: string[] = [];
  if (resume.personalInfo.fullName) contactLines.push(resume.personalInfo.fullName);
  if (resume.personalInfo.professionalTitle) contactLines.push(resume.personalInfo.professionalTitle);
  if (resume.personalInfo.email) contactLines.push(`Email: ${resume.personalInfo.email}`);
  if (resume.personalInfo.phone) contactLines.push(`Phone: ${resume.personalInfo.phone}`);
  if (resume.personalInfo.location) contactLines.push(`Location: ${resume.personalInfo.location}`);
  if (resume.personalInfo.linkedinUrl) contactLines.push(`LinkedIn: ${resume.personalInfo.linkedinUrl}`);
  if (resume.personalInfo.githubUrl) contactLines.push(`GitHub: ${resume.personalInfo.githubUrl}`);
  if (resume.personalInfo.portfolioUrl) contactLines.push(`Portfolio: ${resume.personalInfo.portfolioUrl}`);

  if (contactLines.length > 0) {
    parts.push(`=== CONTACT INFORMATION ===\n${contactLines.join('\n')}`);
  }

  // Summary
  if (resume.personalInfo.summary) {
    parts.push(`=== PROFESSIONAL SUMMARY ===\n${resume.personalInfo.summary}`);
  }

  // Experience
  if (resume.experiences && resume.experiences.length > 0) {
    const expLines = resume.experiences.map((exp) => {
      const header = `${exp.jobTitle} at ${exp.company} (${exp.startDate} - ${exp.current ? 'Present' : exp.endDate || ''})`;
      const bullets = (exp.highlights || []).map((h) => `• ${h}`).join('\n');
      return `${header}\n${bullets}`;
    });
    parts.push(`=== WORK EXPERIENCE ===\n${expLines.join('\n\n')}`);
  }

  // Education
  if (resume.educations && resume.educations.length > 0) {
    const eduLines = resume.educations.map((edu) => {
      const line = `${edu.degree} - ${edu.institution} (${edu.startDate} - ${edu.current ? 'Present' : edu.endDate || ''})`;
      const details = [
        edu.gpa ? `GPA: ${edu.gpa}` : '',
        edu.honors ? `Honors: ${edu.honors}` : '',
        edu.description || '',
      ].filter(Boolean).join(' | ');
      return details ? `${line}\n${details}` : line;
    });
    parts.push(`=== EDUCATION ===\n${eduLines.join('\n\n')}`);
  }

  // Skills
  if (resume.skillCategories && resume.skillCategories.length > 0) {
    const skillLines = resume.skillCategories.map((cat) => {
      return `${cat.name}: ${(cat.skills || []).join(', ')}`;
    });
    parts.push(`=== TECHNICAL SKILLS ===\n${skillLines.join('\n')}`);
  }

  // Projects
  if (resume.projects && resume.projects.length > 0) {
    const projLines = resume.projects.map((proj) => {
      const tech = (proj.technologies || []).join(', ');
      return `${proj.name} [Tech: ${tech}]\n${proj.description || ''}`;
    });
    parts.push(`=== PROJECTS ===\n${projLines.join('\n\n')}`);
  }

  // Certifications
  if (resume.certifications && resume.certifications.length > 0) {
    const certLines = resume.certifications.map((c) => `${c.name} - ${c.issuer} (${c.issueDate || ''})`);
    parts.push(`=== CERTIFICATIONS ===\n${certLines.join('\n')}`);
  }

  // Achievements
  if (resume.achievements && resume.achievements.length > 0) {
    const achLines = resume.achievements.map((a) => `${a.title}: ${a.description || ''}`);
    parts.push(`=== ACHIEVEMENTS ===\n${achLines.join('\n')}`);
  }

  // Languages
  if (resume.languages && resume.languages.length > 0) {
    const langLines = resume.languages.map((l) => `${l.language} (${l.proficiency})`);
    parts.push(`=== LANGUAGES ===\n${langLines.join(', ')}`);
  }

  // Volunteer
  if (resume.volunteer && resume.volunteer.length > 0) {
    const volLines = resume.volunteer.map((v) => `${v.role} at ${v.organization}\n${v.description || ''}`);
    parts.push(`=== VOLUNTEER EXPERIENCE ===\n${volLines.join('\n\n')}`);
  }

  return parts.join('\n\n');
}
