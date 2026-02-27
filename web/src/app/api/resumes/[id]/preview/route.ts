import { withAuth } from "@/lib/api-auth";
import { NextResponse } from "next/server";

export const GET = withAuth(async (request, user, supabase) => {
  const id = new URL(request.url).pathname.split("/").at(-2);

  const { data: resume, error } = await supabase
    .from("resumes")
    .select("id, storage_path, file_name")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (error || !resume) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { data: signedData, error: signError } = await supabase.storage
    .from("base-resumes")
    .createSignedUrl(resume.storage_path, 3600); // 1 hour expiry

  if (signError || !signedData?.signedUrl) {
    return NextResponse.json(
      { error: "Failed to generate preview URL" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    url: signedData.signedUrl,
    file_name: resume.file_name,
  });
});
