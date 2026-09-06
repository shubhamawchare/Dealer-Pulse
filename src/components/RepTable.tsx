import Link from "next/link";
import { RepSummary } from "@/lib/metrics";
import { formatINR } from "@/lib/data";

export function RepTable({ rows }: { rows: RepSummary[] }) {
  const sorted = [...rows].sort((a, b) => b.bookedRevenue - a.bookedRevenue);

  return (
    <div className="overflow-x-auto border border-line bg-surface">
      <table className="w-full min-w-[640px] text-sm">
        <thead>
          <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-ink-muted">
            <th className="px-4 py-2.5 font-medium">Rep</th>
            <th className="px-4 py-2.5 font-medium">Role</th>
            <th className="px-4 py-2.5 font-medium">Leads</th>
            <th className="px-4 py-2.5 font-medium">Delivered</th>
            <th className="px-4 py-2.5 font-medium">Conversion</th>
            <th className="px-4 py-2.5 font-medium">Booked revenue</th>
            <th className="px-4 py-2.5 font-medium">Stale</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((r) => (
            <tr key={r.repId} className="border-b border-line last:border-b-0 hover:bg-paper">
              <td className="px-4 py-2.5">
                <Link href={`/rep/${r.repId}`} className="font-medium text-ink hover:text-accent">
                  {r.name}
                </Link>
              </td>
              <td className="px-4 py-2.5 text-ink-muted">
                {r.role === "branch_manager" ? "Branch manager" : "Sales officer"}
              </td>
              <td className="tabular px-4 py-2.5">{r.totalLeads}</td>
              <td className="tabular px-4 py-2.5">{r.delivered}</td>
              <td className="tabular px-4 py-2.5">{Math.round(r.conversionRate * 100)}%</td>
              <td className="tabular px-4 py-2.5">{formatINR(r.bookedRevenue)}</td>
              <td className="tabular px-4 py-2.5">
                {r.staleLeads > 0 ? (
                  <span className="text-critical">{r.staleLeads}</span>
                ) : (
                  <span className="text-ink-muted">0</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
