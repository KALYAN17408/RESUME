# RESUME AI 🚀

> **Next-Generation, 100% Free Career Platform & ATS Resume Intelligence Suite**

[![Production Status](https://img.shields.io/badge/Status-Live%20in%20Production-success)](https://theresume-ai.netlify.app)
[![Tests](https://img.shields.io/badge/Tests-36%20Suites%20%7C%20172%20Passing-brightgreen)](https://github.com/KALYAN17408/RESUME)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-blue)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-18.3-61dafb)](https://react.dev/)
[![Vite](https://img.shields.io/badge/Vite-6.1-646cff)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-3.4-38bdf8)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-PostgreSQL%2015-3ecf8e)](https://supabase.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

**Live Application:** [https://theresume-ai.netlify.app](https://theresume-ai.netlify.app)  
**GitHub Repository:** [https://github.com/KALYAN17408/RESUME](https://github.com/KALYAN17408/RESUME)

---

## 📌 Overview

Up to 75% of qualified engineering and technical resumes are silently rejected by automated **Applicant Tracking Systems (ATS)** such as Workday, Greenhouse, Lever, and Taleo before a human recruiter ever sees them. Rejections occur primarily due to complex multi-column layouts, graphics, non-standard headings, unselectable text, and poor keyword alignment.

**RESUME AI** is built from the ground up to eliminate these failure modes. It offers single-column, parser-tested resume templates, an instant ATS compatibility scanner, and a personalized cover letter generator—**100% free with zero paywalls, zero subscription tiers, and no credit card required**.

---

## ✨ Core Features (Production-Ready)

### 1. 📄 ATS Resume Builder
- **4 Proven Single-Column ATS Templates**:
  - **Jake's Tech Standard**: The industry-standard Silicon Valley engineering format.
  - **Harvard Classic**: Elegant, traditional serif typography with centered hierarchy.
  - **Stanford Editorial**: Modern typography with restrained monochrome accents.
  - **Modern Tech Clean**: Contemporary spacing optimized for engineering skills and projects.
- **Split-Screen Editor**: Live real-time preview as you type with automatic debounced saving.
- **Section Customization**: Add, remove, and reorder sections (Experience, Projects, Education, Skills, Custom Sections).
- **Text-Stream Vector PDF Export**: Generates true vector PDFs using `@react-pdf/renderer` with 100% selectable text that parses cleanly in Workday, Greenhouse, and Taleo.

### 2. 🔍 ATS Resume Analyzer
- **0–100 Compatibility Scoring**: Evaluates structural parseability, section detection, and overall ATS readability.
- **Keyword & Skills Matching**: Compares resume text directly against target job descriptions to identify missing technical skills.
- **Quantified Impact & Verb Analysis**: Evaluates high-impact action verbs and quantified achievements following Google's XYZ formula (*Accomplished [X], as measured by [Y], by doing [Z]*).

### 3. ✉️ Cover Letter Generator
- **Resume-Grounded Generation**: Creates role-tailored cover letters strictly grounded in your verified experience and achievements.
- **4 Distinct Tones**: Professional, Confident, Concise, and Enthusiastic.
- **In-Browser Editor & Export**: Real-time word and character counters, draft saving, and instant ATS-compliant PDF downloads.

### 4. 🔒 Authentication & Data Security
- **Multi-Provider Auth**: Google OAuth, GitHub OAuth, and Email/Password with PKCE flow.
- **Resilient Password Recovery**: Complete forgot/reset password flow with automatic PKCE code exchange, OTP token verification, and error handling.
- **Row Level Security (RLS)**: PostgreSQL Row Level Security enforces strict multi-tenant isolation—users can only access their own data.
- **Triple-Layer Storage Adapter**: Custom resilient auth storage spanning `localStorage`, secure `cookies`, and `sessionStorage` to prevent session loss across cross-origin OAuth redirects and Safari ITP.

---

## 🚀 Upcoming Roadmap (Coming Soon)

- **Job Matching & Application Tracker**: Intelligent opportunity matching, skills gap roadmaps, and Kanban-style pipeline tracking (Applied, Interviewing, Offer).
- **AI Career Copilot**: In-app conversational assistant for career transitions, salary negotiations, and interview guidance.
- **Interactive Mock Interviews**: Dynamic role-based behavioral, system design, and technical interview drills with STAR feedback scoring.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend Framework** | React 18.3, TypeScript 5.7, Vite 6.1 |
| **Styling & UI** | Tailwind CSS 3.4, Lucide React icons, Framer Motion animations |
| **State Management** | Zustand 5.0 |
| **Form Handling** | React Hook Form 7.54, Zod 3.24 schema validation |
| **Document Processing** | `@react-pdf/renderer` 4.9 (Vector PDF text streams), `pdf-parse` |
| **Backend & Database** | Supabase, PostgreSQL 15, Supabase Auth (PKCE flow, RLS policies) |
| **Testing** | Vitest 3.0, React Testing Library, jsdom (36 test suites, 172+ tests) |
| **Hosting & CI/CD** | Netlify (Continuous Deployment from `main`), Supabase Cloud |

---

## 📂 Project Structure

```text
RESUMAX_AI/
├── public/
│   ├── _redirects            # Netlify SPA routing fallback
│   └── favicon.svg           # Application favicon
├── src/
│   ├── app/
│   │   ├── App.tsx           # Root application component
│   │   └── router.tsx        # React Router routes and route guards
│   ├── components/
│   │   ├── animations/       # Framer Motion animations (Hero, ScrollProgress)
│   │   ├── layout/           # Navbar, Sidebar, Footer, DashboardLayout
│   │   └── ui/               # Reusable primitives (Button, Input, Card, Modal, Badge, Toast)
│   ├── features/
│   │   ├── analyzer/         # ATS Scanner & scoring engine
│   │   ├── auth/             # Login, Signup, Forgot/Reset Password forms & services
│   │   ├── copilot/          # Career Copilot (Coming Soon)
│   │   ├── cover-letter/     # Cover Letter generator, tones & PDF export
│   │   ├── dashboard/        # Overview, metrics & module cards
│   │   ├── interviews/       # Mock interview hub (Coming Soon)
│   │   ├── jobs/             # Job matching & tracker (Coming Soon)
│   │   └── resumes/          # Resume Builder, 4 templates & PDF renderer
│   ├── lib/
│   │   └── supabase/         # Supabase client, storage adapter & environment validation
│   ├── pages/                # Top-level page routes (LandingPage, LoginPage, SettingsPage, etc.)
│   ├── stores/               # Zustand state stores (authStore, uiStore)
│   ├── types/                # TypeScript type definitions (resume, auth, database)
│   └── utils/                # Helper utilities (cn, formatting, sanitize)
├── supabase/
│   └── migrations/           # PostgreSQL schemas, RLS policies, indexes
├── tests/
│   ├── integration/          # Integration test suites (Auth, Resumes, Analyzer, Cover Letter)
│   └── unit/                 # Unit tests (PDF engine, scoring algorithms, validation)
├── netlify.toml              # Netlify build configuration & SPA rewrites
├── package.json              # Project dependencies and npm scripts
├── tsconfig.json             # TypeScript compiler settings
└── vite.config.ts            # Vite bundler configuration
```

---

## 💻 Getting Started Locally

### Prerequisites
- **Node.js**: v18.x or v20.x+
- **npm**: v9.x or v10.x+
- **Supabase Account**: Free project for database and authentication

### 1. Clone the Repository
```bash
git clone https://github.com/KALYAN17408/RESUME.git
cd RESUME
```

### 2. Install Dependencies
```bash
npm install
```

### 3. Configure Environment Variables
Create a `.env` file in the project root:
```env
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
VITE_SITE_URL=http://localhost:5173
```

### 4. Start Local Development Server
```bash
npm run dev
```
Open [http://localhost:5173](http://localhost:5173) in your browser.

---

## 🧪 Testing & Quality Assurance

RESUME AI includes comprehensive unit and integration test coverage:

```bash
# Run all tests once
npm test

# Run tests in watch mode
npm run test:watch

# Run TypeScript type check
npm run typecheck
```

**Test Coverage Highlights:**
- **Auth Flows**: Google OAuth, GitHub OAuth, password reset, PKCE exchange, session persistence.
- **PDF Generation**: Selectable text-stream extraction across all 4 ATS templates.
- **ATS Engine**: Keyword taxonomy parsing, metric detection, verb verification, and scoring formulas.
- **Data Integrity**: LocalStorage fallback resilience and schema migration backward compatibility.

---

## 🚢 Building for Production

```bash
npm run build
```
This runs TypeScript verification (`tsc --noEmit`) followed by Vite optimization, outputting production assets into the `dist/` directory.

### Netlify Deployment
Every push to the `main` branch automatically triggers a production deployment on Netlify. SPA routing is handled via `public/_redirects` and `netlify.toml`:
```toml
[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

---

## 📄 License

This project is licensed under the [MIT License](LICENSE).
