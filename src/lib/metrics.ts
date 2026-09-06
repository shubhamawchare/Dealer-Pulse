import { Lead, FUNNEL_STAGES, LeadStatus } from "./types";
import {
  branches,
  salesReps,
  targets,
  deliveryByLeadId,
  branchById,
  repById,
  monthKey,
  daysInMonth,
  DATA_AS_OF,
  daysBetween,
  leads as allLeadsRaw,
} from "./data";

function leads_(branchId: string): Lead[] {
  return allLeadsRaw.filter((l) => l.branch_id === branchId);
}

export interface TimeRange {
  start: string; // "2025-06"
  end: string; // "2025-12" inclusive
}

export function monthInRange(month: string, range: TimeRange): boolean {
  return month >= range.start && month <= range.end;
}

/** Leads "belong" to the window if they were created in it. */
export function filterLeadsByRange(leads: Lead[], range: TimeRange): Lead[] {
  return leads.filter((l) => monthInRange(monthKey(l.created_at), range));
}

// ---------- Funnel ----------

export interface FunnelPoint {
  stage: LeadStatus;
  label: string;
  reached: number;
  lostHere: number;
}

const STAGE_LABELS: Record<LeadStatus, string> = {
  new: "New enquiry",
  contacted: "Contacted",
  test_drive: "Test drive",
  negotiation: "Negotiation",
  order_placed: "Order placed",
  delivered: "Delivered",
  lost: "Lost",
};

export function computeFunnel(leads: Lead[]): FunnelPoint[] {
  return FUNNEL_STAGES.map((stage) => {
    const reached = leads.filter((l) =>
      l.status_history.some((h) => h.status === stage)
    ).length;
    const lostHere = leads.filter((l) => {
      if (l.status !== "lost") return false;
      const stages = l.status_history.map((h) => h.status);
      const idx = FUNNEL_STAGES.indexOf(stage);
      const nextStage = FUNNEL_STAGES[idx + 1];
      return stages.includes(stage) && (!nextStage || !stages.includes(nextStage));
    }).length;
    return { stage, label: STAGE_LABELS[stage], reached, lostHere };
  });
}

// ---------- KPIs ----------

export interface Kpis {
  totalLeads: number;
  delivered: number;
  lost: number;
  openPipeline: number;
  conversionRate: number;
  bookedRevenue: number;
  deliveredRevenue: number;
  avgDaysToDeliver: number | null;
}

export function computeKpis(leads: Lead[]): Kpis {
  const delivered = leads.filter((l) => l.status === "delivered").length;
  const lost = leads.filter((l) => l.status === "lost").length;
  const openPipeline = leads.length - delivered - lost;
  const bookedLeads = leads.filter((l) =>
    l.status_history.some((h) => h.status === "order_placed")
  );
  const bookedRevenue = bookedLeads.reduce((s, l) => s + l.deal_value, 0);
  const deliveredRevenue = leads
    .filter((l) => l.status === "delivered")
    .reduce((s, l) => s + l.deal_value, 0);

  const deliveryDurations = leads
    .map((l) => deliveryByLeadId.get(l.id))
    .filter((d): d is NonNullable<typeof d> => !!d)
    .map((d) => d.days_to_deliver);
  const avgDaysToDeliver = deliveryDurations.length
    ? deliveryDurations.reduce((s, v) => s + v, 0) / deliveryDurations.length
    : null;

  return {
    totalLeads: leads.length,
    delivered,
    lost,
    openPipeline,
    conversionRate: leads.length ? delivered / leads.length : 0,
    bookedRevenue,
    deliveredRevenue,
    avgDaysToDeliver,
  };
}

// ---------- Bookings against target (units booked = reached order_placed in month) ----------

export interface BranchMonthActual {
  branchId: string;
  month: string;
  bookedUnits: number;
  bookedRevenue: number;
  targetUnits: number;
  targetRevenue: number;
}

