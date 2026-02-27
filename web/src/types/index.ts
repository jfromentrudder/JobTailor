export interface UserSettings {
  id: string;
  user_id: string;
  full_name: string | null;
  ai_provider: "openai" | "anthropic";
  ai_model: string;
  custom_api_key_encrypted: string | null;
  subscription_tier: "free" | "pro" | "plus";
  // Profile fields for job application autofill
  phone: string | null;
  linkedin_url: string | null;
  location: string | null;
  work_authorization: string | null;
  years_of_experience: number | null;
  education_level: string | null;
  current_title: string | null;
  portfolio_url: string | null;
  github_url: string | null;
  desired_salary: string | null;
  willing_to_relocate: boolean;
  visa_sponsorship_needed: boolean;
  created_at: string;
  updated_at: string;
}

export interface BaseResume {
  id: string;
  user_id: string;
  file_name: string;
  storage_path: string;
  extracted_text: string | null;
  is_primary: boolean;
  file_size_bytes: number | null;
  created_at: string;
  updated_at: string;
}

export interface TailoredResume {
  id: string;
  user_id: string;
  base_resume_id: string | null;
  job_title: string;
  company_name: string | null;
  job_url: string | null;
  job_description_text: string;
  tailored_content: TailoredContent | null;
  tailored_resume_url: string | null;
  ai_provider: string;
  ai_model: string;
  tokens_used: number | null;
  status: "processing" | "completed" | "failed";
  error_message: string | null;
  created_at: string;
}

export interface TailoredContent {
  summary: string;
  experience: ExperienceEntry[];
  skills: string[];
  education: EducationEntry[];
  contact: ContactInfo;
}

export interface ExperienceEntry {
  title: string;
  company: string;
  dates: string;
  bullets: string[];
}

export interface EducationEntry {
  degree: string;
  school: string;
  year: string;
}

export interface ContactInfo {
  name: string;
  email: string;
  phone?: string;
  linkedin?: string;
  location?: string;
}

export interface UsageInfo {
  tailor_count: number;
  limit: number;
  has_custom_key: boolean;
  subscription_tier: "free" | "pro" | "plus";
  month_year: string;
  allowed: boolean;
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  monthly_limit: number;
  allowed_providers: string[];
  allowed_models: string[];
  price_monthly_cents: number;
}

export interface BillingRecord {
  id: string;
  user_id: string;
  plan_id: string;
  amount_cents: number;
  status: "pending" | "completed" | "failed" | "refunded";
  payment_provider: string | null;
  payment_provider_id: string | null;
  period_start: string;
  period_end: string;
  created_at: string;
}

export interface TailorRequest {
  job_description_text: string;
  job_title: string;
  company_name?: string;
  job_url?: string;
}

export interface TailorResponse {
  id: string;
  status: "processing" | "completed" | "failed";
  message: string;
}
