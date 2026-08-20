Quiero refactorizar y simplificar el proyecto actual.

==================================================
OBJETIVO GENERAL
==================================================

Convertir el proyecto actual en un sistema de portafolio fotográfico
para un fotógrafo individual.

El sistema debe centrarse en:

- Portafolio fotográfico
- Galerías
- Fotografías
- Perfil del fotógrafo
- Servicios
- Contacto
- Dashboard administrativo
- Almacenamiento de fotografías

La organización principal de fotografías debe ser mediante GALERÍAS.

El producto final debe ser simple:

PORTAFOLIO
    ↓
GALERÍAS
    ↓
FOTOGRAFÍAS

No quiero que el proyecto se comporte como:

- red social
- plataforma de descubrimiento
- plataforma de viajes
- blog
- sistema de mapas
- plataforma de múltiples fotógrafos


==================================================
IMPORTANTE: ANALIZAR ANTES DE MODIFICAR
==================================================

Trabaja sobre el código existente del repositorio.

NO reescribas el proyecto desde cero.

Antes de realizar cambios:

1. Analiza la arquitectura actual.
2. Revisa package.json.
3. Revisa bun.lock.
4. Revisa Dockerfile.
5. Revisa docker-compose.standalone.yml.
6. Revisa todos los modelos/schema de Drizzle.
7. Revisa las rutas existentes.
8. Revisa componentes.
9. Revisa routers.
10. Revisa queries.
11. Revisa mutations.
12. Revisa autenticación.
13. Revisa el sistema de fotografías.
14. Revisa el sistema de almacenamiento.
15. Identifica dependencias entre Travel, City, Discover, Mapbox, Blog y Photo.

NO eliminar modelos, rutas o dependencias sin verificar previamente
sus referencias.

NO eliminar fotografías ni datos existentes.

Reutilizar las estructuras existentes cuando sea posible.


==================================================
1. ELIMINAR BLOG
==================================================

Eliminar completamente la funcionalidad Blog.

Eliminar, si existen:

- /blog
- /blog/[slug]
- /dashboard/posts
- /dashboard/posts/new
- /dashboard/posts/[slug]
- modelos relacionados exclusivamente con Blog/Post
- schemas
- routers
- queries
- mutations
- componentes
- páginas
- navegación
- enlaces
- lógica
- datos de prueba

Verificar todas las referencias antes de eliminar.

No debe quedar ninguna funcionalidad de Blog.


==================================================
2. ELIMINAR TRAVEL
==================================================

Eliminar Travel como concepto de negocio.

Eliminar:

- /travel
- /travel/[city]
- componentes de Travel
- queries de Travel
- mutations de Travel
- routers de Travel
- navegación de Travel
- lógica específica de Travel

IMPORTANTE:

NO eliminar fotografías existentes.

Analizar cómo las fotografías actualmente relacionadas con Travel
pueden pasar a formar parte de una Gallery.

No realizar simplemente un rename de Travel.

El concepto Travel debe desaparecer del dominio del proyecto.


==================================================
3. ELIMINAR DISCOVER
==================================================

Eliminar completamente Discover.

Eliminar:

- /discover
- componentes
- queries
- mutations
- routers
- navegación
- lógica específica
- referencias en dashboard
- referencias en frontend

No eliminar funcionalidades necesarias para el portafolio.


==================================================
4. ELIMINAR MAPBOX
==================================================

Eliminar completamente Mapbox.

Eliminar:

- dependencias de Mapbox que ya no sean necesarias
- componentes de mapas
- código relacionado con mapas
- configuración
- NEXT_PUBLIC_MAPBOX_ACCESS_TOKEN
- variables de entorno específicas de Mapbox
- lógica específica de mapas

El proyecto NO debe requerir un Mapbox token.


==================================================
5. ELIMINAR CITIES
==================================================

Eliminar City si solamente es utilizada por:

- Travel
- Discover
- Mapbox

Eliminar:

- /dashboard/cities
- /dashboard/cities/[city]
- modelo City si ya no tiene utilidad
- schemas
- queries
- mutations
- routers
- componentes
- formularios
- navegación
- relaciones específicas con City

ANTES de eliminar City:

1. Analizar relación con Photo.
2. Identificar fotografías relacionadas con City.
3. Determinar cómo conservar esa información.
4. Migrar las fotografías a Gallery cuando sea necesario.
5. Ejecutar las migraciones necesarias.
6. Verificar integridad de los datos.
7. Solamente después eliminar City.

