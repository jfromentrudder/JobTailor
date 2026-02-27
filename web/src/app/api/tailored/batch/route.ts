import { withAuth } from "@/lib/api-auth";
import { NextResponse } from "next/server";
import { z } from "zod";

const batchDeleteSchema = z.object({
  ids: z.array(z.string().uuid()).min(1).max(50),
});

export const DELETE = withAuth(async (request, user, supabase) => {
  const body = await request.json();
  const parsed = batchDeleteSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { ids } = parsed.data;

  // Fetch all matching resumes owned by this user
  const { data: resumes, error: fetchError } = await supabase
    .from("tailored_resumes")
    .select("id, tailored_resume_url")
    .eq("user_id", user.id)
    .in("id", ids);

  if (fetchError) {
    return NextResponse.json(
      { error: "Failed to fetch resumes" },
      { status: 500 }
    );
  }

  if (!resumes || resumes.length === 0) {
    return NextResponse.json(
      { error: "No matching resumes found" },
      { status: 404 }
    );
  }

  // Delete storage files
  const storagePaths = resumes
    .map((r) => r.tailored_resume_url)
    .filter(Boolean) as string[];

  if (storagePaths.length > 0) {
    await supabase.storage.from("tailored-resumes").remove(storagePaths);
  }

  // Delete DB records
  const validIds = resumes.map((r) => r.id);
  const { error: deleteError } = await supabase
    .from("tailored_resumes")
    .delete()
    .eq("user_id", user.id)
    .in("id", validIds);

  if (deleteError) {
    return NextResponse.json(
      { error: "Failed to delete resumes" },
      { status: 500 }
    );
  }

  return NextResponse.json({
    success: true,
    deleted: validIds.length,
  });
});
