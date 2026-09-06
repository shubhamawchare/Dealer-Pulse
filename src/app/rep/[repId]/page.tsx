"use client";

import { useMemo } from "react";
import Link from "next/link";
import { notFound, useParams } from "next/navigation";
import { useTimeRange } from "@/lib/time-range-context";
import { repById, branchById, leadsForRep, formatINR, formatMonth } from "@/lib/data";
import {
  filterLeadsByRange,
  computeKpis,
  computeFunnel,
  computeStaleLeads,
  computeLostReasons,
} from "@/lib/metrics";
import { KpiCard } from "@/components/KpiCard";
import { FunnelChart } from "@/components/FunnelChart";
import { LeadAgingTable } from "@/components/LeadAgingTable";
import { LostReasonList } from "@/components/LostReasonList";

const STATUS_LABELS: Record<string, string> = {
  new: "New",
  contacted: "Contacted",
  test_drive: "Test drive",
  negotiation: "Negotiation",
  order_placed: "Order placed",
  delivered: "Delivered",
  lost: "Lost",
};

export default function RepPage() {
  const params = useParams<{ repId: string }>();
  const rep = repById.get(params.repId);
  const branch = rep ? branchById.get(rep.branch_id) : undefined;
  const { range } = useTimeRange();

  const allRepLeads = useMemo(() => (rep ? leadsForRep(rep.id) : []), [rep]);
  const rangeLeads = useMemo(
    () => filterLeadsByRange(allRepLeads, range),
    [allRepLeads, range]
  );
  const kpis = useMemo(() => computeKpis(rangeLeads), [rangeLeads]);
  const funnel = useMemo(() => computeFunnel(rangeLeads), [rangeLeads]);
  const stale = useMemo(() => computeStaleLeads(allRepLeads), [allRepLeads]);
  const lostReasons = useMemo(() => computeLostReasons(rangeLeads), [rangeLeads]);

  const avgDealValue = useMemo(() => {
    const delivered = rangeLeads.filter((l) => l.status === "delivered");
    if (!delivered.length) return null;
    return delivered.reduce((s, l) => s + l.deal_value, 0) / delivered.length;
  }, [rangeLeads]);

  if (!rep) return notFound();

  return (
    <div className="flex flex-col gap-8">
      <header>
        <p className="text-xs uppercase tracking-wide text-ink-muted">
          {branch && (
            <Link href={`/branch/${branch.id}`} className="hover:text-accent">
              {branch.name}
            </Link>
          )}
          {" · "}
          {formatMonth(range.start)} – {formatMonth(range.end)}
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">{rep.name}</h1>
        <p className="mt-1 text-sm text-ink-muted">
          {rep.role === "branch_manager" ? "Branch manager" : "Sales officer"} · joined{" "}
          {new Date(rep.joined).toLocaleDateString("en-IN", { month: "short", year: "numeric" })}
        </p>
      </header>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <KpiCard label="Leads" value={kpis.totalLeads.toString()} />
        <KpiCard
          label="Conversion"
          value={`${Math.round(kpis.conversionRate * 100)}%`}
          sublabel={`${kpis.delivered} delivered`}
        />
        <KpiCard label="Booked revenue" value={formatINR(kpis.bookedRevenue)} />
        <KpiCard label="Avg. deal value" value={avgDealValue ? formatINR(avgDealValue) : "—"} />
        <KpiCard
          label="Stale leads"
          value={stale.length.toString()}
          tone={stale.length > 0 ? "bad" : "good"}
        />
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="border border-line bg-surface p-5">
          <h2 className="mb-4 text-sm font-semibold">Funnel</h2>
          <FunnelChart data={funnel} />
        </div>
        <div className="border border-line bg-surface p-5">
          <h2 className="mb-3 text-sm font-semibold">Why leads are lost</h2>
          <LostReasonList data={lostReasons} />
        </div>
      </section>

      <section className="border border-line bg-surface p-5">
        <h2 className="mb-1 text-sm font-semibold">Leads going cold</h2>
        <p className="mb-4 text-xs text-ink-muted">
          Open leads with no recorded activity in 7 or more days.
        </p>
        <LeadAgingTable rows={stale} showRep={false} />
      </section>

      <section className="border border-line bg-surface p-5">
        <h2 className="mb-4 text-sm font-semibold">All leads in period</h2>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[560px] text-sm">
            <thead>
              <tr className="border-b border-line text-left text-xs uppercase tracking-wide text-ink-muted">
                <th className="px-3 py-2 font-medium">Customer</th>
                <th className="px-3 py-2 font-medium">Model</th>
                <th className="px-3 py-2 font-medium">Source</th>
                <th className="px-3 py-2 font-medium">Status</th>
                <th className="px-3 py-2 font-medium">Deal value</th>
              </tr>
            </thead>
            <tbody>
              {rangeLeads.map((l) => (
                <tr key={l.id} className="border-b border-line last:border-b-0 hover:bg-paper">
                  <td className="px-3 py-2">{l.customer_name}</td>
                  <td className="px-3 py-2 text-ink-muted">{l.model_interested}</td>
                  <td className="px-3 py-2 text-ink-muted">{l.source.replace("_", " ")}</td>
                  <td className="px-3 py-2">{STATUS_LABELS[l.status]}</td>
                  <td className="tabular px-3 py-2">{formatINR(l.deal_value)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
