import { z } from "zod";
import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { and, eq, desc, asc, ilike, count, sql } from "drizzle-orm";
import {
  DEFAULT_PAGE,
  DEFAULT_PAGE_SIZE,
  MAX_PAGE_SIZE,
  MIN_PAGE_SIZE,
} from "@/constants";
import {
  photos,
  galleries,
  photosUpdateSchema,
  photosInsertSchema,
} from "@/db/schema";
import { TRPCError } from "@trpc/server";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { s3Client } from "@/modules/s3/lib/server-client";
import { escapeLike } from "@/lib/escape-like";
import { logger } from "@/lib/logger";

export const photosRouter = createTRPCRouter({
  create: protectedProcedure
    .input(photosInsertSchema)
    .mutation(async ({ ctx, input }) => {
      const values = input;

      try {
        const [insertedPhoto] = await ctx.db
          .insert(photos)
          .values(values)
          .returning();

        // If the photo belongs to a gallery, ensure the gallery has a cover.
        // Cover logic: if the gallery has no cover yet, the first uploaded
        // photo becomes the cover; a favorite photo takes precedence.
        if (insertedPhoto.galleryId) {
          const [gallery] = await ctx.db
            .select()
            .from(galleries)
            .where(eq(galleries.id, insertedPhoto.galleryId));

          if (gallery && !gallery.coverPhotoId) {
            await ctx.db
              .update(galleries)
              .set({
                coverPhotoId: insertedPhoto.id,
                updatedAt: new Date(),
              })
              .where(eq(galleries.id, gallery.id));
          }
        }

        return insertedPhoto;
      } catch (error) {
        logger.error("Photo creation failed", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create photo",
        });
      }
    }),
  remove: protectedProcedure
    .input(
      z.object({
        id: z.uuid(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      const { id } = input;

      if (!id) {
        throw new TRPCError({ code: "BAD_REQUEST" });
      }

      try {
        const [photo] = await ctx.db
          .select()
          .from(photos)
          .where(eq(photos.id, id));

        if (!photo) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Photo not found",
          });
        }

        // If this photo is a gallery cover, reassign the cover to another
        // photo in the same gallery (favorite first) or clear it.
        if (photo.galleryId) {
          const [gallery] = await ctx.db
            .select()
            .from(galleries)
            .where(eq(galleries.id, photo.galleryId));

          if (gallery && gallery.coverPhotoId === photo.id) {
            const remaining = await ctx.db
              .select()
              .from(photos)
              .where(
                and(
                  eq(photos.galleryId, gallery.id),
                  sql`${photos.id} != ${photo.id}`,
                ),
              )
              .orderBy(desc(photos.isFavorite), asc(photos.createdAt))
              .limit(1);

            await ctx.db
              .update(galleries)
              .set({
                coverPhotoId: remaining[0]?.id ?? null,
                updatedAt: new Date(),
              })
              .where(eq(galleries.id, gallery.id));
          }
        }

        // delete photo record first, then S3
        await ctx.db.delete(photos).where(eq(photos.id, id));

        // S3 delete after DB — orphan file is acceptable, inconsistent DB is not
        try {
          const command = new DeleteObjectCommand({
            Bucket: process.env.S3_BUCKET_NAME,
            Key: photo.url,
          });
          await s3Client.send(command);
        } catch (error) {
          logger.error("S3 photo deletion failed; orphan file may remain", error, {
            photoId: photo.id,
            key: photo.url,
          });
        }

        return photo;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        logger.error("Photo deletion failed", error, { photoId: id });
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete photo",
        });
      }
    }),
  update: protectedProcedure
    .input(photosUpdateSchema)
    .mutation(async ({ ctx, input }) => {
      const { id } = input;

      if (!id) {
        throw new TRPCError({ code: "BAD_REQUEST" });
      }

      const [updatedPhoto] = await ctx.db
        .update(photos)
        .set({
          ...input,
          updatedAt: new Date(),
        })
        .where(eq(photos.id, id))
        .returning();

      if (!updatedPhoto) {
        throw new TRPCError({ code: "NOT_FOUND" });
      }

      return updatedPhoto;
    }),
  getOne: protectedProcedure
    .input(
      z.object({
        id: z.uuid(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { id } = input;

      const [photo] = await ctx.db
        .select()
        .from(photos)
        .where(eq(photos.id, id));

      return photo;
    }),
  getMany: protectedProcedure
    .input(
      z.object({
        page: z.number().default(DEFAULT_PAGE),
        orderBy: z.enum(["asc", "desc"] as const).default("desc"),
        pageSize: z
          .number()
          .min(MIN_PAGE_SIZE)
          .max(MAX_PAGE_SIZE)
          .default(DEFAULT_PAGE_SIZE),
        search: z.string().nullish(),
      }),
    )
    .query(async ({ ctx, input }) => {
      const { page, pageSize, search, orderBy } = input;

      const where = search
        ? ilike(photos.title, `%${escapeLike(search)}%`)
        : undefined;

      const data = await ctx.db
        .select()
        .from(photos)
        .where(where)
        .orderBy(
          orderBy === "asc" ? asc(photos.createdAt) : desc(photos.createdAt),
        )
        .limit(pageSize)
        .offset((page - 1) * pageSize);

      const [total] = await ctx.db
        .select({
          count: count(),
        })
        .from(photos)
        .where(where);

      const totalPages = Math.ceil(total.count / pageSize);

      return {
        items: data,
        total: total.count,
        totalPages,
      };
    }),
});