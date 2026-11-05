import type { ResumeData } from '@/features/resumes/types/resume.types';
import type { JobMatchAnalysis } from '../types/job.types';
import { extractKeywordsFromJob, countTermOccurrences, normalizeText } from '@/features/analyzer/services/atsEngine';

/**
 * Deterministic Job Matching Engine
 * Reuses existing ATS keyword taxonomy and utilities to compute factual,
 * non-hallucinated match analytics between a candidate resume and a job description.
 */
export function analyzeJobMatch(
  resume: ResumeData,
  jobDescription: string,
  targetJobTitle: string
): JobMatchAnalysis {
  const normalizedTitle = normalizeText(targetJobTitle);

  // 1. Extract job keywords from taxonomy
  const { detectedTaxonomy, extractedPhrases } = extractKeywordsFromJob(jobDescription);
  const allJobKeywords = [...detectedTaxonomy, ...extractedPhrases];

  // 2. Aggregate candidate resume skills & text
  const resumeSkillsNormalized = new Set<string>();

  // Add categorized skills
  if (resume.skillCategories) {
    for (const cat of resume.skillCategories) {
      for (const s of cat.skills) {
        resumeSkillsNormalized.add(s.toLowerCase().trim());
      }
    }
  }

  // Add project technologies
  if (resume.projects) {
    for (const proj of resume.projects) {
      if (proj.technologies) {
        for (const t of proj.technologies) {
          resumeSkillsNormalized.add(t.toLowerCase().trim());
        }
      }
    }
  }

  // Compile full resume text for deep search
  const resumeTextParts: string[] = [
    resume.personalInfo.fullName,
    resume.personalInfo.professionalTitle,
    resume.personalInfo.summary,
  ];

  if (resume.experiences) {
    for (const exp of resume.experiences) {
      resumeTextParts.push(exp.jobTitle, exp.company);
      if (exp.highlights) resumeTextParts.push(...exp.highlights);
    }
  }

  if (resume.projects) {
    for (const p of resume.projects) {
      resumeTextParts.push(p.name, p.description);
      if (p.technologies) resumeTextParts.push(...p.technologies);
    }
  }

  if (resume.educations) {
    for (const edu of resume.educations) {
      resumeTextParts.push(edu.degree, edu.institution);
      if (edu.description) resumeTextParts.push(edu.description);
    }
  }

  const fullResumeText = resumeTextParts.join(' ');

  // 3. Match Skills against Job Keywords
  const matchedSkills: string[] = [];
  const missingSkills: string[] = [];
  const criticalMissing: string[] = [];

  for (const kw of allJobKeywords) {
    const termLower = kw.normalized;
    const isDirectSkill = resumeSkillsNormalized.has(termLower);
    const occurrencesInResume = countTermOccurrences(fullResumeText, kw.term);

    if (isDirectSkill || occurrencesInResume > 0) {
      if (!matchedSkills.includes(kw.term)) {
        matchedSkills.push(kw.term);
      }
    } else {
      if (!missingSkills.includes(kw.term)) {
        missingSkills.push(kw.term);
        if (kw.importance === 'critical') {
          criticalMissing.push(kw.term);
        }
      }
    }
  }

  const totalEvaluatedSkills = matchedSkills.length + missingSkills.length;
  const skillMatchPercentage =
    totalEvaluatedSkills > 0
      ? Math.round((matchedSkills.length / totalEvaluatedSkills) * 100)
      : 70;

  // 4. Experience & Title Alignment
  const relevantRoles: string[] = [];
  let titleMatchScore = 0;

  const candidateTitleLower = (resume.personalInfo.professionalTitle || '').toLowerCase();
  const targetWords = normalizedTitle.split(/\s+/).filter((w) => w.length > 2);

  if (candidateTitleLower && targetWords.some((w) => candidateTitleLower.includes(w))) {
    titleMatchScore += 50;
  }

  let totalExperienceYears = 0;
  if (resume.experiences && resume.experiences.length > 0) {
    for (const exp of resume.experiences) {
      const expTitle = (exp.jobTitle || '').toLowerCase();
      if (targetWords.some((w) => expTitle.includes(w))) {
        relevantRoles.push(exp.jobTitle);
        titleMatchScore += 25;
      }
      // Simple year estimator: 1.5 years per role baseline
      totalExperienceYears += 1.5;
    }
  }

  const titleAlignment: 'strong' | 'moderate' | 'weak' =
    titleMatchScore >= 50 ? 'strong' : titleMatchScore >= 25 ? 'moderate' : 'weak';

  const experienceSummary =
    relevantRoles.length > 0
      ? `Found ${relevantRoles.length} role(s) directly related to "${targetJobTitle}": ${relevantRoles.slice(0, 2).join(', ')}.`
      : `No exact role title matches for "${targetJobTitle}". Consider tailoring your summary to highlight transferable experience.`;

  // 5. Keyword Density Overlap
  const matchedKeywordsList = matchedSkills.slice(0, 8);

  // 6. Overall Weighted Score
  // 50% Skills, 30% Experience Alignment, 20% Keyword Overlap
  const expScore = titleAlignment === 'strong' ? 90 : titleAlignment === 'moderate' ? 70 : 45;
  const kwScore = Math.min(100, Math.round((matchedSkills.length / Math.max(1, allJobKeywords.length)) * 100));

  const rawOverall = Math.round(skillMatchPercentage * 0.5 + expScore * 0.3 + kwScore * 0.2);
  const overallScore = Math.max(15, Math.min(96, rawOverall));

  // 7. Actionable Suggestions
  const suggestions: string[] = [];

  if (criticalMissing.length > 0) {
    suggestions.push(
      `Address critical skill gaps: The job strongly emphasizes ${criticalMissing.slice(0, 3).join(', ')}. If you have practical experience with these, add them to your Skills or Projects sections.`
    );
  }

  if (titleAlignment === 'weak') {
    suggestions.push(
      `Align your headline: Your current title "${resume.personalInfo.professionalTitle || 'Candidate'}" differs from "${targetJobTitle}". Consider customizing your professional summary to reflect target role competencies.`
    );
  }

  if (missingSkills.length > 0 && criticalMissing.length === 0) {
    suggestions.push(
      `Boost secondary keyword match: Adding mentions of ${missingSkills.slice(0, 3).join(', ')} in your project highlights will increase ATS filter discoverability.`
    );
  }

  if (resume.projects && resume.projects.length > 0 && matchedSkills.length > 0) {
    suggestions.push(
      `Highlight relevant tools in your projects: Emphasize ${matchedSkills.slice(0, 2).join(' and ')} in your project descriptions to demonstrate practical application.`
    );
  } else if (!resume.projects || resume.projects.length === 0) {
    suggestions.push(
      `Add technical projects: Demonstrating real implementations using required technologies will significantly strengthen your profile.`
    );
  }

  return {
    overallScore,
    skillsMatch: {
      matched: matchedSkills,
      missing: missingSkills,
      criticalMissing,
      matchPercentage: skillMatchPercentage,
    },
    experienceAlignment: {
      titleAlignment,
      relevantRolesFound: relevantRoles,
      yearsEstimated: Math.round(totalExperienceYears * 10) / 10,
      summary: experienceSummary,
    },
    keywordAlignment: {
      matchedCount: matchedSkills.length,
      totalJobKeywords: allJobKeywords.length,
      topMatches: matchedKeywordsList,
    },
    suggestions,
    analyzedAt: new Date().toISOString(),
    disclaimer:
      'Match score is an algorithmic estimate based on keyword frequency and qualification alignment. It is intended for interview preparation and application tailoring, not a hiring prediction or guarantee.',
  };
}
