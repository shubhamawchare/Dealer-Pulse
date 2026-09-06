"use client";

import { useMemo } from "react";
import { useTimeRange } from "@/lib/time-range-context";
import {
  leads,
  formatINR,
  formatMonth,
  DATA_AS_OF,
} from "@/lib/data";
import {
  filterLeadsByRange,
  computeKpis,
  computeFunnel,
  computeBranchSummaries,
  computeInsights,
  computeMonthlyTrend,
  computeLostReasons,
} from "@/lib/metrics";
import { KpiCard } from "@/components/KpiCard";
import { InsightsPanel } from "@/components/InsightsPanel";
import { FunnelChart } from "@/components/FunnelChart";
import { BranchTable } from "@/components/BranchTable";
import { MonthlyTrendChart } from "@/components/MonthlyTrendChart";
import { SourceBreakdownChart } from "@/components/SourceBreakdownChart";
import { LostReasonList } from "@/components/LostReasonList";

export default function OverviewPage() {
  const { range } = useTimeRange();

  const rangeLeads = useMemo(() => filterLeadsByRange(leads, range), [range]);
  const kpis = useMemo(() => computeKpis(rangeLeads), [rangeLeads]);
  const funnel = useMemo(() => computeFunnel(rangeLeads), [rangeLeads]);
  const branchSummaries = useMemo(
    () => computeBranchSummaries(rangeLeads, range),
    [rangeLeads, range]
  );
  const insights = useMemo(() => computeInsights(range), [range]);
  const trend = useMemo(() => computeMonthlyTrend(null, range), [range]);
  const lostReasons = useMemo(() => computeLostReasons(rangeLeads), [rangeLeads]);

  const networkAttainment = useMemo(() => {
    const totalTarget = branchSummaries.reduce((s, b) => s + b.targetUnits, 0);
    const totalBooked = branchSummaries.reduce((s, b) => s + b.bookedUnits, 0);
    return totalTarget ? totalBooked / totalTarget : 0;
  }, [branchSummaries]);

  return (
    <div className="flex flex-col gap-8">
      <header>
        <p className="text-xs uppercase tracking-wide text-ink-muted">
          {formatMonth(range.start)} – {formatMonth(range.end)} · data as of{" "}
          {DATA_AS_OF.toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">Network overview</h1>
      </header>

      <section className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
        <KpiCard label="Leads" value={kpis.totalLeads.toString()} />
        <KpiCard
          label="Conversion"
          value={`${Math.round(kpis.conversionRate * 100)}%`}
          sublabel={`${kpis.delivered} delivered`}
        />
        <KpiCard
          label="Unit attainment"
          value={`${Math.round(networkAttainment * 100)}%`}
          tone={networkAttainment >= 1 ? "good" : networkAttainment < 0.75 ? "bad" : "neutral"}
        />
        <KpiCard label="Booked revenue" value={formatINR(kpis.bookedRevenue)} />
        <KpiCard
          label="Avg. delivery time"
          value={kpis.avgDaysToDeliver ? `${kpis.avgDaysToDeliver.toFixed(0)}d` : "—"}
        />
      </section>

      <section className="grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="flex flex-col gap-6">
          <div className="border border-line bg-surface p-5">
            <h2 className="mb-4 text-sm font-semibold">Branch performance</h2>
            <BranchTable rows={branchSummaries} />
          </div>

          <div className="border border-line bg-surface p-5">
            <h2 className="mb-1 text-sm font-semibold">Bookings vs. target by month</h2>
            <p className="mb-3 text-xs text-ink-muted">
              Bars are units booked (reached order stage); the dashed line is the combined target.
            </p>
            <MonthlyTrendChart data={trend} />
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div className="border border-line bg-surface p-5">
              <h2 className="mb-3 text-sm font-semibold">Lead sources</h2>
              <SourceBreakdownChart leads={rangeLeads} />
            </div>
            <div className="border border-line bg-surface p-5">
              <h2 className="mb-3 text-sm font-semibold">Why leads are lost</h2>
              <LostReasonList data={lostReasons} />
            </div>
          </div>

          <div className="border border-line bg-surface p-5">
            <h2 className="mb-1 text-sm font-semibold">Lead funnel</h2>
            <p className="mb-4 text-xs text-ink-muted">
              Share of leads reaching each stage, with drop-off from the previous stage.
            </p>
            <FunnelChart data={funnel} />
          </div>
        </div>

        <div className="flex flex-col gap-3">
          <h2 className="text-sm font-semibold">Needs attention</h2>
          <InsightsPanel insights={insights} />
        </div>
      </section>
    </div>
  );
}
