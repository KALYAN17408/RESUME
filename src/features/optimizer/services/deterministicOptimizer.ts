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
  BulletStrategy,
} from '../types/optimizer.types';
import { SKILLS_TAXONOMY } from '@/features/analyzer/services/keywordTaxonomy';
import { extractMetrics } from './claimValidator';

/**
 * Common modern transferable skill relationship map
 * Maps existing skill -> related / transferable target skills
 */
const TRANSFERABLE_SKILL_MAP: Record<string, string[]> = {
  react: ['next.js', 'react native', 'redux', 'remix', 'vue.js'],
  typescript: ['javascript', 'node.js', 'full-stack', 'modern web'],
  javascript: ['typescript', 'node.js', 'es6+', 'frontend'],
  python: ['fastapi', 'flask', 'django', 'data analysis', 'pandas', 'pytorch', 'machine learning'],
  'node.js': ['express', 'nest.js', 'rest apis', 'microservices', 'graphql'],
  postgresql: ['sql', 'mysql', 'database design', 'prisma', 'indexing', 'redis'],
  sql: ['postgresql', 'mysql', 'database architecture', 'query optimization'],
  docker: ['kubernetes', 'containerization', 'ci/cd', 'cloud deployments'],
  aws: ['cloud computing', 'serverless', 'lambda', 's3', 'ec2', 'cloud architecture'],
  git: ['github', 'version control', 'ci/cd', 'collaborative workflows'],
  html: ['css', 'tailwind css', 'responsive design', 'web standards'],
  tailwind: ['css', 'responsive web', 'modern ui/ux'],
};

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
 * Strips bullet symbols, numbers, and leading weak action verbs
 */
function cleanBullet(bullet: string): string {
  return bullet
    .replace(/^[\s•\-*–—\d.)]+/, '')
    .replace(/^(?:worked on|responsible for|helped with|assisted in|participated in|tasked with|was involved in)\s+/i, '')
    .trim();
}

/**
 * Token overlap / Jaccard similarity between two strings
 */
function computeTokenSimilarity(strA: string, strB: string): number {
  const tokenize = (s: string) =>
    new Set(
      s
        .toLowerCase()
        .replace(/[^a-z0-9\s]/g, '')
        .split(/\s+/)
        .filter((w) => w.length > 2)
    );

  const setA = tokenize(strA);
  const setB = tokenize(strB);
  if (setA.size === 0 || setB.size === 0) return 0;

  let intersection = 0;
  for (const token of setA) {
    if (setB.has(token)) intersection++;
  }

  const union = new Set([...setA, ...setB]).size;
  return union === 0 ? 0 : intersection / union;
}

// ----------------------------------------------------------------------------
// 1. INTELLIGENT RESUME BULLET REWRITER (6 Strategies + Anti-Duplication)
// ----------------------------------------------------------------------------

