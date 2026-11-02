-- Migration: 20261102000000_create_resumes_schema.sql
-- Description: Creates resumes, resume_sections, resume_templates, and resume_versions tables with Row Level Security (RLS)
-- Phase: Phase 2 Core Resume Builder

-- 1. Create resume_templates catalog table
CREATE TABLE IF NOT EXISTS public.resume_templates (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('tech', 'academic', 'executive', 'modern')),
    description TEXT,
    thumbnail_url TEXT,
    is_pro_only BOOLEAN NOT NULL DEFAULT FALSE,
    config JSONB NOT NULL DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Seed standard ATS-compliant templates
INSERT INTO public.resume_templates (id, name, category, description, is_pro_only, config)
VALUES 
    ('jakes-technical', 'Jake''s Technical', 'tech', 'Minimalist single-column format favored by Big Tech recruiters. High density and zero ATS parsing tables.', FALSE, '{"fontFamily": "Inter", "accentColor": "#0f172a", "spacing": "compact"}'::jsonb),
    ('harvard-classic', 'Harvard Classic', 'academic', 'Traditional serif layout with centered hierarchy, formal section dividers, and conservative margins.', FALSE, '{"fontFamily": "Merriweather", "accentColor": "#1e293b", "spacing": "normal"}'::jsonb),
    ('stanford-editorial', 'Stanford Editorial', 'modern', 'Refined visual hierarchy with subtle ink accents, left-aligned headings, and contemporary spacing.', FALSE, '{"fontFamily": "Inter", "accentColor": "#4338ca", "spacing": "normal"}'::jsonb),
    ('modern-tech-clean', 'Modern Tech Clean', 'modern', 'Crisp sans-serif presentation with subtle accent branding, structured skills tags, and clear project links.', FALSE, '{"fontFamily": "Inter", "accentColor": "#2563eb", "spacing": "relaxed"}'::jsonb)
ON CONFLICT (id) DO NOTHING;

-- 2. Create resumes master table
CREATE TABLE IF NOT EXISTS public.resumes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    title TEXT NOT NULL DEFAULT 'Untitled Resume',
    target_role TEXT,
    summary TEXT,
    template_id TEXT NOT NULL REFERENCES public.resume_templates(id) DEFAULT 'jakes-technical',
    customization JSONB NOT NULL DEFAULT '{
        "accentColor": "#0f172a",
        "fontFamily": "Inter",
        "fontSize": "medium",
        "lineSpacing": "normal",
        "margins": "normal"
    }'::jsonb,
    personal_info JSONB NOT NULL DEFAULT '{}'::jsonb,
    sections_order TEXT[] NOT NULL DEFAULT ARRAY['personal', 'summary', 'experience', 'education', 'skills', 'projects', 'certifications']::TEXT[],
    enabled_sections JSONB NOT NULL DEFAULT '{
        "personal": true,
        "summary": true,
        "experience": true,
        "education": true,
        "skills": true,
        "projects": true,
        "certifications": true,
        "achievements": false,
        "languages": false,
        "publications": false,
        "volunteer": false,
        "interests": false
    }'::jsonb,
    is_primary BOOLEAN NOT NULL DEFAULT FALSE,
    ats_score INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Create resume_sections table for modular section storage
CREATE TABLE IF NOT EXISTS public.resume_sections (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resume_id UUID NOT NULL REFERENCES public.resumes(id) ON DELETE CASCADE,
    section_type TEXT NOT NULL CHECK (section_type IN ('personal', 'summary', 'experience', 'education', 'skills', 'projects', 'certifications', 'achievements', 'awards', 'languages', 'publications', 'volunteer', 'interests')),
    section_title TEXT NOT NULL,
    display_order INTEGER NOT NULL DEFAULT 0,
    content JSONB NOT NULL DEFAULT '{}'::jsonb,
    is_visible BOOLEAN NOT NULL DEFAULT TRUE,
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Create resume_versions table for point-in-time snapshots
CREATE TABLE IF NOT EXISTS public.resume_versions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resume_id UUID NOT NULL REFERENCES public.resumes(id) ON DELETE CASCADE,
    created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    version_number INTEGER NOT NULL,
    change_summary TEXT,
    snapshot JSONB NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Indexes for fast query performance
CREATE INDEX IF NOT EXISTS idx_resumes_user_id ON public.resumes(user_id);
CREATE INDEX IF NOT EXISTS idx_resumes_updated_at ON public.resumes(user_id, updated_at DESC);
CREATE INDEX IF NOT EXISTS idx_resume_sections_resume_order ON public.resume_sections(resume_id, display_order ASC);
CREATE INDEX IF NOT EXISTS idx_resume_sections_content_gin ON public.resume_sections USING GIN (content);
CREATE INDEX IF NOT EXISTS idx_resume_versions_resume_num ON public.resume_versions(resume_id, version_number DESC);

-- 6. Trigger to automatically update updated_at on resumes
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trigger_resumes_updated_at ON public.resumes;
CREATE TRIGGER trigger_resumes_updated_at
    BEFORE UPDATE ON public.resumes
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- 7. Enable Row Level Security (RLS) on all tables
ALTER TABLE public.resume_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resume_sections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resume_versions ENABLE ROW LEVEL SECURITY;

-- 8. RLS Policies

-- resume_templates: Read access for all authenticated users, writes restricted
CREATE POLICY "Templates are viewable by authenticated users"
    ON public.resume_templates
    FOR SELECT
    TO authenticated
    USING (TRUE);

-- resumes: Users can CRUD only their own resumes
CREATE POLICY "Users can view their own resumes"
    ON public.resumes
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own resumes"
    ON public.resumes
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own resumes"
    ON public.resumes
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own resumes"
    ON public.resumes
    FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);

-- resume_sections: Access allowed only if the parent resume belongs to the user
CREATE POLICY "Users can view sections of their own resumes"
    ON public.resume_sections
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.resumes
            WHERE public.resumes.id = public.resume_sections.resume_id
              AND public.resumes.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert sections to their own resumes"
    ON public.resume_sections
    FOR INSERT
    TO authenticated
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.resumes
            WHERE public.resumes.id = public.resume_sections.resume_id
              AND public.resumes.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update sections of their own resumes"
    ON public.resume_sections
    FOR UPDATE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.resumes
            WHERE public.resumes.id = public.resume_sections.resume_id
              AND public.resumes.user_id = auth.uid()
        )
    )
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM public.resumes
            WHERE public.resumes.id = public.resume_sections.resume_id
              AND public.resumes.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete sections of their own resumes"
    ON public.resume_sections
    FOR DELETE
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.resumes
            WHERE public.resumes.id = public.resume_sections.resume_id
              AND public.resumes.user_id = auth.uid()
        )
    );

-- resume_versions: Read/Write restricted to owner of the parent resume
CREATE POLICY "Users can view versions of their own resumes"
    ON public.resume_versions
    FOR SELECT
    TO authenticated
    USING (
        EXISTS (
            SELECT 1 FROM public.resumes
            WHERE public.resumes.id = public.resume_versions.resume_id
              AND public.resumes.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can create versions for their own resumes"
    ON public.resume_versions
    FOR INSERT
    TO authenticated
    WITH CHECK (
        auth.uid() = created_by AND
        EXISTS (
            SELECT 1 FROM public.resumes
            WHERE public.resumes.id = public.resume_versions.resume_id
              AND public.resumes.user_id = auth.uid()
        )
    );
