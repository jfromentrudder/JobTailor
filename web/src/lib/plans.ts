export type SubscriptionTier = "free" | "pro" | "plus";

export interface PlanDefinition {
  name: string;
  limit: number;
  allowedModels: string[];
  priceMonthly: number; // in cents
}

export const PLANS: Record<SubscriptionTier, PlanDefinition> = {
  free: {
    name: "Free",
    limit: 5,
    allowedModels: ["gpt-4o-mini"],
    priceMonthly: 0,
  },
  pro: {
    name: "Pro",
    limit: 50,
    allowedModels: [
      "gpt-4o-mini",
      "gpt-4o",
      "claude-sonnet-4-5-20250929",
      "claude-haiku-4-5-20251001",
    ],
    priceMonthly: 999,
  },
  plus: {
    name: "Plus",
    limit: 200,
    allowedModels: [
      "gpt-4o-mini",
      "gpt-4o",
      "gpt-4-turbo",
      "claude-sonnet-4-5-20250929",
      "claude-haiku-4-5-20251001",
    ],
    priceMonthly: 1999,
  },
};

export function getTierLimit(tier: string): number {
  return PLANS[tier as SubscriptionTier]?.limit ?? PLANS.free.limit;
}

export function isModelAllowed(tier: string, model: string): boolean {
  const plan = PLANS[tier as SubscriptionTier] ?? PLANS.free;
  return plan.allowedModels.includes(model);
}

export function getProviderForModel(model: string): "openai" | "anthropic" {
  return model.startsWith("claude") ? "anthropic" : "openai";
}
