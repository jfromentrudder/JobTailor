import { withAuth } from "@/lib/api-auth";
import { checkUsage, incrementUsage } from "@/lib/usage";
import { tailorResume } from "@/lib/ai/provider";
import { generateResumePdf } from "@/lib/pdf/generate";
import { tailorRequestSchema } from "@/lib/validation";
import { NextResponse } from "next/server";

export const maxDuration = 60;

export const POST = withAuth(async (request, user, supabase) => {
  // 1. Validate request
  const body = await request.json();
  const parsed = tailorRequestSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.flatten() },
      { status: 400 }
    );
  }
  const { job_description_text, job_title, company_name, job_url } =
    parsed.data;

  // 2. Check usage limits
  const usage = await checkUsage(supabase, user.id);
  if (!usage.allowed) {
    return NextResponse.json(
      {
        error:
          "Monthly limit reached. Add your own API key in settings for unlimited use.",
      },
      { status: 429 }
    );
  }

  // 3. Get primary resume
  const { data: resume } = await supabase
    .from("resumes")
    .select("*")
    .eq("user_id", user.id)
    .eq("is_primary", true)
    .single();

  if (!resume?.extracted_text) {
    return NextResponse.json(
      { error: "No base resume found. Upload one first." },
      { status: 400 }
    );
  }

  // 4. Get AI settings
  const { data: settings } = await supabase
    .from("user_settings")
    .select("*")
    .eq("user_id", user.id)
    .single();

  const aiProvider = settings?.ai_provider || "openai";
  const aiModel = settings?.ai_model || "gpt-4o-mini";

  // 5. Create initial record (processing)
  const { data: tailoredRecord, error: insertError } = await supabase
    .from("tailored_resumes")
    .insert({
      user_id: user.id,
      base_resume_id: resume.id,
      job_title,
      company_name: company_name || null,
      job_url: job_url || null,
      job_description_text,
      ai_provider: aiProvider,
      ai_model: aiModel,
      status: "processing",
    })
    .select()
    .single();

  if (insertError || !tailoredRecord) {
    return NextResponse.json(
      { error: "Failed to create record" },
      { status: 500 }
    );
  }

  // 6. Call AI and generate PDF
  try {
    const tailoredContent = await tailorResume({
      resumeText: resume.extracted_text,
      jobDescription: job_description_text,
      jobTitle: job_title,
      companyName: company_name,
      provider: aiProvider,
      model: aiModel,
      encryptedApiKey: settings?.custom_api_key_encrypted,
    });

    const { _tokensUsed, ...contentWithoutTokens } = tailoredContent;

    // 7. Generate PDF
    const pdfBuffer = await generateResumePdf(contentWithoutTokens);

    // 8. Upload PDF to storage
    const pdfPath = `${user.id}/${tailoredRecord.id}.pdf`;
    const { error: uploadError } = await supabase.storage
      .from("tailored-resumes")
      .upload(pdfPath, pdfBuffer, { contentType: "application/pdf" });

    if (uploadError) {
      throw new Error("Failed to upload PDF: " + uploadError.message);
    }

    // 9. Update record as completed
    await supabase
      .from("tailored_resumes")
      .update({
        tailored_content: contentWithoutTokens,
        tailored_resume_url: pdfPath,
        status: "completed",
        tokens_used: _tokensUsed ?? null,
      })
      .eq("id", tailoredRecord.id);

    // 10. Increment usage
    await incrementUsage(supabase, user.id);

    return NextResponse.json({
      id: tailoredRecord.id,
      status: "completed",
      message: "Resume tailored successfully",
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Unknown error";
    await supabase
      .from("tailored_resumes")
      .update({ status: "failed", error_message: message })
      .eq("id", tailoredRecord.id);

    return NextResponse.json(
      { error: "Tailoring failed", details: message },
      { status: 500 }
    );
  }
});
