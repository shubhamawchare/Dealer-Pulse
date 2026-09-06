"use client";

import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";

const SOURCE_LABELS: Record<string, string> = {
  walk_in: "Walk-in",
  website: "Website",
  referral: "Referral",
  social_media: "Social media",
  phone_enquiry: "Phone enquiry",
  auto_expo: "Auto expo",
};

export function SourceBreakdownChart({ leads }: { leads: { source: string }[] }) {
  const counts = new Map<string, number>();
  leads.forEach((l) => counts.set(l.source, (counts.get(l.source) ?? 0) + 1));
  const data = Array.from(counts.entries())
    .map(([source, count]) => ({ source: SOURCE_LABELS[source] ?? source, count }))
    .sort((a, b) => b.count - a.count);

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} layout="vertical" margin={{ left: 8, right: 16, top: 4, bottom: 4 }}>
        <CartesianGrid stroke="var(--grid)" horizontal={false} />
        <XAxis type="number" tick={{ fontSize: 11, fill: "var(--ink-muted)" }} axisLine={false} tickLine={false} />
        <YAxis
          type="category"
          dataKey="source"
          width={100}
          tick={{ fontSize: 12, fill: "var(--ink)" }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          contentStyle={{
            background: "var(--surface)",
            border: "1px solid var(--line)",
            borderRadius: 4,
            fontSize: 12,
          }}
        />
        <Bar dataKey="count" fill="var(--info)" radius={[0, 2, 2, 0]} barSize={16} />
      </BarChart>
    </ResponsiveContainer>
  );
}
