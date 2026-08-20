"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import GalleryCard from "../components/gallery-card";
import { Skeleton } from "@/components/ui/skeleton";
import { EmptyState } from "@/components/empty-state";
import { ImageOff } from "lucide-react";

export const GalleriesView = () => {
  const trpc = useTRPC();
  const { data } = useSuspenseQuery(
    trpc.galleries.getManyPublished.queryOptions({ limit: 100 })
  );

  if (data.length === 0) {
    return (
      <EmptyState
        icon={<ImageOff className="h-12 w-12" />}
        title="No galleries yet"
        description="There are no published galleries right now."
        height="h-full"
      />
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {data.map((gallery) => (
        <GalleryCard
          key={gallery.id}
          title={gallery.title}
          slug={gallery.slug}
          description={gallery.description}
          coverPhoto={gallery.coverPhoto}
          photoCount={gallery.photoCount}
        />
      ))}
    </div>
  );
};

export const GalleriesLoading = () => {
  return (
    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="rounded-lg border bg-card p-3">
          <Skeleton className="aspect-[3/4] w-full rounded-md" />
          <Skeleton className="mt-3 h-5 w-2/3" />
          <Skeleton className="mt-2 h-4 w-1/3" />
        </div>
      ))}
    </div>
  );
};