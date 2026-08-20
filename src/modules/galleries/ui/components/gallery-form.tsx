"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { slugify } from "../../lib/slugify";

const galleryFormSchema = z.object({
  title: z.string().min(1, { message: "Title is required" }),
  slug: z
    .string()
    .optional()
    .refine(
      (v) => !v || /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(v),
      { message: "Invalid slug" }
    ),
  description: z.string().optional(),
  isPublished: z.boolean(),
});

type GalleryFormValues = z.infer<typeof galleryFormSchema>;

interface GalleryFormProps {
  gallery?: {
    id: string;
    title: string;
    slug: string;
    description: string | null;
    isPublished: boolean;
  } | null;
}

export function GalleryForm({ gallery }: GalleryFormProps) {
  const router = useRouter();
  const trpc = useTRPC();
  const queryClient = useQueryClient();

  const createGallery = useMutation(trpc.galleries.create.mutationOptions());
  const updateGallery = useMutation(trpc.galleries.update.mutationOptions());

  const form = useForm<GalleryFormValues>({
    resolver: zodResolver(galleryFormSchema),
    defaultValues: {
      title: gallery?.title ?? "",
      slug: gallery?.slug ?? "",
      description: gallery?.description ?? "",
      isPublished: gallery?.isPublished ?? false,
    },
  });

  const onSubmit = (values: GalleryFormValues) => {
    if (gallery) {
      updateGallery.mutate(
        { id: gallery.id, title: values.title, slug: values.slug || gallery.slug, description: values.description, isPublished: values.isPublished },
        {
          onSuccess: async () => {
            await queryClient.invalidateQueries(
              trpc.galleries.getMany.queryOptions()
            );
            toast.success("Gallery updated successfully");
            router.push(`/dashboard/galerias/${gallery.id}`);
          },
          onError: (error) => {
            toast.error(error.message || "Failed to update gallery");
          },
        }
      );
    } else {
      createGallery.mutate(values, {
        onSuccess: async (data) => {
          await queryClient.invalidateQueries(
            trpc.galleries.getMany.queryOptions()
          );
          toast.success("Gallery created successfully");
          router.push(`/dashboard/galerias/${data.id}`);
        },
        onError: (error) => {
          toast.error(error.message || "Failed to create gallery");
        },
      });
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Title</FormLabel>
              <FormControl>
                <Input
                  {...field}
                  placeholder="e.g. Boda María y Juan"
                  onChange={(e) => {
                    field.onChange(e.target.value);
                    if (!gallery) {
                      form.setValue("slug", slugify(e.target.value));
                    }
                  }}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="slug"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Slug</FormLabel>
              <FormControl>
                <Input {...field} placeholder="boda-maria-y-juan" />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description</FormLabel>
              <FormControl>
                <Textarea
                  {...field}
                  rows={4}
                  className="resize-none"
                  placeholder="A short description of this gallery"
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="isPublished"
          render={({ field }) => (
            <FormItem className="flex items-center justify-between rounded-lg border p-4">
              <FormLabel className="text-base">Published</FormLabel>
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.push("/dashboard/galerias")}
          >
            Cancel
          </Button>
          <Button type="submit">
            {gallery ? "Save changes" : "Create gallery"}
          </Button>
        </div>
      </form>
    </Form>
  );
}