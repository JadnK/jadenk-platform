export function Topbar() {
  return (
    <header className="sticky top-0 z-20 border-b border-zinc-800 bg-zinc-950/85 backdrop-blur">
      <div className="flex items-center justify-between px-5 py-4 lg:px-8">
        <div>
          <p className="text-xs font-medium uppercase tracking-[0.2em] text-zinc-500">
            api.jadenk.de
          </p>
          <h2 className="text-lg font-semibold text-zinc-50">
            Control Dashboard
          </h2>
        </div>

        <div className="flex items-center gap-3">
          <div className="rounded-full border border-zinc-800 bg-zinc-900 px-3 py-1 text-sm text-zinc-300">
            admin@jadenk.de
          </div>
        </div>
      </div>
    </header>
  );
}