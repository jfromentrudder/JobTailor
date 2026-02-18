"use client";

import { useState, useEffect } from "react";
import { UsageMeter } from "@/components/usage-meter";
import { Save, Key, Cpu } from "lucide-react";

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

interface SettingsData {
  ai_provider: "openai" | "anthropic";
  ai_model: string;
  has_custom_api_key: boolean;
  full_name: string | null;
}

export default function SettingsPage() {
  const [settings, setSettings] = useState<SettingsData | null>(null);
  const [provider, setProvider] = useState<"openai" | "anthropic">("openai");
  const [model, setModel] = useState("gpt-4o-mini");
  const [apiKey, setApiKey] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [usage, setUsage] = useState({ count: 0, limit: 5, hasCustomKey: false });

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => {
        setSettings(data);
        setProvider(data.ai_provider);
        setModel(data.ai_model);
        setUsage((u) => ({ ...u, hasCustomKey: data.has_custom_api_key }));
      });
  }, []);

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
      setUsage((u) => ({ ...u, hasCustomKey: data.has_custom_api_key }));
      setTimeout(() => setSaved(false), 3000);
    } else {
      const data = await res.json();
      setError(data.error?.toString() || "Failed to save");
    }
    setSaving(false);
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
      <h1 className="text-2xl font-bold text-gray-900 mb-2">Settings</h1>
      <p className="text-gray-500 mb-8">
        Configure your AI provider and API key
      </p>

      <div className="space-y-6">
        <UsageMeter
          count={usage.count}
          limit={usage.limit}
          hasCustomKey={usage.hasCustomKey}
        />

        <div className="bg-white border border-gray-200 rounded-xl p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Cpu className="inline h-4 w-4 mr-1" />
              AI Provider
            </label>
            <select
              value={provider}
              onChange={(e) => {
                const p = e.target.value as "openai" | "anthropic";
                setProvider(p);
                setModel(MODELS[p][0].value);
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="openai">OpenAI</option>
              <option value="anthropic">Anthropic</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Model
            </label>
            <select
              value={model}
              onChange={(e) => setModel(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {MODELS[provider].map((m) => (
                <option key={m.value} value={m.value}>
                  {m.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Key className="inline h-4 w-4 mr-1" />
              API Key {settings.has_custom_api_key && "(configured)"}
            </label>
            <input
              type="password"
              value={apiKey}
              onChange={(e) => setApiKey(e.target.value)}
              placeholder={
                settings.has_custom_api_key
                  ? "Enter new key to replace, or leave empty"
                  : "Enter your API key for unlimited usage"
              }
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <p className="text-xs text-gray-400 mt-1">
              Your API key is encrypted and stored securely. Adding your own key
              removes the monthly usage limit.
            </p>
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
