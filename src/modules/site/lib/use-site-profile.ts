"use client";

import { useQuery } from "@tanstack/react-query";
import { useTRPC } from "@/trpc/client";
import { siteProfileDefaults, socialLinkDefaults } from "./site-defaults";

export function useSiteProfile() {
  const trpc = useTRPC();
  const { data } = useQuery(trpc.site.getProfile.queryOptions());
  return data ?? { ...siteProfileDefaults, socialLinks: socialLinkDefaults };
}
