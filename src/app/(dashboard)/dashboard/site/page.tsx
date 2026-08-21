import { Suspense } from "react";
import { trpc } from "@/trpc/server";
import { getQueryClient } from "@/trpc/server";
import { ErrorBoundary } from "react-error-boundary";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import { DashboardSiteView } from "@/modules/site/ui/views/dashboard-site-view";
import { Skeleton } from "@/components/ui/skeleton";

const page = async () => {
  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(trpc.site.getProfile.queryOptions());

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<Skeleton className="h-40 w-full" />}>
        <ErrorBoundary fallback={<p>Something went wrong</p>}>
          <DashboardSiteView />
        </ErrorBoundary>
      </Suspense>
    </HydrationBoundary>
  );
};

export default page;
