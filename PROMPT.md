# PROMPT.md — Portafolio Fotográfico | Contenido Administrable

## Rol del agente

Actúa como desarrollador senior sobre el repositorio existente.

Antes de modificar cualquier archivo:

- Lee `AGENTS.md`.
- Respeta las decisiones registradas en `DECISIONS.md`.
- Implementa únicamente el alcance definido en este documento.
- Mantén la arquitectura, convenciones y estilo del proyecto.
- No reescribas funcionalidades fuera del alcance solicitado.

---

# Reglas de ejecución

## Antes de modificar

1. Explora el proyecto antes de editar archivos.
2. Usa `rg`, `grep` o `glob` para localizar todas las referencias relacionadas.
3. Lee los archivos vecinos para entender patrones existentes.
4. Identifica:
   - modelos
   - componentes
   - routers
   - queries
   - mutations
   - hooks
   - utilidades
   - constantes
5. No hagas suposiciones cuando el código pueda confirmarlas.

## Durante la implementación

- Haz cambios mínimos y enfocados.
- Mantén TypeScript estricto.
- Evita `any` siempre que sea posible.
- Reutiliza componentes y utilidades existentes.
- No cambies el diseño visual salvo donde sea necesario para consumir datos dinámicos.
- No agregues comentarios innecesarios.

## Manejo de errores

- Sigue el patrón existente del proyecto.
- Usa el logger existente si aplica.
- No ocultes errores silenciosamente.

## Verificación

Antes de finalizar:

- Ejecutar lint si existe.
- Ejecutar typecheck si existe.
- Verificar imports rotos.
- Verificar build si aplica.

## Restricciones

Nunca ejecutar:

- `git push`
- `git pull`
- `git commit`
- `git merge`
- cualquier comando que modifique el repositorio remoto.

---

# Objetivo

Eliminar el contenido hardcodeado del portafolio y convertirlo en contenido administrable desde el dashboard.

El diseño visual debe mantenerse prácticamente igual.

El usuario final debe poder modificar su información sin editar el código.

---

# Contexto

Actualmente existen múltiples textos e imágenes escritos directamente en el código.

Ejemplos:

- nombre del fotógrafo
- profesión
- biografía
- redes sociales
- avatar
- imagen de portada (`bg.jpg`)
- servicios
- contenido mostrado en `/about`

Todo este contenido debe almacenarse en la base de datos y administrarse desde el panel administrativo.

---

# Alcance

## 1. Perfil del fotógrafo

Actualmente existe una estructura similar a:

```ts
name: "Sera"
role: "Photographer"
bio: "I'm Sera..."
avatar: "/avatar.jpg"
```

Debe convertirse en información administrable.

### Campos

- Nombre
- Profesión
- Biografía
- Avatar

El frontend debe seguir mostrando exactamente estos datos, pero obtenidos dinámicamente.

---

## 2. Redes sociales

Actualmente existe una estructura similar a:

```ts
socialLinks: [
  { title: "Instagram", href: "..." },
  { title: "GitHub", href: "..." },
  { title: "Instagram", href: "..." },
  { title: "Contact me", href: "...", primary: true }
]
```

Mantener exactamente **4 enlaces configurables**.

Cada enlace debe permitir modificar:

- título
- URL

El enlace principal (`primary`) debe seguir existiendo y poder modificarse desde el dashboard.

No aumentar ni reducir la cantidad de enlaces.

---

## 3. Eliminar Gear

Eliminar completamente el concepto de **Gear**.

Debe desaparecer de:

- frontend
- dashboard
- modelos
- componentes
- consultas
- tipos
- constantes

Siempre que no tenga dependencias con otras funcionalidades.

---

## 4. Sustituir Gear por Servicios

En lugar de Gear utilizar:

```ts
services: [
  {
    title: "...",
    description: "..."
  }
]
```

Los servicios deben ser administrables.

### Operaciones

- listar
- crear
- editar
- eliminar

Si ya existe un sistema reutilizable de ordenamiento, aprovecharlo.

---

## 5. About

Actualmente `/about` muestra Gear.

Debe mostrar Servicios.

No crear una página independiente de Servicios.

