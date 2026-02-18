import { createClient } from "@/lib/supabase/server";
import { ResumeCard } from "@/components/resume-card";
import { UsageMeter } from "@/components/usage-meter";
import { FileText, Upload } from "lucide-react";
import Link from "next/link";
import type { TailoredResume } from "@/types";

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: tailoredResumes } = await supabase
    .from("tailored_resumes")
    .select("*")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false });

  const { data: settings } = await supabase
    .from("user_settings")
    .select("custom_api_key_encrypted")
    .eq("user_id", user!.id)
    .single();

  const monthYear = new Date().toISOString().slice(0, 7);
  const { data: usage } = await supabase
    .from("usage_tracking")
    .select("tailor_count")
    .eq("user_id", user!.id)
    .eq("month_year", monthYear)
    .single();

  const hasCustomKey = !!settings?.custom_api_key_encrypted;
  const count = usage?.tailor_count ?? 0;
  const resumes = (tailoredResumes ?? []) as TailoredResume[];

  // Check if user has a base resume
  const { data: baseResumes } = await supabase
    .from("resumes")
    .select("id")
    .eq("user_id", user!.id)
    .eq("is_primary", true)
    .limit(1);

  const hasBaseResume = (baseResumes?.length ?? 0) > 0;

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-500 mt-1">
            Your tailored resumes and usage overview
          </p>
        </div>
      </div>

      <div className="mb-8">
        <UsageMeter count={count} limit={5} hasCustomKey={hasCustomKey} />
      </div>

      {!hasBaseResume && (
        <div className="mb-8 p-6 bg-amber-50 border border-amber-200 rounded-xl">
          <div className="flex items-center gap-3">
            <Upload className="h-6 w-6 text-amber-600" />
            <div>
              <p className="font-medium text-amber-800">
                Upload your base resume to get started
              </p>
              <p className="text-sm text-amber-600 mt-1">
                The extension needs a base resume to create tailored versions.
              </p>
            </div>
            <Link
              href="/dashboard/upload"
              className="ml-auto px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 text-sm"
            >
              Upload Resume
            </Link>
          </div>
        </div>
      )}

      {resumes.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-xl border border-gray-200">
          <FileText className="h-12 w-12 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">
            No tailored resumes yet
          </h3>
          <p className="text-gray-500 text-sm max-w-sm mx-auto">
            Browse job listings with the JobTailor extension installed, and
            we&apos;ll help you tailor your resume to each role.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {resumes.map((resume) => (
            <ResumeCard key={resume.id} resume={resume} />
          ))}
        </div>
      )}
    </div>
  );
}
