import type {
  OptimizeSummaryInput,
  OptimizeSummaryResult,
  RewriteBulletInput,
  RewriteBulletResult,
  SuggestKeywordsInput,
  SuggestKeywordsResult,
  GenerateCoverLetterInput,
  GenerateCoverLetterResult,
  SummaryAlternative,
  BulletAlternative,
  SuggestedKeyword,
  KeywordCategory,
  KeywordImportance,
} from '../types/optimizer.types';
import { SKILLS_TAXONOMY } from '@/features/analyzer/services/keywordTaxonomy';
import { extractMetrics } from './claimValidator';

/**
 * Maps taxonomy categories to optimizer KeywordCategory
 */
function mapCategory(cat: string): KeywordCategory {
  switch (cat) {
    case 'technical':
      return 'Languages';
    case 'framework':
      return 'Frameworks & Libraries';
    case 'database':
    case 'cloud':
      return 'Databases & Cloud';
    case 'tool':
      return 'Tools & DevOps';
    case 'methodology':
      return 'Methodologies';
    case 'soft_skill':
      return 'Soft Skills';
    default:
      return 'General';
  }
}

/**
 * Strips bullet symbols and leading action words
 */
function cleanBullet(bullet: string): string {
  return bullet.replace(/^[\s•\-*–—\d.)]+/, '').trim();
}

/**
 * Deterministic Bullet Rewriter
 * Adheres strictly to Google's XYZ formula:
 * "Accomplished [X] as measured by [Y] by doing [Z]"
 */
export function rewriteBulletDeterministic(input: RewriteBulletInput): RewriteBulletResult {
  const startTime = Date.now();
  const cleaned = cleanBullet(input.originalBullet);
  const existingMetrics = extractMetrics(cleaned);
  const hasOriginalMetric = existingMetrics.length > 0;

  // Determine metric or placeholder
  const metricPlaceholder = hasOriginalMetric
    ? existingMetrics.join(', ')
    : '[add measurable result if available, e.g. % increase or hours saved]';

  // Extract any recognized tools/skills from the bullet or known skills
  const skillsMentioned = (input.knownSkills || []).slice(0, 3);
  const skillsSuffix = skillsMentioned.length > 0
    ? ` using ${skillsMentioned.join(', ')}`
    : '';

  // Generate 3 structured alternatives
  const alternatives: BulletAlternative[] = [
    {
      id: crypto.randomUUID(),
      text: `Engineered and delivered ${cleaned.toLowerCase().replace(/^(?:worked on|responsible for|helped with|assisted in)\s*/i, '')}, resulting in ${metricPlaceholder}${skillsSuffix}.`,
      formula: 'XYZ',
      actionVerb: 'Engineered',
      metricsOrPlaceholders: [metricPlaceholder],
      improvements: [
        'Applied Google XYZ formula (Accomplished [X] as measured by [Y] by doing [Z])',
        'Replaced passive or descriptive phrasing with strong active verb "Engineered"',
        hasOriginalMetric
          ? 'Retained verified measurable outcome'
          : 'Added explicit bracketed placeholder for missing metric (no invented numbers)',
      ],
      requiresConfirmation: !hasOriginalMetric,
      unsupportedClaims: [],
    },
    {
      id: crypto.randomUUID(),
      text: `Streamlined ${cleaned.toLowerCase().replace(/^(?:worked on|responsible for|helped with|assisted in)\s*/i, '')} across production environments, driving ${metricPlaceholder} through automated validation and performance tuning.`,
      formula: 'Action-Result',
      actionVerb: 'Streamlined',
      metricsOrPlaceholders: [metricPlaceholder],
      improvements: [
        'Structured around direct business action and operational outcome',
        'Emphasized production reliability and workflow efficiency',
        'Prompted candidate confirmation for metric quantification',
      ],
      requiresConfirmation: !hasOriginalMetric,
      unsupportedClaims: [],
    },
    {
      id: crypto.randomUUID(),
      text: `Spearheaded technical implementation of ${cleaned.toLowerCase().replace(/^(?:worked on|responsible for|helped with|assisted in)\s*/i, '')}, improving system throughput and reliability by ${metricPlaceholder}.`,
      formula: 'Leadership-Scope',
      actionVerb: 'Spearheaded',
      metricsOrPlaceholders: [metricPlaceholder],
      improvements: [
        'Demonstrated technical initiative and system ownership',
        'Focused on measurable throughput and engineering quality',
        'Preserved original technical responsibility without title inflation',
      ],
      requiresConfirmation: !hasOriginalMetric,
      unsupportedClaims: [],
    },
  ];

  return {
    originalBullet: input.originalBullet,
    alternatives,
    provider: 'deterministic',
    isDeterministic: true,
    processingTimeMs: Date.now() - startTime,
  };
}

