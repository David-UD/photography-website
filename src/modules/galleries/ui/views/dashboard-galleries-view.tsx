"use client";

import { useSuspenseQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Link from "next/link";
import { Plus, Pencil } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { DeleteGalleryButton } from "../components/delete-gallery-button";
import { PublishToggle } from "../components/publish-toggle";

export const DashboardGalleriesView = () => {
  const trpc = useTRPC();
  const { data } = useSuspenseQuery(
    trpc.galleries.getMany.queryOptions()
  );

  return (
    <div className="px-4 md:px-8">
      <div className="flex items-center justify-between py-4">
        <div>
          <h1 className="text-2xl font-bold">Galerías</h1>
          <p className="text-muted-foreground">
            Manage your photo galleries
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/galerias/nueva">
            <Plus className="mr-2 h-4 w-4" /> New gallery
          </Link>
        </Button>
      </div>

      {data.length === 0 ? (
        <div className="rounded-md border border-dashed p-12 text-center">
          <p className="text-muted-foreground">
            No galleries yet. Create your first gallery to start organizing your
            photos.
          </p>
          <Button className="mt-4" asChild>
            <Link href="/dashboard/galerias/nueva">
              <Plus className="mr-2 h-4 w-4" /> New gallery
            </Link>
          </Button>
        </div>
      ) : (
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Gallery</TableHead>
                <TableHead>Slug</TableHead>
                <TableHead>Photos</TableHead>
                <TableHead>Published</TableHead>
                <TableHead className="text-right pr-6">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {data.map((gallery) => (
                <TableRow key={gallery.id}>
                  <TableCell>
                    <Link
                      href={`/dashboard/galerias/${gallery.id}`}
                      className="font-medium hover:underline"
                    >
                      {gallery.title}
                    </Link>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    /galerias/{gallery.slug}
                  </TableCell>
                  <TableCell>{gallery.photoCount}</TableCell>
                  <TableCell>
                    <PublishToggle
                      galleryId={gallery.id}
                      initialValue={gallery.isPublished}
                    />
                  </TableCell>
                  <TableCell className="text-right pr-6">
                    <div className="flex items-center justify-end gap-2">
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/dashboard/galerias/${gallery.id}`}>
                          <Pencil className="h-4 w-4" />
                        </Link>
                      </Button>
                      <DeleteGalleryButton
                        galleryId={gallery.id}
                        galleryTitle={gallery.title}
                      />
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export const DashboardGalleriesLoading = () => {
  return (
    <div className="px-4 md:px-8">
      <div className="flex items-center justify-between py-4">
        <Skeleton className="h-8 w-32" />
        <Skeleton className="h-10 w-32" />
      </div>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Gallery</TableHead>
              <TableHead>Slug</TableHead>
              <TableHead>Photos</TableHead>
              <TableHead>Published</TableHead>
              <TableHead className="text-right pr-6">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {Array.from({ length: 5 }).map((_, i) => (
              <TableRow key={i}>
                <TableCell>
                  <Skeleton className="h-5 w-40" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-32" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-8" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-5 w-10" />
                </TableCell>
                <TableCell className="text-right pr-6">
                  <Skeleton className="h-8 w-16 ml-auto" />
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
};