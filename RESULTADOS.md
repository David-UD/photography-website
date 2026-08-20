# RESULTADOS — Refactorización a Portafolio Fotográfico

Fecha: 2026-08-20
Base: `PROMPT.md` / `PLAN.md`

---

## Resumen

Se transformó el proyecto de una plataforma multi-funcional (blog, travel, discover,
ciudades, mapas) a un **portafolio fotográfico individual** centrado en
`PORTAFOLIO → GALERÍAS → FOTOGRAFÍAS`.

Se eliminaron Blog, Travel, Discover, Mapbox, Cities y EXIF, y se creó la entidad
`Gallery` como principal organizadora de fotografías. El entorno Docker de desarrollo
local ahora usa `next dev` con Fast Refresh (sin `next build` al arrancar).

---

## 1. Archivos eliminados

### Rutas de app (`src/app`)
- `(home)/blog/` y `(home)/blog/[slug]/`
- `(home)/travel/` y `(home)/travel/[city]/`
- `(home)/discover/`
- `(dashboard)/dashboard/posts/` (+ `new/`, `[slug]/`)
- `(dashboard)/dashboard/cities/` (+ `[city]/`)

### Módulos (`src/modules`)
- `blog/` (types, server, ui)
- `posts/` (params, schemas, types, hooks, lib, server, ui, tests)
- `travel/` (types, server, ui)
- `discover/` (clustering, hooks, server, ui)
- `mapbox/` (hooks, ui)
- `cities/` (types, server, ui)

### Editor / componentes de Blog
- `src/components/editor/` completo (Tiptap editor, toolbars, extensiones, rich-text-viewer)

### Componentes de photos EXIF/mapa
- `photos/ui/components/aperture-selector.tsx`
- `photos/ui/components/shutter-speed-selector.tsx`
- `photos/ui/components/iso-selector.tsx`
- `photos/ui/components/exposure-compensation-selector.tsx`
- `photos/ui/components/photo-form.tsx` (legacy, con mapa/EXIF)
- `photos/ui/components/photo-upload-modal.tsx`
- `photos/ui/components/multi-step-form/steps/third-step.tsx` (mapa/geocodificación)

### Home (travel/cities)
- `home/ui/views/cities-view.tsx`
- `home/ui/components/city-card.tsx`
- `home/ui/components/latest-travel-card.tsx`

### Dashboard
- `dashboard/ui/views/map-view.tsx`

### Scripts
- `scripts/seed-demo-post.ts`

---

## 2. Archivos modificados

- `.env` / `.env.example` — eliminada `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN`
- `Dockerfile` — separación clara dev (next dev) vs producción (next build + standalone)
- `docker-compose.standalone.yml` — dev mode con `next dev`, volúmenes node_modules/.next, servicio migrate separado
- `package.json` — eliminadas deps y script `seed:demo-post`
- `src/app/(home)/page.tsx` — home con Galerías (reemplaza LatestTravel + Cities)
- `src/app/(photograph)/screensaver/page.tsx` — usa `home.getScreensaverPhotos`
- `src/components/footer/index.tsx` — nav: Galerías/Sobre mí/Servicios/Contacto
- `src/db/schema.ts` — nueva tabla `galleries`, `photos.galleryId`, eliminación de Blog/City/EXIF
- `src/hooks/use-modal.ts` — soporta `galleryId` para crear fotos en una galería
- `src/lib/utils.ts` — eliminadas utilidades tiptap/GPS
- `src/modules/dashboard/server/procedures.ts` — stats con galerías, sin mapas/cities
- `src/modules/dashboard/ui/components/dashboard-sidebar/index.tsx` — nav Galerías/Fotografías/Perfil
- `src/modules/dashboard/ui/components/dashboard-sidebar/icon-map.tsx`
- `src/modules/dashboard/ui/components/dashboard-widgets.tsx` — sin mapa
- `src/modules/dashboard/ui/views/section-cards-view.tsx` — tarjeta Galerías
- `src/modules/home/server/procedures.ts` — `getGalleries`, `getScreensaverPhotos`
- `src/modules/home/ui/components/header/navbar.tsx` y `mobile-menu.tsx`
- `src/modules/photograph/ui/views/photograph-view.tsx` y `screensaver-view.tsx`
- `src/modules/photos/hooks/use-photo-upload.ts` — sin EXIF
- `src/modules/photos/lib/utils.ts` — solo `getImageInfo`/blurhash (sin EXIF)
- `src/modules/photos/server/procedures.ts` — gestión de cover de galería, sin citySets/EXIF
- `src/modules/photos/server/__tests__/procedures.test.ts` — tests actualizados al modelo Gallery
- `src/modules/photos/ui/components/columns.tsx` — sin fecha/cámara/ciudad
- `src/modules/photos/ui/components/create-photo-modal.tsx` — recibe galleryId
- `src/modules/photos/ui/components/multi-step-form/*` — 3 pasos sin EXIF/mapa, con selector de galería
- `src/modules/photos/ui/components/photo-preview-card.tsx` — sin cámara/EXIF
- `src/modules/photos/ui/components/photo-uploader.tsx`
- `src/modules/photos/ui/components/photos-list-header.tsx` y `views/dashboard-photos-view.tsx`
- `src/modules/photos/ui/views/photo-id-view.tsx` — sin cámara/mapa, con selector de galería
- `src/site.config.ts` — eliminado bloque `mapbox`
- `src/trpc/routers/_app.ts` — routers: photos, s3, home, dashboard, galleries

