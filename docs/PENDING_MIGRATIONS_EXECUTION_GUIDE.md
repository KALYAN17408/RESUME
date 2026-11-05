# RESUME AI — Pending Migration Execution & Verification Guide

**Project:** `D:\RESUMAX_AI`  
**Remote Supabase Project:** `mnjekjorvdsvnshumhbr` (`https://mnjekjorvdsvnshumhbr.supabase.co`)  
**Target Environment:** Production PostgreSQL 15+  
**Execution Mode:** Supabase Dashboard SQL Editor (Manual & Verified)  
**Date:** November 5, 2026  

---

## 1. Executive Summary & Safety Certification

This guide provides the complete, pre-audited SQL scripts for the three pending database migrations in **RESUME AI**:

1. **Step 1:** `20261103000000_create_ats_reports_schema.sql` (Phase 3 ATS Analyzer)
2. **Step 2:** `20261104000000_create_resume_optimization_sessions_schema.sql` (Phase 4 AI Optimizer & Cover Letter)
3. **Step 3:** `20261105000000_create_career_features_schema.sql` (Job Matching, Career Copilot, Mock Interviews)

### Safety Certification
- **Zero Destructive Operations:** Contains **NO** `DROP TABLE`, **NO** `DROP COLUMN`, **NO** `TRUNCATE`, and **NO** destructive data mutations.
- **Idempotency:** Every table creation uses `CREATE TABLE IF NOT EXISTS`, every index uses `CREATE INDEX IF NOT EXISTS`, and all policies are guarded with `DROP POLICY IF EXISTS`.
- **Existing User Data Safety:** The 5 existing remote tables (`profiles`, `resumes`, `resume_templates`, `resume_sections`, `resume_versions`) and their records remain 100% untouched.
- **Strict Row-Level Security (RLS):** Every newly created table has RLS explicitly enabled with authenticated user ownership enforcement (`auth.uid() = user_id`). Anonymous access is completely blocked.

---

## 2. Chronological Migration Scripts

