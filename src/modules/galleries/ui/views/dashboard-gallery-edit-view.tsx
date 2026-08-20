"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useTRPC } from "@/trpc/client";
import {
  ArrowLeft,
  Plus,
  Star,
  StarOff,
  Image as ImageIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { useSuspenseQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { GalleryForm } from "../components/gallery-form";
import { DeleteGalleryButton } from "../components/delete-gallery-button";
import { PublishToggle } from "../components/publish-toggle";
import { useModal } from "@/hooks/use-modal";
import { keyToUrl } from "@/modules/s3/lib/key-to-url";
import BlurImage from "@/components/blur-image";

interface DashboardGalleryEditViewProps {
  id: string;
}

export function DashboardGalleryEditView({ id }: DashboardGalleryEditViewProps) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { data } = useSuspenseQuery(
    trpc.galleries.getOne.queryOptions({ id })
  );

  const modal = useModal();
  const [coverPhotoId, setCoverPhotoId] = useState<string | null>(null);

  const updateCoverPhoto = useMutation(
    trpc.galleries.updateCoverPhoto.mutationOptions()
  );

  const handleSetCover = (photoId: string) => {
    updateCoverPhoto.mutate(
      { galleryId: data.id, photoId },
      {
        onSuccess: async () => {
          setCoverPhotoId(photoId);
          await queryClient.invalidateQueries(
            trpc.galleries.getOne.queryOptions({ id })
          );
          await queryClient.invalidateQueries(
            trpc.galleries.getMany.queryOptions()
          );
          await queryClient.invalidateQueries(
            trpc.home.getGalleries.queryOptions({ limit: 12 })
          );
          toast.success("Cover photo updated successfully");
        },
        onError: (error) => {
          toast.error(error.message || "Failed to update cover photo");
        },
      }
    );
  };

  return (
    <div className="min-h-screen pb-8">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6">
          <Link href="/dashboard/galerias">
            <Button variant="ghost" className="mb-4 -ml-4">
              <ArrowLeft className="mr-2 h-4 w-4" /> Back to galleries
            </Button>
          </Link>
          <div className="flex items-start justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">{data.title}</h1>
              <p className="mt-1 text-sm text-muted-foreground">
                /galerias/{data.slug} · {data.photos.length} photos
              </p>
            </div>
            <div className="flex items-center gap-2">
              <PublishToggle
                galleryId={data.id}
                initialValue={data.isPublished}
              />
              <DeleteGalleryButton
                galleryId={data.id}
                galleryTitle={data.title}
              />
              <Button onClick={() => modal.onOpen(data.id)}>
                <Plus className="mr-2 h-4 w-4" /> Add photos
              </Button>
            </div>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <div>
            <GalleryForm
              gallery={{
                id: data.id,
                title: data.title,
                slug: data.slug,
                description: data.description,
                isPublished: data.isPublished,
              }}
            />
          </div>

          <div>
            <div className="rounded-lg border bg-card p-4">
              <div className="mb-2 flex items-center gap-2">
                <ImageIcon className="h-4 w-4" />
                <h2 className="text-sm font-semibold">Photos</h2>
              </div>
              {data.photos.length > 0 ? (
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                  {data.photos.map((photo) => {
                    const isCover = (coverPhotoId ?? data.coverPhotoId) === photo.id;
                    return (
                      <div
                        key={photo.id}
                        className="group relative aspect-[4/3] overflow-hidden rounded-md border"
                      >
                        <BlurImage
                          src={keyToUrl(photo.url)}
                          alt={photo.title}
                          fill
                          sizes="(max-width: 768px) 50vw, 25vw"
                          blurhash={photo.blurData}
                          className="object-cover"
                        />
                        <div className="absolute bottom-1 right-1">
                          <Button
                            type="button"
                            variant="outline"
                            size="icon-sm"
                            className="h-7 w-7 bg-background/80 backdrop-blur-sm"
                            onClick={() => handleSetCover(photo.id)}
                            title="Set as cover"
                          >
                            {isCover ? (
                              <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                            ) : (
                              <StarOff className="h-4 w-4" />
                            )}
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No photos yet. Click &quot;Add photos&quot; to upload your
                  first photo.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export function DashboardGalleryEditLoading() {
  return (
    <div className="container mx-auto px-4 py-8 space-y-6">
      <Skeleton className="h-8 w-64" />
      <div className="grid gap-8 lg:grid-cols-2">
        <Skeleton className="h-96 w-full rounded-lg" />
        <Skeleton className="h-96 w-full rounded-lg" />
      </div>
    </div>
  );
}

export function DashboardGalleryEditError() {
  return (
    <div className="flex flex-col items-center justify-center py-24 text-center">
      <p className="mb-4 text-destructive">Failed to load gallery</p>
      <Link href="/dashboard/galerias">
        <Button variant="outline">
          <ArrowLeft className="mr-2 h-4 w-4" /> Back to galleries
        </Button>
      </Link>
    </div>
  );
}