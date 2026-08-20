import { z } from "zod";
import {
  createTRPCRouter,
  baseProcedure,
  protectedProcedure,
} from "@/trpc/init";
import { and, eq, inArray, sql } from "drizzle-orm";
import { galleries, photos } from "@/db/schema";
import { galleriesUpdateSchema } from "@/db/schema";
import { TRPCError } from "@trpc/server";
import { logger } from "@/lib/logger";
import { slugify } from "../lib/slugify";

function isUniqueViolation(error: unknown): boolean {
  return (
    typeof error === "object" &&
    error !== null &&
    "code" in error &&
    (error as { code: string }).code === "23505"
  );
}

export const galleriesRouter = createTRPCRouter({
  // Admin: list all galleries with cover + count
  getMany: protectedProcedure.query(async ({ ctx }) => {
    const items = await ctx.db
      .select({
        id: galleries.id,
        title: galleries.title,
        slug: galleries.slug,
        description: galleries.description,
        coverPhotoId: galleries.coverPhotoId,
        isPublished: galleries.isPublished,
        createdAt: galleries.createdAt,
        updatedAt: galleries.updatedAt,
      })
      .from(galleries)
      .orderBy(galleries.updatedAt);

    const coverIds = items
      .map((g) => g.coverPhotoId)
      .filter((id): id is string => Boolean(id));

    const covers = coverIds.length
      ? await ctx.db
          .select({
            id: photos.id,
            url: photos.url,
            title: photos.title,
            blurData: photos.blurData,
          })
          .from(photos)
          .where(inArray(photos.id, coverIds))
      : [];

    const countMap = new Map<unknown, number>();

    if (items.length > 0) {
      const counts = await ctx.db
        .select({ galleryId: photos.galleryId, count: sql<number>`COUNT(*)::int` })
        .from(photos)
        .where(
          inArray(
            photos.galleryId,
            items.map((g) => g.id),
          ),
        )
        .groupBy(photos.galleryId);

      counts.forEach((c) => countMap.set(c.galleryId, c.count));
    }

    return items.map((g) => {
      const cover = covers.find((c) => c.id === g.coverPhotoId) ?? null;
      return {
        ...g,
        coverPhoto: cover,
        photoCount: countMap.get(g.id) ?? 0,
      };
    });
  }),

  // Admin: single gallery with all photos
  getOne: protectedProcedure
    .input(z.object({ id: z.uuid() }))
    .query(async ({ ctx, input }) => {
      const [gallery] = await ctx.db
        .select()
        .from(galleries)
        .where(eq(galleries.id, input.id));

      if (!gallery) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Gallery not found" });
      }

      const galleryPhotos = await ctx.db
        .select()
        .from(photos)
        .where(eq(photos.galleryId, gallery.id))
        .orderBy(photos.createdAt);

      return { ...gallery, photos: galleryPhotos };
    }),

  // Public: list published galleries with cover + count
  getManyPublished: baseProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(100),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { limit } = input;

      const items = await ctx.db
        .select()
        .from(galleries)
        .where(eq(galleries.isPublished, true))
        .orderBy(galleries.updatedAt)
        .limit(limit);

      const coverIds = items
        .map((g) => g.coverPhotoId)
        .filter((id): id is string => Boolean(id));

      const covers = coverIds.length
        ? await ctx.db
            .select({
              id: photos.id,
              url: photos.url,
              title: photos.title,
              blurData: photos.blurData,
            })
            .from(photos)
            .where(
              and(
                inArray(photos.id, coverIds),
                eq(photos.visibility, "public"),
              ),
            )
        : [];

      const countMap = new Map<unknown, number>();

      if (items.length > 0) {
        const counts = await ctx.db
          .select({
            galleryId: photos.galleryId,
            count: sql<number>`COUNT(*)::int`,
          })
          .from(photos)
          .where(
            inArray(
              photos.galleryId,
              items.map((g) => g.id),
            ),
          )
          .groupBy(photos.galleryId);

        counts.forEach((c) => countMap.set(c.galleryId, c.count));
      }

      return items.map((g) => {
        const cover = covers.find((c) => c.id === g.coverPhotoId) ?? null;
        return {
          ...g,
          coverPhoto: cover,
          photoCount: countMap.get(g.id) ?? 0,
        };
      });
    }),

  // Public: single published gallery by slug with public photos
  getBySlug: baseProcedure
    .input(z.object({ slug: z.string() }))
    .query(async ({ ctx, input }) => {
      const [gallery] = await ctx.db
        .select()
        .from(galleries)
        .where(and(eq(galleries.slug, input.slug), eq(galleries.isPublished, true)));

      if (!gallery) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Gallery not found" });
      }

      const galleryPhotos = await ctx.db
        .select()
        .from(photos)
        .where(
          and(
            eq(photos.galleryId, gallery.id),
            eq(photos.visibility, "public"),
          ),
        )
        .orderBy(photos.createdAt);

      const coverPhotoId =
        gallery.coverPhotoId ??
        galleryPhotos.find((p) => p.isFavorite)?.id ??
        galleryPhotos[0]?.id ??
        null;

      return { ...gallery, coverPhotoId, photos: galleryPhotos };
    }),

  // Admin: create gallery
  create: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1, { message: "Title is required" }),
        slug: z.string().optional(),
        description: z.string().optional(),
        isPublished: z.boolean().default(false),
        coverPhotoId: z.uuid().optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const [gallery] = await ctx.db
          .insert(galleries)
          .values({
            title: input.title,
            slug: input.slug ? slugify(input.slug) : slugify(input.title),
            description: input.description,
            isPublished: input.isPublished,
            coverPhotoId: input.coverPhotoId,
          })
          .returning();

        return gallery;
      } catch (error) {
        if (isUniqueViolation(error)) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "A gallery with that slug already exists",
          });
        }
        logger.error("Gallery creation failed", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create gallery",
        });
      }
    }),

  // Admin: update gallery
  update: protectedProcedure
    .input(galleriesUpdateSchema)
    .mutation(async ({ ctx, input }) => {
      const { id } = input;

      try {
        const [gallery] = await ctx.db
          .update(galleries)
          .set({
            ...input,
            slug: input.slug ? slugify(input.slug) : undefined,
            updatedAt: new Date(),
          })
          .where(eq(galleries.id, id))
          .returning();

        if (!gallery) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Gallery not found" });
        }

        return gallery;
      } catch (error) {
        if (isUniqueViolation(error)) {
          throw new TRPCError({
            code: "BAD_REQUEST",
            message: "A gallery with that slug already exists",
          });
        }
        logger.error("Gallery update failed", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update gallery",
        });
      }
    }),

  // Admin: delete gallery (photos are unlinked, never deleted)
  remove: protectedProcedure
    .input(z.object({ id: z.uuid() }))
    .mutation(async ({ ctx, input }) => {
      const [gallery] = await ctx.db
        .select()
        .from(galleries)
        .where(eq(galleries.id, input.id));

      if (!gallery) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Gallery not found" });
      }

      await ctx.db
        .update(photos)
        .set({ galleryId: null, updatedAt: new Date() })
        .where(eq(photos.galleryId, gallery.id));

      await ctx.db.delete(galleries).where(eq(galleries.id, gallery.id));

      return gallery;
    }),

  // Admin: set gallery cover photo
  updateCoverPhoto: protectedProcedure
    .input(z.object({ galleryId: z.uuid(), photoId: z.uuid() }))
    .mutation(async ({ ctx, input }) => {
      const { galleryId, photoId } = input;

      const [photo] = await ctx.db
        .select()
        .from(photos)
        .where(eq(photos.id, photoId));

      if (!photo) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Photo not found" });
      }

      const [gallery] = await ctx.db
        .select()
        .from(galleries)
        .where(eq(galleries.id, galleryId));

      if (!gallery) {
        throw new TRPCError({ code: "NOT_FOUND", message: "Gallery not found" });
      }

      if (photo.galleryId !== gallery.id) {
        throw new TRPCError({
          code: "BAD_REQUEST",
          message: "Photo does not belong to this gallery",
        });
      }

      const [updated] = await ctx.db
        .update(galleries)
        .set({ coverPhotoId: photoId, updatedAt: new Date() })
        .where(eq(galleries.id, galleryId))
        .returning();

      return updated;
    }),
});
