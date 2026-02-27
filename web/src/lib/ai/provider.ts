import { tailorWithOpenAI } from "./openai";
import { tailorWithAnthropic } from "./anthropic";
import { decrypt } from "@/lib/encryption";
import { isModelAllowed, PLANS } from "@/lib/plans";
import type { TailoredContent } from "@/types";

interface TailorOptions {
  resumeText: string;
  jobDescription: string;
  jobTitle: string;
  companyName?: string;
  provider: string;
  model: string;
  encryptedApiKey?: string | null;
  subscriptionTier?: string;
}

export async function tailorResume(
  options: TailorOptions
): Promise<TailoredContent & { _tokensUsed?: number }> {
  const { provider, encryptedApiKey, subscriptionTier } = options;

  // Validate model access when using platform API keys (not custom)
  if (!encryptedApiKey && subscriptionTier) {
    if (!isModelAllowed(subscriptionTier, options.model)) {
      const tierName = PLANS[subscriptionTier as keyof typeof PLANS]?.name ?? "Free";
      throw new Error(
        `Your ${tierName} plan doesn't include access to ${options.model}. Upgrade your plan or add your own API key in Settings.`
      );
    }
  }

  let resolvedApiKey: string;
  if (encryptedApiKey) {
    resolvedApiKey = decrypt(encryptedApiKey);
  } else if (
    provider === "openai" &&
    process.env.OPENAI_API_KEY &&
    process.env.OPENAI_API_KEY !== "placeholder-openai-key"
  ) {
    resolvedApiKey = process.env.OPENAI_API_KEY;
  } else {
    throw new Error(
      `No API key available. Please add your own ${provider === "openai" ? "OpenAI" : "Anthropic"} API key in Settings.`
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
