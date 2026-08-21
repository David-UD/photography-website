import { InferSelectModel, relations } from "drizzle-orm";
import {
  boolean,
  timestamp,
  pgTable,
  text,
  real,
  uuid,
  uniqueIndex,
  index,
  pgEnum,
  integer,
} from "drizzle-orm/pg-core";
import {
  createInsertSchema,
  createSelectSchema,
  createUpdateSchema,
} from "drizzle-zod";
import { z } from "zod";

// ⌚️ Reusable timestamps - Define once, use everywhere!
export const timestamps = {
  createdAt: timestamp("created_at").notNull().defaultNow(),
  updatedAt: timestamp("updated_at").notNull().defaultNow(),
};

/***************
 ****************
 *  User Table  *
 ****************
 ***************/

export const user = pgTable("user", {
  id: text("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email").notNull().unique(),
  emailVerified: boolean("email_verified").notNull(),
  image: text("image"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at"),
  updatedAt: timestamp("updated_at"),
});

/***************
 ****************
 *  Photo Table *
 ****************
 ***************/

export const photoVisibility = pgEnum("photo_visibility", [
  "public",
  "private",
]);

export const photos = pgTable(
  "photos",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    url: text("url").notNull(),
    title: text("title").notNull(),
    description: text("description").notNull(),
    isFavorite: boolean("is_favorite").default(false).notNull(),
    visibility: photoVisibility("visibility").default("private").notNull(),
    aspectRatio: real("aspect_ratio").notNull(),
    width: real("width").notNull(),
    height: real("height").notNull(),
    blurData: text("blur_data").notNull(),

    galleryId: uuid("gallery_id"),

    ...timestamps,
  },
  (t) => [index("gallery_idx").on(t.galleryId)],
);

export const photosRelations = relations(photos, ({ one }) => ({
  gallery: one(galleries, {
    fields: [photos.galleryId],
    references: [galleries.id],
  }),
}));

/***************
 ****************
 *  Gallery Table *
 ****************
 ***************/

export const galleries = pgTable(
  "galleries",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    title: text("title").notNull(),
    slug: text("slug").notNull().unique(),
    description: text("description"),
    coverPhotoId: uuid("cover_photo_id"),
    isPublished: boolean("is_published").default(false).notNull(),

    ...timestamps,
  },
  (t) => [uniqueIndex("unique_gallery_slug").on(t.slug)],
);

export const galleriesRelations = relations(galleries, ({ one, many }) => ({
  coverPhoto: one(photos, {
    fields: [galleries.coverPhotoId],
    references: [photos.id],
  }),
  photos: many(photos),
}));

// Photo schemas
export const photosInsertSchema = createInsertSchema(photos).extend({
  title: z.string().min(1, { message: "Title is required" }),
  description: z.string().min(1, { message: "Description is required" }),
  galleryId: z.string().uuid({ message: "Gallery is required" }),
  visibility: z.enum(["public", "private"]).default("public"),
});
export const photosSelectSchema = createSelectSchema(photos);
export const photosUpdateSchema = createUpdateSchema(photos)
  .pick({
    id: true,
    title: true,
    description: true,
    isFavorite: true,
    visibility: true,
    galleryId: true,
  })
  .partial();

// Gallery schemas
export const galleriesInsertSchema = z.object({
  title: z.string().min(1, { message: "Title is required" }),
  slug: z
    .string()
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
      message: "Slug must contain only lowercase letters, numbers and hyphens",
    })
    .optional(),
  description: z.string().optional(),
  coverPhotoId: z.string().uuid().optional(),
  isPublished: z.boolean().optional(),
});
export const galleriesSelectSchema = createSelectSchema(galleries);
export const galleriesUpdateSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1, { message: "Title is required" }).optional(),
  slug: z.string().optional(),
  description: z.string().nullable().optional(),
  isPublished: z.boolean().optional(),
});

/***************
 ****************
 *  Site Content *
 ****************
 ***************/

// Single-row table holding the photographer's public profile and site metadata.
export const siteProfile = pgTable("site_profile", {
  id: text("id").primaryKey().default("default"),
  name: text("name").notNull().default(""),
  tagline: text("tagline").notNull().default(""),
  role: text("role").notNull().default(""),
  bio: text("bio").notNull().default(""),
  initials: text("initials").notNull().default(""),
  // Long-form "About" text shown on the public About page. Admin-manageable.
  about: text("about")
    .notNull()
    .default(
      "With a focus on both candid moments and stunning landscapes, I strive to evoke emotion and tell stories through my work. My photography blends the rawness of everyday life with the artistry of fine art, allowing viewers to connect with each image on a deeper level.\n\nWhether I'm exploring urban environments or venturing into nature, my goal is to highlight the extraordinary in the ordinary. Through my lens, I invite you to join me on this visual journey of discovery and inspiration."
    ),
  // Storage keys (or local paths like "/avatar.jpg"). Use keyToUrl to build the public URL.
  avatar: text("avatar"),
  coverImage: text("cover_image"),
  ...timestamps,
});

export const siteProfileInsertSchema = createInsertSchema(siteProfile)
  .omit({ id: true, createdAt: true, updatedAt: true })
  .partial();
export const siteProfileSelectSchema = createSelectSchema(siteProfile);
export const siteProfileUpdateSchema = createUpdateSchema(siteProfile)
  .omit({ id: true, createdAt: true, updatedAt: true })
  .partial()
  .extend({
    avatar: z.string().nullable().optional(),
    coverImage: z.string().nullable().optional(),
  });

// Exactly four configurable social links (position 1-4).
export const socialLinks = pgTable(
  "social_links",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    title: text("title").notNull(),
    url: text("url").notNull(),
    primary: boolean("primary").default(false).notNull(),
    position: integer("position").notNull(),
    ...timestamps,
  },
  (t) => [uniqueIndex("unique_social_link_position").on(t.position)],
);

export const socialLinksSelectSchema = createSelectSchema(socialLinks);
export const socialLinksUpdateSchema = z.object({
  links: z
    .array(
      z.object({
        title: z.string().min(1, { message: "Title is required" }),
        url: z.string().min(1, { message: "URL is required" }),
        primary: z.boolean().default(false),
        position: z.number().int().min(1).max(4),
      }),
    )
    .length(4, { message: "Exactly 4 social links are required" }),
});

// Admin-manageable services (replace the old hardcoded gear list).
export const services = pgTable(
  "services",
  {
    id: uuid("id").primaryKey().defaultRandom(),
    title: text("title").notNull(),
    description: text("description").notNull(),
    position: integer("position").notNull().default(0),
    ...timestamps,
  },
  (t) => [index("services_position_idx").on(t.position)],
);

export const servicesInsertSchema = createInsertSchema(services).extend({
  title: z.string().min(1, { message: "Title is required" }),
  description: z.string().min(1, { message: "Description is required" }),
});
export const servicesSelectSchema = createSelectSchema(services);
export const servicesUpdateSchema = createUpdateSchema(services)
  .pick({
    id: true,
    title: true,
    description: true,
    position: true,
  })
  .extend({
    id: z.string().uuid(),
  });

// Types
export type Photo = InferSelectModel<typeof photos>;
export type Gallery = InferSelectModel<typeof galleries>;
export type GalleryWithPhotos = Gallery & { photos: Photo[] } & {
  coverPhoto: Photo | null;
};
export type SiteProfile = InferSelectModel<typeof siteProfile>;
export type SocialLink = InferSelectModel<typeof socialLinks>;
export type Service = InferSelectModel<typeof services>;