NO perder fotografías.


==================================================
6. ELIMINAR EXIF COMPLETAMENTE
==================================================

IMPORTANTE:

Quiero ELIMINAR COMPLETAMENTE la funcionalidad EXIF del proyecto.

NO quiero extracción automática de EXIF.

NO quiero edición manual de EXIF.

NO quiero visualización de EXIF.

NO quiero almacenamiento de EXIF.

NO quiero procesamiento de EXIF.

NO quiero una sección de EXIF en el dashboard.

Eliminar cualquier funcionalidad relacionada con:

- EXIF
- metadata EXIF
- lectura de EXIF
- extracción automática de EXIF
- cámara
- lente
- apertura
- velocidad de obturación
- ISO
- focal length
- fecha de captura proveniente de EXIF
- fabricante de cámara
- modelo de cámara
- GPS proveniente de EXIF
- orientación EXIF
- cualquier otro metadato técnico obtenido del EXIF

Buscar y eliminar:

- librerías utilizadas exclusivamente para EXIF
- funciones de extracción EXIF
- utilidades EXIF
- componentes EXIF
- tipos TypeScript relacionados con EXIF
- campos EXIF del modelo de fotografía
- queries relacionadas con EXIF
- endpoints relacionados con EXIF
- procedimientos tRPC relacionados con EXIF
- procesamiento EXIF durante la subida de imágenes
- referencias EXIF en el dashboard

Si existen campos en la base de datos utilizados exclusivamente
para almacenar información EXIF, eliminarlos mediante una migración
adecuada.

NO eliminar información editorial que el fotógrafo pueda introducir
manualmente.

Por ejemplo, una fotografía puede seguir teniendo:

- título
- descripción
- ciudad
- país
- fecha de publicación
- orden
- estado publicado

pero estos datos NO deben obtenerse automáticamente desde EXIF.


==================================================
7. screensaver
==================================================

Mantener screensaver, entiendo que son todas las fotos marcadas como favoritos.

/screensaver

==================================================
7. GALERÍAS
==================================================

Gallery debe ser la entidad principal para organizar fotografías.

Si el proyecto ya tiene una entidad equivalente, reutilizarla.

No crear modelos duplicados innecesariamente.

Modelo conceptual:

Gallery

- id
- title
- slug
- description
- coverImage, puede mantener la logica actual que el cover sea por el este marcado como favorito.
- isPublished
- createdAt
- updatedAt

Photo

- Adapta el modelo a los nuevo requerimientos, por ejemplo, que este ligado a la galeria.

Relación:

Gallery 1 ---- N Photo

Una Gallery contiene múltiples Photo.

Una Photo pertenece a una Gallery.c

Una galería representa una colección de fotografías.

No debe depender de:

- Travel
- Cities
- Discover
- Mapbox
- Blog
- EXIF

==================================================
8. RUTAS PÚBLICAS
==================================================

La sección principal del portafolio debe ser:

/galerias

Cada galería debe tener:

/galerias/[slug]

Ejemplo:

/galerias/boda-ana-y-juan

La página /galerias debe mostrar:

- portada
- título
- descripción opcional
- enlace a la galería

Mantener el aspecto del card de la ciudad actual,pero que muestre el titulo

La página /galerias/[slug] debe mostrar:

- título
- descripción
- fotografías
- visualización de fotografías
- lightbox si ya existe y puede reutilizarse

Eliminar completamente el concepto:

/travel/[city]

No utilizar City como URL pública.


==================================================
9. DASHBOARD
==================================================

El dashboard debe estar centrado en Galerías y Fotografías.

La navegación principal debe ser:

- Dashboard
- Galerías
- Fotografías
- Perfil

Eliminar:

- Blog
- Travel
- Discover
- Cities
- Mapbox
- EXIF

Crear/adaptar:

/dashboard/galerias
/dashboard/galerias/nueva
/dashboard/galerias/[id]

El administrador debe poder:

- listar galerías
- crear galerías
- editar galerías
- eliminar galerías
- publicar/despublicar galerías
- seleccionar portada, logica actual por favorito
- agregar fotografías
- eliminar fotografías
- ordenar fotografías

Reutilizar el sistema de fotografías existente siempre que sea posible.


