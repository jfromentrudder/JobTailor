export interface UserSettings {
  id: string;
  user_id: string;
  full_name: string | null;
  ai_provider: "openai" | "anthropic";
  ai_model: string;
  custom_api_key_encrypted: string | null;
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
  month_year: string;
  allowed: boolean;
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
