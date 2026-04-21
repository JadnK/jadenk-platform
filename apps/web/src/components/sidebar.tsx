import { Link, NavLink } from "react-router-dom";

const navItems = [
  { to: "/dashboard", label: "Übersicht" },
  { to: "/dashboard/projects", label: "Projects" },
  { to: "/dashboard/deployments", label: "Deployments" },
  { to: "/dashboard/keys", label: "API Keys" },
  { to: "/dashboard/logs", label: "Logs" },
  { to: "/dashboard/settings", label: "Settings" },
];

export function Sidebar() {
  return (
    <aside className="hidden lg:flex lg:flex-col w-72 shrink-0 border-r border-zinc-800 bg-zinc-950 sticky top-0 h-screen">
      <div className="border-b border-zinc-800 px-6 py-5">
        <p className="text-xs font-medium uppercase tracking-[0.22em] text-zinc-500">
          Jadenk
        </p>
        <h1 className="mt-2 text-2xl font-semibold tracking-tight text-zinc-50">
          jadenk-platform
        </h1>
        <p className="mt-1 text-sm text-zinc-400">
          Dashboard · Gateway · API Control
        </p>
      </div>

      <nav className="flex flex-1 flex-col gap-2 p-4">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.to === "/dashboard"}
            className={({ isActive }) =>
              [
                "rounded-xl px-4 py-3 text-sm font-medium transition",
                isActive
                  ? "bg-zinc-800 text-zinc-50"
                  : "text-zinc-400 hover:bg-zinc-900 hover:text-zinc-100",
              ].join(" ")
            }
          >
            {item.label}
          </NavLink>
        ))}
      </nav>

      <div className="border-t border-zinc-800 p-4">
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900 p-4">
          <p className="mt-1 text-sm text-zinc-400">
        Lade ein neues API-Projekt hoch und deploye es direkt.
          </p>

            <Link
            to="/dashboard/projects/new"
            className="mt-4 inline-flex w-full items-center justify-center rounded-xl bg-zinc-50 px-4 py-3 text-sm font-semibold text-zinc-950 transition hover:bg-zinc-200"
            >
            Neues Projekt
            </Link>
        </div>
      </div>
    </aside>
  );
}