function orderPlacedTimestamp(lead: Lead): string | null {
  const entry = lead.status_history.find((h) => h.status === "order_placed");
  return entry ? entry.timestamp : null;
}

export function computeBranchMonthActuals(
  leads: Lead[],
  branchId: string,
  month: string
): BranchMonthActual {
  const target = targets.find(
    (t) => t.branch_id === branchId && t.month === month
  );
  const bookedThisMonth = leads.filter((l) => {
    if (l.branch_id !== branchId) return false;
    const ts = orderPlacedTimestamp(l);
    return ts && monthKey(ts) === month;
  });
  return {
    branchId,
    month,
    bookedUnits: bookedThisMonth.length,
    bookedRevenue: bookedThisMonth.reduce((s, l) => s + l.deal_value, 0),
    targetUnits: target?.target_units ?? 0,
    targetRevenue: target?.target_revenue ?? 0,
  };
}

export interface BranchSummary {
  branchId: string;
  name: string;
  city: string;
  totalLeads: number;
  delivered: number;
  conversionRate: number;
  bookedUnits: number;
  targetUnits: number;
  attainment: number; // bookedUnits / targetUnits across range
  bookedRevenue: number;
  targetRevenue: number;
  revenueAttainment: number;
  staleLeads: number;
}

export function computeBranchSummaries(
  allLeads: Lead[],
  range: TimeRange
): BranchSummary[] {
  return branches.map((b) => {
    const branchLeads = allLeads.filter((l) => l.branch_id === b.id);
    const kpis = computeKpis(branchLeads);
    const months = targets
      .filter((t) => t.branch_id === b.id && monthInRange(t.month, range))
      .map((t) => t.month);
    let bookedUnits = 0;
    let targetUnits = 0;
    let bookedRevenue = 0;
    let targetRevenue = 0;
    months.forEach((m) => {
      const actual = computeBranchMonthActuals(leads_(b.id), b.id, m);
      bookedUnits += actual.bookedUnits;
      targetUnits += actual.targetUnits;
      bookedRevenue += actual.bookedRevenue;
      targetRevenue += actual.targetRevenue;
    });
    return {
      branchId: b.id,
      name: b.name,
      city: b.city,
      totalLeads: branchLeads.length,
      delivered: kpis.delivered,
      conversionRate: kpis.conversionRate,
      bookedUnits,
      targetUnits,
      attainment: targetUnits ? bookedUnits / targetUnits : 0,
      bookedRevenue,
      targetRevenue,
      revenueAttainment: targetRevenue ? bookedRevenue / targetRevenue : 0,
      staleLeads: computeStaleLeads(branchLeads).length,
    };
  });
}

// Note: bookings are computed against the FULL lead set for a branch (see
// `leads_` above), not the time-range-filtered list — a lead created in May
// but booked in June should still count toward June's target.

// ---------- Lead aging ----------

export interface StaleLead {
  lead: Lead;
  daysSinceActivity: number;
}

export function computeStaleLeads(leads: Lead[], thresholdDays = 7): StaleLead[] {
  return leads
    .filter((l) => l.status !== "delivered" && l.status !== "lost")
    .map((l) => ({
      lead: l,
      daysSinceActivity: daysBetween(DATA_AS_OF, new Date(l.last_activity_at)),
    }))
    .filter((x) => x.daysSinceActivity >= thresholdDays)
    .sort((a, b) => b.daysSinceActivity - a.daysSinceActivity);
}

// ---------- Rep performance ----------

export interface RepSummary {
  repId: string;
  name: string;
  role: string;
  branchId: string;
  totalLeads: number;
  delivered: number;
  lost: number;
  conversionRate: number;
  bookedRevenue: number;
  staleLeads: number;
}

