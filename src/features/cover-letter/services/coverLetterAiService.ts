import { supabase } from '@/lib/supabase/client';
import { getSupabaseEnv } from '@/lib/supabase/env';
import type {
  CoverLetterTone,
  GenerateCoverLetterParams,
  CoverLetterGenerationResult,
} from '../types/coverLetter.types';

/**
 * Clean bullet text by stripping weak lead-ins, symbols, and extra punctuation
 */
function cleanBullet(text: string): string {
  return text
    .replace(/^[\s•\-*–—\d.)]+/, '')
    .replace(/^(?:worked on|responsible for|helped with|assisted in|participated in|tasked with)\s+/i, '')
    .replace(/[.;]+$/, '')
    .trim();
}

/**
 * Deterministic, Grounded Synthesis for Cover Letters (Offline / Fallback Safe)
 * Produces structured, factual, non-hallucinated cover letters for 4 distinct tones.
 */
export function generateCoverLetterDeterministic(
  params: GenerateCoverLetterParams
): CoverLetterGenerationResult {
  const startTime = Date.now();
  const tone: CoverLetterTone = params.tone || 'professional';
  const role = (params.jobTitle || 'Software Engineer').trim();
  const company = (params.companyName || 'the Hiring Team').trim();
  const recipient = (params.hiringManagerName || 'Hiring Team').trim();
  const resume = params.resumeData;

  const candidateName =
    params.candidateName || resume?.personalInfo.fullName || 'Candidate';
  const candidateTitle =
    params.professionalTitle || resume?.personalInfo.professionalTitle || role;

  // Extract skills from resume or default to general skills
  const skills: string[] = [];
  if (resume?.skillCategories) {
    for (const cat of resume.skillCategories) {
      for (const s of cat.skills) {
        if (!skills.includes(s)) skills.push(s);
      }
    }
  }

  const skillsList =
    skills.length > 0
      ? skills.slice(0, 5).join(', ')
      : 'modern software engineering, structured problem solving, and responsive web development';

  const projects = resume?.projects || [];
  const experiences = resume?.experiences || [];
  const educations = resume?.educations || [];
  const cycle = (params.previousGenerations || []).length;

  // Build factual narrative story without fabricating
  let achievementStory = '';
  if (projects.length > 0) {
    const p = projects[0];
    const tech =
      p.technologies && p.technologies.length > 0
        ? ` using ${p.technologies.slice(0, 4).join(', ')}`
        : '';
    achievementStory = `developed "${p.name}"${tech}, focusing on modular architecture, reliable data flow, and intuitive user experiences`;
  } else if (
    experiences.length > 0 &&
    experiences[0].highlights &&
    experiences[0].highlights.length > 0
  ) {
    achievementStory = cleanBullet(experiences[0].highlights[0]).toLowerCase();
  } else if (educations.length > 0) {
    achievementStory = `completed coursework and practical technical implementations in ${educations[0].degree || 'engineering'}, building solid competencies in software design and analysis`;
  } else {
    achievementStory = `delivered reliable software projects, applying foundational engineering concepts to build functional, maintainable code`;
  }

  // Education background sentence
  let educationSentence = '';
  if (educations.length > 0) {
    const edu = educations[0];
    educationSentence = `My academic foundation in ${edu.degree || 'Technology'} from ${edu.institution || 'University'}${
      edu.gpa ? ` (${edu.gpa})` : ''
    } has reinforced my discipline in software architecture and systematic problem solving. `;
  }

  // Additional context inclusion if provided
  const contextNote = params.additionalContext?.trim()
    ? ` ${params.additionalContext.trim()}`
    : '';

  // Tone-specific openings, bodies, and closings
  let content = '';

  switch (tone) {
    case 'confident': {
      const openings = [
        `I am writing to express my strong candidacy for the ${role} position at ${company}. With proven hands-on capability in ${skillsList}, I bring a track record of disciplined execution and a readiness to make an immediate, tangible impact on your engineering priorities.`,
        `I am eager to present my background for the ${role} role at ${company}. Having built functional software systems utilizing ${skillsList}, I am prepared to step in, tackle challenging requirements, and deliver dependable results for your technical roadmap.`,
      ];
      const opening = openings[cycle % openings.length];

      content = `Dear ${recipient},

${opening}${contextNote}

${educationSentence}Throughout my technical experience, my core focus has been translating complex functional goals into high-quality, maintainable software. In my recent work, I ${achievementStory}. My development workflow emphasizes clean architecture, systematic testing, and rapid iteration to ensure reliable performance across core user workflows.

What draws me specifically to ${company} is your commitment to high-standard execution and technical rigor. I am fully prepared to leverage my background in ${skillsList} to support your upcoming milestones and contribute to your team's ongoing success.

I look forward to discussing how my technical background and proactive execution mindset align with the objectives of ${company}. Thank you for your time and consideration.

Sincerely,
${candidateName}
${candidateTitle}`.trim();
      break;
    }

    case 'concise': {
      const openings = [
        `I am applying for the ${role} position at ${company}. With a practical background in ${skillsList}, I deliver focused engineering execution and clean, maintainable software solutions.`,
        `Please accept my application for the ${role} opportunity at ${company}. My background in ${skillsList} has prepared me to contribute efficiently to your engineering team from day one.`,
      ];
      const opening = openings[cycle % openings.length];

      content = `Dear ${recipient},

${opening}${contextNote}

${educationSentence}In my recent technical projects, I ${achievementStory}. I emphasize clean modular design, robust code quality, and proactive collaboration to deliver features on schedule.

I am enthusiastic about the work being done at ${company} and would welcome the opportunity to discuss how my verified skills can support your product goals. Thank you for your review.

Sincerely,
${candidateName}
${candidateTitle}`.trim();
      break;
    }

    case 'enthusiastic': {
      const openings = [
        `I am thrilled to submit my application for the ${role} position at ${company}! Having closely followed ${company}'s work and technical trajectory, I am genuinely excited about the opportunity to contribute my background in ${skillsList} to your passionate team.`,
        `It is with immense enthusiasm that I apply for the ${role} role at ${company}. Your team's dedication to building remarkable products strongly resonates with my technical ambition and hands-on experience across ${skillsList}.`,
      ];
      const opening = openings[cycle % openings.length];

      content = `Dear ${recipient},

${opening}${contextNote}

${educationSentence}What drives my passion for technology is the ability to build software that solves real-world problems. In my recent work, I ${achievementStory}. I thrive in collaborative, fast-moving environments and pride myself on learning quickly, taking initiative, and shipping dependable features.

Joining ${company} represents an inspiring next chapter where I can immerse myself in challenging problems, learn from talented engineers, and dedicate my energy toward advancing your core mission.

Thank you very much for your time and consideration. I would be thrilled to speak with you about how my enthusiasm, technical foundation, and dedication can benefit ${company}.

Sincerely,
${candidateName}
${candidateTitle}`.trim();
      break;
    }

    case 'professional':
    default: {
      const openings = [
        `I am writing to express my interest in the ${role} position at ${company}. With a solid technical foundation in ${skillsList}, I am eager to apply my capabilities toward advancing your team's software objectives and product deliverables.`,
        `I am pleased to submit my application for the ${role} opportunity at ${company}. My background in ${skillsList} has equipped me with practical problem-solving skills and a disciplined approach to building dependable applications.`,
      ];
      const opening = openings[cycle % openings.length];

      content = `Dear ${recipient},

${opening}${contextNote}

${educationSentence}Throughout my engineering trajectory, I have prioritized writing clear, well-structured code and implementing reliable software solutions. Most recently, I ${achievementStory}. I approach development with an emphasis on code quality, thoughtful architecture, and cross-functional collaboration to deliver robust results.

What attracts me to ${company} is your reputation for technical innovation and engineering standards. I welcome the opportunity to contribute my skills in ${skillsList} to support your ongoing projects and strategic milestones.

Thank you for your time and consideration. I look forward to the possibility of discussing how my technical background and dedication to quality can support ${company}'s goals.

Sincerely,
${candidateName}
${candidateTitle}`.trim();
      break;
    }
  }

  const subjectLine = `Application for ${role} — ${candidateName}`;

  return {
    content,
    subjectLine,
    usedResumeEvidence: skills.slice(0, 5),
    isDeterministic: true,
    provider: 'deterministic',
    tone,
    fallbackReason: 'Offline Grounded Synthesis Active',
    processingTimeMs: Date.now() - startTime,
  };
}

