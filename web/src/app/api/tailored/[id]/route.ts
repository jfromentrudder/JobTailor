import { withAuth } from "@/lib/api-auth";
import { NextResponse } from "next/server";

export const GET = withAuth(async (request, user, supabase) => {
  const id = new URL(request.url).pathname.split("/").pop();

  const { data, error } = await supabase
    .from("tailored_resumes")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json(data);
});

export const DELETE = withAuth(async (request, user, supabase) => {
  const id = new URL(request.url).pathname.split("/").pop();

  const { data: resume } = await supabase
    .from("tailored_resumes")
    .select("tailored_resume_url")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!resume) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (resume.tailored_resume_url) {
    await supabase.storage
      .from("tailored-resumes")
      .remove([resume.tailored_resume_url]);
  }

  await supabase
    .from("tailored_resumes")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  return NextResponse.json({ success: true });
});
