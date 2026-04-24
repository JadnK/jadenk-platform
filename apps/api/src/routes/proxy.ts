import type { FastifyInstance } from "fastify";
import {
  extractApiKeyFromRequest,
  hashApiKey,
} from "../lib/api-keys";
import { getProjectBySlug, readProjectConfig, writeProjectConfig } from "../lib/project-config";
import { getRunningProcess } from "../runtime/process-manager";
import { env } from "../lib/env";

export async function proxyRoutes(app: FastifyInstance) {
  app.all("/v1/:slug/*", async (request, reply) => {
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

    const wildcard = (request.params as { "*": string })["*"] || "";
    const queryString = request.url.includes("?")
      ? `?${request.url.split("?")[1]}`
      : "";

    const targetUrl = `http://${env}:${project.port}/${wildcard}${queryString}`;

    const headers = new Headers();

    for (const [key, value] of Object.entries(request.headers)) {
      if (!value) continue;
      if (key.toLowerCase() === "host") continue;
      if (key.toLowerCase() === "x-api-key") continue;
      if (key.toLowerCase() === "authorization") continue;

      if (Array.isArray(value)) {
        headers.set(key, value.join(", "));
      } else {
        headers.set(key, value);
      }
    }

    let body: BodyInit | undefined = undefined;

    if (request.method !== "GET" && request.method !== "HEAD") {
      body = request.body as BodyInit;
    }

    try {
      const response = await fetch(targetUrl, {
        method: request.method,
        headers,
        body,
        redirect: "manual",
      });

      const responseHeaders: Record<string, string> = {};

      response.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });

      const buffer = Buffer.from(await response.arrayBuffer());

      return reply.code(response.status).headers(responseHeaders).send(buffer);
    } catch {
      return reply.status(502).send({
        error: "Proxy request fehlgeschlagen",
      });
    }
  });

  app.all("/v1/:slug", async (request, reply) => {
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

    const queryString = request.url.includes("?")
      ? `?${request.url.split("?")[1]}`
      : "";

    const targetUrl = `http://${env.apiUrl}:${project.port}/${queryString}`;

    const headers = new Headers();

    for (const [key, value] of Object.entries(request.headers)) {
      if (!value) continue;
      if (key.toLowerCase() === "host") continue;
      if (key.toLowerCase() === "x-api-key") continue;
      if (key.toLowerCase() === "authorization") continue;

      if (Array.isArray(value)) {
        headers.set(key, value.join(", "));
      } else {
        headers.set(key, value);
      }
    }

    let body: BodyInit | undefined = undefined;

    if (request.method !== "GET" && request.method !== "HEAD") {
      body = request.body as BodyInit;
    }

    try {
      const response = await fetch(targetUrl, {
        method: request.method,
        headers,
        body,
        redirect: "manual",
      });

      const responseHeaders: Record<string, string> = {};

      response.headers.forEach((value, key) => {
        responseHeaders[key] = value;
      });

      const buffer = Buffer.from(await response.arrayBuffer());

      return reply.code(response.status).headers(responseHeaders).send(buffer);
    } catch {
      return reply.status(502).send({
        error: "Proxy request fehlgeschlagen",
      });
    }
  });
}