"use client";

import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

const ChartAreaView = dynamic(
  () =>
    import("@/modules/dashboard/ui/views/chart-area-view").then(
      (mod) => mod.ChartAreaView
    ),
  { ssr: false, loading: () => <Skeleton className="h-[360px] w-full" /> },
);

export function DashboardWidgets() {
  return (
    <>
      <ChartAreaView />
    </>
  );
}