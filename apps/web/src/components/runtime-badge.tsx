interface RuntimeBadgeProps {
  runtime: "node" | "python" | "go" | "php" | "other";
}

export function RuntimeBadge({ runtime }: RuntimeBadgeProps) {
  return (
    <span className="inline-flex rounded-full border border-zinc-700 bg-zinc-800 px-3 py-1 text-xs font-medium text-zinc-300">
      {runtime}
    </span>
  );
}