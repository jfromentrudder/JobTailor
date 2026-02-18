import { withAuth } from "@/lib/api-auth";
import { settingsSchema } from "@/lib/validation";
import { encrypt } from "@/lib/encryption";
import { NextResponse } from "next/server";

export const GET = withAuth(async (_request, user, supabase) => {
  const { data, error } = await supabase
    .from("user_settings")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Never send the encrypted key to the client
  return NextResponse.json({
    ...data,
    has_custom_api_key: !!data.custom_api_key_encrypted,
    custom_api_key_encrypted: undefined,
  });
});

export const PUT = withAuth(async (request, user, supabase) => {
  const body = await request.json();
  const parsed = settingsSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const updates: Record<string, unknown> = {
    ai_provider: parsed.data.ai_provider,
    ai_model: parsed.data.ai_model,
    updated_at: new Date().toISOString(),
  };

  if (parsed.data.full_name !== undefined) {
    updates.full_name = parsed.data.full_name;
  }

  if (parsed.data.custom_api_key !== undefined) {
    if (parsed.data.custom_api_key === "") {
      updates.custom_api_key_encrypted = null;
    } else {
      updates.custom_api_key_encrypted = encrypt(parsed.data.custom_api_key);
    }
  }

  const { data, error } = await supabase
    .from("user_settings")
    .update(updates)
    .eq("user_id", user.id)
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    ...data,
    has_custom_api_key: !!data.custom_api_key_encrypted,
    custom_api_key_encrypted: undefined,
  });
});
