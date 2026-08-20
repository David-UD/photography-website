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

// Types
export type Photo = InferSelectModel<typeof photos>;
export type Gallery = InferSelectModel<typeof galleries>;
export type GalleryWithPhotos = Gallery & { photos: Photo[] } & {
  coverPhoto: Photo | null;
};