==================================================
10. FOTOGRAFÍAS
==================================================

Conservar el sistema actual de fotografías.

Las fotografías deben pertenecer a una galería.

Relación:

Gallery
    ↓
Photos

Mantener:

- upload
- eliminación
- ordenamiento
- almacenamiento
- procesamiento
- optimización
- URLs públicas
- integración S3-compatible
- RustFS
- compatibilidad futura con Cloudflare R2

Las fotografías deben quedar asociadas a Gallery.

IMPORTANTE:

No agregar campos técnicos de cámara o EXIF.

==================================================
11. SUBIDA DE FOTOGRAFÍAS
==================================================

Al subir una fotografía:

NO realizar procesamiento EXIF.

El flujo debe ser:

Seleccionar fotografía
        ↓
Subir archivo
        ↓
Guardar fotografía
        ↓
Asociarla a galería

No realizar:

archivo
 ↓
extraer EXIF
 ↓
guardar EXIF

La información de la fotografía debe ser introducida
manualmente cuando corresponda.


==================================================
11. NAVEGACIÓN PÚBLICA
==================================================

La navegación pública debe simplificarse.

Debe contener:

- Inicio
- Galerías
- Sobre mí
- Servicios
- Contacto

Eliminar:

- Blog
- Travel
- Discover

No deben quedar enlaces rotos.


==================================================
12. NAVEGACIÓN DEL DASHBOARD
==================================================

El dashboard debe simplificarse.

Debe contener como mínimo:

- Resumen
- Galerías
- Fotografías
- Perfil
- Configuración

Eliminar:

- Posts/Blog
- Travel
- Cities
- Discover

No dejar menús ni rutas que ya no existan.

==================================================
15. BASE DE DATOS
==================================================

Analizar el schema antes de modificarlo.

Identificar:

- tablas de Blog
- tablas de Travel
- tablas de Discover
- tablas de Cities
- campos relacionados con EXIF
- relaciones relacionadas con EXIF

Eliminar únicamente estructuras que hayan quedado sin utilidad.

Para EXIF:

Si existen columnas como:

- exif
- metadata
- camera
- camera_make
- camera_model
- lens
- aperture
- shutter_speed
- iso
- focal_length
- captured_at
- gps_latitude
- gps_longitude

u otras equivalentes utilizadas exclusivamente para EXIF,
eliminarlas mediante una migración.

IMPORTANTE:

No eliminar ciudad o país si estos son utilizados como información
editorial independiente del EXIF.

==================================================
16. API / TRPC
==================================================

Eliminar procedures/endpoints relacionados exclusivamente con:

- Blog
- Travel
- Discover
- Cities
- Mapbox
- EXIF

Mantener:

- autenticación
- usuarios
- perfil
- galerías
- fotografías
- almacenamiento

No dejar endpoints sin consumidores.


==================================================
20. NO SOBREDISEÑAR
==================================================

NO agregar nuevas funcionalidades innecesarias.

No quiero:

- red social
- likes
- comentarios
- seguidores
- Discover
- mapas
- viajes
- Blog
- EXIF
- información técnica de cámara
- perfiles públicos de múltiples fotógrafos

El producto debe ser:

SIMPLE
RÁPIDO
VISUAL
PROFESIONAL
c

==================================================
13. DEPENDENCIAS
==================================================

Después de eliminar funcionalidades:

Revisar:

- package.json
- bun.lock
- imports
- componentes
- TypeScript
- configuración de Next.js

Eliminar únicamente dependencias que hayan quedado sin uso.

Especialmente revisar dependencias relacionadas con:

- Mapbox
- Blog
- Travel
- Discover
- Cities
- EXIF

NO eliminar dependencias utilizadas por:

- Next.js
- React
- Drizzle
- PostgreSQL
- Better Auth
- tRPC
- S3
- RustFS
- R2
- procesamiento de imágenes
- dashboard
- galerías
- fotografías


==================================================
19. SLUGS
==================================================

Las galerías deben utilizar slug.

Ejemplo:

Título:

Boda María y Juan

Slug:

boda-maria-juan

URL:

/galeria/boda-maria-juan

Validar:

- unicidad
- caracteres válidos
- actualización segura

==================================================
14. VARIABLES DE ENTORNO
==================================================

Eliminar variables exclusivamente relacionadas con:

- Mapbox
- Travel
- Discover
- Cities
- Blog
- EXIF