export function rewriteBulletDeterministic(input: RewriteBulletInput): RewriteBulletResult {
  const startTime = Date.now();
  const cleaned = cleanBullet(input.originalBullet);
  const existingMetrics = extractMetrics(cleaned);
  const hasOriginalMetric = existingMetrics.length > 0;

  const metricPlaceholder = hasOriginalMetric
    ? existingMetrics.join(', ')
    : '[add measurable result if available, e.g. % increase or hours saved]';

  const knownSkills = input.knownSkills || [];
  const primarySkill = knownSkills[0] || '';
  const secondarySkill = knownSkills[1] || '';
  const skillsSuffix = primarySkill ? ` utilizing ${primarySkill}${secondarySkill ? ` and ${secondarySkill}` : ''}` : '';

  // Determine cycle count / generation offset based on previous generations history
  const previousGen = input.previousGenerations || [];
  const cycle = previousGen.length;

  // Verb banks partitioned across generation cycles to guarantee distinct alternatives
  const verbBanks = {
    technical: ['Engineered', 'Constructed', 'Implemented', 'Refactored', 'Deployed', 'Configured'],
    action: ['Streamlined', 'Orchestrated', 'Architected', 'Spearheaded', 'Championed', 'Executed'],
    impact: ['Maximized', 'Accelerated', 'Elevated', 'Optimized', 'Transformed', 'Drove'],
    concise: ['Delivered', 'Built', 'Resolved', 'Launched', 'Unified', 'Scaled'],
    achievement: ['Accomplished', 'Pioneered', 'Automated', 'Spearheaded', 'Decreased', 'Increased'],
    jobTargeted: ['Integrated', 'Standardized', 'Modernized', 'Provisioned', 'Formulated', 'Hardened'],
  };

  const getVerb = (bank: keyof typeof verbBanks, offset = 0) => {
    const list = verbBanks[bank];
    return list[(cycle + offset) % list.length];
  };

  // Extract relevant keywords from JD if provided
  let jdKeyword = '';
  if (input.jobDescription && input.jobDescription.length > 10) {
    const lowerJD = input.jobDescription.toLowerCase();
    const commonTech = ['api', 'ci/cd', 'microservices', 'cloud', 'pipeline', 'database', 'performance', 'scalability', 'security', 'docker'];
    for (const tech of commonTech) {
      if (lowerJD.includes(tech)) {
        jdKeyword = tech.toUpperCase();
        break;
      }
    }
  }

  // 6 Available Strategy Generators with metric prompts to prevent hallucination
  const strategyGenerators: Record<
    BulletStrategy,
    (offset: number) => { text: string; actionVerb: string; formula: string; improvements: string[] }
  > = {
    'achievement-oriented': (off) => {
      const verb = getVerb('technical', off);
      return {
        text: `${verb} and delivered ${cleaned.toLowerCase()}${skillsSuffix}, resulting in ${metricPlaceholder}.`,
        actionVerb: verb,
        formula: 'XYZ',
        improvements: [
          'Applied Google XYZ formula (Accomplished [X] as measured by [Y] by doing [Z])',
          `Replaced passive phrasing with strong initiative verb "${verb}"`,
          hasOriginalMetric
            ? 'Retained candidate-verified performance statistics'
            : 'Added explicit bracketed placeholder prompting candidate evidence rather than fabricating numbers',
        ],
      };
    },
    'action-oriented': (off) => {
      const verb = getVerb('action', off);
      return {
        text: `${verb} end-to-end development of ${cleaned.toLowerCase()} across production workflows, achieving ${metricPlaceholder} through automated validation.`,
        actionVerb: verb,
        formula: 'Action-Result',
        improvements: [
          `Replaced passive phrasing with strong initiative verb "${verb}"`,
          'Emphasized direct engineering ownership and proactive project delivery',
          hasOriginalMetric
            ? 'Retained verified measurable outcome'
            : 'Prompted candidate confirmation for metric quantification without fabricating data',
        ],
      };
    },
    'impact-oriented': (off) => {
      const verb = getVerb('impact', off);
      return {
        text: `${verb} operational throughput and performance for ${cleaned.toLowerCase()}, driving ${metricPlaceholder} across production workflows.`,
        actionVerb: verb,
        formula: 'Impact-Oriented',
        improvements: [
          `Focused directly on quantifiable business and operational outcomes ("${verb}")`,
          hasOriginalMetric
            ? 'Preserved candidate-verified performance statistics'
            : 'Added explicit bracket placeholder prompting candidate evidence rather than fabricating numbers',
          'Framed responsibilities around production stability and throughput',
        ],
      };
    },
    'technical-oriented': (off) => {
      const verb = getVerb('technical', off + 1);
      return {
        text: `${verb} robust implementation of ${cleaned.toLowerCase()}${skillsSuffix}, improving system throughput by ${metricPlaceholder} with modern architecture standards.`,
        actionVerb: verb,
        formula: 'Leadership-Scope',
        improvements: [
          `Highlighted hands-on implementation tools and technical depth with "${verb}"`,
          knownSkills.length > 0
            ? `Integrated verified candidate technologies (${primarySkill})`
            : 'Emphasized architecture standards and clean code conventions',
          'Showcased test automation and engineering rigour',
        ],
      };
    },
    'concise-oriented': (off) => {
      const verb = getVerb('concise', off);
      return {
        text: `${verb} ${cleaned.toLowerCase()}, eliminating workflow redundancies and achieving ${metricPlaceholder}.`,
        actionVerb: verb,
        formula: 'Concise',
        improvements: [
          `Streamlined narrative down to direct action ("${verb}") and outcome`,
          'Eliminated passive filler and wordiness for high-speed recruiter scanning',
          'Preserved core responsibility without title or metric inflation',
        ],
      };
    },
    'job-targeted': (off) => {
      const verb = getVerb('jobTargeted', off);
      const targetClause = jdKeyword ? ` aligned with target ${jdKeyword} requirements` : ' aligned with role specifications';
      return {
        text: `${verb} ${cleaned.toLowerCase()}${targetClause}, advancing system reliability and achieving ${metricPlaceholder}.`,
        actionVerb: verb,
        formula: 'Job-Targeted',
        improvements: [
          `Tailored vocabulary to target job description${jdKeyword ? ` (${jdKeyword})` : ''}`,
          `Led with active technical verb "${verb}"`,
          'Mapped candidate achievement to target role competencies',
        ],
      };
    },
  };

  // Determine which 3 strategies to generate
  const allStrategies: BulletStrategy[] = [
    'achievement-oriented',
    'action-oriented',
    'technical-oriented',
    'impact-oriented',
    'concise-oriented',
    'job-targeted',
  ];

  let selectedStrategies: BulletStrategy[];
  if (input.strategy) {
    selectedStrategies = [
      input.strategy,
      allStrategies[(allStrategies.indexOf(input.strategy) + 1 + cycle) % allStrategies.length],
      allStrategies[(allStrategies.indexOf(input.strategy) + 2 + cycle) % allStrategies.length],
    ];
  } else {
    // Default strategies: XYZ ('achievement-oriented'), Action-Result ('action-oriented'), Leadership ('technical-oriented')
    // When cycling, rotate to give fresh formulations
    const startIdx = cycle % allStrategies.length;
    selectedStrategies = [
      allStrategies[startIdx],
      allStrategies[(startIdx + 1) % allStrategies.length],
      allStrategies[(startIdx + 2) % allStrategies.length],
    ];
  }

  // Generate alternatives, ensuring none duplicate previous generations
  const alternatives: BulletAlternative[] = [];

  selectedStrategies.forEach((strat, index) => {
    let candidate = strategyGenerators[strat](index);

    // If candidate has high similarity (>0.75) with any previously generated text, cycle offset
    let attempts = 0;
    while (
      previousGen.some((prev) => computeTokenSimilarity(candidate.text, prev) > 0.75) &&
      attempts < 5
    ) {
      attempts++;
      candidate = strategyGenerators[strat](index + attempts);
    }

    alternatives.push({
      id: crypto.randomUUID(),
      text: candidate.text,
      formula: candidate.formula as any,
      actionVerb: candidate.actionVerb,
      metricsOrPlaceholders: [metricPlaceholder],
      improvements: candidate.improvements,
      requiresConfirmation: !hasOriginalMetric,
      unsupportedClaims: [],
    });
  });

  return {
    originalBullet: input.originalBullet,
    alternatives,
    provider: 'deterministic',
    isDeterministic: true,
    processingTimeMs: Date.now() - startTime,
  };
}

