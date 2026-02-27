import Link from "next/link";
import { FileText, Building2, Calendar, ExternalLink, Check } from "lucide-react";
import type { TailoredResume } from "@/types";

const statusColors = {
  processing: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300",
  completed: "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300",
  failed: "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300",
};

interface ResumeCardProps {
  resume: TailoredResume;
  selectable?: boolean;
  selected?: boolean;
  onSelect?: () => void;
}

export function ResumeCard({
  resume,
  selectable = false,
  selected = false,
  onSelect,
}: ResumeCardProps) {
  const cardContent = (
    <>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          {selectable && (
            <div
              className={`flex-shrink-0 h-5 w-5 rounded border-2 flex items-center justify-center transition-colors ${
                selected
                  ? "bg-blue-600 border-blue-600 text-white"
                  : "border-gray-300 dark:border-gray-600"
              }`}
            >
              {selected && <Check className="h-3 w-3" />}
            </div>
          )}
          <FileText className="h-5 w-5 text-blue-600" />
          <h3 className="font-semibold text-gray-900 dark:text-gray-100 line-clamp-1">
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
        <div className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 mb-2">
          <Building2 className="h-3.5 w-3.5" />
          {resume.company_name}
        </div>
      )}

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-1.5 text-xs text-gray-400 dark:text-gray-500">
          <Calendar className="h-3 w-3" />
          {new Date(resume.created_at).toLocaleDateString()}
        </div>
        {!selectable && (
          <ExternalLink className="h-3.5 w-3.5 text-gray-400 dark:text-gray-500" />
        )}
      </div>
    </>
  );

  const baseClassName = `block p-5 bg-white dark:bg-gray-900 rounded-xl border transition-all ${
    selected
      ? "border-blue-500 dark:border-blue-500 ring-2 ring-blue-200 dark:ring-blue-800"
      : "border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-sm"
  }`;

  if (selectable) {
    return (
      <button
        onClick={onSelect}
        className={`${baseClassName} text-left w-full cursor-pointer`}
      >
        {cardContent}
      </button>
    );
  }

  return (
    <Link href={`/dashboard/resumes/${resume.id}`} className={baseClassName}>
      {cardContent}
    </Link>
  );
}
