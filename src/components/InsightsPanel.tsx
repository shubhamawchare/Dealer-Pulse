import Link from "next/link";
import { Insight } from "@/lib/metrics";

const SEVERITY_STYLES: Record<
  Insight["severity"],
  { borderColor: string; badgeBg: string; badgeText: string; label: string }
> = {
  critical: {
    borderColor: "var(--critical)",
    badgeBg: "bg-critical-soft",
    badgeText: "text-critical",
    label: "Act now",
  },
  warning: {
    borderColor: "var(--warning)",
    badgeBg: "bg-warning-soft",
    badgeText: "text-warning",
    label: "Watch",
  },
  info: {
    borderColor: "var(--info)",
    badgeBg: "bg-info-soft",
    badgeText: "text-info",
    label: "FYI",
  },
};

export function InsightsPanel({ insights }: { insights: Insight[] }) {
  if (insights.length === 0) {
    return (
      <div className="border border-line bg-surface p-6 text-center text-sm text-ink-muted">
        No notable exceptions in this period — the network is tracking to plan.
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      {insights.map((insight) => {
        const style = SEVERITY_STYLES[insight.severity];
        const content = (
          <div
            className={`border border-line bg-surface p-3.5 ${
              insight.href ? "transition-colors hover:bg-paper" : ""
            }`}
            style={{ borderLeftWidth: 3, borderLeftColor: style.borderColor }}
          >
            <div className="flex items-start justify-between gap-3">
              <p className="text-sm font-medium leading-snug text-ink">{insight.title}</p>
              <span
                className={`shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide ${style.badgeBg} ${style.badgeText}`}
              >
                {style.label}
              </span>
            </div>
            <p className="mt-1 text-xs leading-relaxed text-ink-muted">{insight.detail}</p>
          </div>
        );
        return insight.href ? (
          <Link key={insight.id} href={insight.href}>
            {content}
          </Link>
        ) : (
          <div key={insight.id}>{content}</div>
        );
      })}
    </div>
  );
}
