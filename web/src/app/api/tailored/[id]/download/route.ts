import { withAuth } from "@/lib/api-auth";
import { NextResponse } from "next/server";

export const GET = withAuth(async (request, user, supabase) => {
  const segments = new URL(request.url).pathname.split("/");
  // /api/tailored/[id]/download → id is at index -2
  const id = segments[segments.length - 2];

  const { data: resume } = await supabase
    .from("tailored_resumes")
    .select("tailored_resume_url, job_title, company_name")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!resume?.tailored_resume_url) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { data: file } = await supabase.storage
    .from("tailored-resumes")
    .download(resume.tailored_resume_url);

  if (!file) {
    return NextResponse.json({ error: "File not found" }, { status: 404 });
  }

  const filename = `${resume.job_title}_${resume.company_name || "resume"}.pdf`.replace(
    /[^a-zA-Z0-9._-]/g,
    "_"
  );

  return new NextResponse(file.stream(), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
});
