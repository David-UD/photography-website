/**
 * ============================================================================
 * SITE CONFIGURATION
 * ============================================================================
 * This is the ONLY file you need to edit to customize the site for your own use.
 * All branding, personal info, social links, and site metadata are defined here.
 *
 * After editing this file, restart the dev server to see changes.
 * ============================================================================
 */

export const siteConfig = {
  /** Site name used in metadata, logo, and branding */
  name: "Sera",

  /** Tagline shown alongside name (e.g. "Photo", "Photography") */
  tagline: "Photo",

  /** Your role/title shown in profile cards and footer */
  role: "Photographer",

  /** Short bio shown on the home page profile card */
  bio: "I'm Sera, a photographer dedicated to capturing authentic moments and telling stories through creative and emotional imagery, wherever my journey takes me.",

  /** Avatar image path (place your avatar in /public/avatar.jpg) */
  avatar: "/avatar.jpg",

  /** Initials used as avatar fallback */
  initials: "EC",

  /** Site metadata for SEO */
  metadata: {
    title: {
      template: "%s - Sera Photography",
      default: "Sera Photography",
    },
    description: "Sera Photography",
  },

  /** Social links shown in profile card and footer.
   * Used as defaults; the live values are managed from the dashboard. */
  socialLinks: [
    {
      title: "Instagram",
      href: "https://instagram.com/ekkooooooooooo0o0",
    },
    {
      title: "GitHub",
      href: "https://github.com/ecarry",
    },
    {
      title: "Xiaohongshu",
      href: "https://www.xiaohongshu.com/user/profile/66c84ba2000000001b01b3f1",
    },
    {
      title: "Contact me",
      href: "mailto:lianshiliang93@gmail.com",
      /** If true, this link gets the primary button style */
      primary: true,
    },
  ] as { title: string; href: string; primary?: boolean }[],

  /** Footer attribution */
  footer: {
    designCredit: {
      name: "Pawel Gola",
      href: "https://templates.gola.io/template/hanssen",
    },
    poweredBy: {
      name: "David Uc",
      href: "https://www.linkedin.com/in/david-uc/",
    },
  },

  /**
   * Image loader configuration.
   * Set to "cloudflare" to use the Cloudflare custom image loader,
   * or "default" to use Next.js built-in image optimization.
   * Use "default" for local development (RustFS/MinIO) since the
   * Cloudflare loader rewrites URLs to /cdn-cgi/image/ which those
   * storage backends do not implement.
   */
  // imageLoader: "cloudflare" as "cloudflare" | "default",
  imageLoader: "default" as "cloudflare" | "default",
} as const;

export type SiteConfig = typeof siteConfig;