/**
 * Deterministic Resume Summary Optimizer
 */
export function optimizeSummaryDeterministic(input: OptimizeSummaryInput): OptimizeSummaryResult {
  const startTime = Date.now();
  const title = input.targetJobTitle || 'Software Engineer';
  const company = input.targetCompany ? ` at ${input.targetCompany}` : '';
  const skillsList = (input.skills && input.skills.length > 0)
    ? input.skills.slice(0, 5).join(', ')
    : 'modern web technologies, cloud services, and scalable architecture';

  const alternatives: SummaryAlternative[] = [
    {
      id: crypto.randomUUID(),
      text: `Results-driven ${title}${company} with extensive hands-on experience designing and scaling production systems. Proven track record in ${skillsList}, delivering high-impact features while improving system performance and developer velocity [add measurable impact if available, e.g. 35% latency reduction]. Adept at collaborating across cross-functional teams to solve complex architectural challenges.`,
      tone: 'impact-driven',
      keywordsUsed: (input.skills || []).slice(0, 4),
      rationale: 'Highlights quantifiable delivery, cross-functional collaboration, and verified technical core.',
      requiresConfirmation: true,
      suggestedPlaceholders: ['[add measurable impact if available, e.g. 35% latency reduction]'],
    },
    {
      id: crypto.randomUUID(),
      text: `Technical ${title} specializing in distributed architectures, automated pipelines, and maintainable software engineering. Core expertise includes ${skillsList}. Passionate about clean code standards, robust automated testing, and building resilient microservices aligned with target role requirements.`,
      tone: 'technical-focus',
      keywordsUsed: (input.skills || []).slice(0, 5),
      rationale: 'Focuses deeply on technical depth, architecture standards, and tooling alignment.',
      requiresConfirmation: false,
      suggestedPlaceholders: [],
    },
    {
      id: crypto.randomUUID(),
      text: `Accomplished ${title} with a strong foundation in ${skillsList}. Skilled in transforming complex business specifications into reliable, scalable software solutions. Committed to engineering excellence, technical mentorship, and accelerating delivery cycles across full software life-cycles.`,
      tone: 'executive',
      keywordsUsed: (input.skills || []).slice(0, 3),
      rationale: 'Emphasizes strategic ownership, lifecycle delivery, and engineering leadership.',
      requiresConfirmation: false,
      suggestedPlaceholders: [],
    },
  ];

  return {
    originalSummary: input.currentSummary || '',
    alternatives,
    provider: 'deterministic',
    isDeterministic: true,
    processingTimeMs: Date.now() - startTime,
  };
}

/**
 * Deterministic Keyword & Skill Suggestion Generator
 */
