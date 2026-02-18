"use client";

import { Zap } from "lucide-react";

interface UsageMeterProps {
  count: number;
  limit: number;
  hasCustomKey: boolean;
}

export function UsageMeter({ count, limit, hasCustomKey }: UsageMeterProps) {
  if (hasCustomKey) {
    return (
      <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
        <div className="flex items-center gap-2 text-green-700">
          <Zap className="h-4 w-4" />
          <span className="text-sm font-medium">Unlimited usage (own API key)</span>
        </div>
      </div>
    );
  }

  const percentage = Math.min((count / limit) * 100, 100);
  const remaining = Math.max(limit - count, 0);

  return (
    <div className="p-4 bg-white border border-gray-200 rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <span className="text-sm font-medium text-gray-700">Monthly Usage</span>
        <span className="text-sm text-gray-500">
          {count} / {limit}
        </span>
      </div>
      <div className="w-full bg-gray-100 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all ${
            percentage >= 100 ? "bg-red-500" : percentage >= 80 ? "bg-yellow-500" : "bg-blue-600"
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <p className="text-xs text-gray-400 mt-2">
        {remaining > 0
          ? `${remaining} tailored resume${remaining !== 1 ? "s" : ""} remaining this month`
          : "Limit reached. Add your own API key in settings for unlimited use."}
      </p>
    </div>
  );
}
