export function LostReasonList({ data }: { data: { reason: string; count: number }[] }) {
  const max = data[0]?.count || 1;

  if (data.length === 0) {
    return <p className="text-sm text-ink-muted">No lost leads in this period.</p>;
  }

  return (
    <div className="flex flex-col gap-2.5">
      {data.map((d) => (
        <div key={d.reason}>
          <div className="mb-1 flex items-baseline justify-between text-xs">
            <span className="text-ink">{d.reason}</span>
            <span className="tabular text-ink-muted">{d.count}</span>
          </div>
          <div className="h-1.5 w-full bg-paper">
            <div
              className="h-1.5 bg-critical"
              style={{ width: `${Math.max((d.count / max) * 100, 3)}%` }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}