Mantener las necesarias para:

- PostgreSQL
- DATABASE_URL
- Better Auth
- APP URL
- S3
- RustFS
- R2

Actualizar también:

.env.example

para reflejar únicamente las variables realmente necesarias.


==================================================
15. OPTIMIZAR DOCKER PARA DESARROLLO LOCAL
==================================================

ESTA PARTE ES MUY IMPORTANTE.

Optimizar específicamente:

docker-compose.standalone.yml

para trabajar como entorno de DESARROLLO LOCAL.

La configuración actual ejecuta al iniciar el contenedor:

- drizzle-kit push
- next build
- copia de archivos
- server.js

Esto provoca que cada reinicio del contenedor pueda ejecutar
nuevamente un build completo de Next.js.

Esto NO es adecuado para desarrollo.

El objetivo es que:

docker compose -f docker-compose.standalone.yml up

levante el entorno local rápidamente.


==================================================
16. NEXT.JS EN DESARROLLO
==================================================

En desarrollo local:

NO ejecutar:

next build

al iniciar el contenedor.

Utilizar:

next dev

o el mecanismo equivalente compatible con la versión actual
de Next.js.

Debe existir:

Fast Refresh / Hot Reload.

El flujo esperado:

docker compose up

↓

PostgreSQL inicia

↓

RustFS inicia

↓

migración/inicialización de DB

↓

Next.js dev server

↓

http://localhost:3000

Después:

editar React / TypeScript / SCSS

↓

Fast Refresh

NO:

Docker rebuild
+
instalar dependencias
+
next build


==================================================
17. VOLUMENES DE DOCKER
==================================================

Configurar correctamente los volúmenes para desarrollo.

El código local debe reflejarse dentro del contenedor.

Evitar que:

./node_modules

del host sobrescriba:

/app/node_modules

del contenedor.

Utilizar una estrategia equivalente a:

volumes:
  - .:/app
  - node_modules:/app/node_modules
  - next_cache:/app/.next

Adaptar esta solución al proyecto real.

El objetivo es:

- código local sincronizado
- node_modules dentro del contenedor
- cache de Next.js persistente
- Fast Refresh


==================================================
18. CACHE DE DEPENDENCIAS
==================================================

Optimizar Docker para aprovechar las capas.

Si no cambian:

package.json
bun.lock

NO volver a instalar todas las dependencias.

Si solamente cambia código:

NO ejecutar nuevamente:

bun install

ni:

npm install

ni:

pnpm install

El Dockerfile debe aprovechar correctamente el cache.


==================================================
19. DOCKERFILE
==================================================

Analizar el Dockerfile existente.

Actualmente contiene etapas similares a:

- base
- deps
- dev
- builder
- runner

Determinar si esta estructura sigue siendo apropiada.

Mantener una separación correcta entre:

DESARROLLO

y

PRODUCCIÓN.

No eliminar etapas simplemente para reducir el número de líneas.

El resultado debe ser:

DESARROLLO:
- next dev
- Hot Reload
- source montado
- node_modules persistente
- sin next build al iniciar

PRODUCCIÓN:
- next build
- .next/standalone
- server.js


==================================================
20. PRODUCCIÓN
==================================================

NO romper la capacidad de producción.

La imagen de producción debe realizar:

1. instalación de dependencias
2. next build
3. generación de .next/standalone
4. copia de assets
5. ejecución de server.js

El build de producción debe ocurrir durante:

docker build

o deployment.

NO ejecutar:

next build

cada vez que inicia el contenedor de producción.


==================================================
21. DRIZZLE
==================================================

Analizar el uso actual de:

drizzle-kit push

Actualmente puede ejecutarse durante el arranque del contenedor.

Optimizar esta estrategia.

Separar:

migración/inicialización de base de datos

de:

servidor Next.js.

No ejecutar innecesariamente operaciones pesadas de migración
en cada reinicio del servidor.

Mantener PostgreSQL dentro de Docker.

Si existe un servicio `migrate`, determinar si debe ser el responsable
de las migraciones.

Evitar duplicar:

migrate

y:

db:push

en el mismo flujo sin necesidad.


==================================================
22. POSTGRESQL
==================================================

Mantener:

PostgreSQL 15

como base de datos local.

Conservar:

- volumen persistente
- healthcheck
- DATABASE_URL