Execute the following three scripts sequentially in the [Supabase Dashboard SQL Editor](https://supabase.com/dashboard/project/mnjekjorvdsvnshumhbr/sql/new).

---

### SCRIPT 1: Phase 3 ATS Resume Analyzer Schema
**Source File:** [`supabase/migrations/20261103000000_create_ats_reports_schema.sql`](file:///D:/RESUMAX_AI/supabase/migrations/20261103000000_create_ats_reports_schema.sql)  
**Purpose:** Creates `public.ats_reports` table for diagnostic compatibility scores and keyword matching.

```sql
-- ============================================================================
-- SCRIPT 1: 20261103000000_create_ats_reports_schema.sql
-- ============================================================================

-- 1. Create ats_reports table
CREATE TABLE IF NOT EXISTS public.ats_reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    resume_id UUID REFERENCES public.resumes(id) ON DELETE SET NULL,
    resume_title TEXT,
    file_name TEXT,
    job_title TEXT,
    company_name TEXT,
    job_description TEXT NOT NULL,
    overall_score INTEGER NOT NULL CHECK (overall_score >= 0 AND overall_score <= 100),
    keyword_score INTEGER NOT NULL CHECK (keyword_score >= 0 AND keyword_score <= 100),
    skills_score INTEGER NOT NULL CHECK (skills_score >= 0 AND skills_score <= 100),
    section_score INTEGER NOT NULL CHECK (section_score >= 0 AND section_score <= 100),
    formatting_score INTEGER NOT NULL CHECK (formatting_score >= 0 AND formatting_score <= 100),
    scores JSONB NOT NULL DEFAULT '{}'::jsonb,
    matched_keywords JSONB NOT NULL DEFAULT '[]'::jsonb,
    missing_keywords JSONB NOT NULL DEFAULT '[]'::jsonb,
    sections JSONB NOT NULL DEFAULT '[]'::jsonb,
    formatting JSONB NOT NULL DEFAULT '[]'::jsonb,
    recommendations JSONB NOT NULL DEFAULT '[]'::jsonb,
    raw_extracted_text TEXT,
    word_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Fast query indexes
CREATE INDEX IF NOT EXISTS idx_ats_reports_user_id ON public.ats_reports(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_ats_reports_resume_id ON public.ats_reports(resume_id);

-- 3. Automatic timestamp trigger
DROP TRIGGER IF EXISTS trigger_ats_reports_updated_at ON public.ats_reports;
CREATE TRIGGER trigger_ats_reports_updated_at
    BEFORE UPDATE ON public.ats_reports
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.ats_reports ENABLE ROW LEVEL SECURITY;

-- 5. Idempotent policy drops
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Users can view their own ATS reports" ON public.ats_reports;
    DROP POLICY IF EXISTS "Users can insert their own ATS reports" ON public.ats_reports;
    DROP POLICY IF EXISTS "Users can update their own ATS reports" ON public.ats_reports;
    DROP POLICY IF EXISTS "Users can delete their own ATS reports" ON public.ats_reports;
END $$;

-- 6. Strict authenticated user ownership policies
CREATE POLICY "Users can view their own ATS reports"
    ON public.ats_reports
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own ATS reports"
    ON public.ats_reports
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own ATS reports"
    ON public.ats_reports
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own ATS reports"
    ON public.ats_reports
    FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);
```

---

### SCRIPT 2: Phase 4 AI Optimization & Cover Letter Persistence
**Source File:** [`supabase/migrations/20261104000000_create_resume_optimization_sessions_schema.sql`](file:///D:/RESUMAX_AI/supabase/migrations/20261104000000_create_resume_optimization_sessions_schema.sql)  
**Purpose:** Creates `public.resume_optimization_sessions` table for cover letter drafts and tailoring history.

```sql
-- ============================================================================
-- SCRIPT 2: 20261104000000_create_resume_optimization_sessions_schema.sql
-- ============================================================================

-- 1. Create resume_optimization_sessions table
CREATE TABLE IF NOT EXISTS public.resume_optimization_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    resume_id UUID REFERENCES public.resumes(id) ON DELETE SET NULL,
    session_name TEXT NOT NULL DEFAULT 'Untitled Optimization',
    job_title TEXT,
    company_name TEXT,
    job_description TEXT NOT NULL,
    resume_version_id TEXT,
    original_resume_snapshot JSONB NOT NULL DEFAULT '{}'::jsonb,
    optimization_results JSONB NOT NULL DEFAULT '{
        "summaryResult": null,
        "bulletResults": {},
        "keywordResult": null
    }'::jsonb,
    staged_changes JSONB NOT NULL DEFAULT '{
        "stagedSummary": null,
        "stagedBullets": [],
        "confirmedSkills": [],
        "learningGoals": [],
        "rejectedKeywords": []
    }'::jsonb,
    cover_letter JSONB NOT NULL DEFAULT '{
        "coverLetterResult": null,
        "editedCoverLetter": "",
        "hiringManagerName": "",
        "additionalCoverLetterContext": "",
        "stagedCoverLetter": null
    }'::jsonb,
    status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'in_progress', 'partially_applied', 'completed', 'archived')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    last_opened_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Fast query indexes
CREATE INDEX IF NOT EXISTS idx_resume_optimization_sessions_user_id ON public.resume_optimization_sessions(user_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_resume_optimization_sessions_resume_id ON public.resume_optimization_sessions(resume_id);
CREATE INDEX IF NOT EXISTS idx_resume_optimization_sessions_status ON public.resume_optimization_sessions(status);

-- 3. Automatic timestamp trigger
DROP TRIGGER IF EXISTS trigger_resume_optimization_sessions_updated_at ON public.resume_optimization_sessions;
CREATE TRIGGER trigger_resume_optimization_sessions_updated_at
    BEFORE UPDATE ON public.resume_optimization_sessions
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- 4. Enable Row Level Security (RLS)
ALTER TABLE public.resume_optimization_sessions ENABLE ROW LEVEL SECURITY;

-- 5. Idempotent policy drops
DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Users can view their own optimization sessions" ON public.resume_optimization_sessions;
    DROP POLICY IF EXISTS "Users can insert their own optimization sessions" ON public.resume_optimization_sessions;
    DROP POLICY IF EXISTS "Users can update their own optimization sessions" ON public.resume_optimization_sessions;
    DROP POLICY IF EXISTS "Users can delete their own optimization sessions" ON public.resume_optimization_sessions;
END $$;

-- 6. Strict authenticated user ownership policies
CREATE POLICY "Users can view their own optimization sessions"
    ON public.resume_optimization_sessions
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own optimization sessions"
    ON public.resume_optimization_sessions
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own optimization sessions"
    ON public.resume_optimization_sessions
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own optimization sessions"
    ON public.resume_optimization_sessions
    FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);
```

---

### SCRIPT 3: Career Features (Job Matching, Copilot, Mock Interviews)
**Source File:** [`supabase/migrations/20261105000000_create_career_features_schema.sql`](file:///D:/RESUMAX_AI/supabase/migrations/20261105000000_create_career_features_schema.sql)  
**Purpose:** Creates schema for `saved_jobs`, `career_conversations`, `career_messages`, `mock_interview_sessions`, and `mock_interview_qa`.

```sql
-- ============================================================================
-- SCRIPT 3: 20261105000000_create_career_features_schema.sql
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Job Matching & Application Tracking (saved_jobs)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.saved_jobs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    resume_id UUID REFERENCES public.resumes(id) ON DELETE SET NULL,
    resume_title TEXT,
    title TEXT NOT NULL,
    company TEXT NOT NULL,
    location TEXT,
    employment_type TEXT DEFAULT 'full-time',
    job_url TEXT,
    job_description TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'interested',
    applied_date TIMESTAMPTZ,
    next_action_date TIMESTAMPTZ,
    notes TEXT,
    match_analysis JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_saved_jobs_user_id ON public.saved_jobs(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_saved_jobs_resume_id ON public.saved_jobs(resume_id);
CREATE INDEX IF NOT EXISTS idx_saved_jobs_status ON public.saved_jobs(user_id, status);

ALTER TABLE public.saved_jobs ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Users can view their own saved jobs" ON public.saved_jobs;
    DROP POLICY IF EXISTS "Users can insert their own saved jobs" ON public.saved_jobs;
    DROP POLICY IF EXISTS "Users can update their own saved jobs" ON public.saved_jobs;
    DROP POLICY IF EXISTS "Users can delete their own saved jobs" ON public.saved_jobs;
END $$;

CREATE POLICY "Users can view their own saved jobs"
    ON public.saved_jobs FOR SELECT TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own saved jobs"
    ON public.saved_jobs FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own saved jobs"
    ON public.saved_jobs FOR UPDATE TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own saved jobs"
    ON public.saved_jobs FOR DELETE TO authenticated
    USING (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- 2. AI Career Copilot (career_conversations & career_messages)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.career_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    resume_id UUID REFERENCES public.resumes(id) ON DELETE SET NULL,
    title TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_career_conversations_user_id ON public.career_conversations(user_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_career_conversations_resume_id ON public.career_conversations(resume_id);

ALTER TABLE public.career_conversations ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Users can view their own career conversations" ON public.career_conversations;
    DROP POLICY IF EXISTS "Users can insert their own career conversations" ON public.career_conversations;
    DROP POLICY IF EXISTS "Users can update their own career conversations" ON public.career_conversations;
    DROP POLICY IF EXISTS "Users can delete their own career conversations" ON public.career_conversations;
END $$;

CREATE POLICY "Users can view their own career conversations"
    ON public.career_conversations FOR SELECT TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own career conversations"
    ON public.career_conversations FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own career conversations"
    ON public.career_conversations FOR UPDATE TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own career conversations"
    ON public.career_conversations FOR DELETE TO authenticated
    USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.career_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES public.career_conversations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role TEXT NOT NULL,
    content TEXT NOT NULL,
    metadata JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_career_messages_conversation_id ON public.career_messages(conversation_id, created_at ASC);
CREATE INDEX IF NOT EXISTS idx_career_messages_user_id ON public.career_messages(user_id);

ALTER TABLE public.career_messages ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Users can view their own career messages" ON public.career_messages;
    DROP POLICY IF EXISTS "Users can insert their own career messages" ON public.career_messages;
    DROP POLICY IF EXISTS "Users can delete their own career messages" ON public.career_messages;
END $$;

CREATE POLICY "Users can view their own career messages"
    ON public.career_messages FOR SELECT TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own career messages"
    ON public.career_messages FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own career messages"
    ON public.career_messages FOR DELETE TO authenticated
    USING (auth.uid() = user_id);

-- ----------------------------------------------------------------------------
-- 3. Mock Interviews (mock_interview_sessions & mock_interview_qa)
-- ----------------------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.mock_interview_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    resume_id UUID REFERENCES public.resumes(id) ON DELETE SET NULL,
    resume_title TEXT,
    interview_type TEXT NOT NULL,
    target_role TEXT NOT NULL,
    company_name TEXT,
    job_description TEXT,
    difficulty TEXT NOT NULL DEFAULT 'intermediate',
    total_questions INTEGER NOT NULL DEFAULT 3,
    current_question_index INTEGER NOT NULL DEFAULT 0,
    status TEXT NOT NULL DEFAULT 'in_progress',
    overall_feedback JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_mock_interview_sessions_user_id ON public.mock_interview_sessions(user_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_mock_interview_sessions_status ON public.mock_interview_sessions(user_id, status);

ALTER TABLE public.mock_interview_sessions ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Users can view their own mock interview sessions" ON public.mock_interview_sessions;
    DROP POLICY IF EXISTS "Users can insert their own mock interview sessions" ON public.mock_interview_sessions;
    DROP POLICY IF EXISTS "Users can update their own mock interview sessions" ON public.mock_interview_sessions;
    DROP POLICY IF EXISTS "Users can delete their own mock interview sessions" ON public.mock_interview_sessions;
END $$;

CREATE POLICY "Users can view their own mock interview sessions"
    ON public.mock_interview_sessions FOR SELECT TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own mock interview sessions"
    ON public.mock_interview_sessions FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own mock interview sessions"
    ON public.mock_interview_sessions FOR UPDATE TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own mock interview sessions"
    ON public.mock_interview_sessions FOR DELETE TO authenticated
    USING (auth.uid() = user_id);

CREATE TABLE IF NOT EXISTS public.mock_interview_qa (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES public.mock_interview_sessions(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    question_index INTEGER NOT NULL,
    question TEXT NOT NULL,
    question_type TEXT NOT NULL,
    user_answer TEXT,
    feedback JSONB,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_mock_interview_qa_session_id ON public.mock_interview_qa(session_id, question_index ASC);
CREATE INDEX IF NOT EXISTS idx_mock_interview_qa_user_id ON public.mock_interview_qa(user_id);

ALTER TABLE public.mock_interview_qa ENABLE ROW LEVEL SECURITY;

DO $$ 
BEGIN
    DROP POLICY IF EXISTS "Users can view their own interview qa" ON public.mock_interview_qa;
    DROP POLICY IF EXISTS "Users can insert their own interview qa" ON public.mock_interview_qa;
    DROP POLICY IF EXISTS "Users can update their own interview qa" ON public.mock_interview_qa;
    DROP POLICY IF EXISTS "Users can delete their own interview qa" ON public.mock_interview_qa;
END $$;

CREATE POLICY "Users can view their own interview qa"
    ON public.mock_interview_qa FOR SELECT TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own interview qa"
    ON public.mock_interview_qa FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own interview qa"
    ON public.mock_interview_qa FOR UPDATE TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own interview qa"
    ON public.mock_interview_qa FOR DELETE TO authenticated
    USING (auth.uid() = user_id);
```

---

## 3. Post-Execution Verification Queries

Immediately after running the three scripts above in the Dashboard SQL Editor, run this validation query to confirm that all 12 tables and their RLS policies are in place:

```sql
-- 1. Verify all 12 tables exist in public schema
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN (
    'profiles',
    'resumes',
    'resume_templates',
    'resume_sections',
    'resume_versions',
    'ats_reports',
    'resume_optimization_sessions',
    'saved_jobs',
    'career_conversations',
    'career_messages',
    'mock_interview_sessions',
    'mock_interview_qa'
  )
ORDER BY table_name;

-- 2. Verify RLS is enabled on all tables
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public'
ORDER BY tablename;

-- 3. Verify total active policies per table
SELECT tablename, count(policyname) AS active_policies
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY tablename
ORDER BY tablename;
```

---

## 4. Reconciling Supabase CLI Migration History

After applying the SQL scripts in the Dashboard SQL Editor, you can sync Supabase's internal migration history table (`supabase_migrations.schema_migrations`) so that future `supabase db push` or `supabase migration list` commands recognize them:

```sql
-- Record all 5 migrations in the migration history table
INSERT INTO supabase_migrations.schema_migrations (version) VALUES
  ('20261101000000'),
  ('20261102000000'),
  ('20261103000000'),
  ('20261104000000'),
  ('20261105000000')
ON CONFLICT (version) DO NOTHING;
```

---

## 5. Security & Isolation Matrix

| Table Name | RLS Active | Foreign Key Link | Policy Scope | Anonymous Access |
| :--- | :---: | :--- | :--- | :---: |
| `ats_reports` | **YES** | `profiles.id` (CASCADE) | `auth.uid() = user_id` | **BLOCKED** |
| `resume_optimization_sessions` | **YES** | `profiles.id` (CASCADE) | `auth.uid() = user_id` | **BLOCKED** |
| `saved_jobs` | **YES** | `profiles.id` (CASCADE) | `auth.uid() = user_id` | **BLOCKED** |
| `career_conversations` | **YES** | `profiles.id` (CASCADE) | `auth.uid() = user_id` | **BLOCKED** |
| `career_messages` | **YES** | `career_conversations.id` (CASCADE) | `auth.uid() = user_id` | **BLOCKED** |
| `mock_interview_sessions` | **YES** | `profiles.id` (CASCADE) | `auth.uid() = user_id` | **BLOCKED** |
| `mock_interview_qa` | **YES** | `mock_interview_sessions.id` (CASCADE) | `auth.uid() = user_id` | **BLOCKED** |
