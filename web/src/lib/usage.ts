import { SupabaseClient } from "@supabase/supabase-js";

const FREE_TIER_LIMIT = 5;

export async function checkUsage(
  supabase: SupabaseClient,
  userId: string
) {
  const { data: settings } = await supabase
    .from("user_settings")
    .select("custom_api_key_encrypted")
    .eq("user_id", userId)
    .single();

  const hasCustomKey = !!settings?.custom_api_key_encrypted;
  if (hasCustomKey) {
    return { allowed: true, tailor_count: 0, limit: Infinity, has_custom_key: true };
  }

  const monthYear = new Date().toISOString().slice(0, 7);
  const { data: usage } = await supabase
    .from("usage_tracking")
    .select("tailor_count")
    .eq("user_id", userId)
    .eq("month_year", monthYear)
    .single();

  const count = usage?.tailor_count ?? 0;
  return {
    allowed: count < FREE_TIER_LIMIT,
    tailor_count: count,
    limit: FREE_TIER_LIMIT,
    has_custom_key: false,
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