---

## 3. Archivos creados

### Módulo `src/modules/galleries/`
- `lib/slugify.ts`
- `server/procedures.ts` (getMany, getOne, getManyPublished, getBySlug, create, update, remove, updateCoverPhoto)
- `types.ts`
- `ui/components/gallery-form.tsx`
- `ui/components/delete-gallery-button.tsx`
- `ui/components/publish-toggle.tsx`
- `ui/components/gallery-card.tsx`
- `ui/views/galleries-view.tsx` (público)
- `ui/views/gallery-detail-view.tsx` (público + lightbox)
- `ui/views/dashboard-galleries-view.tsx`
- `ui/views/dashboard-gallery-edit-view.tsx`

### Home
- `home/ui/components/gallery-card.tsx`
- `home/ui/views/galleries-view.tsx`

### Rutas
- `src/app/(home)/galerias/page.tsx`
- `src/app/(home)/galerias/[slug]/page.tsx`
- `src/app/(home)/servicios/page.tsx`
- `src/app/(home)/contacto/page.tsx`
- `src/app/(dashboard)/dashboard/galerias/page.tsx`
- `src/app/(dashboard)/dashboard/galerias/nueva/page.tsx`
- `src/app/(dashboard)/dashboard/galerias/[id]/page.tsx`

---

## 4. Rutas eliminadas
- `/blog`, `/blog/[slug]`
- `/travel`, `/travel/[city]`
- `/discover`
- `/dashboard/posts`, `/dashboard/posts/new`, `/dashboard/posts/[slug]`
- `/dashboard/cities`, `/dashboard/cities/[city]`

## 5. Rutas creadas
- `/galerias`, `/galerias/[slug]`
- `/servicios`, `/contacto`
- `/dashboard/galerias`, `/dashboard/galerias/nueva`, `/dashboard/galerias/[id]`

---

## 6. Modelos eliminados
- `posts`, `categories`, `postVisibility`
- `citySets` (tabla `city_sets`)

## 7. Modelos modificados
- `photos` — eliminadas columnas EXIF/GPS/geo (make, model, lensModel, focalLength,
  focalLength35mm, fNumber, iso, exposureTime, exposureCompensation, latitude,
  longitude, gpsAltitude, dateTimeOriginal, country, countryCode, region, city,
  district, fullAddress, placeFormatted) y `year_idx`; añadido `galleryId`.
- (nuevo) `galleries` — id, title, slug (único), description, coverPhotoId, isPublished, timestamps.

## 8. Migraciones realizadas
- Via `drizzle-kit push` (servicio `migrate` de Docker) al arrancar el entorno:
  creó `galleries`, añadió `photos.gallery_id`, eliminó `city_sets`, `posts`,
  `categories` y las columnas EXIF/GPS de `photos`.

## 9. Datos migrados
- La base de datos estaba vacía (0 fotos, 0 city_sets, 0 posts). No hubo datos que
  migrar. La estrategia documentada para reutilizar `citySets → galleries` no fue
  necesaria. **No se perdió ninguna fotografía** (no existía ninguna).

---

## 10. Dependencias eliminadas (package.json)
- `@mapbox/mapbox-gl-geocoder`, `@types/mapbox-gl`, `@types/mapbox__mapbox-gl-geocoder`
- `mapbox-gl`, `react-map-gl`
- `supercluster`
- `ts-exif-parser`
- Script `seed:demo-post`

Conservadas (necesarias): Next, React, Drizzle, PostgreSQL (`pg`, `@neondatabase/serverless`),
Better Auth, tRPC, S3 (`@aws-sdk/*`), `sharp`, `blurhash`, `react-dropzone`, etc.

---

