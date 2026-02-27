import { z } from "zod";

export const tailorRequestSchema = z.object({
  job_description_text: z
    .string()
    .min(50, "Job description must be at least 50 characters")
    .max(15000, "Job description is too long"),
  job_title: z
    .string()
    .min(1, "Job title is required")
    .max(200),
  company_name: z.string().max(200).optional(),
  job_url: z.string().url().optional().or(z.literal("")),
});

export const settingsSchema = z.object({
  ai_provider: z.enum(["openai", "anthropic"]),
  ai_model: z.string().min(1),
  custom_api_key: z.string().optional(),
  full_name: z.string().max(200).optional(),
  // Profile fields for job application autofill
  phone: z.string().max(30).optional(),
  linkedin_url: z.string().url().or(z.literal("")).optional(),
  location: z.string().max(200).optional(),
  work_authorization: z.string().max(100).optional(),
  years_of_experience: z.number().int().min(0).max(60).optional().nullable(),
  education_level: z.string().max(100).optional(),
  current_title: z.string().max(200).optional(),
  portfolio_url: z.string().url().or(z.literal("")).optional(),
  github_url: z.string().url().or(z.literal("")).optional(),
  desired_salary: z.string().max(100).optional(),
  willing_to_relocate: z.boolean().optional(),
  visa_sponsorship_needed: z.boolean().optional(),
});
