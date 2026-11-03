-- Migration: 20261104000000_create_resume_optimization_sessions_schema.sql
-- Description: Creates resume_optimization_sessions table with Row Level Security (RLS) for Phase 4 AI Resume Optimizer
-- Phase: Phase 4F Optimization Session Persistence & History
-- Dependencies: 20261101000000_create_profiles_schema.sql, 20261102000000_create_resumes_schema.sql

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
