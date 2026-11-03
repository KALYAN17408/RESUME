import type {
  AtsAnalysisInput,
  AtsReport,
  AtsScoreBreakdown,
  KeywordMatch,
  KeywordImportance,
  SectionCheck,
  FormattingCheck,
  AtsRecommendation,
} from '../types/analyzer.types';
import { STOP_WORDS, SKILLS_TAXONOMY, ACTION_VERBS, WEAK_VERBS } from './keywordTaxonomy';

/**
 * Normalizes text for keyword matching while preserving critical technical symbols (e.g. C++, C#, .NET, CI/CD)
 */
export function normalizeText(text: string): string {
  if (!text) return '';
  return text
    .toLowerCase()
    .replace(/\r\n/g, '\n')
    .replace(/[^\w\s+#./-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Escapes regex special characters
 */
function escapeRegExp(string: string): string {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Checks if a specific term exists in the text using word-boundary or symbol-boundary logic
 */
export function countTermOccurrences(text: string, term: string, aliases: string[] = []): number {
  if (!text || !term) return 0;
  const termsToSearch = [term, ...aliases];
  let totalCount = 0;

  for (const t of termsToSearch) {
    const escaped = escapeRegExp(t.toLowerCase());
    // Use word boundaries when term starts/ends with alphanumeric; otherwise use custom boundary
    const pattern = `(?:^|[\\s,;:.()/\\[\\]-])${escaped}(?=[\\s,;:.()/\\[\\]-]|$)`;
    const regex = new RegExp(pattern, 'gi');
    const matches = text.match(regex);
    if (matches) {
      totalCount += matches.length;
    }
  }

  return totalCount;
}

/**
 * Extracts candidate keywords from the Job Description
 */
export function extractKeywordsFromJob(jobDescription: string): {
  detectedTaxonomy: KeywordMatch[];
  extractedPhrases: KeywordMatch[];
} {
  const normalizedJob = normalizeText(jobDescription);
  const detectedTaxonomy: KeywordMatch[] = [];
  const matchedTerms = new Set<string>();

  // 1. Scan curated skills taxonomy
  for (const entry of SKILLS_TAXONOMY) {
    const countInJob = countTermOccurrences(jobDescription, entry.term, entry.aliases);
    if (countInJob > 0) {
      matchedTerms.add(entry.term.toLowerCase());
      if (entry.aliases) {
        entry.aliases.forEach((a) => matchedTerms.add(a.toLowerCase()));
      }

      const importance: KeywordImportance =
        countInJob >= 3 ? 'critical' : countInJob >= 2 ? 'important' : 'nice_to_have';

      detectedTaxonomy.push({
        term: entry.term,
        normalized: entry.term.toLowerCase(),
        category: entry.category,
        importance,
        countInJob,
        countInResume: 0,
        matched: false,
      });
    }
  }

  // 2. Extract significant n-grams (1-gram and 2-gram phrases) from Job Description
  const words = normalizedJob.split(/\s+/).filter((w) => w.length > 2);
  const phraseCounts = new Map<string, number>();

  for (let i = 0; i < words.length; i++) {
    const w1 = words[i];
    // Unigram check
    if (!STOP_WORDS.has(w1) && !matchedTerms.has(w1) && !/^\d+$/.test(w1)) {
      phraseCounts.set(w1, (phraseCounts.get(w1) || 0) + 1);
    }

    // Bigram check
    if (i < words.length - 1) {
      const w2 = words[i + 1];
      if (!STOP_WORDS.has(w1) && !STOP_WORDS.has(w2) && !/^\d+$/.test(w1) && !/^\d+$/.test(w2)) {
        const bigram = `${w1} ${w2}`;
        if (!matchedTerms.has(bigram)) {
          phraseCounts.set(bigram, (phraseCounts.get(bigram) || 0) + 1);
        }
      }
    }
  }

  // Filter phrases occurring at least twice or with significant technical characteristics
  const extractedPhrases: KeywordMatch[] = [];
  for (const [phrase, count] of phraseCounts.entries()) {
    if (count >= 2 && phrase.length >= 4) {
      const importance: KeywordImportance = count >= 3 ? 'important' : 'nice_to_have';
      extractedPhrases.push({
        term: phrase.split(' ').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' '),
        normalized: phrase,
        category: 'technical',
        importance,
        countInJob: count,
        countInResume: 0,
        matched: false,
      });
    }
  }

  return { detectedTaxonomy, extractedPhrases };
}

/**
 * Analyzes standard resume sections
 */
export function analyzeSections(resumeText: string): SectionCheck[] {
  const norm = resumeText.toLowerCase();

  const checks: { id: string; name: string; patterns: RegExp[]; details: string }[] = [
    {
      id: 'contact_info',
      name: 'Contact Information',
      patterns: [
        /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/, // email
        /\b(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/, // phone
      ],
      details: 'Full name, email address, phone number, and location or professional links.',
    },
    {
      id: 'summary',
      name: 'Professional Summary / Objective',
      patterns: [/summary/i, /profile/i, /objective/i, /about/i],
      details: 'Brief 2-3 sentence overview highlighting your core value proposition and career target.',
    },
    {
      id: 'experience',
      name: 'Work Experience',
      patterns: [/experience/i, /employment/i, /work history/i, /professional background/i],
      details: 'Reverse-chronological roles with achievements, dates, and companies.',
    },
    {
      id: 'education',
      name: 'Education',
      patterns: [/education/i, /academic/i, /university/i, /college/i, /bachelor/i, /master/i, /degree/i],
      details: 'Degrees, institutions, graduation dates, and relevant academic honors.',
    },
    {
      id: 'skills',
      name: 'Technical Skills',
      patterns: [/skills/i, /technologies/i, /competencies/i, /tech stack/i, /proficiencies/i],
      details: 'Dedicated categorization of languages, frameworks, cloud tools, and databases.',
    },
    {
      id: 'projects_certifications',
      name: 'Projects & Certifications',
      patterns: [/project/i, /certification/i, /portfolio/i, /credential/i, /license/i],
      details: 'Key technical projects, GitHub repos, or verified professional certifications.',
    },
  ];

  return checks.map((c) => {
    let matchesCount = 0;
    for (const pat of c.patterns) {
      if (pat.test(norm)) matchesCount++;
    }

    const found = matchesCount > 0;
    let status: 'complete' | 'partial' | 'missing' = 'missing';
    let feedback = '';

    if (c.id === 'contact_info') {
      if (matchesCount >= 2) {
        status = 'complete';
        feedback = `${c.name} is clearly identifiable and well-structured.`;
      } else if (matchesCount === 1) {
        status = 'partial';
        feedback = `${c.name} was detected, but may be missing email or phone number.`;
      } else {
        status = 'missing';
        feedback = `${c.name} could not be detected.`;
      }
    } else {
      if (matchesCount >= 1) {
        status = 'complete';
        feedback = `${c.name} is clearly identifiable and well-structured.`;
      } else {
        status = 'missing';
        feedback = `${c.name} could not be detected. Recruiters and ATS scanners look for this section.`;
      }
    }

    return {
      id: c.id,
      name: c.name,
      found,
      status,
      feedback,
      details: c.details,
    };
  });
}

/**
 * Analyzes formatting, metrics, and readability
 */
export function analyzeFormatting(resumeText: string): {
  checks: FormattingCheck[];
  wordCount: number;
  actionVerbCount: number;
  metricCount: number;
} {
  const norm = normalizeText(resumeText);
  const words = norm.split(/\s+/).filter(Boolean);
  const wordCount = words.length;

  // 1. Word count check (400 - 950 words ideal for single/two-page ATS resumes)
  let wordCountScore = 100;
  let wordCountStatus: 'pass' | 'warning' | 'fail' = 'pass';
  let wordCountDetail = `Word count is optimal (${wordCount} words). Fits standard 1-2 page executive limits.`;

  if (wordCount < 200) {
    wordCountScore = 40;
    wordCountStatus = 'fail';
    wordCountDetail = `Resume is very short (${wordCount} words). ATS may consider it incomplete or lacking detail.`;
  } else if (wordCount < 350) {
    wordCountScore = 75;
    wordCountStatus = 'warning';
    wordCountDetail = `Resume is on the shorter side (${wordCount} words). Consider adding more quantified accomplishments.`;
  } else if (wordCount > 1200) {
    wordCountScore = 70;
    wordCountStatus = 'warning';
    wordCountDetail = `Resume is lengthy (${wordCount} words). Consider condensing bullet points to avoid recruiter fatigue.`;
  }

  // 2. Action verbs check
  let actionVerbCount = 0;
  const detectedVerbs = new Set<string>();
  for (const w of words) {
    if (ACTION_VERBS.has(w)) {
      actionVerbCount++;
      detectedVerbs.add(w);
    }
  }

  const distinctVerbsCount = detectedVerbs.size;
  let verbScore = Math.min(100, Math.round((distinctVerbsCount / 8) * 100));
  let verbStatus: 'pass' | 'warning' | 'fail' = distinctVerbsCount >= 6 ? 'pass' : distinctVerbsCount >= 3 ? 'warning' : 'fail';
  let verbDetail = `Found ${distinctVerbsCount} unique high-impact action verbs across experience bullets.`;

  // Check for weak/passive verbs
  const foundWeakVerbs: string[] = [];
  for (const w of words) {
    if (WEAK_VERBS.has(w) && !foundWeakVerbs.includes(w)) {
      foundWeakVerbs.push(w);
    }
  }

  if (foundWeakVerbs.length > 0) {
    verbDetail += ` Found passive phrases (${foundWeakVerbs.slice(0, 3).join(', ')}); replace with strong verbs.`;
  }

  // 3. Measurable metrics / Google XYZ formula check (% numbers, $, multipliers)
  const metricRegex = /(?:\b\d+(?:\.\d+)?%|(?:\$|€|£)\s*\d+(?:,\d+)*(?:\.\d+)?[kmb]?|\b\d+(?:\.\d+)?\s*[kmbx]\b|\b\d+\s*(?:million|billion|thousand|users|clients|customers|requests)\b)/gi;
  const metricMatches = resumeText.match(metricRegex) || [];
  const metricCount = metricMatches.length;

  let metricScore = Math.min(100, Math.round((metricCount / 4) * 100));
  let metricStatus: 'pass' | 'warning' | 'fail' = metricCount >= 3 ? 'pass' : metricCount >= 1 ? 'warning' : 'fail';
  let metricDetail = metricCount >= 3
    ? `Strong impact metrics detected (${metricCount} quantifiable metrics). Matches Google's XYZ formula.`
    : `Found ${metricCount} measurable metrics. Adding specific percentages or cost/time savings boosts ATS ranking.`;

  // 4. Contact accessibility check
  const hasEmail = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/.test(resumeText);
  const hasPhone = /\b(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/.test(resumeText);
  const contactScore = (hasEmail ? 50 : 0) + (hasPhone ? 50 : 0);
  const contactStatus: 'pass' | 'warning' | 'fail' = contactScore === 100 ? 'pass' : contactScore === 50 ? 'warning' : 'fail';
  const contactDetail = contactScore === 100
    ? 'Email and phone number are clearly formatted and easily parseable by ATS scanners.'
    : hasEmail
    ? 'Email is present, but phone number was not detected.'
    : 'Email address missing or unparseable. Critical for recruiter outreach.';

  const checks: FormattingCheck[] = [
    {
      id: 'word_count',
      title: 'Length & Conciseness',
      status: wordCountStatus,
      score: wordCountScore,
      detail: wordCountDetail,
      recommendation: wordCount < 350 ? 'Expand on key project impact and technical challenges.' : undefined,
    },
    {
      id: 'action_verbs',
      title: 'Action Verbs & Leadership Tone',
      status: verbStatus,
      score: verbScore,
      detail: verbDetail,
      recommendation: distinctVerbsCount < 6 ? 'Start each bullet point with a decisive action verb (e.g. Architected, Optimized, Led).' : undefined,
    },
    {
      id: 'quantifiable_metrics',
      title: 'Measurable Impact (XYZ Formula)',
      status: metricStatus,
      score: metricScore,
      detail: metricDetail,
      recommendation: metricCount < 3 ? 'Quantify results: Accomplished [X], measured by [Y], by doing [Z].' : undefined,
    },
    {
      id: 'contact_parseability',
      title: 'Contact Details Parseability',
      status: contactStatus,
      score: contactScore,
      detail: contactDetail,
      recommendation: contactScore < 100 ? 'Ensure both email and direct phone number are prominently listed in the header.' : undefined,
    },
  ];

  return {
    checks,
    wordCount,
    actionVerbCount: distinctVerbsCount,
    metricCount,
  };
}

/**
 * Generates tailored, prioritized recommendations based on analysis findings
 */
export function generateRecommendations(
  missingKeywords: KeywordMatch[],
  sections: SectionCheck[],
  formatting: FormattingCheck[]
): AtsRecommendation[] {
  const recommendations: AtsRecommendation[] = [];

  // 1. Missing Critical Keywords (High Severity)
  const criticalMissing = missingKeywords.filter((k) => k.importance === 'critical');
  if (criticalMissing.length > 0) {
    const list = criticalMissing.map((k) => k.term).slice(0, 5).join(', ');
    recommendations.push({
      id: 'rec_critical_keywords',
      type: 'missing_keyword',
      severity: 'high',
      title: `Incorporate High-Priority Skills (${criticalMissing.length} Missing)`,
      description: `The job description repeatedly mentions required skills that were not detected in your resume: ${list}.`,
      suggestion: `Add these competencies to your Technical Skills section or directly illustrate them in your experience accomplishments.`,
      actionableExample: `E.g., "Engineered responsive client interfaces using ${criticalMissing[0]?.term || 'React'} and modern design patterns."`,
    });
  }

  // 2. Missing Important Keywords (Medium Severity)
  const importantMissing = missingKeywords.filter((k) => k.importance === 'important');
  if (importantMissing.length > 0) {
    const list = importantMissing.map((k) => k.term).slice(0, 6).join(', ');
    recommendations.push({
      id: 'rec_important_keywords',
      type: 'missing_keyword',
      severity: 'medium',
      title: `Add Secondary Relevant Terminology (${importantMissing.length} Terms)`,
      description: `Target role keywords mentioned in the description: ${list}.`,
      suggestion: `Align your project descriptions to mirror the phrasing used in the job description to increase relevance scoring.`,
    });
  }

  // 3. Missing Sections (High Severity)
  for (const sec of sections) {
    if (sec.status === 'missing') {
      recommendations.push({
        id: `rec_sec_${sec.id}`,
        type: 'section',
        severity: 'high',
        title: `Add Missing ${sec.name} Section`,
        description: sec.feedback,
        suggestion: `Include a dedicated ${sec.name} section formatted with standard ATS headings so scanners do not penalize your profile.`,
      });
    }
  }

  // 4. Quantifiable metrics recommendations
  const metricCheck = formatting.find((f) => f.id === 'quantifiable_metrics');
  if (metricCheck && metricCheck.status !== 'pass') {
    recommendations.push({
      id: 'rec_metrics',
      type: 'quantifiable_metric',
      severity: 'medium',
      title: 'Quantify Business & Performance Impact',
      description: 'Your resume lacks measurable metrics (percentages, dollar amounts, scale metrics).',
      suggestion: 'Rewrite bullet points using Google’s XYZ formula: "Accomplished [X] as measured by [Y], by doing [Z]".',
      actionableExample: 'Instead of "Improved system performance", write "Accelerated API response time by 42% by indexing PostgreSQL tables and implementing Redis caching."',
    });
  }

  // 5. Action verbs recommendation
  const verbCheck = formatting.find((f) => f.id === 'action_verbs');
  if (verbCheck && verbCheck.status !== 'pass') {
    recommendations.push({
      id: 'rec_verbs',
      type: 'weak_action_verb',
      severity: 'low',
      title: 'Strengthen Bullet Openings with Action Verbs',
      description: 'Replace passive or generic phrases with decisive leadership verbs.',
      suggestion: 'Begin every bullet point with strong past-tense verbs such as Spearheaded, Architected, Designed, or Orchestrated.',
      actionableExample: 'Change "Worked on microservices" to "Architected distributed event-driven microservices processing 50k events/sec."',
    });
  }

  return recommendations;
}

/**
 * Main ATS Analyzer Engine executing deterministic, explainable analysis
 */
export function runAtsAnalysis(input: AtsAnalysisInput, userId: string): AtsReport {
  const { resumeText, jobDescription } = input;

  if (!resumeText || !resumeText.trim()) {
    throw new Error('Resume text is empty. Please select a valid resume or upload a non-empty document.');
  }

  if (!jobDescription || !jobDescription.trim()) {
    throw new Error('Job description is empty. Please paste the target job description to run ATS analysis.');
  }

  // 1. Keyword extraction from Job
  const { detectedTaxonomy, extractedPhrases } = extractKeywordsFromJob(jobDescription);
  const allJobKeywords = [...detectedTaxonomy, ...extractedPhrases];

  // 2. Keyword matching in Resume
  const matchedKeywords: KeywordMatch[] = [];
  const missingKeywords: KeywordMatch[] = [];

  for (const kw of allJobKeywords) {
    const occurrences = countTermOccurrences(resumeText, kw.term, (kw as any).aliases || []);
    if (occurrences > 0) {
      kw.countInResume = occurrences;
      kw.matched = true;
      matchedKeywords.push(kw);
    } else {
      kw.countInResume = 0;
      kw.matched = false;
      missingKeywords.push(kw);
    }
  }

  // 3. Section checks
  const sections = analyzeSections(resumeText);

  // 4. Formatting and readability
  const { checks: formatting, wordCount, actionVerbCount, metricCount } = analyzeFormatting(resumeText);

  // 5. Score Calculation
  // 5.1 Keyword Score (40% weight)
  let totalKeywordWeight = 0;
  let matchedKeywordWeight = 0;

  for (const kw of allJobKeywords) {
    const weight = kw.importance === 'critical' ? 3 : kw.importance === 'important' ? 2 : 1;
    totalKeywordWeight += weight;
    if (kw.matched) {
      matchedKeywordWeight += weight;
    }
  }

  const keywordScore = totalKeywordWeight > 0
    ? Math.min(100, Math.round((matchedKeywordWeight / totalKeywordWeight) * 100))
    : 80;

  // 5.2 Skills Score (25% weight)
  const technicalTaxonomy = detectedTaxonomy.filter((t) => t.category !== 'soft_skill');
  const matchedTechnical = technicalTaxonomy.filter((t) => t.matched);
  const skillsScore = technicalTaxonomy.length > 0
    ? Math.min(100, Math.round((matchedTechnical.length / technicalTaxonomy.length) * 100))
    : keywordScore;

  // 5.3 Section Score (15% weight)
  const sectionPoints = sections.reduce((acc, s) => {
    return acc + (s.status === 'complete' ? 100 : s.status === 'partial' ? 50 : 0);
  }, 0);
  const sectionScore = Math.round(sectionPoints / sections.length);

  // 5.4 Formatting Score (20% weight)
  const formattingPoints = formatting.reduce((acc, f) => acc + f.score, 0);
  const formattingScore = Math.round(formattingPoints / formatting.length);

  // 5.5 Composite Overall Score (Weighted: 40% KW, 25% Skills, 15% Sections, 20% Formatting)
  const overallScore = Math.min(
    100,
    Math.max(
      0,
      Math.round(
        keywordScore * 0.40 +
        skillsScore * 0.25 +
        sectionScore * 0.15 +
        formattingScore * 0.20
      )
    )
  );

  const scoreGrade =
    overallScore >= 85 ? 'Excellent' :
    overallScore >= 70 ? 'Strong' :
    overallScore >= 50 ? 'Moderate' : 'Needs Improvement';

  const explanation =
    'Estimated ATS compatibility score calculated via deterministic multi-vector analysis: ' +
    '40% Keyword Match Density, 25% Technical Skills Taxonomy, 15% Section Completeness, ' +
    'and 20% Formatting & Readability Metrics. ResuMax AI does not claim affiliation with any commercial ATS platform.';

  const scores: AtsScoreBreakdown = {
    overallScore,
    keywordScore,
    skillsScore,
    sectionScore,
    formattingScore,
    scoreGrade,
    explanation,
  };

  // 6. Actionable Recommendations
  const recommendations = generateRecommendations(missingKeywords, sections, formatting);

  return {
    id: crypto.randomUUID(),
    userId,
    resumeId: input.resumeId,
    resumeTitle: input.resumeTitle,
    fileName: input.fileName,
    jobTitle: input.jobTitle,
    companyName: input.companyName,
    jobDescription: input.jobDescription,
    createdAt: new Date().toISOString(),
    scores,
    matchedKeywords,
    missingKeywords,
    allDetectedKeywords: allJobKeywords,
    sections,
    formatting,
    recommendations,
    wordCount,
    actionVerbCount,
    metricCount,
  };
}
