import { SupabaseClient } from "@supabase/supabase-js";
import { getTierLimit } from "./plans";

export async function checkUsage(
  supabase: SupabaseClient,
  userId: string
) {
  const { data: settings } = await supabase
    .from("user_settings")
    .select("custom_api_key_encrypted, subscription_tier")
    .eq("user_id", userId)
    .single();

  const tier = settings?.subscription_tier || "free";
  const hasCustomKey = !!settings?.custom_api_key_encrypted;

  if (hasCustomKey) {
    return {
      allowed: true,
      tailor_count: 0,
      limit: Infinity,
      has_custom_key: true,
      subscription_tier: tier,
    };
  }

  const limit = getTierLimit(tier);
  const monthYear = new Date().toISOString().slice(0, 7);
  const { data: usage } = await supabase
    .from("usage_tracking")
    .select("tailor_count")
    .eq("user_id", userId)
    .eq("month_year", monthYear)
    .single();

  const count = usage?.tailor_count ?? 0;
  return {
    allowed: count < limit,
    tailor_count: count,
    limit,
    has_custom_key: false,
    subscription_tier: tier,
    month_year: monthYear,
  };
}

export async function incrementUsage(
  supabase: SupabaseClient,
  userId: string
) {
  const { data } = await supabase.rpc("increment_usage", {
    p_user_id: userId,
  });
  return data;
}
