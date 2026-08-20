import { createTRPCRouter, protectedProcedure } from "@/trpc/init";
import { photos, galleries } from "@/db/schema";
import { sql, and, gte } from "drizzle-orm";
import { z } from "zod";

export const dashboardRouter = createTRPCRouter({
  getPhotosCountByMonth: protectedProcedure
    .input(
      z
        .object({
          years: z.number().min(1).max(10).default(3),
        })
        .optional(),
    )
    .query(async ({ ctx, input }) => {
      const years = input?.years ?? 3;

      // Calculate the start date (years ago from now)
      const startDate = new Date();
      startDate.setFullYear(startDate.getFullYear() - years);

      const result = await ctx.db
        .select({
          month: sql<string>`TO_CHAR(${photos.createdAt}, 'YYYY-MM')`,
          count: sql<number>`COUNT(*)::int`,
        })
        .from(photos)
        .where(sql`${photos.createdAt} >= ${startDate}`)
        .groupBy(sql`TO_CHAR(${photos.createdAt}, 'YYYY-MM')`)
        .orderBy(sql`TO_CHAR(${photos.createdAt}, 'YYYY-MM')`);

      // Fill in missing months with 0 count
      const monthlyData: { month: string; count: number }[] = [];
      const currentDate = new Date(startDate);
      const endDate = new Date();

      while (currentDate <= endDate) {
        const monthKey = currentDate.toISOString().slice(0, 7); // YYYY-MM format
        const existingData = result.find((item) => item.month === monthKey);

        monthlyData.push({
          month: monthKey,
          count: existingData?.count ?? 0,
        });

        currentDate.setMonth(currentDate.getMonth() + 1);
      }

      return monthlyData;
    }),

  getDashboardStats: protectedProcedure.query(async ({ ctx }) => {
    // Get total photo count
    const totalPhotosResult = await ctx.db
      .select({ count: sql<number>`COUNT(*)::int` })
      .from(photos);

    const totalPhotos = totalPhotosResult[0]?.count ?? 0;

    // Get current year photo count
    const currentYear = new Date().getFullYear();
    const yearStart = new Date(currentYear, 0, 1);
    const thisYearPhotosResult = await ctx.db
      .select({ count: sql<number>`COUNT(*)::int` })
      .from(photos)
      .where(gte(photos.createdAt, yearStart));

    const thisYearPhotos = thisYearPhotosResult[0]?.count ?? 0;

    // Get last year photo count
    const lastYearStart = new Date(currentYear - 1, 0, 1);
    const lastYearEnd = new Date(currentYear, 0, 1);
    const lastYearPhotosResult = await ctx.db
      .select({ count: sql<number>`COUNT(*)::int` })
      .from(photos)
      .where(
        and(
          gte(photos.createdAt, lastYearStart),
          sql`${photos.createdAt} < ${lastYearEnd}`,
        ),
      );

    const lastYearPhotos = lastYearPhotosResult[0]?.count ?? 0;

    // Calculate year-over-year percentage change for photos
    const thisYearPercentChange =
      lastYearPhotos === 0
        ? thisYearPhotos > 0
          ? 100
          : 0
        : Math.round(
            ((thisYearPhotos - lastYearPhotos) / lastYearPhotos) * 100,
          );

    // Get total galleries
    const totalGalleriesResult = await ctx.db
      .select({ count: sql<number>`COUNT(*)::int` })
      .from(galleries);

    const totalGalleries = totalGalleriesResult[0]?.count ?? 0;

    // Get last year galleries
    const lastYearGalleriesResult = await ctx.db
      .select({ count: sql<number>`COUNT(*)::int` })
      .from(galleries)
      .where(
        and(
          gte(galleries.createdAt, lastYearStart),
          sql`${galleries.createdAt} < ${lastYearEnd}`,
        ),
      );

    const lastYearGalleries = lastYearGalleriesResult[0]?.count ?? 0;

    // Calculate year-over-year percentage change for galleries
    const galleriesPercentChange =
      lastYearGalleries === 0
        ? totalGalleries > 0
          ? 100
          : 0
        : Math.round(
            ((totalGalleries - lastYearGalleries) / lastYearGalleries) * 100,
          );

    return {
      totalPhotos,
      thisYearPhotos,
      thisYearPercentChange,
      totalGalleries,
      galleriesPercentChange,
    };
  }),
});