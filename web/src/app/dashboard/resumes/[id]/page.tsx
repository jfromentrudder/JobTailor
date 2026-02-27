import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";
import Link from "next/link";
import {
  ArrowLeft,
  Download,
  Trash2,
  Building2,
  ExternalLink,
  Clock,
  Cpu,
} from "lucide-react";
import type { TailoredResume, TailoredContent } from "@/types";
import { DeleteButton } from "./delete-button";

export default async function ResumeDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) redirect("/login");

  const { data: resume } = await supabase
    .from("tailored_resumes")
    .select("*")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (!resume) redirect("/dashboard");

  const r = resume as TailoredResume;
  const content = r.tailored_content as TailoredContent | null;

  return (
    <div className="max-w-3xl">
      <Link
        href="/dashboard"
        className="inline-flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Dashboard
      </Link>

      <div className="flex items-start justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">{r.job_title}</h1>
          {r.company_name && (
            <p className="flex items-center gap-1 text-gray-500 dark:text-gray-400 mt-1">
              <Building2 className="h-4 w-4" />
              {r.company_name}
            </p>
          )}
        </div>
        <div className="flex gap-2">
          {r.status === "completed" && (
            <a
              href={`/api/tailored/${r.id}/download`}
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
            >
              <Download className="h-4 w-4" />
              Download PDF
            </a>
          )}
          <DeleteButton id={r.id} />
        </div>
      </div>

      <div className="flex gap-4 text-sm text-gray-500 dark:text-gray-400 mb-8">
        <span className="flex items-center gap-1">
          <Clock className="h-3.5 w-3.5" />
          {new Date(r.created_at).toLocaleDateString()}
        </span>
        <span className="flex items-center gap-1">
          <Cpu className="h-3.5 w-3.5" />
          {r.ai_model}
        </span>
        {r.job_url && (
          <a
            href={r.job_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-blue-600 hover:underline"
          >
            <ExternalLink className="h-3.5 w-3.5" />
            Job Listing
          </a>
        )}
      </div>

      {r.status === "failed" && (
        <div className="p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg mb-6">
          <p className="text-red-700 dark:text-red-300 font-medium">Tailoring failed</p>
          {r.error_message && (
            <p className="text-red-600 dark:text-red-400 text-sm mt-1">{r.error_message}</p>
          )}
        </div>
      )}

      {r.status === "processing" && (
        <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg mb-6">
          <p className="text-yellow-700 dark:text-yellow-300 font-medium">
            Resume is being tailored...
          </p>
          <p className="text-yellow-600 dark:text-yellow-400 text-sm mt-1">
            This may take up to 30 seconds. Refresh to check status.
          </p>
        </div>
      )}

      {content && (
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-6 space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">
              Summary
            </h3>
            <p className="text-gray-700 dark:text-gray-300">{content.summary}</p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">
              Experience
            </h3>
            {content.experience.map((exp, i) => (
              <div key={i} className="mb-4">
                <p className="font-semibold text-gray-900 dark:text-gray-100">{exp.title}</p>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  {exp.company} | {exp.dates}
                </p>
                <ul className="mt-2 space-y-1">
                  {exp.bullets.map((bullet, j) => (
                    <li key={j} className="text-sm text-gray-700 dark:text-gray-300 pl-4 relative">
                      <span className="absolute left-0">&bull;</span>
                      {bullet}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">
              Skills
            </h3>
            <div className="flex flex-wrap gap-2">
              {content.skills.map((skill, i) => (
                <span
                  key={i}
                  className="px-2 py-1 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 rounded text-sm"
                >
                  {skill}
                </span>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">
              Education
            </h3>
            {content.education.map((edu, i) => (
              <p key={i} className="text-gray-700 dark:text-gray-300">
                <span className="font-medium">{edu.degree}</span> — {edu.school}
                , {edu.year}
              </p>
            ))}
          </div>
        </div>
      )}

      <div className="mt-8">
        <h3 className="text-sm font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">
          Original Job Description
        </h3>
        <div className="bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg p-4 max-h-96 overflow-y-auto">
          <p className="text-sm text-gray-600 dark:text-gray-400 whitespace-pre-wrap">
            {r.job_description_text}
          </p>
        </div>
      </div>
    </div>
  );
}
