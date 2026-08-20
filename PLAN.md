# PLAN: Refactorización a Portafolio Fotográfico (enfoque en carpetas/rutas)

> **Propósito de este documento:** Plan paso a paso para ejecutar las indicaciones del
> `PROMPT.md` relativas a la **reestructuración de carpetas y rutas** del proyecto.
> NO se ejecuta ningún cambio; solo se documenta la planificación.
>
> Alcance central (lo que pide el usuario): **carpetas/rutas** → eliminar Blog, Travel,
> Discover, Mapbox, Cities, EXIF y crear **Galerías** como entidad principal.
> Se incluye también la parte de Docker/Dev del `PROMPT.md` de forma resumida porque
> afecta cómo se levanta el proyecto tras mover carpetas.

---

## 0. REGLAS DE ORO (del PROMPT.md, aplicables a carpetas)

1. Trabajar sobre el código existente. **NO reescribir desde cero.**
2. **NO eliminar carpeta/ruta** sin antes verificar referencias (grep global).
3. **NO perder fotografías** ni datos existentes.
4. Reutilizar estructuras existentes (p. ej. `citySets`/`photos` como base de `galleries`).
5. Registrar progreso en `PROGRESO.md` por cada fase ejecutada.
6. Nunca hacer `git push/pull` ni comandos remotos.

---

## 1. MAPA ACTUAL DE CARPETAS Y RUTAS

### 1.1 Rutas de app (`src/app`)
```
src/app
├── (auth)/
│   ├── sign-in/
│   └── ... (auth better-auth)
├── (dashboard)/
│   └── dashboard/
│       ├── page.tsx                      # Resumen
│       ├── cities/                       [ELIMINAR]  (incl. [city]/)
│       ├── photos/                       [CONSERVAR] (incl. [id]/)
│       ├── posts/                        [ELIMINAR]  (incl. new/, [slug]/)
│       └── profile/                      [CONSERVAR]
├── (home)/
│   ├── page.tsx                          # Home (Slider + Profile + LatestTravel + Cities)
│   ├── about/                            [CONSERVAR] (Sobre mí)
│   ├── blog/                             [ELIMINAR]  (incl. [slug]/)
│   ├── discover/                         [ELIMINAR]
│   └── travel/                           [ELIMINAR]  (incl. [city]/)
├── (photograph)/
│   ├── p/[id]/                           [CONSERVAR] (visor de foto)
│   └── screensaver/                      [CONSERVAR] (favoritos)
└── api/
    ├── auth/[...all]/                    [CONSERVAR]
    └── trpc/[trpc]/                      [CONSERVAR]
```

### 1.2 Módulos de features (`src/modules`)
```
src/modules
├── auth/        [CONSERVAR]
├── blog/        [ELIMINAR]  (views, components, types)
├── cities/      [ELIMINAR]  (views, components, server) -> migrar fotos a galleries
├── dashboard/   [CONSERVAR] (sidebar, layout) -> ajustar nav
├── discover/    [ELIMINAR]  (clustering, map widgets)
├── home/        [MODIFICAR] (quitar LatestTravelCard, CitiesView; añadir sección Galerías)
├── mapbox/      [ELIMINAR]  (map component, hooks)
├── photograph/  [CONSERVAR] (screensaver, p view)
├── photos/      [MODIFICAR] (quitar EXIF, ligar a gallery)
├── posts/       [ELIMINAR]  (server, ui, types) -> tablas posts/categories
├── s3/          [CONSERVAR]
└── travel/      [ELIMINAR]  (views, components, server)
```

### 1.3 Routers tRPC (`src/trpc/routers/_app.ts`)
- `posts`      → ELIMINAR
- `photos`     → CONSERVAR + añadir `galleryId`
- `city`       → ELIMINAR
- `s3`         → CONSERVAR
- `home`       → MODIFICAR (quitar getCitySets; añadir getGalleries)
- `discover`   → ELIMINAR
- `travel`     → ELIMINAR
- `blog`       → ELIMINAR
- `dashboard`  → CONSERVAR

### 1.4 Tablas Drizzle (`src/db/schema.ts`)
- `user/session/account/verification` → CONSERVAR (auth)
- `photos` → CONSERVAR + quitar campos EXIF + añadir `galleryId`
- `citySets` → ELIMINAR (o transformar en `galleries`)
- `categories` / `posts` → ELIMINAR
- (nueva) `galleries` → CREAR

