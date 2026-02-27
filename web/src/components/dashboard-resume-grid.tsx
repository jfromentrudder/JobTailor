"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Trash2, CheckSquare, Square, X } from "lucide-react";
import { ResumeCard } from "./resume-card";
import type { TailoredResume } from "@/types";

interface DashboardResumeGridProps {
  resumes: TailoredResume[];
}

export function DashboardResumeGrid({ resumes }: DashboardResumeGridProps) {
  const [selectMode, setSelectMode] = useState(false);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const router = useRouter();

  function toggleSelect(id: string) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      return next;
    });
  }

  function selectAll() {
    if (selectedIds.size === resumes.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(resumes.map((r) => r.id)));
    }
  }

  function exitSelectMode() {
    setSelectMode(false);
    setSelectedIds(new Set());
    setConfirmDelete(false);
  }

  async function handleBatchDelete() {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }

    setDeleting(true);
    try {
      const res = await fetch("/api/tailored/batch", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ids: Array.from(selectedIds) }),
      });

      if (res.ok) {
        exitSelectMode();
        router.refresh();
      }
    } finally {
      setDeleting(false);
      setConfirmDelete(false);
    }
  }

  return (
    <div>
      {/* Toolbar */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {selectMode ? (
            <>
              <button
                onClick={selectAll}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                {selectedIds.size === resumes.length ? (
                  <CheckSquare className="h-4 w-4" />
                ) : (
                  <Square className="h-4 w-4" />
                )}
                {selectedIds.size === resumes.length ? "Deselect All" : "Select All"}
              </button>
              {selectedIds.size > 0 && (
                confirmDelete ? (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-red-600 dark:text-red-400">
                      Delete {selectedIds.size} resume{selectedIds.size !== 1 ? "s" : ""}?
                    </span>
                    <button
                      onClick={handleBatchDelete}
                      disabled={deleting}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
                    >
                      <Trash2 className="h-4 w-4" />
                      {deleting ? "Deleting..." : "Confirm"}
                    </button>
                    <button
                      onClick={() => setConfirmDelete(false)}
                      className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleBatchDelete}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm text-red-600 dark:text-red-400 border border-red-300 dark:border-red-800 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                  >
                    <Trash2 className="h-4 w-4" />
                    Delete Selected ({selectedIds.size})
                  </button>
                )
              )}
            </>
          ) : (
            resumes.length > 0 && (
              <button
                onClick={() => setSelectMode(true)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-sm border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800"
              >
                <CheckSquare className="h-4 w-4" />
                Select
              </button>
            )
          )}
        </div>

        {selectMode && (
          <button
            onClick={exitSelectMode}
            className="inline-flex items-center gap-1 px-3 py-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
          >
            <X className="h-4 w-4" />
            Cancel
          </button>
        )}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {resumes.map((resume) => (
          <ResumeCard
            key={resume.id}
            resume={resume}
            selectable={selectMode}
            selected={selectedIds.has(resume.id)}
            onSelect={() => toggleSelect(resume.id)}
          />
        ))}
      </div>
    </div>
  );
}