export function computeRepSummaries(allLeads: Lead[]): RepSummary[] {
  return salesReps.map((r) => {
    const repLeads = allLeads.filter((l) => l.assigned_to === r.id);
    const kpis = computeKpis(repLeads);
    return {
      repId: r.id,
      name: r.name,
      role: r.role,
      branchId: r.branch_id,
      totalLeads: repLeads.length,
      delivered: kpis.delivered,
      lost: kpis.lost,
      conversionRate: kpis.conversionRate,
      bookedRevenue: kpis.bookedRevenue,
      staleLeads: computeStaleLeads(repLeads).length,
    };
  });
}

// ---------- Lost reasons ----------

export function computeLostReasons(leads: Lead[]): { reason: string; count: number }[] {
  const map = new Map<string, number>();
  leads
    .filter((l) => l.status === "lost")
    .forEach((l) => {
      const reason = l.lost_reason || "Unspecified";
      map.set(reason, (map.get(reason) ?? 0) + 1);
    });
  return Array.from(map.entries())
    .map(([reason, count]) => ({ reason, count }))
    .sort((a, b) => b.count - a.count);
}

// ---------- Delivery delays ----------

export function computeDelayReasons(leadIds: string[]): { reason: string; count: number }[] {
  const map = new Map<string, number>();
  leadIds.forEach((id) => {
    const d = deliveryByLeadId.get(id);
    if (d && d.delay_reason) {
      map.set(d.delay_reason, (map.get(d.delay_reason) ?? 0) + 1);
    }
  });
  return Array.from(map.entries())
    .map(([reason, count]) => ({ reason, count }))
    .sort((a, b) => b.count - a.count);
}

// ---------- Monthly trend (bookings vs target) ----------

export interface MonthTrendPoint {
  month: string;
  label: string;
  bookedUnits: number;
  targetUnits: number;
  bookedRevenue: number;
  targetRevenue: number;
}

export function computeMonthlyTrend(
  branchId: string | null,
  range: TimeRange
): MonthTrendPoint[] {
  const relevantTargets = targets.filter(
    (t) =>
      monthInRange(t.month, range) && (branchId ? t.branch_id === branchId : true)
  );
  const months = Array.from(new Set(relevantTargets.map((t) => t.month))).sort();
  return months.map((month) => {
    const branchIds = branchId ? [branchId] : branches.map((b) => b.id);
    let bookedUnits = 0;
    let targetUnits = 0;
    let bookedRevenue = 0;
    let targetRevenue = 0;
    branchIds.forEach((bId) => {
      const actual = computeBranchMonthActuals(leads_(bId), bId, month);
      bookedUnits += actual.bookedUnits;
      targetUnits += actual.targetUnits;
      bookedRevenue += actual.bookedRevenue;
      targetRevenue += actual.targetRevenue;
    });
    return {
      month,
      label: month,
      bookedUnits,
      targetUnits,
      bookedRevenue,
      targetRevenue,
    };
  });
}

// ---------- Insights ----------

export type InsightSeverity = "critical" | "warning" | "info";

export interface Insight {
  id: string;
  severity: InsightSeverity;
  title: string;
  detail: string;
  branchId?: string;
  repId?: string;
  href?: string;
}

