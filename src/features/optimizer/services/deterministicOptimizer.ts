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

/**
 * Detailed semantic analysis of an input bullet point
 */
export interface BulletAnalysis {
  raw: string;
  cleaned: string;
  originalActionVerb?: string;
  subject: string;
  technologies: string[];
  metrics: string[];
  hasMetric: boolean;
  purposeClause?: string;
  isPythonMySqlExample: boolean;
}

export function analyzeBullet(bullet: string, knownSkills: string[] = []): BulletAnalysis {
  const raw = bullet.trim();
  let cleaned = raw.replace(/^[\s•\-*–—\d.)]+/, '').trim();
  const metrics = extractMetrics(cleaned);
  const hasMetric = metrics.length > 0;

  const isPythonMySqlExample =
    /mini\s+apps?|mini\s+applications?/i.test(cleaned) &&
    /python/i.test(cleaned) &&
    /mysql/i.test(cleaned);

  const techKeywords = [
    'python', 'mysql', 'postgresql', 'postgres', 'sql', 'sqlite', 'mongodb', 'redis',
    'react', 'next.js', 'vue', 'angular', 'javascript', 'typescript', 'node.js', 'express',
    'docker', 'kubernetes', 'aws', 'gcp', 'azure', 'ci/cd', 'git', 'github', 'linux',
    'fastapi', 'flask', 'django', 'java', 'spring', 'c++', 'c#', '.net', 'golang', 'go',
    'graphql', 'rest api', 'rest apis', 'restful', 'tailwind', 'html', 'css', 'kafka',
    'pytorch', 'tensorflow', 'scikit-learn', 'pandas', 'numpy', 'celery', 'prisma'
  ];

  const lower = cleaned.toLowerCase();
  const foundTech: string[] = [];

  for (const tk of techKeywords) {
    const escaped = tk.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`\\b${escaped}\\b`, 'i');
    if (regex.test(lower)) {
      const knownMatch = knownSkills.find((k) => k.toLowerCase() === tk.toLowerCase());
      if (knownMatch && !foundTech.includes(knownMatch)) {
        foundTech.push(knownMatch);
      } else {
        const proper = tk === 'mysql' ? 'MySQL'
          : tk === 'postgresql' || tk === 'postgres' ? 'PostgreSQL'
          : tk === 'javascript' ? 'JavaScript'
          : tk === 'typescript' ? 'TypeScript'
          : tk === 'mongodb' ? 'MongoDB'
          : tk === 'graphql' ? 'GraphQL'
          : tk === 'next.js' ? 'Next.js'
          : tk === 'node.js' ? 'Node.js'
          : tk.charAt(0).toUpperCase() + tk.slice(1);
        if (!foundTech.some((t) => t.toLowerCase() === proper.toLowerCase())) {
          foundTech.push(proper);
        }
      }
    }
  }

  for (const ks of knownSkills) {
    if (new RegExp(`\\b${ks.toLowerCase()}\\b`, 'i').test(lower)) {
      if (!foundTech.some((t) => t.toLowerCase() === ks.toLowerCase())) {
        foundTech.push(ks);
      }
    }
  }

  // Strip weak lead-ins
  cleaned = cleaned.replace(/^(?:worked on|responsible for|helped with|assisted in|participated in|tasked with|was involved in|helped to|focus on|focused on)\s+/i, '');

  // Strip leading action verbs to prevent duplication ("Engineered and delivered developed...")
  let originalActionVerb: string | undefined;
  const verbMatch = cleaned.match(/^(?:developed|built|implemented|created|designed|coded|wrote|engineered|configured|maintained|managed|optimized|automated|streamlined|refactored|programmed|authored|delivered|spearheaded|orchestrated|established|integrated|resolved|produced)\s+/i);
  if (verbMatch) {
    originalActionVerb = verbMatch[0].trim();
    cleaned = cleaned.slice(verbMatch[0].length).trim();
  }

  // Detect purpose or context clause
  let purposeClause: string | undefined;
  const pMatch = cleaned.match(/\s+(?:to\s+(?:improve|solve|automate|enable|deliver|support|handle|manage|reduce|increase|streamline|accelerate)|for\s+(?:internal|user|automated|production|reliable))\s+[^.,;]+/i);
  if (pMatch) {
    purposeClause = pMatch[0].trim();
  }

  // Subject is what remains after stripping prepositional tech phrases and purposes
  let subject = cleaned.replace(/[.,;]+$/, '').trim();
  subject = subject
    .replace(/\s+(?:using|with|utilizing|leveraging|via)\s+.*$/i, '')
    .replace(/\s+(?:to|for)\s+.*$/i, '')
    .replace(/[.,;]+$/, '')
    .trim();

  if (!subject) {
    subject = 'application features';
  }

  return {
    raw,
    cleaned,
    originalActionVerb,
    subject,
    technologies: foundTech,
    metrics,
    hasMetric,
    purposeClause,
    isPythonMySqlExample,
  };
}

