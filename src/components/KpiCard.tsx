export function KpiCard({
  label,
  value,
  sublabel,
  tone = "neutral",
}: {
  label: string;
  value: string;
  sublabel?: string;
  tone?: "neutral" | "good" | "bad";
}) {
  return (
    <div className="border border-line bg-surface p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-ink-muted">
        {label}
      </p>
      <p
        className={`tabular mt-2 text-2xl font-semibold ${
          tone === "good" ? "text-accent" : tone === "bad" ? "text-critical" : "text-ink"
        }`}
      >
        {value}
      </p>
      {sublabel && <p className="mt-1 text-xs text-ink-muted">{sublabel}</p>}
    </div>
  );
}