La aplicación debe esperar correctamente a que PostgreSQL
esté disponible antes de ejecutar operaciones que dependan
de la base de datos.


==================================================
23. RUSTFS
==================================================

Mantener RustFS como almacenamiento S3-compatible local.

Conservar:

- servicio rustfs
- volumen persistente
- puerto 9000
- consola 9001
- bucket de fotografías

Mantener el servicio:

create-bucket

si sigue siendo necesario.

Verificar que el bucket se cree correctamente.

No requerir Cloudflare R2 para desarrollo local.


==================================================
24. S3 / R2
==================================================

Mantener compatibilidad con almacenamiento S3-compatible.

Desarrollo:

RustFS

Producción:

puede utilizarse:

- Cloudflare R2
- otro proveedor S3-compatible

No acoplar el código exclusivamente a RustFS.


==================================================
25. PROBLEMA ACTUAL DE BUN
==================================================

Durante el entorno actual se ha detectado:

Bun v1.3.14
Next.js 16.3.0
Turbopack

Durante `next build` ocurre:

panic: Segmentation fault

y:

error: script "build" was terminated by signal SIGILL
Illegal instruction

Analizar este problema.

NO asumir que es un error del código de la aplicación.

Investigar si puede estar relacionado con:

- Bun
- Next.js
- Turbopack
- Docker
- WSL
- arquitectura CPU
- compatibilidad de instrucciones

El log actual indica que:

- TypeScript termina correctamente
- las páginas estáticas se generan correctamente
- el build llega a Finalizing page optimization
- posteriormente Bun termina con SIGILL

Por tanto, analizar específicamente el crash de Bun.

Para desarrollo local priorizar estabilidad.

Evaluar si Next.js debe ejecutarse con Node.js en lugar de Bun
para el entorno de desarrollo.

NO cambiar Bun por Node automáticamente.

Primero analizar la causa y justificar técnicamente la decisión.

Si se determina que Node.js proporciona mayor estabilidad para
Next.js en Docker/WSL, realizar el cambio de forma consistente.


==================================================
26. OBJETIVO DE RENDIMIENTO
==================================================

Después de la primera construcción de las imágenes:

docker compose -f docker-compose.standalone.yml up

NO debería ejecutar innecesariamente:

- bun install
- npm install
- next build

cada vez que se inicia o reinicia `app`.

Un cambio normal en:

.ts
.tsx
.scss
.css

debe producir:

Fast Refresh

y no:

Docker rebuild
+
instalación de dependencias
+
next build


==================================================
27. EXPERIENCIA LOCAL ESPERADA
==================================================

La experiencia para desarrollar debe ser:

1. Clonar repositorio.
2. Configurar .env.
3. Ejecutar:

docker compose -f docker-compose.standalone.yml up

4. Abrir:

http://localhost:3000

5. Modificar código.
6. Ver Fast Refresh.
7. Crear galerías.
8. Subir fotografías.
9. Ver fotografías.
10. Modificar estilos.
11. Continuar trabajando sin reconstruir Docker.

No debería ser necesario ejecutar:

docker compose build

por cada cambio de código.


==================================================
28. VALIDACIÓN FUNCIONAL
==================================================

Después de los cambios comprobar:

1. PostgreSQL inicia correctamente.
2. PostgreSQL permanece saludable.
3. RustFS inicia correctamente.
4. Bucket de fotografías se crea correctamente.
5. Migraciones funcionan.
6. Next.js inicia.
7. http://localhost:3000 funciona.
8. Login funciona.
9. Dashboard funciona.
10. Galerías funcionan.
11. Crear galería funciona.
12. Editar galería funciona.
13. Eliminar galería funciona.
14. Publicar/despublicar funciona.
15. Subir fotografías funciona.
16. Eliminar fotografías funciona.
17. Ordenar fotografías funciona.
18. Seleccionar portada funciona.
19. /galerias funciona.
20. /galerias/[slug] funciona.
21. Las fotografías se muestran correctamente.
22. RustFS almacena las fotografías.
23. EXIF funciona si ya estaba implementado.
24. Blog ya no existe.
25. Travel ya no existe.
26. Discover ya no existe.
27. Mapbox ya no existe.
28. Cities ya no existe.
29. No existen enlaces rotos.
30. No existen imports rotos.
31. TypeScript compila correctamente.
32. Fast Refresh funciona.
33. Reiniciar `app` NO ejecuta `next build`.
34. Reiniciar `app` NO reinstala dependencias.