## 11. Variables de entorno eliminadas
- `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN` (de `.env`, `.env.example`, `docker-compose`, `Dockerfile`)

---

## 12. Funcionalidades conservadas
- Autenticación (Better Auth): login, sesión, usuarios
- Dashboard (Resumen, Galerías, Fotografías, Perfil)
- Galerías (CRUD, publicar/despublicar, portada por favorito, orden)
- Fotografías: upload (S3/RustFS), eliminación, visibilidad, favorito, ligadas a galería
- Almacenamiento S3-compatible (RustFS dev, R2/proveedor prod)
- Screensaver (fotos favoritas y públicas)
- Visor de foto `/p/[id]`
- Perfil y Sobre mí

---

## 13-18. Docker / Dev local

- **Dockerfile**: etapas `base → deps → dev → builder → runner`.
  - `dev`: `bun run dev` (next dev, Fast Refresh), sin `next build`.
  - `builder`/`runner`: `next build` + `.next/standalone` + `server.js` (producción).
- **docker-compose.standalone.yml**: entorno dev.
  - `app` arranca con `next dev`.
  - Servicio `migrate` separado (ejecuta `drizzle-kit push` una vez).
  - Volúmenes: `.:/app`, `node_modules:/app/node_modules`, `next_cache:/app/.next`
    (el node_modules del host no sobrescribe el del contenedor).
  - PostgreSQL 15 + RustFS + create-bucket con healthchecks y volúmenes persistentes.
- **Estrategia de Hot Reload**: Fast Refresh vía `next dev` con código montado.
- **Cache de dependencias**: capa `deps` cachea `bun install`; solo se reinstala si
  cambian `package.json`/`bun.lock`.

## 19. Solución aplicada a Bun/Next.js
- Para desarrollo local se usa `next dev` (Turbopack) con Bun, que arranca en ~1.4s y
  hace Fast Refresh. No se ejecuta `next build` en desarrollo.
- No se requirió cambiar Bun por Node para el flujo de desarrollo local.
- **Nota**: el crash `SIGILL` durante `next build` documentado en PROMPT.md no fue
  validado (el usuario indicó que trabaja en local y no era necesario validar build de
  producción). Si aparece en producción, evaluar Node en el stage `builder`.

---

## 20-21. Comandos

### Levantar el proyecto localmente
```bash
docker compose -f docker-compose.standalone.yml up -d
```
- PostgreSQL inicia → RustFS + bucket → `migrate` (drizzle-kit push) → `app` (next dev)
- Acceso: http://localhost:3000

### Detenerlo
```bash
docker compose -f docker-compose.standalone.yml down
```
(con `-v` se eliminan también los volúmenes de datos)

### Reconstruir solo cuando sea necesario
Solo si cambian `package.json` / `bun.lock`:
```bash
docker compose -f docker-compose.standalone.yml build app migrate
```
Un cambio normal en `.ts/.tsx/.css` produce Fast Refresh sin rebuild.

### Ejecutar migraciones
El servicio `migrate` las aplica automáticamente al arrancar. Manualmente:
```bash
docker compose -f docker-compose.standalone.yml run --rm migrate
```

### Acceder al dashboard
http://localhost:3000/sign-in → iniciar sesión (seed: `bun run seed:user`)

### Acceder a RustFS
- Consola: http://localhost:9001 (credenciales por defecto rustfsadmin/rustfsadmin)
- API S3: http://localhost:9000

### Entorno de producción
```bash
docker build --target runner -t photography-website .
docker run -p 3000:3000 photography-website
```

---

## Validación funcional realizada (local)
- `bunx tsc --noEmit`: sin errores
- `bunx eslint src`: sin errores ni warnings
- Rutas públicas 200: `/`, `/galerias`, `/galerias/[slug]`, `/about`, `/servicios`, `/contacto`, `/screensaver`
- Rutas dashboard 200 (redirigen a login): `/dashboard`, `/dashboard/photos`, `/dashboard/galerias`, `/dashboard/galerias/nueva`, `/dashboard/profile`
- Rutas eliminadas 404: `/blog`, `/travel`, `/discover`
- `/galerias` mostró solo galerías publicadas (verificado con datos de prueba, luego limpiados)
- Screensaver re-punteado a `home.getScreensaverPhotos` (favoritas + públicas)
- Base de datos migrada correctamente (tablas finales: user, session, account, verification, photos, galleries)

## Pendientes / notas
- No se validó `next build` de producción (usuario trabaja en local).
- El flujo de subida de fotos requiere credenciales S3/RustFS; se validó la estructura,
  no una subida real de archivo.
