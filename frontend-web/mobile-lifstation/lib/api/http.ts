import { API_BASE } from "./base";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { "Content-Type": "application/json" },
    ...init,
  });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`${res.status} ${res.statusText} – ${text || "request failed"}`);
  }
  return res.json() as Promise<T>;
}

export const http = {
  get: <T>(path: string, params?: Record<string, any>) => {
    const q = params
      ? "?" +
        Object.entries(params)
          .filter(([, v]) => v !== undefined && v !== null && `${v}`.length > 0)
          .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(v as any)}`)
          .join("&")
      : "";
    return request<T>(`${path}${q}`);
  },
};
