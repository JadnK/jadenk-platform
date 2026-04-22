import fs from "node:fs";
import path from "node:path";
import bcrypt from "bcrypt";
import { runtimePaths } from "./runtime-paths";

export interface AuthConfig {
  username: string;
  passwordHash: string | null;
  mustChangePassword: boolean;
}

const authConfigPath = path.join(runtimePaths.runtimeRoot, "auth.config.json");

const INITIAL_USERNAME = "admin";
const INITIAL_PASSWORD = "JadenkSetup!2026";

export async function ensureAuthConfig(): Promise<void> {
  await fs.promises.mkdir(runtimePaths.runtimeRoot, { recursive: true });

  if (fs.existsSync(authConfigPath)) {
    return;
  }

  const initialHash = await bcrypt.hash(INITIAL_PASSWORD, 10);

  const initialConfig: AuthConfig = {
    username: INITIAL_USERNAME,
    passwordHash: initialHash,
    mustChangePassword: true,
  };

  await fs.promises.writeFile(
    authConfigPath,
    JSON.stringify(initialConfig, null, 2),
    "utf-8",
  );
}

export async function readAuthConfig(): Promise<AuthConfig> {
  await ensureAuthConfig();

  const content = await fs.promises.readFile(authConfigPath, "utf-8");
  return JSON.parse(content) as AuthConfig;
}

export async function writeAuthConfig(config: AuthConfig): Promise<void> {
  await fs.promises.writeFile(
    authConfigPath,
    JSON.stringify(config, null, 2),
    "utf-8",
  );
}

export async function verifyPassword(
  plainPassword: string,
  passwordHash: string | null,
): Promise<boolean> {
  if (!passwordHash) return false;
  return bcrypt.compare(plainPassword, passwordHash);
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10);
}

export function getInitialCredentials() {
  return {
    username: INITIAL_USERNAME,
    password: INITIAL_PASSWORD,
  };
}