"use client";

import { useState, useCallback } from "react";
import { Upload, FileText, Check, AlertCircle } from "lucide-react";
import { useRouter } from "next/navigation";

export function UploadForm() {
  const [dragOver, setDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const router = useRouter();

  const handleFile = useCallback(
    async (file: File) => {
      if (file.type !== "application/pdf") {
        setError("Only PDF files are supported.");
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setError("File must be under 10MB.");
        return;
      }

      setUploading(true);
      setError(null);

      const formData = new FormData();
      formData.append("file", file);

      try {
        const res = await fetch("/api/upload", {
          method: "POST",
          body: formData,
        });
        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Upload failed");
        }
        setSuccess(true);
        router.refresh();
      } catch (err: unknown) {
        setError(err instanceof Error ? err.message : "Upload failed");
      } finally {
        setUploading(false);
      }
    },
    [router]
  );

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  }

  return (
    <div
      onDragOver={(e) => {
        e.preventDefault();
        setDragOver(true);
      }}
      onDragLeave={() => setDragOver(false)}
      onDrop={handleDrop}
      className={`border-2 border-dashed rounded-xl p-12 text-center transition-colors ${
        dragOver
          ? "border-blue-400 bg-blue-50"
          : success
            ? "border-green-300 bg-green-50"
            : "border-gray-300 hover:border-gray-400"
      }`}
    >
      {success ? (
        <div className="space-y-2">
          <Check className="h-12 w-12 text-green-600 mx-auto" />
          <p className="text-green-700 font-medium">Resume uploaded successfully!</p>
          <p className="text-sm text-green-600">
            Your base resume is ready. The extension will use it for tailoring.
          </p>
        </div>
      ) : (
        <>
          {uploading ? (
            <div className="space-y-2">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto" />
              <p className="text-gray-600">Uploading and processing...</p>
            </div>
          ) : (
            <>
              <Upload className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-700 font-medium mb-1">
                Drop your resume PDF here
              </p>
              <p className="text-sm text-gray-500 mb-4">or click to browse</p>
              <label className="inline-block px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors cursor-pointer">
                Choose File
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleChange}
                  className="hidden"
                />
              </label>
              <p className="text-xs text-gray-400 mt-3">PDF only, max 10MB</p>
            </>
          )}
        </>
      )}

      {error && (
        <div className="mt-4 flex items-center gap-2 justify-center text-red-600 text-sm">
          <AlertCircle className="h-4 w-4" />
          {error}
        </div>
      )}
    </div>
  );
}
