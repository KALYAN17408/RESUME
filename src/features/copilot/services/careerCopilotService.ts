import { supabase } from '@/lib/supabase/client';
import { getSupabaseEnv } from '@/lib/supabase/env';
import type {
  CopilotGenerateParams,
  CopilotGenerateResult,
} from '../types/copilot.types';

/**
 * Deterministic Grounded Career Synthesizer (Offline & Fallback Engine)
 * Synthesizes structured, high-value career intelligence grounded strictly
 * in the user's prompt and candidate resume evidence without hallucinating.
 */
export function synthesizeCareerGuidance(
  params: CopilotGenerateParams
): CopilotGenerateResult {
  const startTime = Date.now();
  const prompt = params.prompt.trim().toLowerCase();
  const resume = params.resumeData;

  const candidateTitle =
    resume?.personalInfo.professionalTitle || 'Software Professional';

  // Extract skills from resume
  const skillsList: string[] = [];
  if (resume?.skillCategories) {
    for (const cat of resume.skillCategories) {
      for (const s of cat.skills) {
        if (!skillsList.includes(s)) skillsList.push(s);
      }
    }
  }

  const projects = resume?.projects || [];
  const experiences = resume?.experiences || [];

  let topic: 'resume_review' | 'skill_gap' | 'interview_prep' | 'career_roadmap' | 'general' =
    'general';
  let responseContent = '';
  const actionableSuggestions: string[] = [];

  // 1. Resume Review & Improvement Guidance
  if (
    prompt.includes('resume') ||
    prompt.includes('feedback') ||
    prompt.includes('review') ||
    prompt.includes('bullet')
  ) {
    topic = 'resume_review';

    const strongPoints: string[] = [];
    if (skillsList.length > 0) {
      strongPoints.push(`Solid core technical foundation in **${skillsList.slice(0, 5).join(', ')}**.`);
    }
    if (experiences.length > 0) {
      strongPoints.push(
        `Clear progression in professional roles, including **${experiences[0].jobTitle}** at **${experiences[0].company}**.`
      );
    }
    if (projects.length > 0) {
      strongPoints.push(`Demonstrated hands-on execution through project work such as **${projects[0].name}**.`);
    }

    responseContent = `### Career Copilot: Resume Strategic Analysis

Here is an objective assessment of your resume profile for **${candidateTitle}** roles:

#### 1. Core Profile Strengths
${strongPoints.map((pt) => `- ${pt}`).join('\n')}

#### 2. High-Impact Refinement Opportunities
- **Quantify Business Impact:** Ensure every major bullet point follows the **Action + Context + Measurable Outcome** model (e.g., *"Reduced latency by 25%"*, *"Processed 10k+ daily transactions"*).
- **Keyword Placement:** Ensure your top technical competencies appear within the first 1/3 of your resume (Headline, Summary, and Primary Skills category) to maximize ATS parser visibility.
- **Project Scope:** Highlight system architecture, trade-offs, and state management in your technical projects.

#### 3. Immediate Recommended Next Steps
1. Review your top 2 experience bullets to replace generic verbs (*"assisted with"*, *"worked on"*) with high-impact engineering verbs (*"Engineered"*, *"Architected"*, *"Delivered"*).
2. Compare your resume against 2-3 target job listings in our **Job Matching** tool to verify keyword coverage.`;

    actionableSuggestions.push(
      'Quantify results across experience highlights',
      'Optimize headline for target role keywords',
      'Run ATS Analyzer on updated PDF'
    );
  }

  // 2. Skill Gap Analysis
  else if (
    prompt.includes('skill') ||
    prompt.includes('gap') ||
    prompt.includes('learn') ||
    prompt.includes('roadmap') ||
    prompt.includes('technolog')
  ) {
    topic = 'skill_gap';

    const knownSkillsStr =
      skillsList.length > 0
        ? skillsList.slice(0, 6).join(', ')
        : 'full-stack web development and core programming';

    responseContent = `### Career Copilot: Skills Gap & Learning Strategy

Based on your current background in **${knownSkillsStr}**, here is a targeted skill gap evaluation:

#### 1. Current Verified Foundation
Your profile demonstrates capability in **${knownSkillsStr}**. This positions you well for roles emphasizing modern application architecture.

#### 2. High-Demand Adjacent Skills to Acquire
- **Cloud Infrastructure & Containers:** Deepen proficiency with Docker containerization, Kubernetes orchestration, and AWS/GCP cloud primitives (serverless, S3, IAM, CloudWatch).
- **System Design & Scalability:** Distributed caching (Redis), asynchronous task queues (RabbitMQ/Kafka), and database indexing/optimization.
- **Testing & Quality Assurance:** End-to-end integration testing (Playwright/Cypress) and CI/CD automated pipeline configuration (GitHub Actions).

#### 3. 90-Day Structured Learning Roadmap
- **Weeks 1–4:** Containerize an existing project with Docker and configure a multi-stage Dockerfile.
- **Weeks 5–8:** Deploy the application to AWS using ECS or Lambda with automated CI/CD deployment pipelines.
- **Weeks 9–12:** Implement distributed caching and write comprehensive integration test suites.`;

    actionableSuggestions.push(
      'Build a Dockerized microservice sample',
      'Complete AWS/GCP cloud architecture modules',
      'Add system design case studies to portfolio'
    );
  }

  // 3. Interview Preparation
  else if (
    prompt.includes('interview') ||
    prompt.includes('question') ||
    prompt.includes('behavioral') ||
    prompt.includes('star') ||
    prompt.includes('technical screen')
  ) {
    topic = 'interview_prep';

    const projectContext =
      projects.length > 0
        ? `"${projects[0].name}"`
        : 'your most complex software project';

    responseContent = `### Career Copilot: Interview Preparation Framework

Preparing for technical and behavioral interviews requires structured communication. Here is your targeted preparation guide:

#### 1. Mastering the STAR Behavioral Method
For questions like *"Tell me about a time you resolved a major technical challenge"*, structure your story as:
- **Situation:** Describe the system state or business constraint (e.g., *"During a high-traffic release..."*).
- **Task:** Clarify your specific responsibility (*"I was tasked with identifying the bottleneck and preventing downtime"*).
- **Action:** Explain the specific architectural choices and code solutions you implemented.
- **Result:** Conclude with the tangible, quantified outcome (*"Reduced latency by 40% and prevented transaction loss"*).

#### 2. Key Story Prompts to Rehearse
- **Technical Conflict:** A time you disagreed with a teammate on architecture or tooling and how you reached consensus.
- **System Outage / Bug:** How you debugged a production issue under time pressure.
- **Architecture Deep-Dive:** Be prepared to diagram and explain every component of ${projectContext} from database to UI.

#### 3. Recommended Action
Head over to the **Mock Interviews** module in the sidebar to run interactive, timed practice sessions with real-time STAR feedback!`;

    actionableSuggestions.push(
      'Draft 3 STAR stories from your work history',
      'Practice technical architecture walkthroughs',
      'Use Mock Interviews module for interactive drills'
    );
  }

  // 4. Career Transition & Growth Strategy
  else if (
    prompt.includes('transition') ||
    prompt.includes('promotion') ||
    prompt.includes('salary') ||
    prompt.includes('offer') ||
    prompt.includes('career')
  ) {
    topic = 'career_roadmap';

    responseContent = `### Career Copilot: Career Trajectory & Positioning Strategy

Here is a strategic framework to navigate your career transition and advance your market value:

#### 1. Framing Transferable Strengths
- **Focus on Business Outcomes:** Rather than framing your experience solely around daily tasks, emphasize how your engineering solutions supported revenue, efficiency, or user retention.
- **Cross-Functional Communication:** Frame your ability to translate product requirements into technical architecture as a core senior differentiator.

#### 2. Position for Upward Mobility
- **Demonstrate Ownership:** Take responsibility for end-to-end system reliability rather than isolated tickets.
- **Mentor and Document:** Senior engineering loops evaluate your ability to uplift teammates through clear technical documentation and PR reviews.

#### 3. Targeted Next Steps
- Target roles that share at least 60–70% overlap with your current competencies while offering growth in the remaining 30%.
- Customize your resume summary to speak directly to the business domain of your target industry.`;

    actionableSuggestions.push(
      'Update LinkedIn headline with target trajectory',
      'Highlight cross-functional collaboration in highlights',
      'Research median compensation bands for target level'
    );
  }

  // 5. General Career Inquiries
  else {
    topic = 'general';

    responseContent = `### Career Copilot: Guidance & Strategy

Thank you for your question. Here are key insights tailored to your career development as **${candidateTitle}**:

- **Continuous Alignment:** Regular alignment between your resume, portfolio, and current market demand gives you significant leverage in the job search.
- **Targeted Applications:** High-conversion job applications combine a customized resume, a grounded cover letter tailored to the job description, and proactive recruiter outreach.
- **Skill Currency:** Focus on mastering high-leverage tools in modern engineering (TypeScript, cloud architectures, automated CI/CD).

#### How else can I assist your career search?
- *"Review my resume experience bullets"*
- *"What technical skills should I learn next?"*
- *"Help me prepare for behavioral interview questions"*
- *"How do I tailor my application for a Senior role?"*`;

    actionableSuggestions.push(
      'Ask for specific resume bullet critique',
      'Request role-specific interview practice',
      'Evaluate skill gaps against target jobs'
    );
  }

  return {
    content: responseContent,
    metadata: {
      usedResumeId: resume?.id,
      usedResumeTitle: resume?.title || resume?.personalInfo.fullName,
      actionableSuggestions,
      processingTimeMs: Date.now() - startTime,
      isFallback: true,
      topic,
    },
  };
}

