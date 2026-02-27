import type { DetectedField } from "./form-detector";

export interface ProfileData {
  full_name?: string;
  email?: string;
  phone?: string;
  linkedin_url?: string;
  github_url?: string;
  portfolio_url?: string;
  location?: string;
  desired_salary?: string;
  work_authorization?: string;
  willing_to_relocate?: boolean;
  visa_sponsorship_needed?: boolean;
  years_of_experience?: number | null;
  education_level?: string;
  current_title?: string;
}

// Map field types to profile data keys
const FIELD_TO_PROFILE: Record<string, keyof ProfileData> = {
  full_name: "full_name",
  first_name: "full_name", // Will extract first name
  last_name: "full_name", // Will extract last name
  email: "email",
  phone: "phone",
  linkedin: "linkedin_url",
  github: "github_url",
  portfolio: "portfolio_url",
  location: "location",
  salary: "desired_salary",
  current_title: "current_title",
  years_experience: "years_of_experience",
  education: "education_level",
};

function dispatchInputEvents(el: HTMLElement) {
  // Dispatch events in the order that mimics real user interaction
  // This is important for React/Angular/Vue compatibility
  el.dispatchEvent(new Event("focus", { bubbles: true }));
  el.dispatchEvent(new Event("input", { bubbles: true }));
  el.dispatchEvent(new Event("change", { bubbles: true }));
  el.dispatchEvent(new Event("blur", { bubbles: true }));
}

function setNativeValue(el: HTMLInputElement | HTMLTextAreaElement, value: string) {
  // React overrides the value setter, so we need to use the native setter
  const nativeInputValueSetter = Object.getOwnPropertyDescriptor(
    HTMLInputElement.prototype,
    "value"
  )?.set;
  const nativeTextareaValueSetter = Object.getOwnPropertyDescriptor(
    HTMLTextAreaElement.prototype,
    "value"
  )?.set;

  const setter = el instanceof HTMLTextAreaElement
    ? nativeTextareaValueSetter
    : nativeInputValueSetter;

  if (setter) {
    setter.call(el, value);
  } else {
    el.value = value;
  }

  dispatchInputEvents(el);
}

function getValueForField(field: DetectedField, profile: ProfileData): string | boolean | null {
  const { fieldType } = field;

  switch (fieldType) {
    case "full_name":
      return profile.full_name || null;

    case "first_name":
      return profile.full_name?.split(" ")[0] || null;

    case "last_name": {
      const parts = profile.full_name?.split(" ");
      return parts && parts.length > 1 ? parts.slice(1).join(" ") : null;
    }

    case "email":
      return profile.email || null;

    case "phone":
      return profile.phone || null;

    case "linkedin":
      return profile.linkedin_url || null;

    case "github":
      return profile.github_url || null;

    case "portfolio":
      return profile.portfolio_url || null;

    case "location":
      return profile.location || null;

    case "salary":
      return profile.desired_salary || null;

    case "current_title":
      return profile.current_title || null;

    case "years_experience":
      return profile.years_of_experience != null
        ? String(profile.years_of_experience)
        : null;

    case "education":
      return profile.education_level || null;

    case "work_authorization":
      // For selects, try to match option text
      return profile.work_authorization || null;

    case "visa_sponsorship":
      return profile.visa_sponsorship_needed ?? null;

    case "relocate":
      return profile.willing_to_relocate ?? null;

    default:
      return null;
  }
}

function fillSelectField(el: HTMLSelectElement, value: string): boolean {
  const options = Array.from(el.options);

  // Try exact match first
  const exactMatch = options.find(
    (opt) => opt.value.toLowerCase() === value.toLowerCase() ||
             opt.textContent?.trim().toLowerCase() === value.toLowerCase()
  );
  if (exactMatch) {
    el.value = exactMatch.value;
    dispatchInputEvents(el);
    return true;
  }

  // Try contains match
  const containsMatch = options.find(
    (opt) => opt.textContent?.trim().toLowerCase().includes(value.toLowerCase()) ||
             value.toLowerCase().includes(opt.textContent?.trim().toLowerCase() || "")
  );
  if (containsMatch) {
    el.value = containsMatch.value;
    dispatchInputEvents(el);
    return true;
  }

  // For yes/no type questions (visa, relocate, etc.)
  const boolVal = value === "true" || value === "yes" || value === "Yes";
  const yesOption = options.find(
    (opt) => opt.textContent?.trim().toLowerCase() === (boolVal ? "yes" : "no")
  );
  if (yesOption) {
    el.value = yesOption.value;
    dispatchInputEvents(el);
    return true;
  }

  return false;
}

function fillCheckbox(el: HTMLInputElement, value: boolean) {
  if (el.checked !== value) {
    el.checked = value;
    dispatchInputEvents(el);
  }
}

export interface FillResult {
  filled: number;
  skipped: number;
  fields: { fieldType: string; filled: boolean; label?: string }[];
}

export function fillFormFields(fields: DetectedField[], profile: ProfileData): FillResult {
  const result: FillResult = { filled: 0, skipped: 0, fields: [] };

  for (const field of fields) {
    const value = getValueForField(field, profile);

    if (value === null || value === undefined) {
      result.skipped++;
      result.fields.push({ fieldType: field.fieldType, filled: false, label: field.label });
      continue;
    }

    const el = field.element;

    try {
      if (el instanceof HTMLSelectElement) {
        const filled = fillSelectField(el, String(value));
        result.fields.push({ fieldType: field.fieldType, filled, label: field.label });
        if (filled) result.filled++;
        else result.skipped++;
      } else if (el instanceof HTMLInputElement && el.type === "checkbox") {
        fillCheckbox(el, Boolean(value));
        result.filled++;
        result.fields.push({ fieldType: field.fieldType, filled: true, label: field.label });
      } else if (el instanceof HTMLInputElement && el.type === "radio") {
        // For radio, try to match value
        if (el.value.toLowerCase() === String(value).toLowerCase()) {
          el.checked = true;
          dispatchInputEvents(el);
          result.filled++;
          result.fields.push({ fieldType: field.fieldType, filled: true, label: field.label });
        } else {
          result.skipped++;
          result.fields.push({ fieldType: field.fieldType, filled: false, label: field.label });
        }
      } else if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement) {
        // Skip file inputs
        if (el instanceof HTMLInputElement && el.type === "file") {
          result.skipped++;
          result.fields.push({ fieldType: field.fieldType, filled: false, label: field.label });
          continue;
        }
        setNativeValue(el, String(value));
        result.filled++;
        result.fields.push({ fieldType: field.fieldType, filled: true, label: field.label });
      } else {
        result.skipped++;
        result.fields.push({ fieldType: field.fieldType, filled: false, label: field.label });
      }
    } catch {
      result.skipped++;
      result.fields.push({ fieldType: field.fieldType, filled: false, label: field.label });
    }
  }

  return result;
}