export function suggestKeywordsDeterministic(input: SuggestKeywordsInput): SuggestKeywordsResult {
  const startTime = Date.now();
  const lowerJD = input.jobDescription.toLowerCase();
  const lowerResume = (input.resumeTextOrSkills + ' ' + (input.existingSkills || []).join(' ')).toLowerCase();

  const detectedMap = new Map<string, { entry: (typeof SKILLS_TAXONOMY)[0]; count: number }>();

  // Scan JD against taxonomy
  for (const entry of SKILLS_TAXONOMY) {
    const terms = [entry.term, ...(entry.aliases || [])];
    let totalCount = 0;

    for (const t of terms) {
      const escaped = t.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const regex = new RegExp(`\\b${escaped}\\b`, 'gi');
      const matches = lowerJD.match(regex);
      if (matches) {
        totalCount += matches.length;
      }
    }

    if (totalCount > 0) {
      detectedMap.set(entry.term, { entry, count: totalCount });
    }
  }

  const allSuggestions: SuggestedKeyword[] = [];
  const matchedKeywords: SuggestedKeyword[] = [];
  const missingKeywords: SuggestedKeyword[] = [];
  const underEmphasizedKeywords: SuggestedKeyword[] = [];

  for (const [term, data] of detectedMap.entries()) {
    const escaped = term.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const resumeMatches = lowerResume.match(new RegExp(`\\b${escaped}\\b`, 'gi')) || [];
    const inResume = resumeMatches.length > 0;
    const isUnderEmphasized = inResume && resumeMatches.length === 1 && data.count >= 3;

    let importance: KeywordImportance = 'nice_to_have';
    if (data.count >= 3) importance = 'critical';
    else if (data.count >= 1) importance = 'important';

    const evidenceStatus = !inResume
      ? 'missing'
      : isUnderEmphasized
        ? 'under_emphasized'
        : 'in_resume';

    let suggestedSection: 'skills' | 'experience' | 'summary' | 'projects' = 'skills';
    if (data.entry.category === 'methodology' || data.entry.category === 'soft_skill') {
      suggestedSection = 'experience';
    } else if (data.count >= 4) {
      suggestedSection = 'summary';
    }

    const item: SuggestedKeyword = {
      id: crypto.randomUUID(),
      term,
      category: mapCategory(data.entry.category),
      importance,
      evidenceStatus,
      frequencyInJD: data.count,
      whyItMatters: `Mentioned ${data.count}x in target JD. Important requirement for role evaluation.`,
      suggestedSection,
      userTriageStatus: 'unreviewed',
    };

    allSuggestions.push(item);
    if (evidenceStatus === 'in_resume') {
      matchedKeywords.push(item);
    } else if (evidenceStatus === 'missing') {
      missingKeywords.push(item);
    } else {
      underEmphasizedKeywords.push(item);
    }
  }

  // Sort by frequency descending
  const sorter = (a: SuggestedKeyword, b: SuggestedKeyword) => b.frequencyInJD - a.frequencyInJD;
  allSuggestions.sort(sorter);
  matchedKeywords.sort(sorter);
  missingKeywords.sort(sorter);
  underEmphasizedKeywords.sort(sorter);

  return {
    matchedKeywords,
    missingKeywords,
    underEmphasizedKeywords,
    allSuggestions,
    provider: 'deterministic',
    isDeterministic: true,
    processingTimeMs: Date.now() - startTime,
  };
}

/**
 * Deterministic Cover Letter Generator
 */
export function generateCoverLetterDeterministic(input: GenerateCoverLetterInput): GenerateCoverLetterResult {
  const startTime = Date.now();
  const candidate = input.candidateName || 'Candidate';
  const role = input.jobTitle;
  const company = input.companyName;
  const recipient = input.hiringManagerName || 'Hiring Team';

  const skillsHighlight = (input.skills && input.skills.length > 0)
    ? input.skills.slice(0, 4).join(', ')
    : 'modern software development and scalable engineering';

  const achievementNote = (input.keyAchievements && input.keyAchievements.length > 0)
    ? input.keyAchievements[0]
    : '[describe a notable project accomplishment or measurable outcome from your recent experience]';

  const subjectLine = `Application for ${role} — ${candidate}`;

  const content = `Dear ${recipient},

I am writing to express my strong enthusiasm for the ${role} position at ${company}. Having reviewed the requirements and engineering priorities outlined in your job posting, I am confident that my technical background and problem-solving approach make me a strong candidate for your team.

Throughout my career, I have focused on building scalable, reliable software systems utilizing ${skillsHighlight}. Most recently, I have ${achievementNote}. My work has consistently emphasized high code quality, automated test coverage, and close cross-functional collaboration to deliver user-focused outcomes on schedule.

What particularly attracts me to ${company} is your commitment to technical innovation and high-standard product execution. I am excited about the opportunity to contribute directly to your upcoming milestones and bring my hands-on expertise in ${skillsHighlight} to your engineering initiatives.

Thank you very much for your time and consideration. I would welcome the opportunity to discuss how my verified experience and technical skills align with the goals of ${company}.

Sincerely,
${candidate}
${input.professionalTitle || 'Software Engineer'}`.trim();

  return {
    content,
    subjectLine,
    usedResumeEvidence: (input.skills || []).slice(0, 4),
    requiresConfirmation: true,
    suggestedPlaceholders: [
      '[describe a notable project accomplishment or measurable outcome from your recent experience]',
    ],
    provider: 'deterministic',
    isDeterministic: true,
    processingTimeMs: Date.now() - startTime,
  };
}
