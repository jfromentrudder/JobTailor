"use client";

import { useState, useEffect } from "react";
import { UsageMeter } from "@/components/usage-meter";
import { Save, Key, Cpu, Lock, Crown } from "lucide-react";
import { PLANS, isModelAllowed, type SubscriptionTier } from "@/lib/plans";

const MODELS: Record<string, { label: string; value: string }[]> = {
  openai: [
    { label: "GPT-4o Mini (Recommended — cheapest)", value: "gpt-4o-mini" },
    { label: "GPT-4o", value: "gpt-4o" },
    { label: "GPT-4 Turbo", value: "gpt-4-turbo" },
  ],
  anthropic: [
    { label: "Claude Sonnet 4.5", value: "claude-sonnet-4-5-20250929" },
    { label: "Claude Haiku 4.5", value: "claude-haiku-4-5-20251001" },
  ],
};

function getMinTierForModel(model: string): string | null {
  const tiers: SubscriptionTier[] = ["free", "pro", "plus"];
  for (const tier of tiers) {
    if (isModelAllowed(tier, model)) return PLANS[tier].name;
  }
  return null;
}

interface SettingsData {
  ai_provider: "openai" | "anthropic";
  ai_model: string;
  has_custom_api_key: boolean;
  full_name: string | null;
  subscription_tier: SubscriptionTier;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<SettingsData | null>(null);
  const [provider, setProvider] = useState<"openai" | "anthropic">("openai");
  const [model, setModel] = useState("gpt-4o-mini");
  const [apiKey, setApiKey] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [removingKey, setRemovingKey] = useState(false);
  const [confirmRemoveKey, setConfirmRemoveKey] = useState(false);
  const [usage, setUsage] = useState({
    count: 0,
    limit: 5,
    hasCustomKey: false,
    subscriptionTier: "free" as SubscriptionTier,
  });

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => {
        setSettings(data);
        setProvider(data.ai_provider);
        setModel(data.ai_model);
        const tier = data.subscription_tier || "free";
        setUsage((u) => ({
          ...u,
          hasCustomKey: data.has_custom_api_key,
          subscriptionTier: tier,
          limit: PLANS[tier as SubscriptionTier]?.limit ?? 5,
        }));
      });
  }, []);

  const tier = settings?.subscription_tier || "free";
  const hasCustomKey = settings?.has_custom_api_key || false;
  const canAccessAllModels = hasCustomKey;

  async function handleSave() {
    setSaving(true);
    setError(null);
    setSaved(false);

    const body: Record<string, string> = {
      ai_provider: provider,
      ai_model: model,
    };
    if (apiKey) body.custom_api_key = apiKey;

    const res = await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    if (res.ok) {
      setSaved(true);
      setApiKey("");
      const data = await res.json();
      setSettings((s) => s ? { ...s, has_custom_api_key: data.has_custom_api_key } : s);
      setUsage((u) => ({ ...u, hasCustomKey: data.has_custom_api_key }));
      setTimeout(() => setSaved(false), 3000);
    } else {
      const data = await res.json();
      setError(data.error?.toString() || "Failed to save");
    }
    setSaving(false);
  }

  async function handleRemoveKey() {
    if (!confirmRemoveKey) {
      setConfirmRemoveKey(true);
      return;
    }
    setRemovingKey(true);
    setError(null);

    // When removing key, also reset to a model allowed by the tier
    const safeModel = isModelAllowed(tier, model) ? model : "gpt-4o-mini";
    const safeProvider = safeModel.startsWith("claude") ? "anthropic" : "openai";

    const res = await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        custom_api_key: "",
        ai_provider: safeProvider,
        ai_model: safeModel,
      }),
    });

    if (res.ok) {
      const data = await res.json();
      setSettings((s) =>
        s ? { ...s, has_custom_api_key: false } : s
      );
      setUsage((u) => ({ ...u, hasCustomKey: false }));
      setProvider(safeProvider);
      setModel(safeModel);
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } else {
      const data = await res.json();
      setError(data.error?.toString() || "Failed to remove key");
    }
    setRemovingKey(false);
    setConfirmRemoveKey(false);
  }

  if (!settings) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Settings</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-8">
        Configure your AI provider and API key
      </p>

      <div className="space-y-6">
        <UsageMeter
          count={usage.count}
          limit={usage.limit}
          hasCustomKey={usage.hasCustomKey}
          subscriptionTier={usage.subscriptionTier}
        />

        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Cpu className="inline h-4 w-4 mr-1" />
              AI Provider
            </label>
            <select
              value={provider}
              onChange={(e) => {
                const p = e.target.value as "openai" | "anthropic";
                setProvider(p);
                // Select the first allowed model for this provider
                const models = MODELS[p];
                const firstAllowed = models.find(
                  (m) => canAccessAllModels || isModelAllowed(tier, m.value)
                );
                setModel(firstAllowed?.value || models[0].value);
              }}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="openai">OpenAI</option>
              <option value="anthropic">Anthropic</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Model
            </label>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {MODELS[provider].map((m) => {
                const allowed = canAccessAllModels || isModelAllowed(tier, m.value);
                const minTier = getMinTierForModel(m.value);
                return (
                  <option key={m.value} value={m.value} disabled={!allowed}>
                    {m.label}{!allowed ? ` 🔒 ${minTier}+ plan` : ""}
                  </option>
                );
              })}
            </select>
            {!canAccessAllModels && tier === "free" && (
              <p className="text-xs text-amber-600 dark:text-amber-400 mt-1 flex items-center gap-1">
                <Crown className="h-3 w-3" />
                Upgrade your plan or add your own API key to unlock more models
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              <Key className="inline h-4 w-4 mr-1" />
              API Key {hasCustomKey && "(configured)"}
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder={
                hasCustomKey
                  ? "Enter new key to replace, or leave empty"
                  : "Enter your API key for unlimited usage"
              }
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
              Your API key is encrypted and stored securely. Adding your own key
              removes the monthly usage limit and unlocks all models.
            </p>
            {hasCustomKey && (
              <div className="mt-2">
                {confirmRemoveKey ? (
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-red-600 dark:text-red-400">
                      Are you sure? You&apos;ll revert to plan limits.
                    </span>
                    <button
                      onClick={handleRemoveKey}
                      disabled={removingKey}
                      className="text-xs text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 font-medium"
                    >
                      {removingKey ? "Removing..." : "Yes, remove"}
                    </button>
                    <button
                      onClick={() => setConfirmRemoveKey(false)}
                      className="text-xs text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                    >
                      Cancel
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={handleRemoveKey}
                    className="text-xs text-red-500 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300"
                  >
                    Remove custom key
                  </button>
                )}
              </div>
            )}
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}
          {saved && (
            <p className="text-sm text-green-600">Settings saved successfully!</p>
          )}

          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {saving ? "Saving..." : "Save Settings"}
          </button>
        </div>
      </div>
    </div>
  );
}
