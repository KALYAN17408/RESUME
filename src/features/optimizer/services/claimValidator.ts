import type { ClaimValidationReport, DetectedClaim } from '../types/optimizer.types';
import { SKILLS_TAXONOMY } from '@/features/analyzer/services/keywordTaxonomy';

// Regex detecting quantified figures: percentages, dollar values, multipliers, scale numbers
const METRIC_PATTERN = /(?:\$|€|£)?\b\d+(?:\.\d+)?(?:%|\s*(?:k|m|b|million|billion|thousand|users|queries|requests|x|fold)\b)?/gi;

// Regex detecting bracketed placeholders like [add %], [X metric], [insert number]
const PLACEHOLDER_PATTERN = /\[(?:add|insert|measurable|metric|estimate|approx|number|percentage|result|impact)[^\]]*\]/gi;

// High-risk qualification markers
const HIGH_QUALIFICATIONS = [
  'phd',
  'doctorate',
  'master of science',
  'mba',
  'certified solutions architect professional',
  'cissp',
  'pmp',
  'patent holder',
];

// Seniority levels for inflation detection
const SENIORITY_HIERARCHY: Record<string, number> = {
  intern: 1,
  junior: 2,
  associate: 2,
  mid: 3,
  senior: 4,
  staff: 5,
  principal: 6,
  lead: 5,
  manager: 5,
  director: 7,
  vp: 8,
  'vice president': 8,
  cto: 9,
  cio: 9,
  head: 7,
};

/**
 * Extracts all non-placeholder metric tokens from a string
 */
export function extractMetrics(text: string): string[] {
  // First strip bracketed placeholders so they are not treated as invented claims
  const stripped = text.replace(/\[[^\]]+\]/g, ' ');
  const matches = stripped.match(METRIC_PATTERN) || [];
  return matches
    .map((m) => m.trim().toLowerCase())
    .filter((m) => {
      // Exclude simple single digit counts like "1 year" or "2 days" if benign
      return !/^(?:1|2|3)\s*(?:day|days|week|weeks|hour|hours)$/i.test(m);
    });
}

/**
 * Checks whether text contains explicit bracketed placeholders for missing evidence
 */
export function hasBracketedPlaceholders(text: string): boolean {
  return PLACEHOLDER_PATTERN.test(text);
}

/**
 * Detects whether proposed text introduces newly fabricated quantifiable metrics
 * that did not exist in the source text.
 */
export function detectInventedMetrics(originalText: string, proposedText: string): DetectedClaim[] {
  const originalMetrics = new Set(extractMetrics(originalText));
  const proposedMetrics = extractMetrics(proposedText);
  const detected: DetectedClaim[] = [];

  for (const metric of proposedMetrics) {
    // If the proposed metric was not in original and not in brackets, it is an invented metric
    if (!originalMetrics.has(metric)) {
      // Check if this metric is part of a bracketed placeholder in the raw proposedText
      const isInsideBrackets = new RegExp(`\\[[^\\]]*${metric.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}[^\\]]*\\]`, 'i').test(proposedText);
      if (!isInsideBrackets) {
        detected.push({
          type: 'invented_metric',
          text: metric,
          reason: `Metric "${metric}" was introduced but does not appear in the original source resume.`,
          severity: 'violation',
        });
      }
    }
  }

  return detected;
}

/**
 * Detects whether proposed text introduces skills that were neither in knownSkills nor original text.
 */
export function detectInventedSkills(
  knownSkills: string[],
  proposedText: string,
  originalText = ''
): DetectedClaim[] {
  const combinedSource = `${knownSkills.join(' ')} ${originalText}`.toLowerCase();
  const lowerProposed = proposedText.toLowerCase();
  const detected: DetectedClaim[] = [];

  // Check known technical terms from the curated taxonomy
  for (const entry of SKILLS_TAXONOMY) {
    const terms = [entry.term, ...(entry.aliases || [])];
    for (const term of terms) {
      const lowerTerm = term.toLowerCase();
      // If term is in proposed text
      const termRegex = new RegExp(`\\b${lowerTerm.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
      if (termRegex.test(lowerProposed)) {
        // Check if it was in the source text
        if (!termRegex.test(combinedSource)) {
          // It's a newly introduced skill
          detected.push({
            type: 'invented_skill',
            text: term,
            reason: `Technical skill "${term}" appears in the suggested text but is not listed in your verified skills or resume history.`,
            severity: 'warning', // Warning so user can confirm if they actually have it
          });
        }
      }
    }
  }

  return detected;
}

/**
 * Detects ungrounded qualifications (e.g. degrees, specialized certifications)
 */
export function detectUnsupportedQualifications(originalText: string, proposedText: string): DetectedClaim[] {
  const lowerOrig = originalText.toLowerCase();
  const lowerProp = proposedText.toLowerCase();
  const detected: DetectedClaim[] = [];

  for (const qual of HIGH_QUALIFICATIONS) {
    const qualRegex = new RegExp(`\\b${qual}\\b`, 'i');
    if (qualRegex.test(lowerProp) && !qualRegex.test(lowerOrig)) {
      detected.push({
        type: 'unsupported_qualification',
        text: qual,
        reason: `Qualification "${qual}" was introduced without evidence in your educational/certification records.`,
        severity: 'violation',
      });
    }
  }

  return detected;
}

/**
 * Detects drastic seniority title inflation (e.g. Junior -> VP or Lead)
 */
export function detectSeniorityInflation(originalText: string, proposedText: string): DetectedClaim[] {
  const lowerOrig = originalText.toLowerCase();
  const lowerProp = proposedText.toLowerCase();
  const detected: DetectedClaim[] = [];

  let highestOrigLevel = 0;
  for (const [title, level] of Object.entries(SENIORITY_HIERARCHY)) {
    if (new RegExp(`\\b${title}\\b`, 'i').test(lowerOrig)) {
      highestOrigLevel = Math.max(highestOrigLevel, level);
    }
  }

  if (highestOrigLevel > 0) {
    for (const [title, level] of Object.entries(SENIORITY_HIERARCHY)) {
      // If proposed jumps more than 2 seniority levels (e.g. Intern/Junior (level 1-2) to Director/VP (level 7-8))
      if (level - highestOrigLevel >= 3) {
        if (new RegExp(`\\b${title}\\b`, 'i').test(lowerProp) && !new RegExp(`\\b${title}\\b`, 'i').test(lowerOrig)) {
          detected.push({
            type: 'unsupported_experience',
            text: title,
            reason: `Seniority term "${title}" appears to inflate verified career progression.`,
            severity: 'violation',
          });
        }
      }
    }
  }

  return detected;
}

/**
 * Comprehensive claim validation report for a bullet or summary rewrite
 */
export function validateClaimIntegrity(
  originalText: string,
  proposedText: string,
  knownSkills: string[] = []
): ClaimValidationReport {
  const metricClaims = detectInventedMetrics(originalText, proposedText);
  const skillClaims = detectInventedSkills(knownSkills, proposedText, originalText);
  const qualClaims = detectUnsupportedQualifications(originalText, proposedText);
  const seniorityClaims = detectSeniorityInflation(originalText, proposedText);

  const allClaims: DetectedClaim[] = [
    ...metricClaims,
    ...skillClaims,
    ...qualClaims,
    ...seniorityClaims,
  ];

  const hasViolations = allClaims.some((c) => c.severity === 'violation');

  return {
    isValid: !hasViolations,
    detectedClaims: allClaims,
    hasViolations,
  };
}
