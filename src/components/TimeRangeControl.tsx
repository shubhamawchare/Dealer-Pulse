"use client";

import { useTimeRange, Preset } from "@/lib/time-range-context";
import { formatMonth } from "@/lib/data";

const PRESETS: { key: Preset; label: string }[] = [
  { key: "last1", label: "Last month" },
  { key: "last3", label: "Last 3 months" },
  { key: "last6", label: "Last 6 months" },
  { key: "full", label: "Full period" },
];

export function TimeRangeControl({ compact = false }: { compact?: boolean }) {
  const { range, setRange, months, preset, setPreset } = useTimeRange();

  if (compact) {
    return (
      <div className="flex items-center gap-2 overflow-x-auto">
        <span className="whitespace-nowrap text-xs font-medium text-ink-muted">
          Period
        </span>
        <select
          className="rounded border border-line bg-surface px-2 py-1 text-sm"
          value={preset === "custom" ? "custom" : preset}
          onChange={(e) => setPreset(e.target.value as Preset)}
        >
          {PRESETS.map((p) => (
            <option key={p.key} value={p.key}>
              {p.label}
            </option>
          ))}
        </select>
      </div>
    );
  }

  return (
    <div>
      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-ink-muted">
        Time range
      </p>
      <div className="flex flex-col gap-1">
        {PRESETS.map((p) => (
          <button
            key={p.key}
            onClick={() => setPreset(p.key)}
            className={`rounded px-2 py-1.5 text-left text-sm transition-colors ${
              preset === p.key
                ? "bg-accent-soft font-medium text-accent"
                : "text-ink-muted hover:bg-paper hover:text-ink"
            }`}
          >
            {p.label}
          </button>
        ))}
      </div>

      <div className="mt-3 grid grid-cols-2 gap-2 border-t border-line pt-3">
        <div>
          <label className="mb-1 block text-[11px] text-ink-muted">From</label>
          <select
            className="w-full rounded border border-line bg-surface px-1.5 py-1 text-xs tabular"
            value={range.start}
            onChange={(e) => setRange({ start: e.target.value, end: range.end })}
          >
            {months.map((m) => (
              <option key={m} value={m} disabled={m > range.end}>
                {formatMonth(m)}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-[11px] text-ink-muted">To</label>
          <select
            className="w-full rounded border border-line bg-surface px-1.5 py-1 text-xs tabular"
            value={range.end}
            onChange={(e) => setRange({ start: range.start, end: e.target.value })}
          >
            {months.map((m) => (
              <option key={m} value={m} disabled={m < range.start}>
                {formatMonth(m)}
              </option>
            ))}
          </select>
        </div>
      </div>
    </div>
  );
}