// ----------------------------------------------------------------------------
// 2. INTELLIGENT PROFESSIONAL SUMMARY OPTIMIZER (Fresher vs Experienced + 3 Alts)
// ----------------------------------------------------------------------------

export function optimizeSummaryDeterministic(input: OptimizeSummaryInput): OptimizeSummaryResult {
  const startTime = Date.now();
  const title = input.targetJobTitle || 'Software Engineer';
  const company = input.targetCompany ? ` at ${input.targetCompany}` : '';
  const verifiedSkills = (input.skills && input.skills.length > 0)
    ? input.skills
    : ['modern web architecture', 'clean code', 'distributed systems'];
  const skillsList = verifiedSkills.slice(0, 5).join(', ');

  const profile = input.candidateProfile || {};
  const isFresher = profile.isFresher === true || profile.totalYearsExperience === 0;
  const cycle = (input.previousGenerations || []).length;

  const previousGen = input.previousGenerations || [];

  // 3 Required Distinct Alternatives:
  // 1. Professional and concise
  // 2. Skills and technical strengths focused
  // 3. Target-role aligned

  let alt1Text = '';
  let alt2Text = '';
  let alt3Text = '';

  if (isFresher) {
    // Truthful, grounded summaries for candidates with academic projects / early-career backgrounds
    const openers1 = [
      `Motivated and detail-oriented ${title}${company} with a solid foundation in computer science and practical project engineering.`,
      `Dedicated early-career ${title}${company} passionate about building reliable software and mastering modern development practices.`,
      `Analytical ${title}${company} committed to engineering excellence, scalable architectures, and rapid technical adaptation.`,
    ];
    const opener1 = openers1[cycle % openers1.length];

    alt1Text = `${opener1} Hands-on experience developing projects using ${skillsList}. Proven ability to collaborate effectively, write maintainable code, and deliver functional solutions [add project highlight or academic GPA if available].`;

    alt2Text = `Technical ${title} focused on core competencies in ${skillsList}. Demonstrated proficiency across software lifecycles through end-to-end coursework and independent software projects. Skilled at algorithm design, API integration, and clean code paradigms.`;

    alt3Text = `Aspiring ${title}${company} eager to apply practical knowledge in ${skillsList} to high-standard team initiatives. Driven to contribute immediately to engineering goals while rapidly assimilating production workflows and testing practices.`;
  } else {
    // Grounded summaries for experienced professionals
    const openers1 = [
      `Results-driven ${title}${company} with demonstrated expertise in engineering high-reliability software.`,
      `Experienced ${title}${company} with a proven track record of architecting scalable systems and driving product delivery.`,
      `Senior-level ${title}${company} specializing in modern software design and robust engineering execution.`,
    ];
    const opener1 = openers1[cycle % openers1.length];

    alt1Text = `${opener1} Extensive hands-on experience utilizing ${skillsList} to optimize application performance [add measurable impact if available, e.g. 35% latency reduction]. Adept at translating complex specifications into clean, production-ready deliverables.`;

    alt2Text = `Technical ${title} specializing in distributed architectures, automated pipelines, and maintainable software engineering. Core technical stack includes ${skillsList}. Passionate about clean code standards, robust automated testing, and building resilient microservices aligned with target role requirements.`;

    alt3Text = `Accomplished ${title} with a strong foundation in ${skillsList}. Skilled in transforming complex business specifications into reliable, scalable software solutions. Committed to engineering excellence, technical mentorship, and accelerating delivery cycles across full software life-cycles.`;
  }

  // Diversity check: adjust phrasing if candidate text was already generated in this session
  if (previousGen.includes(alt1Text)) {
    alt1Text = alt1Text.replace('Hands-on experience', 'Demonstrated proficiency in');
  }

  const alternatives: SummaryAlternative[] = [
    {
      id: crypto.randomUUID(),
      text: alt1Text,
      tone: 'professional-concise',
      keywordsUsed: verifiedSkills.slice(0, 4),
      rationale: isFresher
        ? 'Concise, truthful representation of foundational technical capabilities and project delivery.'
        : 'Tight executive overview highlighting verified technical core and production delivery.',
      requiresConfirmation: isFresher,
      suggestedPlaceholders: isFresher
        ? ['[add project highlight or academic GPA if available]']
        : ['[add measurable impact if available, e.g. 35% latency reduction]'],
    },
    {
      id: crypto.randomUUID(),
      text: alt2Text,
      tone: 'skills-focused',
      keywordsUsed: verifiedSkills.slice(0, 5),
      rationale: 'Spotlights specific technical languages, frameworks, and architecture standards.',
      requiresConfirmation: false,
      suggestedPlaceholders: [],
    },
    {
      id: crypto.randomUUID(),
      text: alt3Text,
      tone: 'role-aligned',
      keywordsUsed: verifiedSkills.slice(0, 3),
      rationale: `Directly aligns candidate's verified skill set with target role objectives${company}.`,
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

// ----------------------------------------------------------------------------
// 3. INTELLIGENT KEYWORDS & SKILLS (4 Distinct Groups + Context Awareness)
// ----------------------------------------------------------------------------

export function suggestKeywordsDeterministic(input: SuggestKeywordsInput): SuggestKeywordsResult {
  const startTime = Date.now();
  const lowerJD = (input.jobDescription || '').toLowerCase();
  const lowerResume = (
    (input.resumeTextOrSkills || '') +
    ' ' +
    (input.existingSkills || []).join(' ')
  ).toLowerCase();

  const detectedMap = new Map<
    string,
    {
      term: string;
      category: KeywordCategory;
      count: number;
    }
  >();

  // 1. Scan curated taxonomy against JD
  for (const entry of SKILLS_TAXONOMY) {
    const terms = [entry.term, ...(entry.aliases || [])];
    let count = 0;
    for (const t of terms) {
      const escaped = t.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const matches = lowerJD.match(new RegExp(`\\b${escaped}\\b`, 'gi'));
      if (matches) count += matches.length;
    }
    if (count > 0) {
      detectedMap.set(entry.term, {
        term: entry.term,
        category: mapCategory(entry.category),
        count,
      });
    }
  }

  // 2. Dynamic token scanning for modern terms not in legacy taxonomy (e.g. Next.js, FastAPI, Redis, etc.)
  const modernTechList: Array<{ term: string; category: KeywordCategory }> = [
    { term: 'Next.js', category: 'Frameworks & Libraries' },
    { term: 'Tailwind CSS', category: 'Frameworks & Libraries' },
    { term: 'FastAPI', category: 'Frameworks & Libraries' },
    { term: 'GraphQL', category: 'Frameworks & Libraries' },
    { term: 'Redis', category: 'Databases & Cloud' },
    { term: 'Supabase', category: 'Databases & Cloud' },
    { term: 'PostgreSQL', category: 'Databases & Cloud' },
    { term: 'MongoDB', category: 'Databases & Cloud' },
    { term: 'Docker', category: 'Tools & DevOps' },
    { term: 'Kubernetes', category: 'Tools & DevOps' },
    { term: 'CI/CD', category: 'Tools & DevOps' },
    { term: 'GitHub Actions', category: 'Tools & DevOps' },
    { term: 'Vitest', category: 'Tools & DevOps' },
    { term: 'Jest', category: 'Tools & DevOps' },
    { term: 'Microservices', category: 'Methodologies' },
    { term: 'REST APIs', category: 'Methodologies' },
    { term: 'System Design', category: 'Methodologies' },
    { term: 'Agile', category: 'Methodologies' },
  ];

  for (const item of modernTechList) {
    if (!detectedMap.has(item.term)) {
      const escaped = item.term.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      const matches = lowerJD.match(new RegExp(`\\b${escaped}\\b`, 'gi'));
      if (matches && matches.length > 0) {
        detectedMap.set(item.term, {
          term: item.term,
          category: item.category,
          count: matches.length,
        });
      }
    }
  }

  // 4 Distinct Recommendation Groups Required:
  // 1. Already present in resume (matchedKeywords)
  // 2. Relevant but missing from resume (missingKeywords)
  // 3. Related or transferable skills (transferableKeywords)
  // 4. Suggested learning goals (learningGoalKeywords)

  const matchedKeywords: SuggestedKeyword[] = [];
  const missingKeywords: SuggestedKeyword[] = [];
  const transferableKeywords: SuggestedKeyword[] = [];
  const learningGoalKeywords: SuggestedKeyword[] = [];
  const allSuggestions: SuggestedKeyword[] = [];

  for (const [term, data] of detectedMap.entries()) {
    const escaped = term.toLowerCase().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const resumeMatches = lowerResume.match(new RegExp(`\\b${escaped}\\b`, 'gi')) || [];
    const inResume = resumeMatches.length > 0;
    const isUnderEmphasized = inResume && resumeMatches.length === 1 && data.count >= 3;

    // Determine importance
    let importance: KeywordImportance = 'nice_to_have';
    if (data.count >= 3) importance = 'critical';
    else if (data.count >= 1) importance = 'important';

    // Check if transferable based on candidate's existing skills
    let isTransferable = false;
    let transferableReason = '';
    const lowerTerm = term.toLowerCase();

    for (const [knownSkill, siblings] of Object.entries(TRANSFERABLE_SKILL_MAP)) {
      if (lowerResume.includes(knownSkill) && siblings.some((s) => s.includes(lowerTerm) || lowerTerm.includes(s))) {
        isTransferable = true;
        transferableReason = `Transferable from candidate's verified background in ${knownSkill.toUpperCase()}.`;
        break;
      }
    }

    const evidenceStatus = inResume
      ? isUnderEmphasized
        ? 'under_emphasized'
        : 'in_resume'
      : 'missing';

    let suggestedSection: 'skills' | 'experience' | 'summary' | 'projects' = 'skills';
    if (data.category === 'Methodologies' || data.category === 'Soft Skills') {
      suggestedSection = 'experience';
    } else if (data.count >= 4) {
      suggestedSection = 'summary';
    }

    let suggestedAction = '';
    if (inResume) {
      suggestedAction = isUnderEmphasized
        ? 'Under-emphasized: Reinforce in recent experience or project highlights.'
        : 'Verified matched: Retain prominent placement in technical skills.';
    } else if (isTransferable) {
      suggestedAction = `Transferable competency: Confirm hands-on familiarity or bridge from ${transferableReason}`;
    } else if (importance === 'critical') {
      suggestedAction = 'Critical requirement: Confirm practical experience or add as primary learning goal.';
    } else {
      suggestedAction = 'Optional skill: Review target posting relevance before staging.';
    }

    const item: SuggestedKeyword = {
      id: crypto.randomUUID(),
      term: data.term,
      category: data.category,
      importance,
      evidenceStatus,
      frequencyInJD: data.count,
      whyItMatters: `Mentioned ${data.count}x in target JD. Important requirement for role evaluation.${transferableReason ? ' ' + transferableReason : ''}`,
      suggestedSection,
      userTriageStatus: 'unreviewed',
      suggestedAction,
      isTransferable,
      isLearningGoal: !inResume && !isTransferable,
    };

    allSuggestions.push(item);

    if (inResume) {
      matchedKeywords.push(item);
    } else if (isTransferable) {
      transferableKeywords.push(item);
      missingKeywords.push(item); // Also keep in missing for backward compatibility
    } else if (importance === 'critical' || importance === 'important') {
      missingKeywords.push(item);
    } else {
      learningGoalKeywords.push(item);
      missingKeywords.push(item);
    }
  }

  // Populate learning goals from critical missing items
  for (const item of missingKeywords) {
    if (!transferableKeywords.includes(item) && !learningGoalKeywords.includes(item)) {
      learningGoalKeywords.push(item);
    }
  }

  // Sort descending by frequency in JD
  const sorter = (a: SuggestedKeyword, b: SuggestedKeyword) => b.frequencyInJD - a.frequencyInJD;
  allSuggestions.sort(sorter);
  matchedKeywords.sort(sorter);
  missingKeywords.sort(sorter);
  transferableKeywords.sort(sorter);
  learningGoalKeywords.sort(sorter);

  const underEmphasizedKeywords = matchedKeywords.filter((k) => k.evidenceStatus === 'under_emphasized');

  return {
    matchedKeywords,
    missingKeywords,
    underEmphasizedKeywords,
    transferableKeywords,
    learningGoalKeywords,
    allSuggestions,
    provider: 'deterministic',
    isDeterministic: true,
    processingTimeMs: Date.now() - startTime,
  };
}

// ----------------------------------------------------------------------------
// 4. INTELLIGENT COVER LETTER GENERATOR (Role & Project Grounded)
// ----------------------------------------------------------------------------

export function generateCoverLetterDeterministic(input: GenerateCoverLetterInput): GenerateCoverLetterResult {
  const startTime = Date.now();
  const candidate = input.candidateName || 'Candidate';
  const role = input.jobTitle || 'Software Engineer';
  const company = input.companyName || 'Hiring Company';
  const recipient = input.hiringManagerName || 'Hiring Team';

  const skillsList = (input.skills && input.skills.length > 0)
    ? input.skills.slice(0, 5).join(', ')
    : 'modern web engineering, distributed systems, and automated testing';

  const projects = input.projects || [];
  const experiences = input.experiences || [];
  const educations = input.educations || [];
  const cycle = (input.previousGenerations || []).length;

  // Narrative achievement story drawn from actual candidate achievements, projects, or experiences
  let achievementStory = '';
  if (input.keyAchievements && input.keyAchievements.length > 0) {
    achievementStory = cleanBullet(input.keyAchievements[0]);
  } else if (projects.length > 0) {
    const p = projects[0];
    const tech = p.technologies && p.technologies.length > 0 ? ` using ${p.technologies.join(', ')}` : '';
    achievementStory = `developed "${p.name}"${tech}, focusing on modular architecture, reliable data flow, and intuitive user experiences`;
  } else if (experiences.length > 0 && experiences[0].highlights && experiences[0].highlights.length > 0) {
    achievementStory = cleanBullet(experiences[0].highlights[0]).toLowerCase();
  } else {
    achievementStory = '[describe a notable project accomplishment or measurable outcome from your recent experience]';
  }

  // Education / degree signal
  let educationSignal = '';
  if (educations.length > 0) {
    educationSignal = `My academic foundation in ${educations[0].degree} from ${educations[0].institution} has provided me with rigorous fundamentals in system design and algorithmic problem-solving. `;
  }

  // Openings partitioned by regeneration cycle
  const openings = [
    `I am writing to express my enthusiastic interest in the ${role} position at ${company}. Having followed ${company}'s technical innovations and commitment to engineering excellence, I am eager to contribute my background in ${skillsList} to your engineering team.`,
    `I am thrilled to apply for the ${role} opening at ${company}. With a strong foundation in ${skillsList} and a passion for building resilient, user-focused software, I am confident in my ability to make an immediate impact on your upcoming milestones.`,
    `It is with great enthusiasm that I submit my application for the ${role} role at ${company}. Your mission and high-standard product execution strongly resonate with my technical trajectory and hands-on experience in ${skillsList}.`,
  ];
  const opening = openings[cycle % openings.length];

  const subjectLine = `Application for ${role} — ${candidate}`;

  const content = `Dear ${recipient},

${opening}

${educationSignal}Throughout my engineering journey, I have focused on writing clean, maintainable code and building high-performance applications utilizing ${skillsList}. In my recent work, I ${achievementStory}. My technical approach emphasizes automated testing, structured code reviews, and thoughtful cross-functional collaboration to deliver robust features on schedule.

What excites me most about joining ${company} is the opportunity to solve challenging technical problems in a high-caliber environment. I am eager to apply my verified competencies in ${skillsList} to advance your product architecture and help scale your software capabilities.

Thank you very much for your time and consideration. I would welcome the opportunity to discuss how my technical skills and proactive problem-solving mindset align with the goals of ${company}.

Sincerely,
${candidate}
${input.professionalTitle || 'Software Engineer'}`.trim();

  return {
    content,
    subjectLine,
    usedResumeEvidence: (input.skills || []).slice(0, 5),
    requiresConfirmation: !projects.length && !experiences.length,
    suggestedPlaceholders: achievementStory.includes('[') ? [achievementStory] : [],
    provider: 'deterministic',
    isDeterministic: true,
    processingTimeMs: Date.now() - startTime,
  };
}
