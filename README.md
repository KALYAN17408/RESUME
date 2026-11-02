# ResuMax AI 🚀
### Production-Grade AI Career Copilot & ATS Resume Intelligence Platform

ResuMax AI is an enterprise-ready, AI-powered career enablement platform designed to empower professionals—especially technical candidates—to craft parser-safe resumes, pass recruiter and Applicant Tracking System (ATS) screening filters, match tailored job opportunities, and prepare for high-stakes interviews.

---

## 📌 Executive Summary

Modern hiring pipelines rely on automated Applicant Tracking Systems (Workday, Greenhouse, Lever, Taleo) that silently discard up to 75% of qualified resumes due to parsing incompatibilities, missing contextual keywords, and poor achievement quantification.

**ResuMax AI** bridges this gap by unifying:
1. **ATS-Compliant Resume Engineering:** Pixel-accurate, single-column, parser-safe templates (Harvard Classic, Stanford Editorial, Jake's Tech Layout, Modern Tech) exported as pure text-stream vector PDFs.
2. **Multi-Vector ATS Analyzer:** Automated scoring measuring structural parseability, quantified achievement metrics (Google's XYZ formula), keyword alignment, and brevity.
3. **Targeted Job Match & Resume Tailoring:** Dynamic alignment between real job descriptions and candidate career history without artificial keyword stuffing.
4. **Atlas Career Copilot:** An intelligent, conversational career copilot guiding job seekers through resume improvements, career pathways, and interview readiness.
5. **Technical & Behavioral Interview Hub:** Role-specific question banks, system design tracks, and AI-driven feedback loops.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | React 18 / 19, TypeScript, Vite, Tailwind CSS, Lucide React, Zustand, React Hook Form, Zod |
| **Backend & Database** | Supabase, PostgreSQL 15+, Supabase Auth (PKCE / Row Level Security), Supabase Storage |
| **AI Orchestration** | REA Agent Framework, Provider-Agnostic LLM Layer (Google Gemini, OpenAI, Claude, Local Ollama) |
| **Document Processing** | `@react-pdf/renderer` (Vector text streams), `docx` generation, PDF parser / AST extraction engine |
| **Deployment** | Netlify (Frontend SPA), Supabase Hosted Backend & Edge Functions |

---

## 📂 Project Architecture & Documentation Index

All architectural blueprints, security definitions, and system specifications are documented in [`docs/`](./docs/):

1. [`docs/PRODUCT_REQUIREMENTS.md`](./docs/PRODUCT_REQUIREMENTS.md) — Comprehensive PRD across Modules A through G with user stories, non-functional requirements, and acceptance criteria.
2. [`docs/REFERENCE_RESEARCH.md`](./docs/REFERENCE_RESEARCH.md) — Competitive and architectural audit of `resumax.ai/home`, comparing UX, templates, and pricing.
3. [`docs/EXISTING_PROJECT_AUDIT.md`](./docs/EXISTING_PROJECT_AUDIT.md) — Read-only audit of the existing `ResumeForge AI` (Firebase) repository, detailing reusable logic vs legacy technical debt.
4. [`docs/SYSTEM_ARCHITECTURE.md`](./docs/SYSTEM_ARCHITECTURE.md) — System topology, component interactions, data flow, state management, and export pipelines.
5. [`docs/DATABASE_DESIGN.md`](./docs/DATABASE_DESIGN.md) — Normalized PostgreSQL schema across 18 tables with primary/foreign keys, indexes, and Row Level Security (RLS) policies.
6. [`docs/SECURITY_ARCHITECTURE.md`](./docs/SECURITY_ARCHITECTURE.md) — Threat model, Supabase Auth lifecycle, storage bucket security, rate limiting, and zero-trust key management.
7. [`docs/AI_AGENT_ARCHITECTURE.md`](./docs/AI_AGENT_ARCHITECTURE.md) — Multi-agent orchestration, REA MCP integration, structured JSON schema prompting, and fallback chains.
8. [`docs/DEVELOPMENT_ROADMAP.md`](./docs/DEVELOPMENT_ROADMAP.md) — Multi-phase execution plan from Phase 0 foundation through Phase 6 production launch.
9. [`docs/PHASE_0_COMPLETION_REPORT.md`](./docs/PHASE_0_COMPLETION_REPORT.md) — Formal audit report, verification matrix, risk assessment, and gatekeeper checklist for Phase 1.

---

## 🚦 Phase 0 Status & Next Steps

* **Status:** **PHASE 0 COMPLETED (Architecture, Research & Verification)**
* **Current Action:** Awaiting explicit operator approval to initialize **Phase 1: Project Scaffolding & Core Foundations**.
* **Zero-Impact Guarantee:** The legacy `ResumeForge AI` project (`D:\resumeforge-ai-firebase\resumeforge`) remains completely untouched and operational.
