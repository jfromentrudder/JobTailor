import Anthropic from "@anthropic-ai/sdk";
import { TAILOR_SYSTEM_PROMPT, buildUserPrompt } from "./prompts";
import type { TailoredContent } from "@/types";

interface AnthropicTailorOptions {
  resumeText: string;
  jobDescription: string;
  jobTitle: string;
  companyName?: string;
  model: string;
  resolvedApiKey: string;
}

export async function tailorWithAnthropic(
  options: AnthropicTailorOptions
): Promise<TailoredContent & { _tokensUsed?: number }> {
  const client = new Anthropic({ apiKey: options.resolvedApiKey });

  const response = await client.messages.create({
    model: options.model || "claude-sonnet-4-20250514",
    max_tokens: 4000,
    system: TAILOR_SYSTEM_PROMPT,
    messages: [
      { role: "user", content: buildUserPrompt(options) },
    ],
  });

  const textBlock = response.content.find((b) => b.type === "text");
  if (!textBlock || textBlock.type !== "text")
    throw new Error("Empty response from Anthropic");

  // Extract JSON from response (may be wrapped in markdown code blocks)
  const jsonMatch = textBlock.text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("No JSON found in Anthropic response");

  return {
    ...JSON.parse(jsonMatch[0]),
    _tokensUsed: response.usage.input_tokens + response.usage.output_tokens,
  };
}
