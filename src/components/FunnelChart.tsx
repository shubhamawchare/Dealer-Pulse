import { FunnelPoint } from "@/lib/metrics";

export function FunnelChart({ data }: { data: FunnelPoint[] }) {
  const max = data[0]?.reached || 1;

  return (
    <div className="flex flex-col gap-3">
      {data.map((point, i) => {
        const widthPct = Math.max((point.reached / max) * 100, 4);
        const prevReached = i > 0 ? data[i - 1].reached : point.reached;
        const dropOff = i > 0 ? prevReached - point.reached : 0;
        const dropPct = prevReached ? Math.round((dropOff / prevReached) * 100) : 0;

        return (
          <div key={point.stage}>
            <div className="mb-1 flex items-baseline justify-between text-xs">
              <span className="font-medium text-ink">{point.label}</span>
              <span className="tabular text-ink-muted">
                {point.reached}
                {i > 0 && dropOff > 0 && (
                  <span className="ml-2 text-critical">−{dropPct}%</span>
                )}
              </span>
            </div>
            <div className="h-6 w-full bg-paper">
              <div
                className="h-6 bg-accent transition-[width]"
                style={{ width: `${widthPct}%` }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}
