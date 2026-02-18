-- JobTailor Initial Schema
-- Run this in the Supabase SQL Editor

-- =========================================
-- Table: user_settings
-- =========================================
CREATE TABLE public.user_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
    full_name TEXT,
    ai_provider TEXT DEFAULT 'openai' CHECK (ai_provider IN ('openai', 'anthropic')),
    ai_model TEXT DEFAULT 'gpt-4o-mini',
    custom_api_key_encrypted TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- =========================================
-- Table: resumes (base resumes uploaded by users)
-- =========================================
CREATE TABLE public.resumes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    file_name TEXT NOT NULL,
    storage_path TEXT NOT NULL,
    extracted_text TEXT,
    is_primary BOOLEAN DEFAULT false,
    file_size_bytes INTEGER,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Ensure only one primary resume per user
CREATE UNIQUE INDEX idx_one_primary_resume
    ON public.resumes (user_id) WHERE is_primary = true;

-- =========================================
-- Table: tailored_resumes
-- =========================================
CREATE TABLE public.tailored_resumes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    base_resume_id UUID REFERENCES public.resumes(id) ON DELETE SET NULL,
    job_title TEXT NOT NULL,
    company_name TEXT,
    job_url TEXT,
    job_description_text TEXT NOT NULL,
    tailored_content JSONB,
    tailored_resume_url TEXT,
    ai_provider TEXT NOT NULL,
    ai_model TEXT NOT NULL,
    tokens_used INTEGER,
    status TEXT DEFAULT 'processing'
        CHECK (status IN ('processing', 'completed', 'failed')),
    error_message TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_tailored_resumes_user_id ON public.tailored_resumes(user_id);
CREATE INDEX idx_tailored_resumes_status ON public.tailored_resumes(status);

-- =========================================
-- Table: usage_tracking
-- =========================================
CREATE TABLE public.usage_tracking (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
    month_year TEXT NOT NULL,
    tailor_count INTEGER DEFAULT 0,
    UNIQUE(user_id, month_year)
);

-- =========================================
-- RLS Policies
-- =========================================
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tailored_resumes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.usage_tracking ENABLE ROW LEVEL SECURITY;

-- user_settings
CREATE POLICY "user_settings_select" ON public.user_settings
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "user_settings_insert" ON public.user_settings
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "user_settings_update" ON public.user_settings
    FOR UPDATE USING (auth.uid() = user_id);

-- resumes
CREATE POLICY "resumes_select" ON public.resumes
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "resumes_insert" ON public.resumes
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "resumes_update" ON public.resumes
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "resumes_delete" ON public.resumes
    FOR DELETE USING (auth.uid() = user_id);

-- tailored_resumes
CREATE POLICY "tailored_resumes_select" ON public.tailored_resumes
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "tailored_resumes_insert" ON public.tailored_resumes
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "tailored_resumes_update" ON public.tailored_resumes
    FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "tailored_resumes_delete" ON public.tailored_resumes
    FOR DELETE USING (auth.uid() = user_id);

-- usage_tracking
CREATE POLICY "usage_select" ON public.usage_tracking
    FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "usage_insert" ON public.usage_tracking
    FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "usage_update" ON public.usage_tracking
    FOR UPDATE USING (auth.uid() = user_id);

-- =========================================
-- Trigger: auto-create user_settings on signup
-- =========================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.user_settings (user_id, full_name)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', '')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =========================================
-- Function: increment usage (called from API via RPC)
-- =========================================
CREATE OR REPLACE FUNCTION public.increment_usage(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
    current_month TEXT;
    new_count INTEGER;
BEGIN
    current_month := TO_CHAR(NOW(), 'YYYY-MM');

    INSERT INTO public.usage_tracking (user_id, month_year, tailor_count)
    VALUES (p_user_id, current_month, 1)
    ON CONFLICT (user_id, month_year)
    DO UPDATE SET tailor_count = usage_tracking.tailor_count + 1
    RETURNING tailor_count INTO new_count;

    RETURN new_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =========================================
-- Storage Buckets (create via Supabase dashboard or CLI)
-- Bucket: base-resumes (private)
-- Bucket: tailored-resumes (private)
-- =========================================

-- Storage RLS for base-resumes
CREATE POLICY "Users upload own base resumes"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'base-resumes'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users read own base resumes"
ON storage.objects FOR SELECT
USING (
    bucket_id = 'base-resumes'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users delete own base resumes"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'base-resumes'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

-- Storage RLS for tailored-resumes
CREATE POLICY "Users upload own tailored resumes"
ON storage.objects FOR INSERT
WITH CHECK (
    bucket_id = 'tailored-resumes'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users read own tailored resumes"
ON storage.objects FOR SELECT
USING (
    bucket_id = 'tailored-resumes'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
);

CREATE POLICY "Users delete own tailored resumes"
ON storage.objects FOR DELETE
USING (
    bucket_id = 'tailored-resumes'
    AND auth.role() = 'authenticated'
    AND (storage.foldername(name))[1] = auth.uid()::text
);
