import { z } from "zod";
import { createTRPCRouter, baseProcedure } from "@/trpc/init";
import { desc, eq, and, inArray, sql } from "drizzle-orm";
import { galleries, photos } from "@/db/schema";
import { TRPCError } from "@trpc/server";

export const homeRouter = createTRPCRouter({
  getManyLikePhotos: baseProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(10).default(10),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { limit } = input;

      const data = await ctx.db
        .select()
        .from(photos)
        .where(
          and(eq(photos.isFavorite, true), eq(photos.visibility, "public")),
        )
        .orderBy(desc(photos.updatedAt))
        .limit(limit);

      return data;
    }),
  // Screensaver: all public favorite photos
  getScreensaverPhotos: baseProcedure.query(async ({ ctx }) => {
    const data = await ctx.db
      .select()
      .from(photos)
      .where(
        and(eq(photos.isFavorite, true), eq(photos.visibility, "public")),
      )
      .orderBy(desc(photos.updatedAt))
      .limit(500);

    return data;
  }),
  // Public published galleries with cover + count (home + /galerias)
  getGalleries: baseProcedure
    .input(
      z.object({
        limit: z.number().min(1).max(100).default(12),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { limit } = input;

      const items = await ctx.db
        .select()
        .from(galleries)
        .where(eq(galleries.isPublished, true))
        .orderBy(desc(galleries.updatedAt))
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
  getPhotoById: baseProcedure
    .input(
      z.object({
        id: z.uuid(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { id } = input;

      const data = await ctx.db.query.photos.findFirst({
        where: and(eq(photos.id, id), eq(photos.visibility, "public")),
      });

      if (!data) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Photo not found",
        });
      }

      return data;
    }),
});