---

## 2. MAPA OBJETIVO DE CARPETAS Y RUTAS

```
src/app
├── (auth)/sign-in/                       [igual]
├── (dashboard)/dashboard/
│   ├── page.tsx                          # Resumen
│   ├── galerias/                         [NUEVO]
│   │   ├── page.tsx                      # listar galerías
│   │   ├── nueva/page.tsx                # crear
│   │   └── [id]/page.tsx                 # editar / fotos / portada / orden
│   ├── fotos/                            [RENOMBRAR photos -> fotos] (o mantener "photos")
│   └── perfil/                           [RENOMBRAR profile -> perfil] (o mantener)
├── (home)/
│   ├── page.tsx                          # Home: Slider + Profile + Galerías destacadas
│   ├── sobre-mi/                         [de about -> sobre-mi] (o mantener about)
│   ├── galerias/                         [NUEVO]
│   │   ├── page.tsx                      # lista de galerías (cards tipo city-card)
│   │   └── [slug]/page.tsx               # detalle galería + lightbox
│   └── servicios/                        [NUEVO - opcional según nav]
│   └── contacto/                         [NUEVO - opcional según nav]
├── (photograph)/
│   ├── p/[id]/                           [igual]
│   └── screensaver/                      [igual]
└── api/...                               [igual]
```

> Nota de nombres: el PROMPT pide rutas `/galerias` y `/galerias/[slug]` en público,
> y `/dashboard/galerias` en admin. El slug se define en la entidad Gallery.
> Los renombres de `photos`→`fotos` o `profile`→`perfil` son **cosméticos**; se
> recomienda conservar los nombres internos en inglés para no romper imports y
> solo cambiar las **rutas URL** (segmentos de carpeta) según convenga.

### 2.1 Módulos objetivo (`src/modules`)
```
src/modules
├── auth/          [igual]
├── dashboard/     [nav ajustada: Galerías, Fotografías, Perfil, Configuración]
├── galleries/     [NUEVO] (server procedures, ui views/components)
├── home/          [quita travel/cities; añade galleries grid]
├── photograph/    [igual]
├── photos/        [sin EXIF; añade galleryId; conserva upload/S3]
├── s3/            [igual]
└── (eliminados: blog, cities, discover, mapbox, posts, travel)
```

---

## 3. CHECKLIST DE ANÁLISIS PREVIO (obligatorio antes de borrar)

Para **cada** carpeta a eliminar, ejecutar búsquedas y listar referencias:

- [ ] **Blog**: `grep -r "blog" src --include=*.tsx --include=*.ts` → `modules/blog`,
      `modules/posts`, `app/(home)/blog`, `app/(dashboard)/dashboard/posts`,
      `footer`, `navbar`, `mobile-menu`, `latest-blog-section`, `blog-items`,
      `routers/_app.ts` (`posts`, `blog`), `schema.ts` (`posts`, `categories`),
      `siteConfig` (si existe), `.env` (`NEXT_PUBLIC_*` de blog si los hay).
- [ ] **Travel**: `grep -r "travel" src` → `modules/travel`, `app/(home)/travel`,
      `home/latest-travel-card.tsx`, `city-card.tsx` (router.push `/travel/...`),
      `navbar`, `footer`, `mobile-menu`, `routers/_app.ts` (`travel`),
      referencias en `photos` create (¿usa citySets solo? ver abajo).
- [ ] **Discover**: `grep -r "discover" src` → `modules/discover`,
      `app/(home)/discover`, `discover-widget`, `routers/_app.ts` (`discover`),
      `home/getManyLikePhotos` (¿usa discover? no, usa photos.isFavorite).
- [ ] **Mapbox**: `grep -r -i "mapbox" src` → `modules/mapbox`, `photo-form.tsx`
      (MapboxComponent, useGetAddress), `multi-step-form` (ThirdStep dirección),
      `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN` en `.env`/`.env.example`/next.config.
- [ ] **Cities**: `grep -r "city" src` → `modules/cities`, `app/(dashboard)/dashboard/cities`,
      `home/cities-view.tsx` + `city-card.tsx`, `travel/cover-photo.tsx`,
      `routers/_app.ts` (`city`), `schema.ts` (`citySets`), `photos` (campos
      country/city/region usados como editorial → SE CONSERVAN, no son EXIF),
      `dashboard` procedures (getDistinctCities).
