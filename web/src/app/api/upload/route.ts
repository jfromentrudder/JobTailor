import { withAuth } from "@/lib/api-auth";
import { extractTextFromPdf } from "@/lib/pdf/extract";
import { NextResponse } from "next/server";
import crypto from "crypto";

export const POST = withAuth(async (request, user, supabase) => {
  const formData = await request.formData();
  const file = formData.get("file") as File | null;

  if (!file || file.type !== "application/pdf") {
    return NextResponse.json({ error: "PDF file required" }, { status: 400 });
  }
  if (file.size > 10 * 1024 * 1024) {
    return NextResponse.json(
      { error: "File too large (max 10MB)" },
      { status: 400 }
    );
  }

  const buffer = Buffer.from(await file.arrayBuffer());

  let extractedText = "";
  try {
    extractedText = await extractTextFromPdf(buffer);
  } catch (err) {
    console.error("PDF parse error:", err);
    return NextResponse.json(
      { error: "Could not parse PDF. Please try a different file." },
      { status: 400 }
    );
  }

  const storagePath = `${user.id}/${crypto.randomUUID()}.pdf`;
  const { error: uploadError } = await supabase.storage
    .from("base-resumes")
    .upload(storagePath, buffer, { contentType: "application/pdf" });

  if (uploadError) {
    return NextResponse.json(
      { error: "Upload failed: " + uploadError.message },
      { status: 500 }
    );
  }

  // Unset previous primary resume
  await supabase
    .from("resumes")
    .update({ is_primary: false })
    .eq("user_id", user.id)
    .eq("is_primary", true);

  const { data, error } = await supabase
    .from("resumes")
    .insert({
      user_id: user.id,
      file_name: file.name,
      storage_path: storagePath,
      extracted_text: extractedText,
      is_primary: true,
      file_size_bytes: file.size,
    })
    .select()
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json(data, { status: 201 });
});
