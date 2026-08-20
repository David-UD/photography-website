"use client";

import { FramedPhoto } from "@/components/framed-photo";
import { photosUpdateSchema } from "@/db/schema";
import { useTRPC } from "@/trpc/client";
import { useMutation, useSuspenseQuery } from "@tanstack/react-query";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
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

interface PhotoIdViewProps {
  id: string;
}

const formSchema = photosUpdateSchema;

export const PhotoIdView = ({ id }: PhotoIdViewProps) => {
  const trpc = useTRPC();
  const { data } = useSuspenseQuery(
    trpc.photos.getOne.queryOptions({
      id,
    })
  );
  const { data: galleries } = useSuspenseQuery(
    trpc.galleries.getMany.queryOptions()
  );

  const updateMutation = useMutation(
    trpc.photos.update.mutationOptions({
      onSuccess: () => {},
      onError: () => {},
    })
  );

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      id: data.id,
      title: data.title ?? "",
      description: data.description ?? "",
      visibility: data.visibility ?? "private",
      isFavorite: data.isFavorite ?? false,
      galleryId: data.galleryId ?? null,
    },
  });

  const isSubmitting = updateMutation.isPending;

  function onSubmit(values: z.infer<typeof formSchema>) {
    updateMutation.mutate({ ...values, id: data.id });
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-6 flex items-baseline justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">
              {data.title || "Untitled photo"}
            </h1>
          </div>
        </div>

        <div className="grid gap-8 lg:grid-cols-[minmax(0,2fr)_minmax(0,1.6fr)] items-start">
          {/* Form on the left */}
          <div className="bg-card border rounded-xl p-6 shadow-sm w-full">
            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-6"
              >
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Title</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Photo title" />
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
                          rows={5}
                          className="resize-none"
                          placeholder="Photo description"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid gap-4 md:grid-cols-2">
                  <FormField
                    control={form.control}
                    name="visibility"
                    render={({ field }) => (
                      <FormItem className="flex flex-col justify-between gap-2">
                        <div className="flex items-center justify-between gap-4">
                          <FormLabel>Visibility</FormLabel>
                          <div className="flex items-center gap-2 text-sm text-muted-foreground">
                            <span>
                              {field.value === "public" ? "Public" : "Private"}
                            </span>
                            <FormControl>
                              <Switch
                                checked={field.value === "public"}
                                onCheckedChange={(checked) =>
                                  field.onChange(checked ? "public" : "private")
                                }
                              />
                            </FormControl>
                          </div>
                        </div>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="isFavorite"
                    render={({ field }) => (
                      <FormItem className="flex items-center justify-between gap-4">
                        <FormLabel>Favorite</FormLabel>
                        <FormControl>
                          <Switch
                            checked={field.value ?? false}
                            onCheckedChange={field.onChange}
                          />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="galleryId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Gallery</FormLabel>
                      <FormControl>
                        <select
                          {...field}
                          value={field.value ?? ""}
                          className="w-full p-2 border rounded-md bg-background"
                        >
                          <option value="">No gallery</option>
                          {galleries.map((g) => (
                            <option key={g.id} value={g.id}>
                              {g.title}
                            </option>
                          ))}
                        </select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end pt-2">
                  <Button type="submit" disabled={isSubmitting}>
                    {isSubmitting ? "Saving..." : "Save changes"}
                  </Button>
                </div>
              </form>
            </Form>
          </div>

          {/* Photo on the right */}
          <div className="space-y-4">
            <div className="flex items-center justify-center bg-gray-50 dark:bg-muted rounded-xl p-6">
              <FramedPhoto
                src={data.url}
                alt={data.title}
                blurhash={data.blurData}
                width={data.width}
                height={data.height}
                className="max-h-[50vh]"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};