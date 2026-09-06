import Link from "next/link";
import { StaleLead } from "@/lib/metrics";
import { repById } from "@/lib/data";

const STATUS_LABELS: Record<string, string> = {
  new: "New",
  contacted: "Contacted",
  test_drive: "Test drive",
  negotiation: "Negotiation",
  order_placed: "Order placed",
};

export function LeadAgingTable({ rows, showRep = true }: { rows: StaleLead[]; showRep?: boolean }) {
  if (rows.length === 0) {
    return (
      <p className="border border-line bg-surface p-4 text-sm text-ink-muted">
        No leads have gone quiet for 7+ days. Pipeline is being worked actively.
      </p>
    );
  }

  return (
    <div className="overflow-x-auto border border-line bg-surface">
      <table className="w-full min-w-[560px] text-sm">
        <thead>
          <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-ink-muted">
            <th className="px-4 py-2.5 font-medium">Customer</th>
            <th className="px-4 py-2.5 font-medium">Model</th>
            <th className="px-4 py-2.5 font-medium">Stage</th>
            {showRep && <th className="px-4 py-2.5 font-medium">Rep</th>}
            <th className="px-4 py-2.5 font-medium">Days quiet</th>
          </tr>
        </thead>
        <tbody>
          {rows.slice(0, 15).map(({ lead, daysSinceActivity }) => (
            <tr key={lead.id} className="border-b border-line last:border-b-0 hover:bg-paper">
              <td className="px-4 py-2.5">{lead.customer_name}</td>
              <td className="px-4 py-2.5 text-ink-muted">{lead.model_interested}</td>
              <td className="px-4 py-2.5">{STATUS_LABELS[lead.status] ?? lead.status}</td>
              {showRep && (
                <td className="px-4 py-2.5">
                  <Link href={`/rep/${lead.assigned_to}`} className="text-ink-muted hover:text-accent">
                    {repById.get(lead.assigned_to)?.name ?? lead.assigned_to}
                  </Link>
                </td>
              )}
              <td className="tabular px-4 py-2.5 text-critical">{daysSinceActivity}d</td>
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length > 15 && (
        <p className="border-t border-line px-4 py-2 text-xs text-ink-muted">
          + {rows.length - 15} more
        </p>
      )}
    </div>
  );
}
