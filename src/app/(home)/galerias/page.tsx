import { Suspense } from "react";
import { trpc } from "@/trpc/server";
import { getQueryClient } from "@/trpc/server";
import { ErrorBoundary } from "react-error-boundary";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";
import {
  GalleriesView,
  GalleriesLoading,
} from "@/modules/galleries/ui/views/galleries-view";

export const metadata = {
  title: "Galerías",
  description: "Galerías de fotografía",
};

const page = async () => {
  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(
    trpc.galleries.getManyPublished.queryOptions({ limit: 100 })
  );

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="min-h-screen pb-16">
        <div className="container mx-auto px-4 py-10">
          <h1 className="text-3xl font-bold tracking-tight">Galerías</h1>
          <p className="mt-1 text-muted-foreground">
            Una colección de fotografías organizadas por proyectos.
          </p>
          <div className="mt-8">
            <Suspense fallback={<GalleriesLoading />}>
              <ErrorBoundary fallback={<p>Something went wrong</p>}>
                <GalleriesView />
              </ErrorBoundary>
            </Suspense>
          </div>
        </div>
      </div>
    </HydrationBoundary>
  );
};

export default page;