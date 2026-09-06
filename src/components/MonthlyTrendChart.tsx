"use client";

import {
  ResponsiveContainer,
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { MonthTrendPoint } from "@/lib/metrics";
import { formatMonth } from "@/lib/data";

export function MonthlyTrendChart({ data }: { data: MonthTrendPoint[] }) {
  const chartData = data.map((d) => ({
    ...d,
    label: formatMonth(d.month),
  }));

  return (
    <ResponsiveContainer width="100%" height={280}>
      <ComposedChart data={chartData} margin={{ top: 8, right: 12, bottom: 0, left: -16 }}>
        <CartesianGrid stroke="var(--grid)" vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 12, fill: "var(--ink-muted)" }}
          axisLine={{ stroke: "var(--line)" }}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 12, fill: "var(--ink-muted)" }}
          axisLine={false}
          tickLine={false}
          width={40}
        />
        <Tooltip
          contentStyle={{
            background: "var(--surface)",
            border: "1px solid var(--line)",
            borderRadius: 4,
            fontSize: 12,
          }}
          formatter={(value, name) => [
            String(value),
            name === "bookedUnits" ? "Booked units" : "Target units",
          ]}
        />
        <Bar dataKey="bookedUnits" fill="var(--accent)" barSize={22} radius={[2, 2, 0, 0]} />
        <Line
          dataKey="targetUnits"
          stroke="var(--critical)"
          strokeWidth={2}
          dot={{ r: 3 }}
          strokeDasharray="4 3"
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
