import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { apiPost } from "../lib/api";

type LoginResponse = {
  ok: boolean;
  username: string;
  mustChangePassword: boolean;
};

export function LoginPage() {
  const navigate = useNavigate();

  const [username, setUsername] = useState("admin");
  const [password, setPassword] = useState("");
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [mustChangePassword, setMustChangePassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = async () => {
    try {
      setIsSubmitting(true);
      setError("");

      const data = await apiPost<LoginResponse>(
        "/auth/login",
        JSON.stringify({
          username,
          password,
        }),
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      if (data.mustChangePassword) {
        setMustChangePassword(true);
        setCurrentPassword(password);
        return;
      }

      navigate("/dashboard");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login fehlgeschlagen");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChangePassword = async () => {
    try {
      setIsSubmitting(true);
      setError("");

      await apiPost(
        "/auth/change-password",
        JSON.stringify({
          currentPassword,
          newPassword,
        }),
        {
          headers: {
            "Content-Type": "application/json",
          },
        },
      );

      navigate("/dashboard");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Passwort konnte nicht geändert werden",
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-6 text-zinc-50">
      <div className="w-full max-w-md rounded-3xl border border-zinc-800 bg-zinc-900 p-8 shadow-2xl">
        <div className="mb-8">
          <p className="text-xs font-medium uppercase tracking-[0.24em] text-zinc-500">
            api.jadenk.de
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight">
            {mustChangePassword ? "Passwort setzen" : "Login"}
          </h1>
          <p className="mt-2 text-sm text-zinc-400">
            {mustChangePassword
              ? "Beim ersten Login musst du ein neues Passwort setzen."
              : "Melde dich an, um Projekte und API Keys zu verwalten."}
          </p>
        </div>

        {error ? (
          <div className="mb-4 rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-300">
            {error}
          </div>
        ) : null}

        {!mustChangePassword ? (
          <form
            className="space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              void handleLogin();
            }}
          >
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-300">
                Username
              </label>
              <input
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                className="w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm outline-none transition placeholder:text-zinc-600 focus:border-zinc-600"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-300">
                Passwort
              </label>
              <input
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                className="w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm outline-none transition placeholder:text-zinc-600 focus:border-zinc-600"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-2xl bg-zinc-50 px-4 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-zinc-200 disabled:opacity-60"
            >
              {isSubmitting ? "Einloggen..." : "Einloggen"}
            </button>
          </form>
        ) : (
          <form
            className="space-y-4"
            onSubmit={(event) => {
              event.preventDefault();
              void handleChangePassword();
            }}
          >
            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-300">
                Aktuelles Passwort
              </label>
              <input
                type="password"
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
                className="w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm outline-none transition focus:border-zinc-600"
              />
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-zinc-300">
                Neues Passwort
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(event) => setNewPassword(event.target.value)}
                className="w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm outline-none transition focus:border-zinc-600"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full rounded-2xl bg-zinc-50 px-4 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-zinc-200 disabled:opacity-60"
            >
              {isSubmitting ? "Speichert..." : "Passwort setzen"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}