==================================================
29. VALIDACIÓN DE DOCKER
==================================================

Ejecutar y verificar:

docker compose -f docker-compose.standalone.yml down

docker compose -f docker-compose.standalone.yml up

Después verificar:

docker compose -f docker-compose.standalone.yml ps

Y:

docker compose -f docker-compose.standalone.yml logs app

El log del entorno de desarrollo NO debe mostrar un:

next build

completo cada vez que se inicia `app`.

Debe iniciar el servidor de desarrollo.


==================================================
30. LIMPIEZA FINAL
==================================================

Después de eliminar funcionalidades:

Revisar:

- imports
- exports
- rutas
- navegación
- componentes
- schemas
- routers
- queries
- mutations
- tipos TypeScript
- variables de entorno
- package.json
- bun.lock
- Dockerfile
- docker-compose.standalone.yml
- documentación

No dejar código muerto evidente relacionado con:

- Blog
- Travel
- Discover
- Mapbox
- Cities


==================================================
31. NO SOBREDISEÑAR
==================================================

No agregar nuevas funcionalidades innecesarias.

NO agregar:

- sistema social
- Discover
- mapas
- Travel
- Blog
- ciudades
- analytics complejos
- integración con iPhone
- funcionalidades avanzadas que no sean necesarias
- funcionalidades duplicadas

El producto debe mantenerse enfocado en:

Fotógrafo
    ↓
Galerías
    ↓
Fotografías


==================================================
32. RESULTADO FINAL
==================================================

El proyecto debe quedar como un portafolio fotográfico individual.

ELIMINAR:

- Blog
- Travel
- Discover
- Mapbox
- Cities

CONSERVAR:

- Next.js
- React
- Dashboard
- autenticación
- PostgreSQL
- Drizzle
- fotografías
- galerías
- almacenamiento S3-compatible
- RustFS
- compatibilidad R2
- EXIF automático
- perfil
- servicios
- contacto

La navegación pública debe ser:

Inicio
Galerías
Sobre mí
Servicios
Contacto

La navegación del dashboard debe ser:

Resumen
Galerías
Fotografías
Perfil
Configuración

==================================================
33. PROGRESO
==================================================

Por cada proceso ejecutado agregar en el archivo PROGRESO.md, para saber hasta que parte va del plan.

==================================================
33. REPORTE FINAL
==================================================

Al finalizar, entregar un reporte en un archivo llamado RESULTADOS.md indicando:

1. Archivos eliminados.
2. Archivos modificados.
3. Archivos creados.
4. Rutas eliminadas.
5. Rutas creadas.
6. Modelos eliminados.
7. Modelos modificados.
8. Migraciones realizadas.
9. Datos migrados.
10. Dependencias eliminadas.
11. Variables de entorno eliminadas.
12. Funcionalidades conservadas.
13. Cambios realizados en Dockerfile.
14. Cambios realizados en docker-compose.standalone.yml.
15. Estrategia de Hot Reload.
16. Estrategia de volúmenes.
17. Estrategia de cache de dependencias.
18. Estrategia de migraciones.
19. Solución aplicada al problema de Bun/Next.js.
20. Comandos finales para desarrollo local.
21. Comandos finales para producción.

También indicar explícitamente:

- cómo levantar el proyecto localmente
- cómo detenerlo
- cómo reconstruir únicamente cuando sea necesario
- cómo ejecutar migraciones
- cómo acceder al dashboard
- cómo acceder a RustFS
- cómo levantar el entorno de producción

==================================================
REGLA FINAL
==================================================

NO realizar cambios destructivos sin verificar previamente
las dependencias y relaciones existentes.

NO perder datos.

NO eliminar fotografías.

NO eliminar el sistema de almacenamiento.

NO romper autenticación.

NO romper el dashboard.

NO romper galerías.

NO romper el flujo de subida de fotografías.

La prioridad es obtener un proyecto más simple, enfocado y rápido
para desarrollo local, manteniendo una arquitectura limpia para
producción.


## RESTRICCIONES Y SUPUESTOS

- Nunca hagas push, pull o cualquier otro comando hacia el proyecto de GIT.
- Al finalizar la ejecución, documenta los resultados en RESULTADOS.md (reemplaza la versión anterior)
- No asumas nada. Pregunta para aclaraciones.