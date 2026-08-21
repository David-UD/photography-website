# RESULTADOS.md — Contenido administrable desde el dashboard

## Objetivo implementado

Eliminar el contenido hardcodeado del portafolio (`src/site.config.ts`) y
convertirlo en contenido administrable desde el dashboard:

- Perfil del fotógrafo (nombre, profesión, biografía, tagline, iniciales, avatar)
- Exactamente 4 redes sociales (título, URL, enlace principal)
- Servicios (CRUD) que reemplazan al concepto de Gear
- Imagen de portada (antes `bg.jpg` fija)
- Metadata SEO (title / description)

El diseño visual se mantiene prácticamente igual; solo se consumen datos
dinámicos.

## Modelos modificados / creados

Tablas añadidas en `src/db/schema.ts`:

- `site_profile` — fila única con perfil público
  (`name`, `tagline`, `role`, `bio`, `initials`, `avatar`, `cover_image`).
- `social_links` — exactamente 4 enlaces (`title`, `url`, `primary`, `position`
  con índice único).
- `services` — servicios administrables (`title`, `description`, `position`).

Schemas zod exportados: `siteProfileInsertSchema/Select/Update`,
`socialLinksSelectSchema/Update`, `servicesInsertSchema/Select/Update`.

## Migraciones realizadas

- `bun run db:push` (drizzle-kit push) contra PostgreSQL local. Cambios aplicados.

## Endpoints creados / modificados (router `site`)

En `src/modules/site/server/procedures.ts` (montado en `src/trpc/routers/_app.ts`):

Públicos:
- `site.getProfile` — perfil + 4 redes sociales, con fallback a defaults.
- `site.getServices` — lista de servicios ordenados.

Protegidos (admin):
- `site.updateProfile` — upsert de la fila única de perfil.
- `site.updateSocialLinks` — reemplaza los 4 enlaces (transacción).
- `site.createService` / `site.updateService` / `site.removeService` — CRUD.

Helpers:
- `src/trpc/server.tsx` — nuevo `getServerCaller` para llamadas directas en RSC.
- `src/modules/site/server/site-data.ts` — `getSiteProfile`, `getSiteServices`.
- `src/modules/site/lib/site-defaults.ts` — defaults y fallback.
- `src/modules/site/lib/site-image-url.ts` — URL pública (key → keyToUrl o ruta local).
- `src/modules/site/lib/use-site-profile.ts` — hook cliente con fallback.

## Componentes modificados

Públicos (ahora leen de DB):
- `src/modules/home/ui/components/profile-card.tsx` — nombre, profesión, bio,
  avatar, iniciales y 4 redes.
- `src/modules/home/ui/components/header/logo.tsx` — nombre y tagline.
- `src/modules/home/ui/components/header/mobile-menu.tsx` — avatar/nombre/profesión
  (sin enlace a /servicios).
- `src/components/footer/index.tsx` — avatar, nombre, profesión (créditos intactos;
  sin enlace a /servicios).
- `src/app/layout.tsx` — metadata SEO por código (constante `metadata` en
  `site.config.ts`).
- `src/app/(home)/about/page.tsx` — portada dinámica y **Servicios** (ya no Gear).
- `src/app/(home)/contacto/page.tsx` — portada y enlace principal dinámicos.
- `src/modules/auth/ui/views/sign-in-view.tsx` — portada dinámica.
- `src/components/contact-card.tsx` — icono con fallback y título libre (string).

Administración (nuevo):
- `src/modules/site/ui/components/image-field.tsx` — subida de avatar/portada
  reutilizando `usePhotoUpload` (sistema de almacenamiento existente).
- `src/modules/site/ui/views/dashboard-site-view.tsx` — formulario de perfil.
- `src/modules/site/ui/views/dashboard-social-links-view.tsx` — editor de 4 enlaces.
- `src/modules/site/ui/views/dashboard-services-view.tsx` — lista de servicios.
- `src/modules/site/ui/components/service-form-dialog.tsx` — crear/editar servicio.
- Páginas: `/dashboard/site`, `/dashboard/site/redes`, `/dashboard/site/servicios`.
- Sidebar del dashboard: nuevas entradas Sitio / Redes sociales / Servicios
  (`dashboard-sidebar/index.tsx`, `icon-map.tsx`).

Otros:
- `src/site.config.ts` — eliminado `gear`; `socialLinks` pasa a defaults
  gestionables en runtime.
- Página `/servicios` eliminada (los servicios ya se muestran en `/about`);
  se quitó el enlace de navbar, menú móvil y footer.
- `README.md` — tabla de configuración actualizada (se elimina `gear`).

## Validaciones realizadas

1. `bunx tsc --noEmit` (en contenedor) — sin errores.
2. `bunx eslint src` (en contenedor) — sin errores.
3. `GET /`, `/about`, `/contacto` — 200; `/servicios` — 404 (página eliminada).
   - `/about` ya no muestra gear (SONY/DJI eliminados) y muestra Servicios.
   - Portada usa fallback `url(/bg.jpg)` hasta que se suba una nueva.
   - Sin enlace "Servicios" en navbar, menú móvil ni footer.
4. `/api/trpc/site.getProfile` devuelve los datos por defecto.
5. Rutas admin devuelven 307 a sign-in sin sesión (protegidas correctamente).
6. `db:push` aplicado correctamente (3 tablas nuevas).

## Cómo administra el usuario ahora

1. **Perfil**: `/dashboard/site` — editar nombre, tagline, profesión, bio,
   iniciales y metadata SEO; subir **avatar** y **portada** con el selector de
   imagen (usa el almacenamiento S3/RustFS existente).
2. **Redes sociales**: `/dashboard/site/redes` — exactamente 4 enlaces con
   título, URL y un interruptor para el enlace principal.
3. **Servicios**: `/dashboard/site/servicios` — crear, editar y eliminar
   servicios; se muestran en `/about`.
4. **Portada**: subida desde `/dashboard/site`; la portada pública (About,
   Servicios, Contacto y login) se actualiza automáticamente. Si no hay portada
   se usa `/bg.jpg` como respaldo.

## Limitaciones

- No hay reordenamiento drag-and-drop de servicios; el orden es por posición de
  creación.
- Los iconos de redes se derivan del título conocido (Instagram, GitHub, X,
  Xiaohongshu, Contact me); un título distinto muestra un icono genérico.
- Las imágenes de avatar/portada subidas en local requieren que RustFS esté
  corriendo (configuración CORS y path-style ya resueltas en el stack local).

## Posibles mejoras futuras

- Reordenamiento de servicios (drag & drop) con reescritura de `position`.
- Campo de icono explícito por red social para títulos arbitrarios.
- Seeder que inserte el perfil y los 4 enlaces por defecto en la DB.
- Caché de `getProfile` en el servidor para reducir consultas en cada página.
