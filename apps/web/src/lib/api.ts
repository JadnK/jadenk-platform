import { env } from "./env";

export async function apiGet<T>(path: string): Promise<T> {
  const response = await fetch(`${env.apiUrl}${path}`);

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`);
  }

  return response.json() as Promise<T>;
}

export async function apiPost<T>(
  path: string,
  body?: BodyInit | null,
  init?: RequestInit,
): Promise<T> {
  const response = await fetch(`${env.apiUrl}${path}`, {
    method: "POST",
    body: body ?? null,
    ...init,
  });

  const data = await response.json();

  if (!response.ok) {
    throw new Error(data?.error || `API request failed: ${response.status}`);
  }

  return data as T;
}