- [ ] **EXIF**: `grep -r -i "exif" src` → `photos/lib/utils` (TExifData, extractExif),
      `use-photo-upload` (extracción), `multi-step-form` steps 1/2 (EXIF/cámara),
      `photo-form.tsx` (campos make/model/lens/fNumber/iso/focalLength/...),
      `schema.ts` (make, model, lensModel, focalLength, focalLength35mm, fNumber,
      iso, exposureTime, exposureCompensation, gpsAltitude, dateTimeOriginal, latitude,
      longitude — estos últimos: latitude/longitude ¿se conservan como editorial?
      El PROMPT dice NO EXIF; lat/long vienen de EXIF → se eliminan salvo que el
      fotógrafo los introduzca manualmente; decidir: eliminar para simplicidad).

---

## 4. PLAN PASO A PASO (por fases)

### FASE A — Análisis y respaldo (sin cambios)
1. Leer `package.json`, `bun.lock`, `Dockerfile`, `docker-compose.standalone.yml`.
2. Ejecutar los greps del checklist §3 y volcar resultados en `PROGRESO.md`.
3. Identificar dependencias cruzadas:确认 que `photos` NO depende de Travel/Discover
   salvo por `citySets` (tabla cities). Plan de migración citySets → galleries.
4. Hacer commit de respaldo (local) del estado actual ANTES de borrar.

### FASE B — Crear entidad Gallery (base para reemplazar Cities)
1. **Schema** (`src/db/schema.ts`): crear tabla `galleries`:
   ```ts
   galleries: pgTable("galleries", {
     id: uuid().primaryKey().defaultRandom(),
     title: text().notNull(),
     slug: text().notNull().unique(),
     description: text(),
     coverPhotoId: uuid().references(() => photos.id),  // portada = foto favorita (lógica actual)
     isPublished: boolean().default(false).notNull(),
     ...timestamps,
   })
   ```
   - Añadir `galleryId: uuid().references(() => galleries.id)` a `photos`.
   - (Opcional) transformar `citySets` en `galleries` en lugar de crear nueva; el PROMPT
     dice "reutilizar si existe entidad equivalente". `citySets` es equivalente
     (country/city/coverPhotoId/photoCount). **Decisión recomendada:** renombrar
     `citySets` → `galleries` y `country/city/description` se quedan como metadatos
     editoriales opcionales, añadir `slug`, `isPublished`. Así no se pierden fotos.
2. **Router** `src/modules/galleries/server/procedures.ts` (nuevo) con:
   `getMany` (públicas o todas para admin), `getBySlug`, `create`, `update`,
   `remove`, `updateCoverPhoto` (reusa lógica de `city.updateCoverPhoto`).
3. Registrar en `src/trpc/routers/_app.ts` como `galleries`.
4. Generar migración Drizzle (`drizzle-kit generate`) y aplicar (`drizzle-kit push` / migrate).

### FASE C — Migrar datos Cities → Galleries
1. Script/SQL: por cada `citySets`, crear `galleries` (slug desde city),
   actualizar `photos.galleryId` donde `photos.city = citySets.city`.
2. Verificar integridad (conteo de fotos por galería == photoCount anterior).
3. Solo tras validar, marcar `citySets` para eliminación en Fase H.

### FASE D — Eliminar BLOG (carpetas)
1. Borrar carpetas:
   - `src/app/(home)/blog/` y `src/app/(home)/blog/[slug]/`
   - `src/app/(dashboard)/dashboard/posts/`, `new/`, `[slug]/`
   - `src/modules/blog/`
   - `src/modules/posts/`
2. `schema.ts`: eliminar `posts` y `categories` (y `postVisibility` enum).
3. `_app.ts`: quitar `postsRouter`, `blogRouter`.
4. Quitar refs: `footer/index.tsx`, `navbar.tsx`, `mobile-menu.tsx`,
   `latest-blog-section.tsx`, `blog-items.tsx`, `latest-travel-card.tsx` (si depende).
5. `.env`/`.env.example`: quitar vars de blog si existen.

### FASE E — Eliminar TRAVEL (carpetas)
1. Borrar `src/app/(home)/travel/` (+ `[city]/`) y `src/modules/travel/`.
2. `_app.ts`: quitar `travelRouter`.
3. Quitar refs: `home/latest-travel-card.tsx` (eliminar o reconvertir a
   "últimas galerías"), `home/city-card.tsx` (router.push `/travel/...` → `/galerias/[slug]`),
   `navbar`, `footer`, `mobile-menu`.
