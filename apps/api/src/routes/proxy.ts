import type { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import {
  extractApiKeyFromRequest,
  hashApiKey,
} from "../lib/api-keys";
import {
  getProjectBySlug,
  readProjectConfig,
  writeProjectConfig,
} from "../lib/project-config";
import { getRunningProcess } from "../runtime/process-manager";

const BLOCKED_PROXY_HEADERS = new Set([
  "host",
  "x-api-key",
  "authorization",
  "content-length",
  "transfer-encoding",
  "connection",
  "keep-alive",
  "proxy-authenticate",
  "proxy-authorization",
  "te",
  "trailer",
  "upgrade",
]);

function buildProxyHeaders(request: FastifyRequest): Headers {
  const headers = new Headers();

  for (const [key, value] of Object.entries(request.headers)) {
    const lowerKey = key.toLowerCase();

    if (!value) continue;
    if (BLOCKED_PROXY_HEADERS.has(lowerKey)) continue;

    if (Array.isArray(value)) {
      headers.set(key, value.join(", "));
    } else {
      headers.set(key, String(value));
    }
  }

  return headers;
}

function buildProxyBody(
  request: FastifyRequest,
  headers: Headers,
): string | undefined {
  if (request.method === "GET" || request.method === "HEAD") {
    return undefined;
  }

  if (request.body === undefined || request.body === null) {
    return undefined;
  }

  if (typeof request.body === "string") {
    return request.body;
  }

  headers.set("content-type", "application/json");
  return JSON.stringify(request.body);
}

function getQueryString(request: FastifyRequest): string {
  return request.url.includes("?") ? `?${request.url.split("?")[1]}` : "";
}

function sanitizeResponseHeaders(response: Response): Record<string, string> {
  const responseHeaders: Record<string, string> = {};

  response.headers.forEach((value, key) => {
    const lowerKey = key.toLowerCase();

    if (lowerKey === "transfer-encoding") return;
    if (lowerKey === "connection") return;

    responseHeaders[key] = value;
  });

  return responseHeaders;
}

async function proxyRequest(
  request: FastifyRequest,
  reply: FastifyReply,
  pathPrefix: string,
) {
  const { slug } = request.params as { slug: string };

  const project = await getProjectBySlug(slug);

  if (!project) {
    return reply.status(404).send({
      error: "Projekt nicht gefunden",
    });
  }

  const rawApiKey = extractApiKeyFromRequest(
    request.headers as Record<string, unknown>,
  );

  if (!rawApiKey) {
    return reply.status(401).send({
      error: "API Key fehlt",
    });
  }

  const incomingKeyHash = hashApiKey(rawApiKey);

  const matchedKey = (project.apiKeys ?? []).find(
    (item) => item.keyHash === incomingKeyHash && !item.revokedAt,
  );

  if (!matchedKey) {
    return reply.status(401).send({
      error: "Ungültiger API Key",
    });
  }

  matchedKey.lastUsedAt = new Date().toISOString();

  const persistedProject = await readProjectConfig(project.id);

  if (persistedProject) {
    persistedProject.apiKeys = persistedProject.apiKeys.map((item) =>
      item.id === matchedKey.id
        ? { ...item, lastUsedAt: matchedKey.lastUsedAt }
        : item,
    );

    await writeProjectConfig(persistedProject);
  }

  const running = getRunningProcess(project.id);

  if (!running || project.status !== "running") {
    return reply.status(409).send({
      error: "Projekt läuft nicht",
    });
  }

  const queryString = getQueryString(request);
  const targetUrl = `http://127.0.0.1:${project.port}/${pathPrefix}${queryString}`;

  const headers = buildProxyHeaders(request);
  const body = buildProxyBody(request, headers);

  try {
    const response = await fetch(targetUrl, {
      method: request.method,
      headers,
      body,
      redirect: "manual",
    });

    const responseHeaders = sanitizeResponseHeaders(response);
    const buffer = Buffer.from(await response.arrayBuffer());

    return reply
      .code(response.status)
      .headers(responseHeaders)
      .send(buffer);
  } catch (error) {
    request.log.error(
      {
        error,
        targetUrl,
        method: request.method,
      },
      "Proxy request failed",
    );

    return reply.status(502).send({
      error: "Proxy request fehlgeschlagen",
    });
  }
}

export async function proxyRoutes(app: FastifyInstance) {
  app.all("/v1/:slug/*", async (request, reply) => {
    const wildcard = (request.params as { "*": string })["*"] || "";
    return proxyRequest(request, reply, wildcard);
  });

  app.all("/v1/:slug", async (request, reply) => {
    return proxyRequest(request, reply, "");
  });
}
