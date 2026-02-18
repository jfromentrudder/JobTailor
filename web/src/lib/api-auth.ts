import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";
import type { SupabaseClient, User } from "@supabase/supabase-js";

type AuthenticatedHandler = (
  request: Request,
  user: User,
  supabase: SupabaseClient
) => Promise<NextResponse>;

export function withAuth(handler: AuthenticatedHandler) {
  return async (request: Request) => {
    // Try cookie-based auth first (web app)
    const supabase = await createClient();
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser();

    if (error || !user) {
      // Try Bearer token auth (extension)
      const authHeader = request.headers.get("Authorization");
      if (authHeader?.startsWith("Bearer ")) {
        const token = authHeader.slice(7);
        const { data: tokenData, error: tokenError } =
          await supabase.auth.getUser(token);
        if (!tokenError && tokenData.user) {
          return handler(request, tokenData.user, supabase);
        }
      }
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    return handler(request, user, supabase);
  };
}
