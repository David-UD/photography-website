import "server-only";
import { getServerCaller } from "@/trpc/server";

export const getSiteProfile = async () => {
  const caller = await getServerCaller();
  return caller.site.getProfile();
};

export const getSiteServices = async () => {
  const caller = await getServerCaller();
  return caller.site.getServices();
};
