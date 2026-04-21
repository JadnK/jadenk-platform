import crypto from "node:crypto";

export function createApiKeyId() {
  return `key_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function generateRawApiKey() {
  const random = crypto.randomBytes(24).toString("hex");
  return `jk_live_${random}`;
}

export function hashApiKey(rawKey: string) {
  return crypto.createHash("sha256").update(rawKey).digest("hex");
}

export function getApiKeyPreview(rawKey: string) {
  if (rawKey.length <= 10) return rawKey;
  return `${rawKey.slice(0, 10)}...${rawKey.slice(-4)}`;
}

export function extractApiKeyFromRequest(headers: Record<string, unknown>) {
  const xApiKey = headers["x-api-key"];
  if (typeof xApiKey === "string" && xApiKey.trim()) {
    return xApiKey.trim();
  }

  const authHeader = headers["authorization"];
  if (typeof authHeader === "string" && authHeader.startsWith("Bearer ")) {
    return authHeader.slice(7).trim();
  }

  return null;
}