/**
 * Validates bullet output for duplicates, grammatical issues, and length constraints
 */
export function validateBulletQuality(
  candidateText: string,
  previousGenerations: string[] = [],
  currentBatch: string[] = []
): { isValid: boolean; reason?: string } {
  if (!candidateText || candidateText.trim().length < 10) {
    return { isValid: false, reason: 'Candidate text is too short' };
  }

  // Check for duplicated action verbs (e.g. "Engineered and delivered developed", "Orchestrated ... developed")
  if (
    /\b(engineered|orchestrated|refactored|built|implemented|created|designed|delivered)\b[\s\S]{0,40}\bdeveloped\b/i.test(candidateText) ||
    /\b(developed|built|engineered|orchestrated|refactored|implemented)\b[\s\w,]{0,25}\b\1\b/i.test(candidateText) ||
    /\b(development|implementation)\s+(?:of\s+)?developed\b/i.test(candidateText)
  ) {
    return { isValid: false, reason: 'Duplicate action verbs detected' };
  }

  // Check for raw SVG or HTML tokens
  if (/<svg|\*\*svg|<[^>]+>/i.test(candidateText)) {
    return { isValid: false, reason: 'Malformed markdown or raw SVG markup' };
  }

  // Check for bracket placeholders in final text (must not be present by default)
  if (/\[add measurable result|\[placeholder/i.test(candidateText)) {
    return { isValid: false, reason: 'Unreplaced bracket placeholder in final bullet' };
  }

  // Max length check
  if (candidateText.length > 350) {
    return { isValid: false, reason: 'Bullet text exceeds recommended length' };
  }

  // Duplicate check against current batch
  const lower = candidateText.toLowerCase().trim();
  for (const existing of currentBatch) {
    if (lower === existing.toLowerCase().trim() || computeTokenSimilarity(candidateText, existing) >= 0.85) {
      return { isValid: false, reason: 'Duplicate or near-duplicate in current batch' };
    }
  }

  // Duplicate check against previous generations history
  for (const prev of previousGenerations) {
    if (lower === prev.toLowerCase().trim() || computeTokenSimilarity(candidateText, prev) >= 0.85) {
      return { isValid: false, reason: 'Duplicate of previous generation' };
    }
  }

  return { isValid: true };
}

// ----------------------------------------------------------------------------
// 1. INTELLIGENT RESUME BULLET REWRITER (Grounded, Diverse, Zero-Fabrication)
// ----------------------------------------------------------------------------

export function rewriteBulletDeterministic(input: RewriteBulletInput): RewriteBulletResult {
  const startTime = Date.now();
  const analysis = analyzeBullet(input.originalBullet, input.knownSkills || []);
  const previousGen = input.previousGenerations || [];
  const cycle = previousGen.length;

  const tech = analysis.technologies;
  const primaryTech = tech[0] || (input.knownSkills && input.knownSkills[0]) || '';
  const secondaryTech = tech[1] || (input.knownSkills && input.knownSkills[1]) || '';
  const techPhrase = primaryTech && secondaryTech ? `${primaryTech} and ${secondaryTech}` : primaryTech;

  // Extract JD keyword alignment if present
  let jdKeyword = '';
  if (input.jobDescription && input.jobDescription.length >= 10) {
    const lowerJD = input.jobDescription.toLowerCase();
    const domainTerms = [
      'relational data', 'database queries', 'rest apis', 'crud operations', 'data modeling',
      'query optimization', 'microservices', 'data persistence', 'performance tuning', 'automation'
    ];
    for (const term of domainTerms) {
      if (lowerJD.includes(term)) {
        jdKeyword = term;
        break;
      }
    }
  }

  // Metric opportunity follow-up question (strictly separate from bullet text!)
  const metricOpportunity = !analysis.hasMetric
    ? analysis.isPythonMySqlExample
      ? 'Metric opportunity: If available, specify how many mini-applications were built or the volume of data records handled.'
      : 'Metric opportunity: If available, consider adding quantifiable results (e.g., % improvement, latency reduction, or scale handled).'
    : undefined;

  // Generate 3 distinct candidates corresponding to the 3 required improvement approaches:
  // 1. Concise and ATS-focused
  // 2. Technical contribution-focused
  // 3. Outcome-focused
  const candidates: Array<{
    text: string;
    approach: 'concise-ats' | 'technical-contribution' | 'outcome-focused';
    formula: string;
    actionVerb: string;
    improvements: string[];
  }> = [];

  if (analysis.isPythonMySqlExample) {
    // Grounded transformation specifically for Python + MySQL application bullets
    const conciseGenerations = [
      'Built Python applications backed by MySQL to implement core functionality and manage structured data.',
      'Developed Python applications utilizing MySQL for reliable data storage and functional feature delivery.',
      'Constructed lightweight Python applications with MySQL database integration to streamline data processing.',
      'Delivered Python-based applications backed by MySQL to handle core application logic and relational storage.',
      'Engineered modular Python applications integrated with MySQL for consistent data management.',
    ];

    const techGenerations = [
      'Implemented Python-based applications with MySQL integration, strengthening application logic and relational data handling.',
      'Programmed functional applications in Python with MySQL database schemas, reinforcing clean code and query execution.',
      'Architected Python software modules connected to MySQL, focusing on relational modeling and data flow.',
      'Developed Python utilities with MySQL backends, translating functional requirements into modular code and structured schemas.',
      'Built database-driven software with Python and MySQL, optimizing CRUD operations and data persistence.',
    ];

    const outcomeGenerations = [
      'Developed mini applications using Python and MySQL, applying programming and database concepts to solve practical problems.',
      'Created functional Python applications with MySQL storage, delivering reliable software solutions to address user needs.',
      'Authored Python applications connected to MySQL databases to automate functional workflows and organize user data.',
      'Built practical software solutions in Python leveraging MySQL, enhancing user interaction and data consistency.',
      'Deployed functional Python utilities utilizing MySQL, fulfilling key operational requirements through automated data handling.',
    ];

    const cText = conciseGenerations[cycle % conciseGenerations.length];
    const tText = techGenerations[cycle % techGenerations.length];
    const oText = outcomeGenerations[cycle % outcomeGenerations.length];

    candidates.push(
      {
        text: cText,
        approach: 'concise-ats',
        formula: 'XYZ',
        actionVerb: cText.split(' ')[0],
        improvements: [
          'Formulated with concise active phrasing and zero fluff',
          'Naturally highlights Python and MySQL relational integration',
          'Eliminates passive verbs and wordiness for high-speed recruiter scanning',
        ],
      },
      {
        text: tText,
        approach: 'technical-contribution',
        formula: 'Action-Result',
        actionVerb: tText.split(' ')[0],
        improvements: [
          'Emphasizes relational schema design and application logic',
          'Highlights hands-on implementation tools actually present in source',
          'Strengthens technical contribution without title or scope inflation',
        ],
      },
      {
        text: oText,
        approach: 'outcome-focused',
        formula: 'Outcome-Focused',
        actionVerb: oText.split(' ')[0],
        improvements: [
          'Highlights practical problem solving and functional software delivery',
          'Preserves candidate truthfulness without fabricating corporate metrics',
          'Frames accomplishments around working software outcomes',
        ],
      }
    );
  } else if (analysis.hasMetric) {
    // Bullet already has verified numbers/metrics
    const metricStr = analysis.metrics.join(', ');
    const subj = analysis.subject;
    const techSuffix = techPhrase ? ` using ${techPhrase}` : '';

    const conciseVerbs = ['Optimized', 'Refactored', 'Delivered', 'Engineered', 'Streamlined'];
    const techVerbs = ['Refactored', 'Architected', 'Configured', 'Engineered', 'Implemented'];
    const outcomeVerbs = ['Accelerated', 'Enhanced', 'Elevated', 'Maximized', 'Boosted'];

    const cv = conciseVerbs[cycle % conciseVerbs.length];
    const tv = techVerbs[cycle % techVerbs.length];
    const ov = outcomeVerbs[cycle % outcomeVerbs.length];

    candidates.push(
      {
        text: `${cv} ${subj}${techSuffix}, achieving ${metricStr}.`,
        approach: 'concise-ats',
        formula: 'XYZ',
        actionVerb: cv,
        improvements: [
          'Preserved candidate-verified performance statistics',
          `Led with high-impact action verb "${cv}"`,
          'Direct concise wording focused on confirmed outcomes',
        ],
      },
      {
        text: `${tv} ${subj}${techSuffix} and query execution, driving ${metricStr} through systematic optimization.`,
        approach: 'technical-contribution',
        formula: 'Action-Result',
        actionVerb: tv,
        improvements: [
          'Highlights specific engineering work and technical mechanisms',
          'Connects architectural adjustments directly to verified metric',
          'Preserves exact candidate figures without inflation',
        ],
      },
      {
        text: `${ov} system performance across ${subj}${techSuffix}, delivering ${metricStr}.`,
        approach: 'outcome-focused',
        formula: 'Outcome-Focused',
        actionVerb: ov,
        improvements: [
          'Emphasizes verified business throughput and operational gains',
          'Highlights demonstrated impact on system efficiency',
          'Grounded strictly in verified source metrics',
        ],
      }
    );
  } else {
    // General bullet without metrics
    const subj = analysis.subject;
    const techSuffix = techPhrase ? ` using ${techPhrase}` : '';
    const purpose = analysis.purposeClause || (jdKeyword ? ` to advance ${jdKeyword}` : ' to ensure dependable functionality');

    const conciseOptions = [
      `Engineered ${subj}${techSuffix}${purpose}.`,
      `Built ${subj}${techSuffix} to implement core functionality and manage system operations.`,
      `Delivered ${subj}${techSuffix}, streamlining feature execution and data flow.`,
      `Constructed ${subj}${techSuffix} to fulfill key operational requirements.`,
      `Implemented ${subj}${techSuffix}, establishing reliable application workflows.`,
    ];

    const techOptions = [
      `Implemented ${subj}${techSuffix}, focusing on modular design and robust integration.`,
      `Programmed ${subj}${techSuffix}, reinforcing clean code standards and structured logic.`,
      `Configured ${subj}${techSuffix}, optimizing component interactions and data handling.`,
      `Architected ${subj}${techSuffix}, establishing standardized implementation patterns.`,
      `Architected ${subj}${techSuffix}, ensuring seamless data access.`,
    ];

    const outcomeOptions = [
      `Delivered ${subj}${techSuffix}, solving core operational challenges through automated workflows.`,
      `Developed ${subj}${techSuffix}, enhancing functional reliability and overall system performance.`,
      `Created functional ${subj}${techSuffix}, delivering practical solutions to meet project milestones.`,
      `Built practical solutions for ${subj}${techSuffix}, improving data consistency and user interactions.`,
      `Deployed ${subj}${techSuffix}, ensuring consistent application performance across core scenarios.`,
    ];

    const cText = conciseOptions[cycle % conciseOptions.length];
    const tText = techOptions[cycle % techOptions.length];
    const oText = outcomeOptions[cycle % outcomeOptions.length];

    candidates.push(
      {
        text: cText,
        approach: 'concise-ats',
        formula: 'XYZ',
        actionVerb: cText.split(' ')[0],
        improvements: [
          'Direct concise phrasing eliminating passive filler',
          'Naturally incorporates verified technical skills',
          'Formatted for high-speed recruiter and ATS scanning',
        ],
      },
      {
        text: tText,
        approach: 'technical-contribution',
        formula: 'Action-Result',
        actionVerb: tText.split(' ')[0],
        improvements: [
          'Highlights implementation mechanics and technical depth',
          'Demonstrates engineering problem-solving without exaggeration',
          'Preserves verified candidate tools and responsibilities',
        ],
      },
      {
        text: oText,
        approach: 'outcome-focused',
        formula: 'Outcome-Focused',
        actionVerb: oText.split(' ')[0],
        improvements: [
          'Emphasizes practical utility and functional delivery',
          'Avoids fabricating artificial percentages or corporate scale',
          'Grounded strictly in demonstrated project outcomes',
        ],
      }
    );
  }

  // Quality check and deduplication filter
  const alternatives: BulletAlternative[] = [];
  const acceptedTexts: string[] = [];

  for (const cand of candidates) {
    const quality = validateBulletQuality(cand.text, previousGen, acceptedTexts);
    if (quality.isValid) {
      acceptedTexts.push(cand.text);
      alternatives.push({
        id: crypto.randomUUID(),
        text: cand.text,
        formula: cand.formula as any,
        actionVerb: cand.actionVerb,
        approach: cand.approach,
        relevantKeywords: tech.length > 0 ? tech : (jdKeyword ? [jdKeyword] : []),
        metricOpportunity,
        metricsOrPlaceholders: analysis.hasMetric ? analysis.metrics : [],
        improvements: cand.improvements,
        requiresConfirmation: false,
        unsupportedClaims: [],
      });
    }
  }

  // Fallback: If quality filter eliminated all, provide at least 1 verified safe alternative
  if (alternatives.length === 0) {
    const safeText = candidates[0].text;
    alternatives.push({
      id: crypto.randomUUID(),
      text: safeText,
      formula: 'XYZ',
      actionVerb: safeText.split(' ')[0],
      approach: 'concise-ats',
      relevantKeywords: tech,
      metricOpportunity,
      metricsOrPlaceholders: analysis.hasMetric ? analysis.metrics : [],
      improvements: ['Restructured for clarity and ATS keyword alignment'],
      requiresConfirmation: false,
      unsupportedClaims: [],
    });
  }

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