export function computeInsights(range: TimeRange): Insight[] {
  const insights: Insight[] = [];
  const asOfMonth = monthKey(DATA_AS_OF.toISOString());

  // 1. Branches behind pace in the "current" (as-of) month, if it's in range.
  if (monthInRange(asOfMonth, range)) {
    const dim = daysInMonth(asOfMonth);
    const elapsed = DATA_AS_OF.getUTCDate();
    const expectedPaceFraction = elapsed / dim;
    branches.forEach((b) => {
      const actual = computeBranchMonthActuals(leads_(b.id), b.id, asOfMonth);
      if (!actual.targetUnits) return;
      const expectedUnits = actual.targetUnits * expectedPaceFraction;
      const gap = expectedUnits - actual.bookedUnits;
      const gapPct = expectedUnits ? gap / expectedUnits : 0;
      if (gapPct > 0.25) {
        const daysLeft = dim - elapsed;
        insights.push({
          id: `pace-${b.id}`,
          severity: gapPct > 0.5 ? "critical" : "warning",
          title: `${b.name} is behind pace on its ${formatMonthShort(asOfMonth)} target`,
          detail: `${actual.bookedUnits} of ${actual.targetUnits} units booked with ${daysLeft} day${daysLeft === 1 ? "" : "s"} left — about ${Math.round(gapPct * 100)}% behind where it should be at this point in the month.`,
          branchId: b.id,
          href: `/branch/${b.id}`,
        });
      }
    });
  }

  // 2. Stale leads by branch (uncontacted / stalled 7+ days).
  branches.forEach((b) => {
    const branchLeads = leads_(b.id);
    const stale = computeStaleLeads(branchLeads, 7);
    if (stale.length >= 3) {
      const oldest = stale[0];
      insights.push({
        id: `stale-${b.id}`,
        severity: stale.length >= 8 ? "critical" : "warning",
        title: `${stale.length} leads have gone cold at ${b.name}`,
        detail: `No activity for 7+ days on ${stale.length} open lead${stale.length === 1 ? "" : "s"}. The oldest, ${oldest.lead.customer_name} (${oldest.lead.model_interested}), hasn't been touched in ${oldest.daysSinceActivity} days.`,
        branchId: b.id,
        href: `/branch/${b.id}`,
      });
    }
  });

  // 3. Reps with a notably high lost rate (min sample size to avoid noise).
  const repSummaries = computeRepSummaries(allLeadsRaw);
  repSummaries
    .filter((r) => r.totalLeads >= 10)
    .forEach((r) => {
      const lostRate = r.lost / r.totalLeads;
      if (lostRate >= 0.65) {
        insights.push({
          id: `lostrate-${r.repId}`,
          severity: "warning",
          title: `${r.name} is losing more leads than peers`,
          detail: `${Math.round(lostRate * 100)}% of ${r.name}'s ${r.totalLeads} leads were lost, versus a network average closer to 55%. Worth a pipeline review.`,
          repId: r.repId,
          branchId: r.branchId,
          href: `/rep/${r.repId}`,
        });
      }
    });

  // 4. Delivery delay hotspot.
  const delayReasons = computeDelayReasons(allLeadsRaw.map((l) => l.id));
  const totalDelays = delayReasons.reduce((s, d) => s + d.count, 0);
  if (delayReasons.length && totalDelays >= 15) {
    const top = delayReasons[0];
    insights.push({
      id: `delay-${top.reason}`,
      severity: "info",
      title: `"${top.reason}" is the leading cause of delivery delays`,
      detail: `${top.count} of ${totalDelays} delayed deliveries network-wide cite this reason. Fixing it would meaningfully cut average delivery time.`,
    });
  }

  // 5. Best branch, for a balancing positive signal.
  const branchSummaries = computeBranchSummaries(allLeadsRaw, range);
  const best = [...branchSummaries]
    .filter((b) => b.targetUnits > 0)
    .sort((a, b) => b.attainment - a.attainment)[0];
  if (best && best.attainment >= 1) {
    insights.push({
      id: `best-${best.branchId}`,
      severity: "info",
      title: `${best.name} is leading the network`,
      detail: `Running at ${Math.round(best.attainment * 100)}% of its unit target over the selected period, the strongest attainment across all branches.`,
      branchId: best.branchId,
      href: `/branch/${best.branchId}`,
    });
  }

  const order: Record<InsightSeverity, number> = { critical: 0, warning: 1, info: 2 };
  return insights.sort((a, b) => order[a.severity] - order[b.severity]);
}

function formatMonthShort(month: string): string {
  const [y, m] = month.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString("en-IN", { month: "long" });
}

export { branchById, repById };
