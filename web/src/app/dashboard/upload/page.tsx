import { createClient } from "@/lib/supabase/server";
import { UploadForm } from "@/components/upload-form";
import { FileText, Calendar } from "lucide-react";

export default async function UploadPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: resumes } = await supabase
    .from("resumes")
    .select("id, file_name, is_primary, file_size_bytes, created_at")
    .eq("user_id", user!.id)
    .order("created_at", { ascending: false });

  const primaryResume = resumes?.find((r) => r.is_primary);

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Upload Resume</h1>
      <p className="text-gray-500 mb-8">
        Upload your base resume as a PDF. This will be used as the starting
        point for all tailored versions.
      </p>

      {primaryResume && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-sm font-medium text-blue-800 mb-1">
            Current Base Resume
          </p>
          <div className="flex items-center gap-2 text-blue-700">
            <FileText className="h-4 w-4" />
            <span className="text-sm">{primaryResume.file_name}</span>
            <span className="text-xs text-blue-500 flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {new Date(primaryResume.created_at).toLocaleDateString()}
            </span>
          </div>
          <p className="text-xs text-blue-600 mt-1">
            Uploading a new resume will replace this one as your primary.
          </p>
        </div>
      )}

      <UploadForm />
    </div>
  );
}
