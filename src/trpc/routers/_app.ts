import { createTRPCRouter } from "../init";
import { photosRouter } from "@/modules/photos/server/procedures";
import { s3Router } from "@/modules/s3/server/procedures";
import { homeRouter } from "@/modules/home/server/procedures";
import { dashboardRouter } from "@/modules/dashboard/server/procedures";
import { galleriesRouter } from "@/modules/galleries/server/procedures";

export const appRouter = createTRPCRouter({
  photos: photosRouter,
  s3: s3Router,
  home: homeRouter,
  dashboard: dashboardRouter,
  galleries: galleriesRouter,
});
// export type definition of API
export type AppRouter = typeof appRouter;