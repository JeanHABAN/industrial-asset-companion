import { Platform } from "react-native";
import Constants from "expo-constants";

/** Pull the LAN host from browser or the Expo dev host */
function getLanHost(): string {
  if (typeof window !== "undefined" && window.location?.hostname) {
    return window.location.hostname; // web
  }
  const hostUri =
    (Constants?.expoConfig as any)?.hostUri ||
    (Constants as any)?.manifest?.debuggerHost ||
    (Constants as any)?.manifest2?.extra?.expoGo?.debuggerHost ||
    "";
  if (typeof hostUri === "string" && hostUri.includes(":")) {
    return hostUri.split(":")[0]; // "192.168.1.94:19000" -> "192.168.1.94"
  }
  return "localhost";
}

function isAndroidEmulatorHost(host: string) {
  return Platform.OS === "android" && (host === "localhost" || host === "127.0.0.1");
}

export function guessApiBase(): string {
  // .env override
  const env = process.env.EXPO_PUBLIC_API;
  if (env && env.trim()) return env;

  const host = getLanHost();

  if (Platform.OS === "web") {
    return `http://${host}:8080/api`;
  }
  if (Platform.OS === "android") {
    const androidHost = isAndroidEmulatorHost(host) ? "10.0.2.2" : host;
    return `http://${androidHost}:8080/api`;
  }
  // iOS: simulator can use localhost; devices use LAN host
  return `http://${host}:8080/api`;
}

// Small helper for uniform fetch behavior
export async function apiGet<T>(path: string): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, { method: "GET" });
  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`${res.status} ${res.statusText} ${text ? `- ${text}` : ""}`.trim());
  }
  return res.json() as Promise<T>;
}

export const API_BASE = guessApiBase();
console.log("API_BASE =>", API_BASE);


