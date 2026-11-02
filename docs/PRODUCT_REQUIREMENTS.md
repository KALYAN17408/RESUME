# Product Requirements Document (PRD) — ResuMax AI

**Project Name:** ResuMax AI  
**Version:** 1.0.0-draft (Phase 0 Architecture)  
**Target Market:** Global Software Engineers, Data/ML Engineers, Product Managers, Tech Candidates, and New Grads.  
**Reference Inspiration:** `https://resumax.ai/home`

---

## 1. Executive Summary & Vision

ResuMax AI is designed to solve the asymmetric disadvantage job seekers experience against automated Applicant Tracking Systems (ATS) and rapid recruiter scans (average 6-second review). Unlike generic resume builders that focus primarily on graphic aesthetics—which frequently break ATS parsers through multi-column CSS tables and unindexed graphics—ResuMax AI delivers a **parser-first, content-optimized engineering approach** to career development.

---

## 2. Target Personas

1. **The Software Engineer (Junior to Staff):** Needs clean, single-column LaTeX-like layouts (e.g., Jake's Resume style), strong technical skill categorization, project links, and bullet points formulated around Google's XYZ achievement framework (*Accomplished [X] as measured by [Y] by doing [Z]*).
2. **The Career Pivot / New Graduate:** Lacks formal enterprise experience; requires AI assistance to surface academic projects, internships, hackathons, and transferable coursework into recruiter-friendly achievements.
3. **The Active Job Seeker:** Submits 20–50 applications per week and needs per-job tailoring, instant ATS match scores, missing keyword detection, and customized cover letters within seconds.

---

## 3. Product Architecture Modules (Modules A – G)

### Module A: AI Resume Builder
* **Feature A.1 — Multi-Template Engine:**
  * Support 4+ ATS-compliant templates:
    1. *Jake's Technical Standard* (Clean, single-column, standard tech industry layout).
    2. *Harvard Classic* (Traditional academic/executive serif format).
    3. *Stanford Editorial* (Subtle slate/navy accent, polished typography).
    4. *Modern Tech Clean* (Balanced whitespace, tech stack badges).
  * 100% vector-based text streaming for zero ATS parsing distortion.
* **Feature A.2 — Live Split-Screen Editor:**
  * Real-time preview with zoom levels (50%, 75%, 100%, Fit-to-Page).
  * Auto-save debounce (800ms) with visual status indicator (`Saved`, `Saving...`, `Error`).
* **Feature A.3 — Structured Resume Sections:**
  * Personal Info (Full Name, Headline, Email, Phone, Location, Portfolio, LinkedIn, GitHub).
  * Professional Summary / Objective.
  * Work Experience (Role, Company, Location, Dates, Impact Bullets).
  * Internships & Apprenticeships.
  * Projects (Name, Tech Stack, Live URL, GitHub URL, Bullets).
  * Technical Skills (Categorized: Languages, Frameworks, Developer Tools, Libraries/Databases).
  * Education (Degree, Institution, Dates, GPA, Relevant Coursework).
  * Certifications, Licenses & Publications.
  * Honors, Awards & Hackathons.
  * Spoken Languages & Proficiencies.
* **Feature A.4 — AI Assistant within Editor:**
  * Inline bullet-point generator and rewriter (XYZ formula optimization).
  * Action verb injector (e.g., transforming "worked on" to "architected", "optimized", "spearheaded").
* **Feature A.5 — Export Capabilities:**
  * Crisp vector PDF generation (preserving copy-pasteable text, clickable URLs, correct font glyphs).
  * Formatted Microsoft Word (`.docx`) export.

---

### Module B: ATS Resume Analyzer
* **Feature B.1 — Document Ingestion:**
  * Drag-and-drop file uploader supporting `.pdf` and `.docx` (max 5MB).
  * Text extraction layer converting document layout into structured JSON AST.
* **Feature B.2 — Recruiter-Grade Multi-Vector Scoring (0–100):**
  * *ATS Parseability Score:* Measures font compliance, section heading standardization, column layout simplicity, and absence of unreadable text boxes.
  * *Impact & Quantification Score:* Scans for numbers, percentages, dollar amounts, and metric indicators.
  * *Brevity & Formatting Score:* Evaluates page length, word count balance, bullet length, and whitespace distribution.
  * *Style & Tone Score:* Checks for passive voice, weak verbs, repetition, and spelling/grammar.
  * *Skills Relevance Score:* Compares breadth of recognized technical skills against industry baselines.
* **Feature B.3 — Actionable Improvement Recommendations:**
  * Categorized as Critical Fixes (Red), Improvements (Yellow), and Strong Points (Green).
  * One-click "Apply AI Fix" to automatically rewrite problematic bullet points.

---

### Module C: AI Job Matching & Tailoring
* **Feature C.1 — Job Description Parser:**
  * Pasty input box for raw job specs (LinkedIn, Indeed, company career portals).
  * NLP extraction of required skills, preferred qualifications, years of experience, and domain keywords.
* **Feature C.2 — Resume-to-Job Fit Analysis:**
  * Match Percentage (0–100%).
  * Matched Skills vs Missing Hard Skills & Missing Soft Skills.
* **Feature C.3 — Dynamic Resume Tailoring:**
  * Clones the user's active resume and generates a job-specific version.
  * Naturally weaves missing relevant keywords into existing experience bullets without fabricated qualifications.
* **Feature C.4 — AI Cover Letter Generation:**
  * Generates context-aware, 3-to-4 paragraph cover letters connecting candidate achievements directly to the target role's mission and technical stack.
* **Feature C.5 — Job Application Tracking (Kanban / List):**
  * Columns: `Saved`, `Applied`, `Interviewing`, `Offered`, `Rejected`.
  * Links each application to the specific tailored resume and cover letter version used.

---

### Module D: AI Career Assistant (Atlas-Inspired Copilot)
* **Feature D.1 — Conversational Career Interface:**
  * Context-aware chat drawer available throughout the application.
  * Fully grounded on the user's uploaded resume, profile, and career goals.
* **Feature D.2 — Strategic Career Guidance:**
  * Career pathway recommendations (e.g., Frontend to Fullstack, Senior SWE to Staff/Architect).
  * Skills gap analysis recommending high-value tools, frameworks, and portfolio projects to pursue.
* **Feature D.3 — Compensation & Offer Negotiation Support:**
  * Market salary benchmark estimation and offer evaluation strategies.

---

### Module E: Technical & Behavioral Interview Preparation
* **Feature E.1 — Role-Specific Question Generator:**
  * Curates tailored question sets based on the user's resume experience and target job description.
  * Categories: Data Structures & Algorithms, System Design, Frontend/Backend Architecture, Behavioral (STAR framework).
* **Feature E.2 — Mock Interview Simulation:**
  * Step-by-step interactive question-and-answer workflow.
  * Speech-to-text or typed response submission.
* **Feature E.3 — AI Feedback & Evaluation:**
  * Scores responses on clarity, technical accuracy, conciseness, and structured delivery.
  * Generates model answers demonstrating ideal phrasing.

---

### Module F: User Dashboard & Account Management
* **Feature F.1 — Resume Portfolio:**
  * Grid view of all created resumes with template tags, last modified timestamps, and quick-action menus (Edit, Duplicate, Download, Delete).
* **Feature F.2 — Version History & Snapshots:**
  * View and restore previous revisions of any resume.
* **Feature F.3 — ATS Audit Archive:**
  * Historical log of all ATS score reports and job match reports.
* **Feature F.4 — Usage & Quota Tracker:**
  * Visual progress bars displaying current monthly usage (AI tokens, tailoring runs, export limits).
* **Feature F.5 — Profile & Security Settings:**
  * Profile updates, password reset, session management, and data export/deletion (GDPR compliance).

---

### Module G: Subscription, Billing & Quota System
* **Feature G.1 — Tiered Pricing Model:**
  * **Free Tier ($0/month):**
    * Core ATS Resume Builder with standard templates.
    * 1 Full ATS Resume Analysis report per month.
    * 3 AI bullet point optimizations per month.
    * Standard vector PDF export.
  * **Pro Tier ($29/month or $12/month billed annually):**
    * Unlimited resumes & access to all templates (including Jake's Tech Layout).
    * 30 per-job resume tailoring runs & cover letters per month.
    * 25 in-depth recruiter-grade ATS scoring audits.
    * 50 daily turns with the AI Career Copilot.
    * PDF and editable DOCX exports.
  * **Premium / Intensive Search Tier ($49/month or $17/month billed annually):**
    * 150 resume tailoring workflows & cover letters per month.
    * 100 in-depth ATS reviews with priority queue.
    * 200 daily AI Copilot turns.
    * Full access to System Design & Technical Mock Interview coaching modules.
* **Feature G.2 — Usage Metering & Enforcement:**
  * Server-side quota validation via PostgreSQL triggers or Supabase Edge Functions before executing LLM calls.
* **Feature G.3 — Payment Integration:**
  * Modular payment architecture (Stripe / Razorpay webhooks) with secure customer portal for upgrades, cancellations, and billing history.

---

## 4. Non-Functional Requirements (NFRs)

* **Performance:**
  * Initial page load (LCP) under 1.5s on broadband.
  * Resume builder editor responsiveness: keystroke latency under 16ms (60 FPS).
  * Auto-save debounce completes within 1000ms.
  * PDF generation completes in under 2.5 seconds on client/edge.
* **Accessibility & UI Standards:**
  * WCAG 2.1 AA compliant contrast ratios across light and dark themes.
  * Fully keyboard navigable form inputs and dialogs.
  * High-density, professional UI styling using Tailwind CSS.
* **Security & Privacy:**
  * Zero exposure of AI provider keys in client bundles.
  * PostgreSQL Row Level Security (RLS) guaranteeing strict cross-tenant isolation.
  * Uploaded resume PDFs stored in private Supabase Storage buckets with short-lived signed URLs.
