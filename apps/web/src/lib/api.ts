import { env } from "./env";

export async function apiGet<T>(path: string): Promise<T> {
  const response = await fetch(`${env.apiUrl}${path}`, {
    credentials: "include",
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.error || `API request failed: ${response.status}`);
  }

  return data as T;
}

export async function apiPost<T>(
  path: string,
  body?: BodyInit | null,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(`${env.apiUrl}${path}`, {
    method: "POST",
    body: body ?? null,
    credentials: "include",
    ...init,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.error || `API request failed: ${response.status}`);
  }

  return data as T;
}