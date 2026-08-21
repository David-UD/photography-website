# PLAN.md — Plan de ejecución para `@PROMPT.md`

> Este archivo documenta el **plan paso a paso** para ejecutar cualquier
> actualización especificada en `@PROMPT.md`. Solo es planificación: **no se
> realizan cambios de código**. Una vez que el usuario llene la sección
> **ESPECIFICACIÓN** de `@PROMPT.md`, se sigue este plan.

---

## Fase 0 — Preparación

1. **Leer `@PROMPT.md`** completo, en especial la sección **ESPECIFICACIÓN**.
2. **Validar que la especificación esté completa** (objetivo, alcance, criterios
   de aceptación). Si falta información crítica, pedirla al usuario antes de
   continuar (usar la herramienta de preguntas), no asumir.
3. **Confirmar el entorno**: ramca de git actual, estado de `docker compose`
   (si aplica), y comandos de lint/typecheck disponibles en `package.json`.

---

## Fase 1 — Exploración (entender antes de cambiar)

4. **Mapear el área afectada** con búsquedas:
   - `grep` de palabras clave del objetivo (nombres de funciones, rutas, modelo).
   - `glob` para localizar archivos en los módulos sugeridos.
5. **Leer los archivos vecinos** de las zonas a tocar para captar:
   - convenciones de nombrado y tipado,
   - librerías ya usadas (ver `package.json` y imports),
   - patrones existentes (hooks, `useMutation`, server procedures, `keyToUrl`,
     `logger`, etc.).
6. **Identificar dependencias y puntos de integración**: dónde se llama lo que
   se va a modificar, y qué otras partes se verían afectadas (efecto dominó).
7. **Revisar tests existentes** y cómo se ejecutan, para no romperlos.

---

## Fase 2 — Diseño de la solución

8. **Redactar el enfoque** en lenguaje claro: qué archivos cambian y por qué.
9. **Confirmar que el plan cumple las REGLAS DE EJECUCIÓN** de `@PROMPT.md`:
   - cambios mínimos y enfocados,
   - respeto al estilo del repo,
   - type-safe, sin `any` innecesario,
   - manejo de errores consistente con `logger`,
   - sin comentarios superfluos.
10. **Listar riesgos / edge cases** y cómo cubrirlos (coincide con la sección 7
    de la especificación).
11. **Opcional**: si el cambio es grande o ambiguo, resumir el diseño al usuario
    y esperar confirmación antes de implementar.

---

## Fase 3 — Implementación

12. Seguir el orden de menor a mayor riesgo:
    - tipos/esquema primero,
    - lógica de servidor (procedures, client S3, utils),
    - hooks/cliente,
    - UI.
13. **Editar archivos existentes** preferentemente; crear nuevos solo si se
    requiere.
14. **Mantener trazabilidad** con los criterios de aceptación (sección 8).
15. **No commitear** salvo que el usuario lo pida.

---

## Fase 4 — Verificación

16. **Lint / typecheck** si están configurados:
    - `npm run lint` / `eslint`
    - typecheck del proyecto (ver `package.json`; si no existe script, intentar
      `tsc --noEmit` si TypeScript está disponible).
17. **Smoke test manual** cuando aplique:
    - si hay Docker, `docker compose -f docker-compose.standalone.yml up -d
      --force-recreate <servicio>` para variables de entorno nuevas,
    - recargar la UI y validar el comportamiento esperado.
18. **Revisar errores en consola** usando el `logger` y reportar cualquier
    `{}`/vacío (serializar el error real, no ocultarlo).
19. **Chequear criterios de aceptación** uno por uno y marcarlos.

---

## Fase 5 — Cierre

20. **Resumen conciso** al usuario: qué se cambió, dónde (`archivo:línea`), y
    cómo verificarlo.
21. **Notas de seguimiento**: configuración requerida (env vars), migraciones
    pendientes, o riesgos conocidos.

---

## Checklist rápido (ejecutar en orden)

- [ ] Fase 0: `@PROMPT.md` leído y especificación completa
- [ ] Fase 1: área mapeada y archivos vecinos leídos
- [ ] Fase 2: enfoque definido y alineado a reglas
- [ ] Fase 3: implementación mínima y enfocada
- [ ] Fase 4: lint/typecheck + verificación manual
- [ ] Fase 5: resumen y seguimiento entregados
