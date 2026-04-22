import crypto from "node:crypto";

export interface SessionRecord {
  id: string;
  username: string;
  createdAt: string;
}

const sessions = new Map<string, SessionRecord>();

export function createSession(username: string): SessionRecord {
  const session: SessionRecord = {
    id: crypto.randomBytes(24).toString("hex"),
    username,
    createdAt: new Date().toISOString(),
  };

  sessions.set(session.id, session);
  return session;
}

export function getSession(sessionId: string | undefined | null) {
  if (!sessionId) return null;
  return sessions.get(sessionId) ?? null;
}

export function deleteSession(sessionId: string | undefined | null) {
  if (!sessionId) return;
  sessions.delete(sessionId);
}