4. Confirmar que `photos` no pierde nada (las fotos migraron a galleries en Fase C).

### FASE F — Eliminar DISCOVER (carpetas)
1. Borrar `src/app/(home)/discover/` y `src/modules/discover/`.
2. `_app.ts`: quitar `discoverRouter`.
3. Quitar `discover-widget.tsx` y su uso en home (si lo hubiera).
4. Confirmar que `home.getManyLikePhotos` (carrusel) no depende de discover
   (usa `photos.isFavorite` + `visibility`, seguro).

### FASE G — Eliminar MAPBOX (carpetas)
1. Borrar `src/modules/mapbox/`.
2. `photos/ui/components/photo-form.tsx`: quitar `MapboxComponent`, `useGetAddress`,
   campos de mapa/lat/long (o dejar lat/long como inputs manuales simples si se decide).
3. `multi-step-form/steps/third-step.tsx`: quitar geocodificación Mapbox; reemplazar
   por campos de texto manuales (país/ciudad) o eliminar paso.
4. `.env`, `.env.example`, `next.config.ts`: quitar `NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN`.
5. `package.json`: quitar `mapbox-gl` / `@mapbox/mapbox-gl-geocoder` si solo lo usa esto.

### FASE H — Eliminar CITIES (carpetas, tras migración Fase C)
1. Borrar `src/app/(dashboard)/dashboard/cities/` (+ `[city]/`) y `src/modules/cities/`.
2. `_app.ts`: quitar `cityRouter`.
3. `home/cities-view.tsx` + `home/city-card.tsx`: eliminar o reconvertir a
   `galleries-view.tsx` + `gallery-card.tsx` (reusa estilo de city-card pero con título).
4. `schema.ts`: eliminar `citySets` (ya migrado a `galleries`).
5. `dashboard` procedures: quitar `getDistinctCities` si queda.

### FASE I — Eliminar EXIF (campos y carpetas/utilidades)
1. `photos/lib/utils.ts`: eliminar `TExifData`, `extractExif`, `getImageInfo` (o dejar
   solo `getImageInfo` para dimensiones/blurhash sin EXIF).
2. `photos/hooks/use-photo-upload.ts`: quitar extracción EXIF en subida.
3. `multi-step-form`: eliminar `first-step` (upload+EXIF) y `second-step` (cámara);
   dejar upload simple + detalles (título/desc/visibilidad/favorito).
4. `photo-form.tsx`: quitar make/model/lens/fNumber/iso/focalLength/exposureTime/
   dateTimeOriginal/gpsAltitude/latitude/longitude (según decisión Fase A).
5. `schema.ts` `photos`: quitar columnas EXIF listadas arriba. Generar migración.
6. `package.ts`: quitar `exifreader` (u otra lib EXIF) si es exclusiva de EXIF.

### FASE J — Crear RUTAS PÚBLICAS de Galerías
1. `src/app/(home)/galerias/page.tsx` → `GalleriesView` (grid de `gallery-card`,
   reusa estilo de city-card mostrando título + cover).
2. `src/app/(home)/galerias/[slug]/page.tsx` → `GalleryDetailView`
   (título, descripción, fotos, lightbox existente).
3. `src/modules/galleries/ui/...` con views/components (reusa `FramedPhoto`, lightbox).

### FASE K — Crear RUTAS DE DASHBOARD de Galerías
1. `src/app/(dashboard)/dashboard/galerias/page.tsx` (listar, crear, eliminar, publicar).
2. `src/app/(dashboard)/dashboard/galerias/nueva/page.tsx`.
3. `src/app/(dashboard)/dashboard/galerias/[id]/page.tsx`
   (editar, agregar fotos, seleccionar portada por favorito, ordenar).

### FASE L — Ajustar NAVEGACIÓN
1. **Pública** (`home/components/header/navbar.tsx`, `mobile-menu.tsx`, `footer`):
   Inicio · Galerías · Sobre mí · Servicios · Contacto. Quitar Travel/Discover/Blog.
   - `about` → renombrar ruta a `sobre-mi` (o mantener). Crear `servicios/`, `contacto/`
     mínimos si no existen.
2. **Dashboard** (`dashboard-sidebar/index.tsx`): Resumen · Galerías · Fotografías ·
   Perfil · Configuración. Quitar Cities/Posts.