La apariencia visual debe mantenerse lo más cercana posible.

---

## 6. Imagen de portada

Actualmente existen referencias a `bg.jpg`.

Buscar todas las referencias equivalentes y reemplazarlas por una imagen administrable.

### Requisitos

- subir imagen desde el dashboard
- utilizar el sistema de almacenamiento existente
- actualizar automáticamente la portada pública

No asumir que existe una única referencia.

---

# Backend esperado

El dashboard debe permitir administrar:

- Perfil
- Redes sociales
- Servicios
- Imagen de portada

El contenido debe persistirse correctamente y dejar de depender de constantes hardcodeadas.

---

# Frontend esperado

El diseño debe mantenerse prácticamente igual.

Los únicos cambios permitidos son:

- consumir datos dinámicos
- mostrar avatar dinámico
- mostrar portada dinámica
- mostrar servicios dinámicos
- mostrar perfil dinámico
- mostrar redes dinámicas

No rediseñar componentes.

---

# Arquitectura

Antes de implementar:

- localizar todas las referencias hardcodeadas
- identificar cómo se cargan actualmente
- determinar si ya existe un modelo equivalente
- reutilizar estructuras existentes

No crear tablas duplicadas.

Mantener compatibilidad con:

- Next.js
- React
- TypeScript
- Drizzle
- PostgreSQL
- Better Auth
- RustFS
- almacenamiento existente

---

# Riesgos a revisar

Analizar especialmente:

- referencias múltiples a `bg.jpg`
- Hero
- About
- componentes reutilizados
- seeds con datos hardcodeados
- constantes compartidas
- hooks reutilizados

No dejar referencias antiguas después de la migración.

---

# Criterios de aceptación

## Perfil

- [ ] Nombre editable.
- [ ] Profesión editable.
- [ ] Biografía editable.
- [ ] Avatar editable.

## Redes sociales

- [ ] Existen exactamente cuatro enlaces.
- [ ] Se puede editar título.
- [ ] Se puede editar URL.
- [ ] El botón principal sigue funcionando.

## Servicios

- [ ] Gear desaparece completamente.
- [ ] About muestra Servicios.
- [ ] Se pueden crear servicios.
- [ ] Se pueden editar servicios.
- [ ] Se pueden eliminar servicios.

## Portada

- [ ] `bg.jpg` deja de ser fijo.
- [ ] El usuario puede subir una nueva portada.
- [ ] La portada pública cambia automáticamente.

## Integridad

- [ ] TypeScript sin errores.
- [ ] Build exitoso.
- [ ] Dashboard funcional.
- [ ] Sin imports rotos.

---

# Validaciones finales

Comprobar:

1. La aplicación inicia correctamente.
2. Login funciona.
3. Dashboard funciona.
4. Se puede editar el perfil.
5. Se puede cambiar el avatar.
6. Se pueden editar las redes.
7. Se pueden guardar las redes.
8. Se pueden crear servicios.
9. Se pueden editar servicios.
10. Se pueden eliminar servicios.
11. About muestra Servicios.
12. La portada puede cambiarse.
13. RustFS continúa funcionando.
14. PostgreSQL continúa funcionando.
15. No existen errores TypeScript.
16. No existen errores de build.

---

# Entregables obligatorios

Al finalizar:

## Actualizar `RESULTADOS.md`

Reemplazar completamente su contenido con:

- objetivo implementado
- archivos modificados
- modelos modificados
- migraciones realizadas
- endpoints creados o modificados
- componentes modificados
- validaciones realizadas

## Explicar

Cómo el usuario administra ahora:

- Perfil
- Redes sociales
- Servicios
- Imagen de portada

## Informar

- limitaciones encontradas
- posibles mejoras futuras relacionadas con este módulo

---

# Resultado esperado

El fotógrafo debe poder administrar completamente su identidad pública desde el dashboard sin modificar el código.

Debe poder modificar:

- Nombre
- Profesión
- Biografía
- Avatar
- Cuatro redes sociales
- Servicios
- Imagen de portada

El sitio debe conservar su apariencia actual, pero toda la información mostrada debe provenir del backend en lugar de estar hardcodeada.