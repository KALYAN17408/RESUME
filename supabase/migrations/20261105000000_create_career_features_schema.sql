-- Migration: 20261105000000_create_career_features_schema.sql
-- Description: Creates schema for Job Matching, AI Career Copilot, and Mock Interviews with Row Level Security (RLS)
-- Dependencies: 20261101000000_create_profiles_schema.sql, 20261102000000_create_resumes_schema.sql

-- ============================================================================
-- 1. Job Matching & Application Tracking (saved_jobs)
-- ============================================================================

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

-- ============================================================================
-- 2. AI Career Copilot (career_conversations & career_messages)
-- ============================================================================

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

-- ============================================================================
-- 3. Mock Interviews (mock_interview_sessions & mock_interview_qa)
-- ============================================================================

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
