"use client";

import { useState, useEffect } from "react";
import { Save, User, Briefcase, Globe, MapPin } from "lucide-react";

interface ProfileData {
  full_name: string;
  phone: string;
  linkedin_url: string;
  location: string;
  work_authorization: string;
  years_of_experience: number | null;
  education_level: string;
  current_title: string;
  portfolio_url: string;
  github_url: string;
  desired_salary: string;
  willing_to_relocate: boolean;
  visa_sponsorship_needed: boolean;
  // AI settings needed for PUT
  ai_provider: string;
  ai_model: string;
}

export default function ProfilePage() {
  const [email, setEmail] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [profile, setProfile] = useState<ProfileData>({
    full_name: "",
    phone: "",
    linkedin_url: "",
    location: "",
    work_authorization: "",
    years_of_experience: null,
    education_level: "",
    current_title: "",
    portfolio_url: "",
    github_url: "",
    desired_salary: "",
    willing_to_relocate: false,
    visa_sponsorship_needed: false,
    ai_provider: "openai",
    ai_model: "gpt-4o-mini",
  });

  useEffect(() => {
    fetch("/api/settings")
      .then((r) => r.json())
      .then((data) => {
        setProfile({
          full_name: data.full_name || "",
          phone: data.phone || "",
          linkedin_url: data.linkedin_url || "",
          location: data.location || "",
          work_authorization: data.work_authorization || "",
          years_of_experience: data.years_of_experience ?? null,
          education_level: data.education_level || "",
          current_title: data.current_title || "",
          portfolio_url: data.portfolio_url || "",
          github_url: data.github_url || "",
          desired_salary: data.desired_salary || "",
          willing_to_relocate: data.willing_to_relocate || false,
          visa_sponsorship_needed: data.visa_sponsorship_needed || false,
          ai_provider: data.ai_provider || "openai",
          ai_model: data.ai_model || "gpt-4o-mini",
        });
        setLoading(false);
      });
    fetch("/api/extension/auth")
      .then((r) => r.json())
      .then((data) => {
        if (data.user?.email) setEmail(data.user.email);
      })
      .catch(() => {});
  }, []);

  function updateField(field: keyof ProfileData, value: string | number | boolean | null) {
    setProfile((p) => ({ ...p, [field]: value }));
  }

  async function handleSave() {
    setSaving(true);
    setError(null);
    setSaved(false);

    const res = await fetch("/api/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(profile),
    });

    if (res.ok) {
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } else {
      const data = await res.json();
      setError(data.error?.toString() || "Failed to save");
    }
    setSaving(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600" />
      </div>
    );
  }

  const inputClass =
    "w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500";
  const labelClass = "block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1";

  return (
    <div className="max-w-2xl">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">Profile</h1>
      <p className="text-gray-500 dark:text-gray-400 mb-8">
        Manage your account and application autofill information
      </p>

      <div className="space-y-6">
        {/* Personal Info */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <User className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Personal Info</h2>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Full Name</label>
                <input
                  type="text"
                  value={profile.full_name}
                  onChange={(e) => updateField("full_name", e.target.value)}
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Phone</label>
                <input
                  type="tel"
                  value={profile.phone}
                  onChange={(e) => updateField("phone", e.target.value)}
                  placeholder="+1 (555) 123-4567"
                  className={inputClass}
                />
              </div>
            </div>
            <div>
              <label className={labelClass}>Email</label>
              <input
                type="email"
                value={email}
                disabled
                className="w-full px-3 py-2 border border-gray-200 dark:border-gray-700 rounded-lg bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400"
              />
              <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                Email cannot be changed here.
              </p>
            </div>
            <div>
              <label className={labelClass}>
                <MapPin className="inline h-3.5 w-3.5 mr-1" />
                Location
              </label>
              <input
                type="text"
                value={profile.location}
                onChange={(e) => updateField("location", e.target.value)}
                placeholder="San Francisco, CA"
                className={inputClass}
              />
            </div>
          </div>
        </div>

        {/* Professional Info */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Briefcase className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Professional Info</h2>
          </div>
          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Current Title</label>
                <input
                  type="text"
                  value={profile.current_title}
                  onChange={(e) => updateField("current_title", e.target.value)}
                  placeholder="Software Engineer"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Years of Experience</label>
                <input
                  type="number"
                  min="0"
                  max="60"
                  value={profile.years_of_experience ?? ""}
                  onChange={(e) =>
                    updateField(
                      "years_of_experience",
                      e.target.value ? parseInt(e.target.value) : null
                    )
                  }
                  placeholder="5"
                  className={inputClass}
                />
              </div>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>Education Level</label>
                <select
                  value={profile.education_level}
                  onChange={(e) => updateField("education_level", e.target.value)}
                  className={inputClass}
                >
                  <option value="">Select...</option>
                  <option value="High School">High School</option>
                  <option value="Associate">Associate Degree</option>
                  <option value="Bachelor">Bachelor&apos;s Degree</option>
                  <option value="Master">Master&apos;s Degree</option>
                  <option value="PhD">PhD / Doctorate</option>
                  <option value="Other">Other</option>
                </select>
              </div>
              <div>
                <label className={labelClass}>Desired Salary</label>
                <input
                  type="text"
                  value={profile.desired_salary}
                  onChange={(e) => updateField("desired_salary", e.target.value)}
                  placeholder="$120,000 - $150,000"
                  className={inputClass}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Online Presence */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <Globe className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Online Presence</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className={labelClass}>LinkedIn URL</label>
              <input
                type="url"
                value={profile.linkedin_url}
                onChange={(e) => updateField("linkedin_url", e.target.value)}
                placeholder="https://linkedin.com/in/yourname"
                className={inputClass}
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className={labelClass}>GitHub URL</label>
                <input
                  type="url"
                  value={profile.github_url}
                  onChange={(e) => updateField("github_url", e.target.value)}
                  placeholder="https://github.com/yourname"
                  className={inputClass}
                />
              </div>
              <div>
                <label className={labelClass}>Portfolio URL</label>
                <input
                  type="url"
                  value={profile.portfolio_url}
                  onChange={(e) => updateField("portfolio_url", e.target.value)}
                  placeholder="https://yourportfolio.com"
                  className={inputClass}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Job Preferences */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <MapPin className="h-5 w-5 text-blue-600" />
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Job Preferences</h2>
          </div>
          <div className="space-y-4">
            <div>
              <label className={labelClass}>Work Authorization</label>
              <select
                value={profile.work_authorization}
                onChange={(e) => updateField("work_authorization", e.target.value)}
                className={inputClass}
              >
                <option value="">Select...</option>
                <option value="US Citizen">US Citizen</option>
                <option value="Permanent Resident">Permanent Resident (Green Card)</option>
                <option value="H1B">H-1B Visa</option>
                <option value="OPT/CPT">OPT / CPT</option>
                <option value="EAD">EAD</option>
                <option value="TN Visa">TN Visa</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div className="flex flex-col gap-3">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={profile.willing_to_relocate}
                  onChange={(e) => updateField("willing_to_relocate", e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Willing to relocate
                </span>
              </label>
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={profile.visa_sponsorship_needed}
                  onChange={(e) => updateField("visa_sponsorship_needed", e.target.checked)}
                  className="h-4 w-4 rounded border-gray-300 dark:border-gray-600 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-sm text-gray-700 dark:text-gray-300">
                  Need visa sponsorship
                </span>
              </label>
            </div>
          </div>
        </div>

        {/* Save area */}
        <div className="flex items-center gap-4">
          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <Save className="h-4 w-4" />
            {saving ? "Saving..." : "Save Profile"}
          </button>
          {saved && (
            <p className="text-sm text-green-600">Profile updated!</p>
          )}
          {error && (
            <p className="text-sm text-red-600">{error}</p>
          )}
        </div>
      </div>
    </div>
  );
}
