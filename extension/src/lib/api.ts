import browser from "webextension-polyfill";

const DEFAULT_API_URL = "http://localhost:3000";

async function getApiUrl(): Promise<string> {
  const { apiUrl } = await browser.storage.local.get("apiUrl");
  return (apiUrl as string) || DEFAULT_API_URL;
}

async function getAccessToken(): Promise<string | null> {
  const { accessToken } = await browser.storage.local.get("accessToken");
  return (accessToken as string) || null;
}

export async function isAuthenticated(): Promise<boolean> {
  const token = await getAccessToken();
  return !!token;
}

export async function tailorResume(data: {
  job_description_text: string;
  job_title: string;
  company_name?: string;
  job_url?: string;
}): Promise<{ id?: string; status?: string; message?: string; error?: string }> {
  const token = await getAccessToken();
  if (!token) {
    return { error: "Not authenticated. Please log in." };
  }

  const apiUrl = await getApiUrl();

  try {
    const response = await fetch(`${apiUrl}/api/tailor`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(data),
    });

    const result = await response.json();

    if (!response.ok) {
      return { error: result.error || `Request failed (${response.status})` };
    }

    return result;
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : "Network error";
    return { error: message };
  }
}
