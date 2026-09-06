export function AttainmentBar({ value }: { value: number }) {
  const pct = Math.round(value * 100);
  const color = value >= 1 ? "var(--accent)" : value >= 0.75 ? "var(--warning)" : "var(--critical)";

  return (
    <div className="flex items-center gap-2">
      <div className="h-2 w-24 bg-paper">
        <div
          className="h-2"
          style={{ width: `${Math.min(pct, 100)}%`, background: color }}
        />
      </div>
      <span className="tabular text-xs" style={{ color }}>
        {pct}%
      </span>
    </div>
  );
}
