import { Suspense } from "react";
import { trpc } from "@/trpc/server";
import { getQueryClient } from "@/trpc/server";
import { ErrorBoundary } from "react-error-boundary";
import { dehydrate, HydrationBoundary } from "@tanstack/react-query";

import ProfileCard from "@/modules/home/ui/components/profile-card";
import Footer from "@/components/footer";

import {
  GalleriesView,
  GalleriesViewLoadingStatus,
} from "@/modules/home/ui/views/galleries-view";
import {
  SliderViewLoadingStatus,
  SliderView,
} from "@/modules/home/ui/views/slider-view";

const page = async () => {
  const queryClient = getQueryClient();
  void queryClient.prefetchQuery(
    trpc.home.getManyLikePhotos.queryOptions({ limit: 10 })
  );
  void queryClient.prefetchQuery(
    trpc.home.getGalleries.queryOptions({ limit: 12 })
  );

  return (
    <HydrationBoundary state={dehydrate(queryClient)}>
      <div className="flex flex-col lg:flex-row min-h-screen w-full">
        {/* LEFT CONTENT - Fixed */}
        <div className="w-full lg:w-1/2 h-[70vh] lg:fixed lg:top-0 lg:left-0 lg:h-screen p-0 lg:p-3 rounded-xl">
          <Suspense fallback={<SliderViewLoadingStatus />}>
            <ErrorBoundary fallback={<p>Something went wrong</p>}>
              <SliderView />
            </ErrorBoundary>
          </Suspense>
        </div>
        {/* Spacer for fixed left content */}
        <div className="hidden lg:block lg:w-1/2" />
        {/* RIGHT CONTENT - Scrollable */}
        <div className="w-full mt-3 lg:mt-0 lg:w-1/2 space-y-3 pb-3">
          {/* PROFILE CARD  */}
          <ProfileCard />

          {/* GALLERIES CARD  */}
          <div className="p-4 lg:p-5 bg-muted rounded-xl">
            <p className="text-sm font-light mb-3">Galerías</p>
            <Suspense fallback={<GalleriesViewLoadingStatus />}>
              <ErrorBoundary fallback={<p>Something went wrong</p>}>
                <GalleriesView />
              </ErrorBoundary>
            </Suspense>
          </div>

          <Footer />
        </div>
      </div>
    </HydrationBoundary>
  );
};

export default page;