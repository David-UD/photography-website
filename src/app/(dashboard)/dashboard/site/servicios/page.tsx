import { Suspense } from "react";
import { trpc } from "@/trpc/server";
import { getQueryClient } from "@/trpc/server";
import { ErrorBoundary } from "react-error-boundary";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import {
  DashboardServicesView,
  DashboardServicesLoading,
} from "@/modules/site/ui/views/dashboard-services-view";

const page = async () => {
  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(trpc.site.getServices.queryOptions());

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<DashboardServicesLoading />}>
        <ErrorBoundary fallback={<p>Something went wrong</p>}>
          <DashboardServicesView />
        </ErrorBoundary>
      </Suspense>
    </HydrationBoundary>
  );
};

export default page;
