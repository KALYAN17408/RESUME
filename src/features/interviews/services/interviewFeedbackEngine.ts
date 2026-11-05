import type {
  QuestionFeedback,
  InterviewType,
  StarEvaluation,
} from '../types/interview.types';

/**
 * Deterministic Interview Evaluation Engine
 * Evaluates candidate responses for relevance, clarity, depth, and STAR framework adherence.
 */
export function evaluateAnswer(
  question: string,
  userAnswer: string,
  questionType: InterviewType
): QuestionFeedback {
  const answer = userAnswer.trim();
  const lowerAnswer = answer.toLowerCase();
  const wordCount = answer.split(/\s+/).filter(Boolean).length;

  // 1. Clarity & Length Scoring
  let clarityScore = 50;
  if (wordCount >= 50 && wordCount <= 300) {
    clarityScore = 85;
  } else if (wordCount > 300) {
    clarityScore = 75; // slightly verbose
  } else if (wordCount >= 30) {
    clarityScore = 70;
  } else {
    clarityScore = 40; // too brief
  }

  // 2. Relevance Scoring
  const conversationalStopwords = new Set([
    'tell', 'about', 'time', 'describe', 'handled', 'handle', 'walk', 'when', 'what', 'would', 'could', 'how', 'your'
  ]);
  const qWords = question
    .toLowerCase()
    .replace(/[^\w\s]/g, '')
    .split(/\s+/)
    .filter((w) => w.length > 2 && !conversationalStopwords.has(w));

  let matchHits = 0;
  for (const w of qWords) {
    if (lowerAnswer.includes(w)) matchHits++;
  }

  const matchRatio = qWords.length > 0 ? matchHits / qWords.length : 0.5;
  let relevanceScore = Math.min(95, Math.max(40, Math.round(55 + matchRatio * 40)));

  // If word count is solid and demonstrates technical depth, boost baseline relevance
  if (wordCount >= 40 && /\b(implemented|built|engineered|designed|resolved|caching|database|system|service|scale|api|performance|lock|uptime)\b/i.test(answer)) {
    relevanceScore = Math.max(relevanceScore, 75);
  }

  // 3. Behavioral STAR Evaluation
  let starEvaluation: StarEvaluation | undefined;
  if (questionType === 'behavioral') {
    const hasSituation =
      /(when|during|at my previous|in my role|project|incident|challenge|faced|client)/i.test(
        answer
      );
    const hasTask =
      /(task|goal|objective|responsible|needed to|assigned|my role was|expectation)/i.test(
        answer
      );
    const hasAction =
      /(implemented|built|engineered|designed|resolved|spearheaded|communicated|refactored|led|analyzed|created)/i.test(
        answer
      );
    const hasResult =
      /(result|outcome|improved|reduced|increased|achieved|success|delivering|percent|%|\d+)/i.test(
        answer
      );

    const missingParts: string[] = [];
    if (!hasSituation) missingParts.push('Situation');
    if (!hasTask) missingParts.push('Task');
    if (!hasAction) missingParts.push('Action');
    if (!hasResult) missingParts.push('Result');

    const notes =
      missingParts.length === 0
        ? 'Excellent structure: All four STAR components (Situation, Task, Action, Result) are clearly demonstrated.'
        : `Structure recommendation: Strengthen the ${missingParts.join(
            ', '
          )} component(s) to make your response more memorable to interviewers.`;

    starEvaluation = {
      situationPresent: hasSituation,
      taskPresent: hasTask,
      actionPresent: hasAction,
      resultPresent: hasResult,
      notes,
    };
  }

  // 4. Strengths
  const strengths: string[] = [];
  if (wordCount >= 60) {
    strengths.push('Provided substantial detail with clear context and narrative progression.');
  }
  if (/\d+|%|percent|latency|users|revenue|scale/i.test(answer)) {
    strengths.push('Effective use of concrete metrics and business-oriented outcomes.');
  }
  if (/(i chose|i decided|my approach|trade-off|architecture|decision)/i.test(answer)) {
    strengths.push('Clearly articulated personal technical ownership and decision-making rationale.');
  }
  if (strengths.length === 0) {
    strengths.push('Addressed the core prompt directly without dodging the question.');
  }

  // 5. Improvement Areas
  const improvements: string[] = [];
  if (wordCount < 60) {
    improvements.push(
      'Elaborate further: Interviewers look for 2–3 minutes of spoken detail (approx. 150–250 words) covering technical choices and edge cases.'
    );
  }
  if (!/\d+|%|percent/i.test(answer)) {
    improvements.push(
      'Quantify the conclusion: Add a measurable metric to substantiate the outcome (e.g., test coverage %, latency reduction, or timeline saved).'
    );
  }
  if (!/(trade-off|alternative|challenge|risk)/i.test(answer)) {
    improvements.push(
      'Mention trade-offs: Discussing alternative approaches you rejected shows mature senior engineering judgment.'
    );
  }

  // 6. Suggested Answer Structure
  const suggestedAnswerStructure =
    questionType === 'behavioral'
      ? '1. Situation (15%): Context & constraint → 2. Task (15%): Your mandate → 3. Action (50%): Deep technical execution → 4. Result (20%): Quantified business impact.'
      : '1. Direct Thesis: Clear architectural stance → 2. Technical Mechanisms: Core algorithms/primitives → 3. Trade-offs: Latency vs simplicity vs cost → 4. Practical Example.';

  // 7. Sample Illustrative Answer
  const sampleAnswer =
    questionType === 'behavioral'
      ? 'Example Structure:\n"At my previous team, we faced a 40% error rate spike during Black Friday checkout (Situation). My task was to identify the database lock contention and restore 99.9% availability within two hours (Task). I analyzed thread dumps, added Redis caching for product inventory queries, and isolated write operations (Action). This reduced DB CPU utilization from 98% to 32% and restored zero-drop checkout throughput (Result)."'
      : 'Example Structure:\n"I evaluate distributed architecture through the lens of data access patterns and consistency requirements. For high-concurrency read-heavy traffic, I introduce distributed caching (Redis) alongside read-replicas. For asynchronous workloads, I leverage message queues (Kafka/RabbitMQ) to decouple ingestion from background processing, guaranteeing bounded latency."';

  return {
    relevanceScore,
    clarityScore,
    strengths,
    improvements,
    starEvaluation,
    suggestedAnswerStructure,
    sampleAnswer,
    analyzedAt: new Date().toISOString(),
  };
}
