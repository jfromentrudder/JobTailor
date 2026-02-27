"use client";

import { useState } from "react";
import { Eye, X, Loader2 } from "lucide-react";

interface ResumePreviewProps {
  resumeId: string;
}

export function ResumePreview({ resumeId }: ResumePreviewProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handleOpen() {
    if (previewUrl) {
      setOpen(true);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const res = await fetch(`/api/resumes/${resumeId}/preview`);
      if (!res.ok) throw new Error("Failed to load preview");
      const data = await res.json();
      setPreviewUrl(data.url);
      setOpen(true);
    } catch {
      setError("Could not load preview");
    } finally {
      setLoading(false);
    }
  }

  return (
    <>
      <button
        onClick={handleOpen}
        disabled={loading}
        className="inline-flex items-center gap-1.5 text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 disabled:opacity-50"
      >
        {loading ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Eye className="h-4 w-4" />
        )}
        {loading ? "Loading..." : "Preview"}
      </button>

      {error && (
        <p className="text-xs text-red-500 mt-1">{error}</p>
      )}

      {open && previewUrl && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
          <div className="relative w-full max-w-4xl h-[85vh] mx-4 bg-white dark:bg-gray-900 rounded-xl shadow-2xl overflow-hidden">
            <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                Resume Preview
              </h3>
              <button
                onClick={() => setOpen(false)}
                className="p-1 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <embed
              src={previewUrl}
              type="application/pdf"
              className="w-full h-[calc(100%-52px)]"
            />
          </div>
        </div>
      )}
    </>
  );
}
