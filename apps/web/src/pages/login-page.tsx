export function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-zinc-950 px-6 text-zinc-50">
      <div className="w-full max-w-md rounded-3xl border border-zinc-800 bg-zinc-900 p-8 shadow-2xl">
        <div className="mb-8">
          <p className="text-xs font-medium uppercase tracking-[0.24em] text-zinc-500">
            api.jadenk.de
          </p>
          <h1 className="mt-3 text-3xl font-semibold tracking-tight">
            Login
          </h1>
          <p className="mt-2 text-sm text-zinc-400">
            Melde dich an, um Services, API Keys und Logs zu verwalten.
          </p>
        </div>

        <form className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-300">
              E-Mail
            </label>
            <input
              type="email"
              placeholder="admin@jadenk.de"
              className="w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm outline-none transition placeholder:text-zinc-600 focus:border-zinc-600"
            />
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium text-zinc-300">
              Passwort
            </label>
            <input
              type="password"
              placeholder="••••••••"
              className="w-full rounded-2xl border border-zinc-800 bg-zinc-950 px-4 py-3 text-sm outline-none transition placeholder:text-zinc-600 focus:border-zinc-600"
            />
          </div>

          <button
            type="button"
            className="w-full rounded-2xl bg-zinc-50 px-4 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-zinc-200"
          >
            Einloggen
          </button>
        </form>
      </div>
    </div>
  );
}