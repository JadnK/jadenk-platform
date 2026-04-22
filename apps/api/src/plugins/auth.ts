import type { FastifyReply, FastifyRequest } from "fastify";
import { getSession } from "../lib/session-store";

export async function requireAuth(
  request: FastifyRequest,
  reply: FastifyReply,
) {
  const sessionId = request.cookies.session_id;
  const session = getSession(sessionId);

  if (!session) {
    return reply.status(401).send({
      error: "Nicht eingeloggt",
    });
  }

  (request as FastifyRequest & { authUser?: { username: string } }).authUser = {
    username: session.username,
  };
}