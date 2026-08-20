import { Suspense } from "react";
import { trpc } from "@/trpc/server";
import { getQueryClient } from "@/trpc/server";
import { ErrorBoundary } from "react-error-boundary";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import {
  DashboardGalleriesView,
  DashboardGalleriesLoading,
} from "@/modules/galleries/ui/views/dashboard-galleries-view";

const page = async () => {
  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(trpc.galleries.getMany.queryOptions());

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<DashboardGalleriesLoading />}>
        <ErrorBoundary fallback={<p>Something went wrong</p>}>
          <DashboardGalleriesView />
        </ErrorBoundary>
      </Suspense>
    </HydrationBoundary>
  );
};

export default page;