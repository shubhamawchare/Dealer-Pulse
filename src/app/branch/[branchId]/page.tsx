"use client";

import { useMemo } from "react";
import { notFound, useParams } from "next/navigation";
import { useTimeRange } from "@/lib/time-range-context";
import {
  branchById,
  leadsForBranch,
  repsForBranch,
  formatINR,
  formatMonth,
} from "@/lib/data";
import {
  filterLeadsByRange,
  computeKpis,
  computeFunnel,
  computeStaleLeads,
  computeRepSummaries,
  computeMonthlyTrend,
  computeLostReasons,
  computeDelayReasons,
  computeBranchMonthActuals,
  monthInRange,
} from "@/lib/metrics";
import { KpiCard } from "@/components/KpiCard";
import { FunnelChart } from "@/components/FunnelChart";
import { MonthlyTrendChart } from "@/components/MonthlyTrendChart";
import { RepTable } from "@/components/RepTable";
import { LeadAgingTable } from "@/components/LeadAgingTable";
import { LostReasonList } from "@/components/LostReasonList";
import { AttainmentBar } from "@/components/AttainmentBar";
import { targets } from "@/lib/data";

export default function BranchPage() {
  const params = useParams<{ branchId: string }>();
  const branch = branchById.get(params.branchId);
  const { range } = useTimeRange();

  const allBranchLeads = useMemo(
    () => (branch ? leadsForBranch(branch.id) : []),
    [branch]
  );
  const rangeLeads = useMemo(
    () => filterLeadsByRange(allBranchLeads, range),
    [allBranchLeads, range]
  );
  const kpis = useMemo(() => computeKpis(rangeLeads), [rangeLeads]);
  const funnel = useMemo(() => computeFunnel(rangeLeads), [rangeLeads]);
  const stale = useMemo(() => computeStaleLeads(allBranchLeads), [allBranchLeads]);
  const reps = useMemo(
    () => (branch ? repsForBranch(branch.id) : []),
    [branch]
  );
  const repSummaries = useMemo(() => {
    const all = computeRepSummaries(rangeLeads);
    return all.filter((r) => reps.some((rep) => rep.id === r.repId));
  }, [reps, rangeLeads]);
  const trend = useMemo(
    () => (branch ? computeMonthlyTrend(branch.id, range) : []),
    [branch, range]
  );
  const lostReasons = useMemo(() => computeLostReasons(rangeLeads), [rangeLeads]);
  const delayReasons = useMemo(
    () => computeDelayReasons(rangeLeads.map((l) => l.id)),
    [rangeLeads]
  );

  const attainment = useMemo(() => {
    if (!branch) return { units: 0, targetUnits: 0, revenue: 0, targetRevenue: 0, pct: 0, revPct: 0 };
    const months = targets
      .filter((t) => t.branch_id === branch.id && monthInRange(t.month, range))
      .map((t) => t.month);
    let units = 0,
      targetUnits = 0,
      revenue = 0,
      targetRevenue = 0;
    months.forEach((m) => {
      const a = computeBranchMonthActuals(allBranchLeads, branch.id, m);
      units += a.bookedUnits;
      targetUnits += a.targetUnits;
      revenue += a.bookedRevenue;
      targetRevenue += a.targetRevenue;
    });
    return {
      units,
      targetUnits,
      revenue,
      targetRevenue,
      pct: targetUnits ? units / targetUnits : 0,
      revPct: targetRevenue ? revenue / targetRevenue : 0,
    };
  }, [branch, allBranchLeads, range]);

  if (!branch) return notFound();

  const manager = reps.find((r) => r.role === "branch_manager");

  return (
    <div className="flex flex-col gap-8">
      <header>
        <p className="text-xs uppercase tracking-wide text-ink-muted">
          {branch.city} · {formatMonth(range.start)} – {formatMonth(range.end)}
        </p>
        <h1 className="mt-1 text-2xl font-semibold tracking-tight">{branch.name}</h1>
        {manager && (
          <p className="mt-1 text-sm text-ink-muted">Branch manager: {manager.name}</p>
        )}
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
          value={`${Math.round(attainment.pct * 100)}%`}
          sublabel={`${attainment.units} / ${attainment.targetUnits} units`}
          tone={attainment.pct >= 1 ? "good" : attainment.pct < 0.75 ? "bad" : "neutral"}
        />
        <KpiCard label="Booked revenue" value={formatINR(attainment.revenue)} />
        <KpiCard
          label="Stale leads"
          value={stale.length.toString()}
          tone={stale.length > 0 ? "bad" : "good"}
        />
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="border border-line bg-surface p-5">
          <h2 className="mb-3 text-sm font-semibold">Target attainment</h2>
          <div className="flex flex-col gap-3">
            <div>
              <p className="mb-1 text-xs text-ink-muted">Units</p>
              <AttainmentBar value={attainment.pct} />
            </div>
            <div>
              <p className="mb-1 text-xs text-ink-muted">Revenue</p>
              <AttainmentBar value={attainment.revPct} />
            </div>
          </div>
        </div>
        <div className="border border-line bg-surface p-5">
          <h2 className="mb-1 text-sm font-semibold">Bookings vs. target</h2>
          <MonthlyTrendChart data={trend} />
        </div>
      </section>

      <section className="border border-line bg-surface p-5">
        <h2 className="mb-4 text-sm font-semibold">Sales team</h2>
        <RepTable rows={repSummaries} />
      </section>

      <section className="border border-line bg-surface p-5">
        <h2 className="mb-1 text-sm font-semibold">Leads going cold</h2>
        <p className="mb-4 text-xs text-ink-muted">
          Open leads with no recorded activity in 7 or more days.
        </p>
        <LeadAgingTable rows={stale} />
      </section>

      <section className="grid gap-6 sm:grid-cols-2">
        <div className="border border-line bg-surface p-5">
          <h2 className="mb-4 text-sm font-semibold">Lead funnel</h2>
          <FunnelChart data={funnel} />
        </div>
        <div className="flex flex-col gap-6">
          <div className="border border-line bg-surface p-5">
            <h2 className="mb-3 text-sm font-semibold">Why leads are lost</h2>
            <LostReasonList data={lostReasons} />
          </div>
          {delayReasons.length > 0 && (
            <div className="border border-line bg-surface p-5">
              <h2 className="mb-3 text-sm font-semibold">Delivery delay reasons</h2>
              <LostReasonList data={delayReasons} />
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
