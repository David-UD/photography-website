"use client";

import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { useTRPC } from "@/trpc/client";
import { Button } from "@/components/ui/button";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useConfirm } from "@/hooks/use-confirm";

interface DeleteGalleryButtonProps {
  galleryId: string;
  galleryTitle: string;
}

export function DeleteGalleryButton({
  galleryId,
  galleryTitle,
}: DeleteGalleryButtonProps) {
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const [ConfirmDialog, confirm] = useConfirm(
    "Delete Gallery",
    `Are you sure you want to delete "${galleryTitle}"? Its photos will be kept but unlinked from this gallery.`
  );

  const deleteGallery = useMutation(trpc.galleries.remove.mutationOptions());

  const handleDelete = async () => {
    const ok = await confirm();
    if (!ok) return;

    deleteGallery.mutate(
      { id: galleryId },
      {
        onSuccess: async () => {
          await queryClient.invalidateQueries(
            trpc.galleries.getMany.queryOptions()
          );
          toast.success("Gallery deleted successfully");
        },
        onError: (error) => {
          toast.error(error.message || "Failed to delete gallery");
        },
      }
    );
  };

  return (
    <>
      <ConfirmDialog />
      <Button
        variant="ghost"
        size="icon"
        onClick={handleDelete}
        className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
        title="Delete gallery"
      >
        <Trash2 className="size-4" />
      </Button>
    </>
  );
}