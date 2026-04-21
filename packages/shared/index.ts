export type UserRole = "admin" | "user";

export interface Service {
  id: string;
  name: string;
  slug: string;
  targetUrl: string;
  runtime: "node" | "python" | "other";
  createdAt: string;
}