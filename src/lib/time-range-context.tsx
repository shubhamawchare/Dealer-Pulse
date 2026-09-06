"use client";

import { createContext, useContext, useMemo, useState, ReactNode } from "react";
import { allMonths } from "./data";
import { TimeRange } from "./metrics";

interface TimeRangeContextValue {
  range: TimeRange;
  setRange: (range: TimeRange) => void;
  months: string[];
  setPreset: (preset: Preset) => void;
  preset: Preset;
}

export type Preset = "last1" | "last3" | "last6" | "full" | "custom";

const TimeRangeContext = createContext<TimeRangeContextValue | null>(null);

export function TimeRangeProvider({ children }: { children: ReactNode }) {
  const months = useMemo(() => allMonths(), []);
  const [preset, setPresetState] = useState<Preset>("full");
  const [range, setRangeState] = useState<TimeRange>({
    start: months[0],
    end: months[months.length - 1],
  });

  function setPreset(p: Preset) {
    setPresetState(p);
    const end = months[months.length - 1];
    if (p === "full") {
      setRangeState({ start: months[0], end });
    } else if (p === "last1") {
      setRangeState({ start: months[months.length - 1], end });
    } else if (p === "last3") {
      setRangeState({ start: months[Math.max(0, months.length - 3)], end });
    } else if (p === "last6") {
      setRangeState({ start: months[Math.max(0, months.length - 6)], end });
    }
  }

  function setRange(r: TimeRange) {
    setPresetState("custom");
    setRangeState(r);
  }

  return (
    <TimeRangeContext.Provider value={{ range, setRange, months, setPreset, preset }}>
      {children}
    </TimeRangeContext.Provider>
  );
}

export function useTimeRange() {
  const ctx = useContext(TimeRangeContext);
  if (!ctx) throw new Error("useTimeRange must be used within TimeRangeProvider");
  return ctx;
}
