"use client";

import { Zap, Crown } from "lucide-react";
import type { SubscriptionTier } from "@/lib/plans";

interface UsageMeterProps {
  count: number;
  limit: number;
  hasCustomKey: boolean;
  subscriptionTier?: SubscriptionTier;
}

const TIER_BADGE: Record<SubscriptionTier, { label: string; color: string }> = {
  free: {
    label: "Free",
    color: "bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400",
  },
  pro: {
    label: "Pro",
    color: "bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300",
  },
  plus: {
    label: "Plus",
    color: "bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300",
  },
};

export function UsageMeter({
  count,
  limit,
  hasCustomKey,
  subscriptionTier = "free",
}: UsageMeterProps) {
  const badge = TIER_BADGE[subscriptionTier];

  if (hasCustomKey) {
    return (
      <div className="p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-green-700 dark:text-green-300">
            <Zap className="h-4 w-4" />
            <span className="text-sm font-medium">Unlimited usage (own API key)</span>
          </div>
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${badge.color}`}
          >
            <Crown className="h-3 w-3" />
            {badge.label}
          </span>
        </div>
      </div>
    );
  }

  const percentage = Math.min((count / limit) * 100, 100);
  const remaining = Math.max(limit - count, 0);

  return (
    <div className="p-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-lg">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Monthly Usage
          </span>
          <span
            className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${badge.color}`}
          >
            <Crown className="h-3 w-3" />
            {badge.label}
          </span>
        </div>
        <span className="text-sm text-gray-500 dark:text-gray-400">
          {count} / {limit}
        </span>
      </div>
      <div className="w-full bg-gray-100 dark:bg-gray-800 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all ${
            percentage >= 100
              ? "bg-red-500"
              : percentage >= 80
                ? "bg-yellow-500"
                : "bg-blue-600"
          }`}
          style={{ width: `${percentage}%` }}
        />
      </div>
      <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">
        {remaining > 0
          ? `${remaining} tailored resume${remaining !== 1 ? "s" : ""} remaining this month`
          : "Limit reached. Upgrade your plan or add your own API key for more."}
      </p>
    </div>
  );
}
