import OpenAI from "openai";
import { TAILOR_SYSTEM_PROMPT, buildUserPrompt } from "./prompts";
import type { TailoredContent } from "@/types";

interface OpenAITailorOptions {
  resumeText: string;
  jobDescription: string;
  jobTitle: string;
  companyName?: string;
  model: string;
  resolvedApiKey: string;
}

export async function tailorWithOpenAI(
  options: OpenAITailorOptions
): Promise<TailoredContent & { _tokensUsed?: number }> {
  const client = new OpenAI({ apiKey: options.resolvedApiKey });

  const response = await client.chat.completions.create({
    model: options.model,
    messages: [
      { role: "system", content: TAILOR_SYSTEM_PROMPT },
      { role: "user", content: buildUserPrompt(options) },
    ],
    response_format: { type: "json_object" },
    temperature: 0.3,
    max_tokens: 4000,
  });

  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error("Empty response from OpenAI");

  const parsed = JSON.parse(content) as TailoredContent;
  return {
    ...parsed,
    _tokensUsed: response.usage?.total_tokens,
  };
}
