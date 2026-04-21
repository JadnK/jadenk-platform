interface StatusBadgeProps {
  status: "running" | "stopped" | "building" | "failed";
}

export function StatusBadge({ status }: StatusBadgeProps) {
  const styles: Record<StatusBadgeProps["status"], string> = {
    running: "border-emerald-500/20 bg-emerald-500/10 text-emerald-300",
    stopped: "border-zinc-700 bg-zinc-800 text-zinc-300",
    building: "border-amber-500/20 bg-amber-500/10 text-amber-300",
    failed: "border-red-500/20 bg-red-500/10 text-red-300",
  };

  return (
    <span
      className={`inline-flex rounded-full border px-3 py-1 text-xs font-medium ${styles[status]}`}
    >
      {status}
    </span>
  );
}