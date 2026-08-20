# PROGRESO — Refactorización a Portafolio Fotográfico

Seguimiento de avance por fase del `PLAN.md`.

| Fase | Descripción | Estado | Fecha |
|------|-------------|--------|-------|
| A | Análisis completo del código, dependencias cruzadas y respaldo | ✅ Completado | 2026-08-20 |
| B | Crear entidad Gallery (schema `galleries`, `photos.galleryId`, router `galleries`) | ✅ Completado | 2026-08-20 |
| C | Migrar datos Cities → Galleries | ⏭️ No aplica (DB vacía, 0 fotos) | 2026-08-20 |
| D | Eliminar Blog (carpetas, schema, router, refs, editor) | ✅ Completado | 2026-08-20 |
| E | Eliminar Travel (carpetas, router, refs) | ✅ Completado | 2026-08-20 |
| F | Eliminar Discover (carpetas, router, refs; screensaver re-punteado) | ✅ Completado | 2026-08-20 |
| G | Eliminar Mapbox (carpetas, env, deps, refs) | ✅ Completado | 2026-08-20 |
| H | Eliminar Cities (carpetas, router, `citySets` post-migración) | ✅ Completado | 2026-08-20 |
| I | Eliminar EXIF (campos, utilidades, multi-step-form) | ✅ Completado | 2026-08-20 |
| J | Crear rutas públicas `/galerias` y `/galerias/[slug]` | ✅ Completado | 2026-08-20 |
| K | Crear rutas dashboard `/dashboard/galerias` | ✅ Completado | 2026-08-20 |
| L | Ajustar navegación pública y dashboard | ✅ Completado | 2026-08-20 |
| M | Ajustar home principal | ✅ Completado | 2026-08-20 |
| N | Limpieza de dependencias y variables de entorno | ✅ Completado | 2026-08-20 |
| O | Docker para desarrollo local (next dev + volúmenes) | ✅ Completado | 2026-08-20 |
| P | Validación (typecheck, lint, rutas locales) | ✅ Completado | 2026-08-20 |

## Notas de progreso

- **Fase C**: la base de datos estaba vacía (0 fotos, 0 city_sets, 0 posts). No fue
  necesaria la migración de datos; el schema se alineó directamente con
  `drizzle-kit push`.
- **Fase F**: el screensaver dependía de `discover.getManyPhotos`. Se creó
  `home.getScreensaverPhotos` (favoritas + públicas) y se re-punteó el screensaver.
- **Fase I**: se eliminó EXIF de upload y del formulario multi-paso. Se conservó
  `getImageInfo` (dimensiones + blurhash) porque el modelo de fotos lo requiere.
- **Fase P**: validado `tsc` y `eslint` sin errores; rutas públicas y de dashboard
  responden correctamente. No se validó `next build` de producción (usuario trabaja
  en local).
- **Entorno**: la app corre con `docker compose -f docker-compose.standalone.yml up -d`
  usando `next dev` (Fast Refresh).
