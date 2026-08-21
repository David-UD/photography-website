import { keyToUrl } from "@/modules/s3/lib/key-to-url";

/**
 * Build a public image URL from a stored value.
 * - null/undefined -> fallback (e.g. local "/avatar.jpg", "/bg.jpg")
 * - local path (starts with "/") -> returned as-is
 * - S3/R2 key -> resolved via keyToUrl
 */
export const siteImageUrl = (
  value: string | null | undefined,
  fallback: string,
) => {
  if (!value) return fallback;
  return value.startsWith("/") ? value : keyToUrl(value);
};
