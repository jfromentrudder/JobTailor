import Link from "next/link";
import { FileText, Building2, Calendar, ExternalLink } from "lucide-react";
import type { TailoredResume } from "@/types";

const statusColors = {
  processing: "bg-yellow-100 text-yellow-800",
  completed: "bg-green-100 text-green-800",
  failed: "bg-red-100 text-red-800",
};

export function ResumeCard({ resume }: { resume: TailoredResume }) {
  return (
    <Link
      href={`/dashboard/resumes/${resume.id}`}
      className="block p-5 bg-white rounded-xl border border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all"
    >
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-blue-600" />
          <h3 className="font-semibold text-gray-900 line-clamp-1">
            {resume.job_title}
          </h3>
        </div>
        <span
          className={`text-xs px-2 py-1 rounded-full font-medium ${statusColors[resume.status]}`}
        >
          {resume.status}
        </span>
      </div>

      {resume.company_name && (
        <div className="flex items-center gap-1.5 text-sm text-gray-500 mb-2">
          <Building2 className="h-3.5 w-3.5" />
          {resume.company_name}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs text-gray-400">
          <Calendar className="h-3 w-3" />
          {new Date(resume.created_at).toLocaleDateString()}
        </div>
        <ExternalLink className="h-3.5 w-3.5 text-gray-400" />
      </div>
    </Link>
  );
}
