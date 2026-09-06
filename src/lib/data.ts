import raw from "@/data/dealership_data.json";
import { Dataset, Branch, SalesRep, Lead, Target, Delivery } from "./types";

const dataset = raw as unknown as Dataset;

export const branches: Branch[] = dataset.branches;
export const salesReps: SalesRep[] = dataset.sales_reps;
export const leads: Lead[] = dataset.leads;
export const targets: Target[] = dataset.targets;
export const deliveries: Delivery[] = dataset.deliveries;

export const branchById = new Map(branches.map((b) => [b.id, b]));
export const repById = new Map(salesReps.map((r) => [r.id, r]));
export const leadById = new Map(leads.map((l) => [l.id, l]));
export const deliveryByLeadId = new Map(deliveries.map((d) => [d.lead_id, d]));

/**
 * The dataset runs June 2025 - December 2025. Real deployments compute
 * "days remaining in month" and "pace vs target" against the wall clock.
 * Since this data is fixed in the past, we anchor "now" a few days before
 * the end of the last month in the data so pace-based insights (the kind
 * a branch manager would see mid-month) are demonstrable rather than
 * every month reading as already closed out.
 */
export const DATA_AS_OF = new Date("2025-12-20T00:00:00Z");

export function allMonths(): string[] {
  const months = new Set(targets.map((t) => t.month));
  return Array.from(months).sort();
}

export function repsForBranch(branchId: string): SalesRep[] {
  return salesReps.filter((r) => r.branch_id === branchId);
}

export function leadsForBranch(branchId: string): Lead[] {
  return leads.filter((l) => l.branch_id === branchId);
}

export function leadsForRep(repId: string): Lead[] {
  return leads.filter((l) => l.assigned_to === repId);
}

export function monthKey(iso: string): string {
  return iso.slice(0, 7);
}

export function daysInMonth(monthKey: string): number {
  const [y, m] = monthKey.split("-").map(Number);
  return new Date(y, m, 0).getDate();
}

export function formatMonth(monthKey: string): string {
  const [y, m] = monthKey.split("-").map(Number);
  return new Date(y, m - 1, 1).toLocaleDateString("en-IN", {
    month: "short",
    year: "numeric",
  });
}

export function formatINR(value: number): string {
  if (value >= 10000000) return `₹${(value / 10000000).toFixed(2)} Cr`;
  if (value >= 100000) return `₹${(value / 100000).toFixed(1)} L`;
  return `₹${value.toLocaleString("en-IN")}`;
}

export function daysBetween(a: Date, b: Date): number {
  return Math.floor((a.getTime() - b.getTime()) / (1000 * 60 * 60 * 24));
}
