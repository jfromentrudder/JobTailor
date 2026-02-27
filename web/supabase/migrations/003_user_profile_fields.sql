-- Add profile fields to user_settings for job application autofill
ALTER TABLE public.user_settings
  ADD COLUMN phone TEXT,
  ADD COLUMN linkedin_url TEXT,
  ADD COLUMN location TEXT,
  ADD COLUMN work_authorization TEXT,
  ADD COLUMN years_of_experience INTEGER,
  ADD COLUMN education_level TEXT,
  ADD COLUMN current_title TEXT,
  ADD COLUMN portfolio_url TEXT,
  ADD COLUMN github_url TEXT,
  ADD COLUMN desired_salary TEXT,
  ADD COLUMN willing_to_relocate BOOLEAN DEFAULT false,
  ADD COLUMN visa_sponsorship_needed BOOLEAN DEFAULT false;
