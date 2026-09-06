import Link from "next/link";
import { BranchSummary } from "@/lib/metrics";
import { formatINR } from "@/lib/data";
import { AttainmentBar } from "./AttainmentBar";

export function BranchTable({ rows }: { rows: BranchSummary[] }) {
  const sorted = [...rows].sort((a, b) => b.attainment - a.attainment);

  return (
    <div className="overflow-x-auto border border-line bg-surface">
      <table className="w-full min-w-[720px] text-sm">
        <thead>
          <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-ink-muted">
            <th className="px-4 py-3 font-medium">Branch</th>
            <th className="px-4 py-3 font-medium">Leads</th>
            <th className="px-4 py-3 font-medium">Conversion</th>
            <th className="px-4 py-3 font-medium">Units booked</th>
            <th className="px-4 py-3 font-medium">Unit attainment</th>
            <th className="px-4 py-3 font-medium">Revenue booked</th>
            <th className="px-4 py-3 font-medium">Stale leads</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((r) => (
            <tr key={r.branchId} className="border-b border-line last:border-b-0 hover:bg-paper">
              <td className="px-4 py-3">
                <Link href={`/branch/${r.branchId}`} className="font-medium text-ink hover:text-accent">
                  {r.name}
                </Link>
                <div className="text-xs text-ink-muted">{r.city}</div>
              </td>
              <td className="tabular px-4 py-3">{r.totalLeads}</td>
              <td className="tabular px-4 py-3">{Math.round(r.conversionRate * 100)}%</td>
              <td className="tabular px-4 py-3">
                {r.bookedUnits}
                <span className="text-ink-muted"> / {r.targetUnits}</span>
              </td>
              <td className="px-4 py-3">
                <AttainmentBar value={r.attainment} />
              </td>
              <td className="tabular px-4 py-3">{formatINR(r.bookedRevenue)}</td>
              <td className="tabular px-4 py-3">
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
