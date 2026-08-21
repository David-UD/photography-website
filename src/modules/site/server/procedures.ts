import { z } from "zod";
import { createTRPCRouter, baseProcedure, protectedProcedure } from "@/trpc/init";
import { eq, sql } from "drizzle-orm";
import {
  siteProfile,
  socialLinks,
  services,
  siteProfileUpdateSchema,
  socialLinksUpdateSchema,
  servicesInsertSchema,
  servicesUpdateSchema,
} from "@/db/schema";
import { TRPCError } from "@trpc/server";
import { logger } from "@/lib/logger";
import {
  PROFILE_ID,
  siteProfileDefaults,
  socialLinkDefaults,
} from "../lib/site-defaults";

export const siteRouter = createTRPCRouter({
  // Public: profile + exactly 4 social links (falls back to site defaults).
  getProfile: baseProcedure.query(async ({ ctx }) => {
    const [profile] = await ctx.db
      .select()
      .from(siteProfile)
      .where(eq(siteProfile.id, PROFILE_ID))
      .limit(1);

    const links = await ctx.db
      .select()
      .from(socialLinks)
      .orderBy(socialLinks.position);

    return {
      ...siteProfileDefaults,
      ...(profile ?? {}),
      socialLinks: links.length ? links : socialLinkDefaults,
    };
  }),

  // Public: ordered services.
  getServices: baseProcedure.query(async ({ ctx }) => {
    return ctx.db.select().from(services).orderBy(services.position);
  }),

  // Admin: upsert the single profile row.
  updateProfile: protectedProcedure
    .input(siteProfileUpdateSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const [existing] = await ctx.db
          .select({ id: siteProfile.id })
          .from(siteProfile)
          .where(eq(siteProfile.id, PROFILE_ID))
          .limit(1);

        if (existing) {
          const [updated] = await ctx.db
            .update(siteProfile)
            .set({ ...input, updatedAt: new Date() })
            .where(eq(siteProfile.id, PROFILE_ID))
            .returning();
          return updated;
        }

        const [created] = await ctx.db
          .insert(siteProfile)
          .values({ id: PROFILE_ID, ...input })
          .returning();
        return created;
      } catch (error) {
        logger.error("Site profile update failed", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update profile",
        });
      }
    }),

  // Admin: replace all 4 social links.
  updateSocialLinks: protectedProcedure
    .input(socialLinksUpdateSchema)
    .mutation(async ({ ctx, input }) => {
      try {
        const result = await ctx.db.transaction(async (tx) => {
          await tx.delete(socialLinks);
          const inserted = await tx
            .insert(socialLinks)
            .values(input.links)
            .returning();
          return inserted;
        });
        return result;
      } catch (error) {
        logger.error("Social links update failed", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update social links",
        });
      }
    }),

  // Admin: create service (position = max + 1).
  createService: protectedProcedure
    .input(servicesInsertSchema.omit({ id: true, createdAt: true, updatedAt: true }))
    .mutation(async ({ ctx, input }) => {
      try {
        const [{ max }] = await ctx.db
          .select({
            max: sql<number>`COALESCE(MAX(${services.position}), 0)::int`,
          })
          .from(services);

        const [created] = await ctx.db
          .insert(services)
          .values({ ...input, position: max + 1 })
          .returning();

        return created;
      } catch (error) {
        logger.error("Service creation failed", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create service",
        });
      }
    }),

  // Admin: update service.
  updateService: protectedProcedure
    .input(servicesUpdateSchema)
    .mutation(async ({ ctx, input }) => {
      const { id, ...values } = input;
      try {
        const [updated] = await ctx.db
          .update(services)
          .set({ ...values, updatedAt: new Date() })
          .where(eq(services.id, id))
          .returning();

        if (!updated) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Service not found" });
        }
        return updated;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        logger.error("Service update failed", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update service",
        });
      }
    }),

  // Admin: delete service.
  removeService: protectedProcedure
    .input(z.object({ id: z.uuid() }))
    .mutation(async ({ ctx, input }) => {
      try {
        const [removed] = await ctx.db
          .delete(services)
          .where(eq(services.id, input.id))
          .returning();

        if (!removed) {
          throw new TRPCError({ code: "NOT_FOUND", message: "Service not found" });
        }
        return removed;
      } catch (error) {
        if (error instanceof TRPCError) throw error;
        logger.error("Service deletion failed", error);
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete service",
        });
      }
    }),
});
