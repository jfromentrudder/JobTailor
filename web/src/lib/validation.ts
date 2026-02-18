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
});
