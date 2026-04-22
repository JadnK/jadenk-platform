import { useEffect, useState, type ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { apiGet } from "../lib/api";

interface AuthGuardProps {
  children: ReactNode;
}

type MeResponse = {
  ok: boolean;
  username: string;
  mustChangePassword: boolean;
};

export function AuthGuard({ children }: AuthGuardProps) {
  const [status, setStatus] = useState<"loading" | "authenticated" | "guest">(
    "loading",
  );

  useEffect(() => {
    const load = async () => {
      try {
        await apiGet<MeResponse>("/auth/me");
        setStatus("authenticated");
      } catch {
        setStatus("guest");
      }
    };

    void load();
  }, []);

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-zinc-950 text-zinc-400">
        Lade Session...
      </div>
    );
  }

  if (status === "guest") {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}