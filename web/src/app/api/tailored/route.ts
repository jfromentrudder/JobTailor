import { withAuth } from "@/lib/api-auth";
import { NextResponse } from "next/server";

export const GET = withAuth(async (_request, user, supabase) => {
  const { data, error } = await supabase
    .from("tailored_resumes")
    .select("id, job_title, company_name, status, created_at, tailored_resume_url")
    .eq("user_id", user.id)
    .eq("status", "completed")
    .order("created_at", { ascending: false })
    .limit(20);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data ?? []);
});
