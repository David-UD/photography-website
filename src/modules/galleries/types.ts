import { inferRouterOutputs } from "@trpc/server";
import type { appRouter } from "@/trpc/routers/_app";

export type GalleryGetMany = inferRouterOutputs<typeof appRouter>["galleries"]["getMany"];
export type GalleryGetManyPublished =
  inferRouterOutputs<typeof appRouter>["galleries"]["getManyPublished"];
export type GalleryGetOne = inferRouterOutputs<typeof appRouter>["galleries"]["getOne"];
export type GalleryGetBySlug =
  inferRouterOutputs<typeof appRouter>["galleries"]["getBySlug"];