"use client";

import { useState } from "react";
import { useSuspenseQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ArrowLeft, X } from "lucide-react";
import Link from "next/link";
import { FramedPhoto } from "@/components/framed-photo";
import { ResponsiveModal } from "@/components/responsive-modal";
import { keyToUrl } from "@/modules/s3/lib/key-to-url";
import BlurImage from "@/components/blur-image";

interface GalleryDetailViewProps {
  slug: string;
}

export function GalleryDetailView({ slug }: GalleryDetailViewProps) {
  const trpc = useTRPC();
  const { data } = useSuspenseQuery(
    trpc.galleries.getBySlug.queryOptions({ slug })
  );

  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);

  const selectedPhoto =
    selectedIndex !== null ? data.photos[selectedIndex] : null;

  const goPrev = () => {
    setSelectedIndex((i) =>
      i === null ? i : (i - 1 + data.photos.length) % data.photos.length
    );
  };

  const goNext = () => {
    setSelectedIndex((i) =>
      i === null ? i : (i + 1) % data.photos.length
    );
  };

  return (
    <div className="min-h-screen pb-16">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Link href="/galerias">
            <Button variant="ghost" className="mb-4 -ml-4">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to galleries
            </Button>
          </Link>
          <h1 className="text-3xl font-bold tracking-tight">{data.title}</h1>
          {data.description && (
            <p className="mt-2 max-w-2xl text-muted-foreground">
              {data.description}
            </p>
          )}
          <p className="mt-2 text-sm text-muted-foreground">
            {data.photos.length}{" "}
            {data.photos.length === 1 ? "photo" : "photos"}
          </p>
        </div>

        {data.photos.length > 0 ? (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {data.photos.map((photo, index) => (
              <button
                key={photo.id}
                type="button"
                className="group relative aspect-[4/3] overflow-hidden rounded-lg border bg-card"
                onClick={() => setSelectedIndex(index)}
              >
                <BlurImage
                  src={keyToUrl(photo.url)}
                  alt={photo.title}
                  fill
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  blurhash={photo.blurData}
                  className="object-cover transition-transform duration-500 ease-out group-hover:scale-105"
                />
                <span className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent p-3 text-left text-sm text-white opacity-0 transition-opacity group-hover:opacity-100">
                  {photo.title}
                </span>
              </button>
            ))}
          </div>
        ) : (
          <p className="text-muted-foreground">
            This gallery has no photos yet.
          </p>
        )}
      </div>

      <ResponsiveModal
        open={selectedIndex !== null}
        onOpenChange={(open) => {
          if (!open) setSelectedIndex(null);
        }}
        title={selectedPhoto?.title ?? "Photo"}
        className="sm:max-w-4xl"
      >
        {selectedPhoto && (
          <div className="flex flex-col items-center gap-4">
            <div className="flex items-center justify-center">
              <FramedPhoto
                src={selectedPhoto.url}
                alt={selectedPhoto.title}
                blurhash={selectedPhoto.blurData}
                width={selectedPhoto.width}
                height={selectedPhoto.height}
              />
            </div>
            {data.photos.length > 1 && (
              <div className="flex items-center gap-4">
                <Button variant="outline" size="sm" onClick={goPrev}>
                  Previous
                </Button>
                <span className="text-sm text-muted-foreground">
                  {selectedIndex! + 1} / {data.photos.length}
                </span>
                <Button variant="outline" size="sm" onClick={goNext}>
                  Next
                </Button>
              </div>
            )}
            <Button variant="ghost" size="sm" onClick={() => setSelectedIndex(null)}>
              <X className="mr-1 h-4 w-4" /> Close
            </Button>
          </div>
        )}
      </ResponsiveModal>
    </div>
  );
}

export function GalleryDetailLoading() {
  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <Skeleton className="h-8 w-48" />
      <Skeleton className="h-4 w-72" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="aspect-[4/3] w-full rounded-lg" />
        ))}
      </div>
    </div>
  );
}

export function GalleryDetailError() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <p className="mb-4 text-destructive">Failed to load gallery</p>
      <Link href="/galerias">
        <Button variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to galleries
        </Button>
      </Link>
    </div>
  );
}