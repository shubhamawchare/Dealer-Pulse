import type { Metadata } from "next";
import "./globals.css";
import { TimeRangeProvider } from "@/lib/time-range-context";
import { AppShell } from "@/components/AppShell";

export const metadata: Metadata = {
  title: "DealerPulse",
  description: "Real-time performance dashboard for the dealership network",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        <TimeRangeProvider>
          <AppShell>{children}</AppShell>
        </TimeRangeProvider>
      </body>
    </html>
  );
}
