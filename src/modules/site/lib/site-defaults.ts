import { siteConfig } from "@/site.config";

export const PROFILE_ID = "default";

export const siteProfileDefaults = {
  id: PROFILE_ID,
  name: siteConfig.name,
  tagline: siteConfig.tagline,
  role: siteConfig.role,
  bio: siteConfig.bio,
  initials: siteConfig.initials,
  about:
    "With a focus on both candid moments and stunning landscapes, I strive to evoke emotion and tell stories through my work. My photography blends the rawness of everyday life with the artistry of fine art, allowing viewers to connect with each image on a deeper level.\n\nWhether I'm exploring urban environments or venturing into nature, my goal is to highlight the extraordinary in the ordinary. Through my lens, I invite you to join me on this visual journey of discovery and inspiration.",
  avatar: siteConfig.avatar,
  coverImage: null,
} as const;

export const socialLinkDefaults = siteConfig.socialLinks.map((link, index) => ({
  id: `${index}`,
  title: link.title,
  url: link.href,
  primary: link.primary ?? false,
  position: index + 1,
}));
