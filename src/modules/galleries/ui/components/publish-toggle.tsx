"use client";

import { toast } from "sonner";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Switch } from "@/components/ui/switch";

interface PublishToggleProps {
  galleryId: string;
  initialValue: boolean;
}

export function PublishToggle({ galleryId, initialValue }: PublishToggleProps) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const updateGallery = useMutation(
    trpc.galleries.update.mutationOptions()
  );

  const handleChange = (checked: boolean) => {
    updateGallery.mutate(
      { id: galleryId, isPublished: checked },
      {
        onSuccess: async () => {
          await queryClient.invalidateQueries(
            trpc.galleries.getMany.queryOptions()
          );
          await queryClient.invalidateQueries(
            trpc.home.getGalleries.queryOptions({ limit: 12 })
          );
          toast.success(checked ? "Gallery published" : "Gallery unpublished");
        },
        onError: (error) => {
          toast.error(error.message || "Failed to update gallery");
        },
      }
    );
  };

  return (
    <Switch checked={initialValue} onCheckedChange={handleChange} />
  );
}