/**
 * Main Career Copilot Service
 * Invokes remote Supabase Edge Function when configured, falling back
 * seamlessly to the grounded career synthesizer.
 */
export class CareerCopilotService {
  static async generateAdvice(
    params: CopilotGenerateParams
  ): Promise<CopilotGenerateResult> {
    const startTime = Date.now();
    const env = getSupabaseEnv();

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
      prompt: params.prompt,
      conversationHistory: params.conversationHistory.map((m) => ({
        role: m.role,
        content: m.content,
      })),
      candidateName: resume?.personalInfo.fullName || 'Candidate',
      professionalTitle: resume?.personalInfo.professionalTitle || 'Software Engineer',
      skills,
      projects: resume?.projects || [],
      experiences: resume?.experiences || [],
    };

    if (env.isConfigured) {
      try {
        const { data, error } = await supabase.functions.invoke('ai-optimizer', {
          body: {
            operation: 'career-copilot',
            payload,
          },
        });

        if (!error && data && data.content) {
          return {
            content: data.content,
            metadata: {
              usedResumeId: resume?.id,
              usedResumeTitle: resume?.title || resume?.personalInfo.fullName,
              actionableSuggestions: data.actionableSuggestions || [],
              processingTimeMs: Date.now() - startTime,
              isFallback: false,
            },
          };
        }
      } catch (err) {
        console.warn('[CareerCopilotService] Remote error, falling back to grounded synthesis:', err);
      }
    }

    // Default: Grounded deterministic synthesis
    return synthesizeCareerGuidance(params);
  }
}
