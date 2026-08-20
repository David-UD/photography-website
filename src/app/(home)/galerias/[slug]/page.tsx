import { Suspense } from "react";
import { trpc } from "@/trpc/server";
import { getQueryClient } from "@/trpc/server";
import { ErrorBoundary } from "react-error-boundary";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import {
  GalleryDetailView,
  GalleryDetailLoading,
  GalleryDetailError,
} from "@/modules/galleries/ui/views/gallery-detail-view";

type Props = {
  params: Promise<{ slug: string }>;
};

const page = async ({ params }: Props) => {
  const { slug } = await params;
  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(
    trpc.galleries.getBySlug.queryOptions({ slug })
  );

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <Suspense fallback={<GalleryDetailLoading />}>
        <ErrorBoundary fallback={<GalleryDetailError />}>
          <GalleryDetailView slug={slug} />
        </ErrorBoundary>
      </Suspense>
    </HydrationBoundary>
  );
};

export default page;