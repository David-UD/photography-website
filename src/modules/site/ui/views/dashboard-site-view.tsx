"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { useTRPC } from "@/trpc/client";
import { useMutation, useQueryClient, useSuspenseQuery } from "@tanstack/react-query";
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
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ImageField } from "../components/image-field";

const profileFormSchema = z.object({
  name: z.string().min(1, { message: "Name is required" }),
  tagline: z.string().min(1, { message: "Tagline is required" }),
  role: z.string().min(1, { message: "Role is required" }),
  bio: z.string().min(1, { message: "Bio is required" }),
  about: z.string().min(1, { message: "About is required" }),
  initials: z.string().min(1, { message: "Initials are required" }),
});

type ProfileFormValues = z.infer<typeof profileFormSchema>;

export function DashboardSiteView() {
  const trpc = useTRPC();
  const queryClient = useQueryClient();
  const { data: profile } = useSuspenseQuery(
    trpc.site.getProfile.queryOptions()
  );

  const updateProfile = useMutation(trpc.site.updateProfile.mutationOptions());

  const form = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      name: profile.name,
      tagline: profile.tagline,
      role: profile.role,
      bio: profile.bio,
      about: profile.about,
      initials: profile.initials,
    },
  });

  const avatarKey =
    profile.avatar && !profile.avatar.startsWith("/") ? profile.avatar : null;
  const coverKey =
    profile.coverImage && !profile.coverImage.startsWith("/")
      ? profile.coverImage
      : null;

  const [avatar, setAvatar] = useState<string | null>(avatarKey);
  const [coverImage, setCoverImage] = useState<string | null>(coverKey);

  const onSubmit = (values: ProfileFormValues) => {
    updateProfile.mutate(
      { ...values, avatar, coverImage },
      {
        onSuccess: async () => {
          await queryClient.invalidateQueries(
            trpc.site.getProfile.queryOptions()
          );
          toast.success("Profile updated successfully");
        },
        onError: (error) => {
          toast.error(error.message || "Failed to update profile");
        },
      }
    );
  };

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-2xl font-bold">Sitio</h1>
        <p className="text-sm text-muted-foreground">
          Administra el perfil público del sitio, tu avatar y la portada.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Perfil</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nombre</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Sera" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="tagline"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tagline</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Photo" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="role"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Profesión</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Photographer" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="initials"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Iniciales (fallback del avatar)</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="EC" maxLength={3} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <FormField
                control={form.control}
                name="bio"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Biografía</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        rows={4}
                        className="resize-none"
                        placeholder="Sobre el fotógrafo..."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="about"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Texto "About" (página pública)</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        rows={8}
                        className="resize-none"
                        placeholder="With a focus on..."
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <div className="grid gap-6 md:grid-cols-2">
                <ImageField
                  label="Avatar"
                  value={avatar}
                  fallback="/avatar.jpg"
                  folder="profile"
                  onChange={setAvatar}
                />
                <ImageField
                  label="Imagen de portada"
                  value={coverImage}
                  fallback="/bg.jpg"
                  folder="cover"
                  onChange={setCoverImage}
                />
              </div>

              <div className="flex justify-end">
                <Button type="submit" disabled={updateProfile.isPending}>
                  {updateProfile.isPending ? "Guardando..." : "Guardar cambios"}
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
