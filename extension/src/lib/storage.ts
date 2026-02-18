import browser from "webextension-polyfill";

export interface StoredAuth {
  accessToken: string;
  refreshToken: string;
}

export async function saveAuth(auth: StoredAuth): Promise<void> {
  await browser.storage.local.set({
    accessToken: auth.accessToken,
    refreshToken: auth.refreshToken,
  });
}

export async function getAuth(): Promise<StoredAuth | null> {
  const data = await browser.storage.local.get(["accessToken", "refreshToken"]);
  if (data.accessToken && data.refreshToken) {
    return {
      accessToken: data.accessToken as string,
      refreshToken: data.refreshToken as string,
    };
  }
  return null;
}

export async function clearAuth(): Promise<void> {
  await browser.storage.local.remove(["accessToken", "refreshToken"]);
}

export interface JobDetection {
  isJobDescription: boolean;
  confidence: number;
  jobTitle?: string;
  companyName?: string;
  jobDescriptionText?: string;
  url: string;
  signals: string[];
}

export async function saveDetection(
  tabId: number,
  detection: JobDetection
): Promise<void> {
  const key = `detection_${tabId}`;
  await browser.storage.local.set({ [key]: detection });
}

export async function getDetection(
  tabId: number
): Promise<JobDetection | null> {
  const key = `detection_${tabId}`;
  const data = await browser.storage.local.get(key);
  return (data[key] as JobDetection) || null;
}

export async function removeDetection(tabId: number): Promise<void> {
  const key = `detection_${tabId}`;
  await browser.storage.local.remove(key);
}
