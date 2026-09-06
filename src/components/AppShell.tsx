"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { branches } from "@/lib/data";
import { TimeRangeControl } from "./TimeRangeControl";

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  return (
    <div className="min-h-screen lg:flex">
      <aside className="border-b border-line bg-surface lg:w-64 lg:shrink-0 lg:border-b-0 lg:border-r lg:min-h-screen">
        <div className="flex items-center justify-between px-5 py-4 lg:block">
          <Link href="/" className="flex items-baseline gap-2">
            <span className="text-lg font-semibold tracking-tight">DealerPulse</span>
          </Link>
          <p className="hidden text-xs text-ink-muted lg:mt-1 lg:block">
            Toyota network · 5 branches
          </p>
        </div>

        <nav className="flex gap-1 overflow-x-auto border-t border-line px-3 py-2 lg:block lg:overflow-visible lg:border-t-0 lg:px-3 lg:py-4">
          <NavLink href="/" active={pathname === "/"}>
            Overview
          </NavLink>
          <div className="hidden px-2 pb-1 pt-4 text-xs font-medium uppercase tracking-wide text-ink-muted lg:block">
            Branches
          </div>
          {branches.map((b) => (
            <NavLink
              key={b.id}
              href={`/branch/${b.id}`}
              active={pathname === `/branch/${b.id}`}
            >
              {b.name}
            </NavLink>
          ))}
        </nav>

        <div className="hidden border-t border-line px-4 py-4 lg:block">
          <TimeRangeControl />
        </div>
      </aside>

      <div className="border-b border-line bg-surface px-4 py-3 lg:hidden">
        <TimeRangeControl compact />
      </div>

      <main className="flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
        <div className="mx-auto max-w-6xl">{children}</div>
      </main>
    </div>
  );
}

function NavLink({
  href,
  active,
  children,
}: {
  href: string;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className={`block whitespace-nowrap rounded px-3 py-1.5 text-sm transition-colors ${
        active
          ? "bg-accent-soft font-medium text-accent"
          : "text-ink-muted hover:bg-paper hover:text-ink"
      }`}
    >
      {children}
    </Link>
  );
}
