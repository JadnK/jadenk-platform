import type { FastifyInstance } from "fastify";
import {
  hashPassword,
  readAuthConfig,
  verifyPassword,
  writeAuthConfig,
} from "../lib/auth-config";
import { createSession, deleteSession, getSession } from "../lib/session-store";

interface LoginBody {
  username?: string;
  password?: string;
}

interface ChangePasswordBody {
  currentPassword?: string;
  newPassword?: string;
}

export async function authRoutes(app: FastifyInstance) {
  app.post("/login", async (request, reply) => {
    const body = (request.body || {}) as LoginBody;
    const username = body.username?.trim() || "";
    const password = body.password || "";

    const config = await readAuthConfig();

    if (username !== config.username) {
      return reply.status(401).send({
        error: "Ungültige Zugangsdaten",
      });
    }

    const valid = await verifyPassword(password, config.passwordHash);

    if (!valid) {
      return reply.status(401).send({
        error: "Ungültige Zugangsdaten",
      });
    }

    const session = createSession(config.username);

    reply.setCookie("session_id", session.id, {
        httpOnly: true,
        sameSite: "none",
        secure: true,
        path: "/",
        maxAge: 60 * 60 * 24 * 7,
    });

    return {
      ok: true,
      username: config.username,
      mustChangePassword: config.mustChangePassword,
    };
  });

  app.post("/change-password", async (request, reply) => {
    const body = (request.body || {}) as ChangePasswordBody;
    const currentPassword = body.currentPassword || "";
    const newPassword = body.newPassword || "";

    const sessionId = request.cookies.session_id;
    const session = getSession(sessionId);

    if (!session) {
      return reply.status(401).send({
        error: "Nicht eingeloggt",
      });
    }

    if (newPassword.length < 8) {
      return reply.status(400).send({
        error: "Neues Passwort muss mindestens 8 Zeichen lang sein",
      });
    }

    const config = await readAuthConfig();
    const valid = await verifyPassword(currentPassword, config.passwordHash);

    if (!valid) {
      return reply.status(401).send({
        error: "Aktuelles Passwort ist falsch",
      });
    }

    config.passwordHash = await hashPassword(newPassword);
    config.mustChangePassword = false;

    await writeAuthConfig(config);

    return {
      ok: true,
      message: "Passwort geändert",
    };
  });

  app.get("/me", async (request, reply) => {
    const sessionId = request.cookies.session_id;
    const session = getSession(sessionId);

    if (!session) {
      return reply.status(401).send({
        error: "Nicht eingeloggt",
      });
    }

    const config = await readAuthConfig();

    return {
      ok: true,
      username: session.username,
      mustChangePassword: config.mustChangePassword,
    };
  });

  app.post("/logout", async (request, reply) => {
    const sessionId = request.cookies.session_id;
    deleteSession(sessionId);

    reply.clearCookie("session_id", {
      path: "/",
    });

    return {
      ok: true,
    };
  });
}