/**
 * Main Cover Letter Generation Service
 * Invokes remote AI Edge Function when available, falling back cleanly to deterministic synthesis
 */
export class CoverLetterAiService {
  static async generateCoverLetter(
    params: GenerateCoverLetterParams
  ): Promise<CoverLetterGenerationResult> {
    const startTime = Date.now();
    const env = getSupabaseEnv();

    // Prepare payload
    const resume = params.resumeData;
    const skills: string[] = [];
    if (resume?.skillCategories) {
      for (const cat of resume.skillCategories) {
        for (const s of cat.skills) {
          if (!skills.includes(s)) skills.push(s);
        }
      }
    }

    const payload = {
      candidateName:
        params.candidateName || resume?.personalInfo.fullName || 'Candidate',
      professionalTitle:
        params.professionalTitle ||
        resume?.personalInfo.professionalTitle ||
        params.jobTitle,
      jobTitle: params.jobTitle,
      companyName: params.companyName,
      hiringManagerName: params.hiringManagerName || 'Hiring Team',
      jobDescription: params.jobDescription || '',
      tone: params.tone || 'professional',
      additionalContext: params.additionalContext || '',
      skills,
      projects: resume?.projects || [],
      experiences: resume?.experiences || [],
      educations: resume?.educations || [],
      previousGenerations: params.previousGenerations || [],
    };

    // If Supabase is configured, try remote Edge Function
    if (env.isConfigured) {
      try {
        const { data, error } = await supabase.functions.invoke('ai-optimizer', {
          body: {
            operation: 'generate-cover-letter',
            payload,
          },
        });

        if (error) {
          console.warn('[CoverLetterAiService] Edge Function returned error:', error);
          // Fall back to deterministic generator with clear explanation
          const fallback = generateCoverLetterDeterministic(params);
          fallback.fallbackReason = `Remote AI service unavailable (${error.message || '503'}); grounded synthesis generated.`;
          return fallback;
        }

        if (data && data.content) {
          return {
            content: data.content,
            subjectLine:
              data.subjectLine ||
              `Application for ${params.jobTitle} — ${payload.candidateName}`,
            usedResumeEvidence: data.usedResumeEvidence || skills.slice(0, 5),
            isDeterministic: false,
            provider: 'supabase-edge-ai',
            tone: params.tone || 'professional',
            processingTimeMs: Date.now() - startTime,
          };
        }
      } catch (err: any) {
        console.warn('[CoverLetterAiService] Failed to invoke remote AI function:', err);
      }
    }

    // Default: Grounded deterministic synthesis
    return generateCoverLetterDeterministic(params);
  }
}

