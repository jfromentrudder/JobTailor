import { tailorWithOpenAI } from "./openai";
import { tailorWithAnthropic } from "./anthropic";
import { decrypt } from "@/lib/encryption";
import type { TailoredContent } from "@/types";

interface TailorOptions {
  resumeText: string;
  jobDescription: string;
  jobTitle: string;
  companyName?: string;
  provider: string;
  model: string;
  encryptedApiKey?: string | null;
}

export async function tailorResume(
  options: TailorOptions
): Promise<TailoredContent & { _tokensUsed?: number }> {
  const { provider, encryptedApiKey } = options;

  let resolvedApiKey: string;
  if (encryptedApiKey) {
    resolvedApiKey = decrypt(encryptedApiKey);
  } else if (provider === "openai") {
    if (!process.env.OPENAI_API_KEY) {
      throw new Error("Platform OpenAI API key not configured");
    }
    resolvedApiKey = process.env.OPENAI_API_KEY;
  } else {
    throw new Error(
      `No API key available for provider "${provider}". Please add your own API key in settings.`
    );
  }

  const tailorOptions = {
    resumeText: options.resumeText,
    jobDescription: options.jobDescription,
    jobTitle: options.jobTitle,
    companyName: options.companyName,
    model: options.model,
    resolvedApiKey,
  };

  switch (provider) {
    case "openai":
      return tailorWithOpenAI(tailorOptions);
    case "anthropic":
      return tailorWithAnthropic(tailorOptions);
    default:
      throw new Error(`Unsupported AI provider: ${provider}`);
  }
}
