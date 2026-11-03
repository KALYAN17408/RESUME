-- Migration: 20261103000000_create_ats_reports_schema.sql
-- Description: Creates ats_reports table with Row Level Security (RLS) for Phase 3 ATS Resume Analyzer
-- Phase: Phase 3 ATS Resume Analyzer
-- Dependencies: 20261101000000_create_profiles_schema.sql, 20261102000000_create_resumes_schema.sql

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
