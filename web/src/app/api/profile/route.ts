import { withAuth } from "@/lib/api-auth";
import { NextResponse } from "next/server";

export const GET = withAuth(async (_request, user, supabase) => {
  const { data, error } = await supabase
    .from("user_settings")
    .select(
      "full_name, phone, linkedin_url, location, work_authorization, " +
      "years_of_experience, education_level, current_title, " +
      "portfolio_url, github_url, desired_salary, " +
      "willing_to_relocate, visa_sponsorship_needed"
    )
    .eq("user_id", user.id)
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  // Also get email from the user object
  const profileData = data as unknown as Record<string, unknown>;
  return NextResponse.json({
    ...profileData,
    email: user.email,
  });
});