### FASE M — Ajustar HOME principal
- `src/app/(home)/page.tsx`: quitar `LatestTravelCard` y `CitiesView`; añadir
  `GalleriesView` (galerías destacadas). Conservar `SliderView` (favoritos) y `ProfileCard`.
- `SliderView` sigue usando `home.getManyLikePhotos` (fotos favoritas+públicas) → conservar.

### FASE N — Limpieza de dependencias y entorno
1. `package.json` / `bun.lock`: quitar `mapbox-gl`, `exifreader`, y cualquier lib
   exclusiva de blog/travel/discover/cities (ver greps). NO quitar Next/React/Drizzle/
   Postgres/Auth/tRPC/S3.
2. `.env` / `.env.example`: quitar Mapbox/Blog/Travel/Discover/Cities/EXIF vars;
   conservar DATABASE_URL, Better Auth, APP_URL, S3/RustFS/R2.

### FASE O — Docker para desarrollo local (resumido del PROMPT)
1. `docker-compose.standalone.yml`: separar servicio `migrate` (ejecuta drizzle push
   una vez) del servicio `app`. `app` arranca con `next dev` (NO `next build`).
2. Volúmenes: `.:/app`, `node_modules:/app/node_modules`, `next_cache:/app/.next`
   (evitar sobrescribir node_modules del host).
3. Cache de deps: copiar `package.json`+`bun.lock` primero, instalar, luego copiar código.
4. `Dockerfile`: mantener etapas `base/deps/dev/builder/runner`. `dev` usa `next dev`;
   `builder/runner` usa `next build` + `.next/standalone` (producción).
5. PostgreSQL 15 + RustFS + create-bucket + healthcheck + volúmenes persistentes.
6. Investigar crash Bun/Next (SIGILL) en build; para dev priorizar estabilidad
   (evaluar Node en dev si Bun falla). Decisión justificada antes de cambiar.

### FASE P — Validación funcional
- `docker compose -f docker-compose.standalone.yml up` → sin `next build` en app.
- Verificar: PostgreSQL healthy, RustFS + bucket, migraciones, Next dev en :3000,
  login, dashboard, galerías (CRUD + publicar + portada + orden), `/galerias`,
  `/galerias/[slug]`, fotos se suben y muestran, screensaver (favoritos),
  sin enlaces rotos, `tsc`/lint OK, Fast Refresh.

---

## 5. ORDEN DE EJECUCIÓN RECOMENDADO (resumen)

A (análisis) → B (crear galleries) → C (migrar cities→galleries) →
D (blog) → E (travel) → F (discover) → G (mapbox) → H (cities, post-migración) →
I (exif) → J (rutas públicas galerías) → K (rutas dashboard galerías) →
L (nav) → M (home) → N (deps/env) → O (docker) → P (validación).

Cada fase debe: (1) grep de referencias, (2) borrar/crear carpetas, (3) ajustar
routers/schema/nav, (4) compilar/typecheck, (5) anotar en `PROGRESO.md`.

---

## 6. RIESGOS Y PUNTOS DE DECISIÓN

- **citySets ↔ galleries**: renombrar in-place vs crear nueva. Recomendado renombrar
  para no perder `photoCount`/`coverPhotoId` y minimizar migración de fotos.
- **latitude/longitude**: vienen de EXIF → PROMPT dice eliminar EXIF. Decisión:
  eliminar para simplificar (la galería ya no es por ubicación). Si el fotógrafo
  quiere ubicación editorial, añadir campos de texto manuales aparte, no de EXIF.
- **home.getManyLikePhotos**: se conserva (carrusel = favoritos). No tocar.
- **screensaver**: se conserva (favoritos). No tocar.
- **`p/[id]` (photograph)**: se conserva; al quitar cities, la foto sigue ligada a
  `galleryId`. Ajustar breadcrumb/links rotos que apunten a `/travel/` o `/dashboard/cities`.

---

## 7. ENTREGABLES FINALES (al ejecutar, no ahora)

- `PROGRESO.md`: avance por fase.
- `RESULTADOS.md`: archivos eliminados/modificados/creados, rutas, modelos, migraciones,
  deps/env eliminadas, cambios Docker, estrategia hot-reload/volúmenes/cache/migraciones,
  solución Bun, comandos dev/prod.
- Este `PLAN.md` queda como documentación de la planificación.
