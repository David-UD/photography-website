import { Suspense } from "react";
import { trpc } from "@/trpc/server";
import { getQueryClient } from "@/trpc/server";
import { ErrorBoundary } from "react-error-boundary";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import {
  DashboardGalleryEditView,
  DashboardGalleryEditLoading,
  DashboardGalleryEditError,
} from "@/modules/galleries/ui/views/dashboard-gallery-edit-view";

type Props = {
  params: Promise<{ id: string }>;
};

const page = async ({ params }: Props) => {
  const { id } = await params;
  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(trpc.galleries.getOne.queryOptions({ id }));

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<DashboardGalleryEditLoading />}>
        <ErrorBoundary fallback={<DashboardGalleryEditError />}>
          <DashboardGalleryEditView id={id} />
        </ErrorBoundary>
      </Suspense>
    </HydrationBoundary>
  );
};

export default page;