# PetCarnet — Registro de Fases

Registro de avances, cambios y decisiones tomadas durante el desarrollo.

---

## Skills instaladas

Skills de agente disponibles en este proyecto (`.agents/skills/`):

| Skill | Fuente |
| --- | --- |
| `vercel-react-best-practices` | https://github.com/vercel-labs/agent-skills |
| `nextjs-app-router-patterns` | https://github.com/wshobson/agents |
| `frontend-design` | https://github.com/anthropics/skills |
| `tailwind-css-patterns` | https://github.com/giuseppe-trisciuoglio/developer-kit |
| `typescript-pro` | https://github.com/jeffallan/claude-skills |

**Fecha de instalación:** 2026-08-28

---

## FASE 15 — Seguridad de dependencias: upgrade de Next.js y audit limpio (PR `feat/next-seguridad`)

**Estado:** Completada
**Fecha:** 2026-09-14

Resuelve el hallazgo **A1 / R-3** (ALTA→CRÍTICA) de la auditoría FASE 0. Corresponde al **PR #1 de la secuencia coordinada** de FASE 1 (§9 de `FASE0_COORDINACION_A_B.md`), que permanecía pendiente tras integrarse los PRs 2-5.

### 15.1 Upgrade de Next.js y ESLint

- `next` `16.2.9` → `16.3.5` (versión `latest`, patch de seguridad de la misma familia 16.x).
- `eslint-config-next` `16.2.9` → `16.3.5` (alineado al runtime).
- Compatibilidad verificada: peers exigen `react ^19`; el proyecto usa `react@19.2.4` → sin divergencia de versión.

### 15.2 Vulnerabilidades corregidas

| Severidad | Paquete | Detalle |
| --- | --- | --- |
| CRÍTICA | `next` | Middleware/Proxy bypass en App Router con Turbopack y single locale (GHSA, RCE). Resuelto en 16.3.5. |
| ALTA | `sharp` (transitiva de `next/image`) | CVEs de libvips/libheif; resuelto por el binario de 16.3.5. |
| ALTA | `postcss` | XSS por `</style>` sin escapar en la salida de stringify (build-time); resuelto vía dependencias de 16.3.5. |
| ALTA | `browserslist`, `brace-expansion`, `js-yaml` | DoS / consumo CPU (toolchain de build). |
| MODERADA | `@tailwindcss/postcss`, `baseline-browser-mapping` | actualizadas a versiones seguras con `npm audit fix` (sin `--force`). |

**Resultado:** `npm audit` → **0 vulnerabilidades** (antes: 1 crítica, 5 altas, 2 moderadas).

### 15.3 Cambios

- `package.json`: solo `next` y `eslint-config-next` (versiones exactas).
- `package-lock.json`: regenerado (transitivas del toolchain en rangos seguros).
- **Sin cambios de código funcional**: no se tocan capas `lib/`, `data/`, componentes ni rutas.

### 15.4 Verificación

- `npm run lint` ✅ · `npm run typecheck` ✅ · `npm test` ✅ (31 pruebas, 3 archivos).
- `npm run build` ✅ (SSG completo: 22 variantes de perfil + home/licencia).
- Smoke test con `npm start` (servidor de producción): 200 en `/`, `/perfil/<id>`, `/perfil/<codigoPublico>`, `/alerta`, `/vacunas`, `/documentos`, `/login`, `/docs/lucca/cartilla-vacunacion.pdf`, `/docs/viserys/cartilla-vacunacion.pdf`; 404 correcto en `/perfil/inexistente` y `/perfil/<código inexistente>`; `/ _next/image` devuelve `200 image/jpeg` (optimizador funcional, superficie de la amenaza A1).
- `npm audit` → 0.

---

## FASE 14 — Higiene de datos y validación de `mascotas.json` (PR2 `fix/data-higiene`)

**Estado:** Completada
**Fecha:** 2026-09-14

Rama `fix/data-higiene`. Elimina el drift entre `mascotas.json` y `PetProfile`, remplaza el cast silencioso `as PetProfile[]` por una validación real en runtime y documenta avisos no bloqueantes.

### 14.1 Correcciones de datos

- Tallas fuera del enum `PetSize`: `chicharrona` y `freya` tenían `"Pequeña"` (→ `"Pequeño"`), `arya` `"Mediana"` (→ `"Mediano"`).
- Sentineles inconsistentes en salud normalizados a `[]`: `alergias: ["Ninguna registrada"]` y `condicionesMedicas: ["Ninguna"]` en `lucca` y `niko`, y `alergias: ["Ninguna registrada"]` en `alix`. `HealthCard` ya manejaba arrays vacíos, por lo que no requirió cambios de UI (los sentineles se conservan como aviso en el validador para detectar regresiones).

### 14.2 Validación real de datos (nuevo `src/lib/dataValidation.ts`)

- `collectValidationErrors(data)` — valida estructura y tipos contra `PetProfile`: enums cerrados (`especie`, `estado`, `genero`, `talla`, `estatus` de vacunas, `tipo`/`categoria` de documentos), fechas `YYYY-MM-DD`, objetos anidados, arrays de strings, `null` permitido (`microchip`, campos de emergencia), unicidad de `id` y `codigoPublico`, patrón `PC-XXX-NNN`.
- `assertValidPetProfiles(data): asserts data is PetProfile[]` — lanza con el listado completo de errores (fails fast en build/dev) y estrecha el tipo sin `as`.
- `collectDataWarnings(data)` — avisos no bloqueantes: sentineles de salud, teléfonos no mexicanos, desajuste `telefonoPrincipal` vs `whatsapp`, teléfono compartido por muchas mascotas y campo `notas` vacío.

### 14.3 Eliminación del cast en `getAllPets`

- `src/lib/getAllPets.ts` ya no usa `mascotas as PetProfile[]`; valida al cargar el módulo (`assertValidPetProfiles`) y devuelve `PetProfile[]` con el tipo garantizado por la aserción.
- Ahora un drift de datos rompe la compilación/build en tiempo de ejecución en lugar de propagarse de forma silenciosa.

### 14.4 CLI `npm run validate:data`

- Nuevo `scripts/validate-data.mts` ejecutable con el type stripping de Node (sin compilación ni dependencias). Ejecuta la validación estructural + informe de avisos + comprobación de que existan los assets referenciados en `public/`.
- `tsconfig.json`: se habilita `allowImportingTsExtensions` (requisito de los imports `.ts` del CLI bajo `noEmit`).

### 14.5 Avisos pendientes (sin cambios en datos)

- Las 8 mascotas de la familia (loki, viserys, frey, sandor, bizcocho, chicharrona, freya, arya) comparten idénticos `telefonoPrincipal` y `whatsapp` = `552201296480`, formato no mexicano → posible placeholder. **Pendiente de verificar en producción**; no se inventan números.
- `alix`: `telefonoPrincipal` (10 dígitos) no coincide con `whatsapp` (`521...`).
- `notas` vacío en 8 mascotas (válido como `string`, aviso informativo).
- Los SVG legacy `public/pets/*.svg` (incl. `chicarrona.svg`, huérfano del rename) no tienen referencias en `src/` ni en los datos; se conservan sin uso.

### 14.6 Tests

- `src/lib/dataValidation.test.ts` (+16 pruebas): datos reales válidos, rechazo de enums inválidos, duplicados, fechas, microchip y avisos de sentineles/placeholders. Suite total: **31 pruebas pasando**.

---

## FASE 13 — URL pública estable del perfil (PR1 `fix/qr-url-estable`)

**Estado:** Completada
**Fecha:** 2026-09-14

Rama `fix/qr-url-estable` (commits en español, Conventional Commits). Resuelve C1 / R-2 / U-1 / M1 / DT2 / DT3: se eliminan las URLs de QR hardcodeadas y se introduce una única fuente de verdad para la URL pública del perfil, alineada a la arquitectura `Domain → Services → Mapping → View Models → UI` y al principio del roadmap «El QR identifica, no almacena».

### 13.1 Contrato del servicio de URL pública

Nuevo servicio `src/lib/services/publicProfileUrl.ts`:

- `getPublicProfileUrl(source): string | null` — construye la URL canónica del perfil a partir del **identificador público estable** `codigoPublico`. Acepta `string` (`getPublicProfileUrl("PC-LUCCA-001")`) o un perfil/objeto `{ identificacion: { codigoPublico } }`. **No depende de `pet.id`.**
- Ruta canónica producida: `/perfil/<codigoPublico>`.
- Base URL: se toma de `NEXT_PUBLIC_APP_URL` (normalizada sin barra final); sin variable definida devuelve ruta relativa (funciona en cualquier origin / localhost).
- Datos inválidos (vacío, en blanco, ausente) → `null` (convención del proyecto: degradación suave, sin excepciones propias).

### 13.2 Navegación con alias estable de `codigoPublico`

- `getPetById` ahora resuelve tanto por `pet.id` como por `pet.identificacion.codigoPublico` (alias estable).
- `generateStaticParams` de las 4 rutas de perfil (`/perfil/[id]`, `/alerta`, `/vacunas`, `/documentos`) pre-renderiza ambas variantes. Los enlaces internos (home, navbar) siguen usando `pet.id`; el QR usa la ruta canónica por `codigoPublico`.

### 13.3 Consumidores migrados al contrato

- `QRShareCard` recibe `profileUrl` ya resuelto (elimina el `https://petcarnet.app` hardcodeado y deja de construir URLs).
- `LostPetAlertForm` usa `getPublicProfileUrl(pet)` para el texto compartido y el QR de la imagen de alerta.
- Campo `qr` (muerto: `urlPublica`/`texto`) eliminado de `PetProfile` y de `mascotas.json` (11 mascotas).

### 13.4 Tooling de calidad

- Agregado `vitest` con `vitest.config.ts` (alias `@` → `src`, entorno node).
- Scripts: `npm run test` (vitest) y `npm run typecheck` (`tsc --noEmit`).
- Pruebas unitarias del contrato en `src/lib/services/publicProfileUrl.test.ts` y del alias en `src/lib/getPetById.test.ts`.

---

## FASE 12 — Mejoras de dark mode, fix de descarga de alerta y menú compacto

**Estado:** Completada
**Fecha:** 2026-08-29

Rama `feat/rediseno-ui` (commits en español, Conventional Commits). Mejoras aplicando las reglas de la skill `vercel-react-best-practices` y corrección de un bug reportado de la visualización/descarga de la imagen de alerta.

### 12.1 Modo oscuro según mejores prácticas de Vercel
- `layout.tsx`: script inline síncrono en `<head>` que aplica la clase `dark` y `color-scheme` antes de la hidratación, eliminando el flash de tema claro→oscuro al cargar (regla `rendering-hydration-no-flicker`).
- `providers.tsx`: clave de `localStorage` versionada (`petcarnet-theme:v1`) con **migración** automática desde la clave anterior sin versión (regla `client-localstorage-schema`); cache en memoria de las lecturas de storage (regla `js-cache-storage`).
- Tema gestionado con `useSyncExternalStore` (`getServerSnapshot = "light"`), lo que **elimina el hydration mismatch** que ocurría en SSG (el render servidor `light` difería del cliente `dark` por `prefers-color-scheme`), respetando la regla `set-state-in-effect`.
- Verificado en browser: 0 errores de consola tras estos cambios.

### 12.2 Fix descarga/compartir del generador de alerta
- **Causa raíz:** `html2canvas` no soporta los colores modernos (`oklab`/`lab`) que genera Tailwind CSS v4; al capturar la vista previa (que usa un gradiente) lanzaba `Attempting to parse an unsupported color function "lab"` y la imagen no se generaba → no se podía descargar ni compartir.
- **Solución:** reemplazo de `html2canvas` por **`html-to-image`**, que renderiza vía SVG `foreignObject` usando el motor del navegador y soporta los colores v4. Se elimina la precarga innecesaria a data URL y se valida el `blob` antes de compartir.
- Verificado en browser: la descarga genera un PNG válido (686×1788, RGBA, con foto y gradiente) con 0 errores de consola.

### 12.3 Menú de navegación más compacto
- `SiteNav.tsx`: reducido el espaciado del `nav` y de los enlaces; la huella de PawPrint queda pegada al texto "Inicio" (gap `gap-1`, icono de 15px) y se compactan los paddings.

### 12.4 Fix dark mode de subpáginas, menú agrupado, "Carnet Digital" y story en galería
- **Fix dark mode en Documentos/Vacunas/Alerta:** `SubpageHeader.tsx` recibía gradientes claros (`via-white`) sin variantes `dark:`, quedando como bloque blanco en modo oscuro. Se añade un overlay absoluto `hidden dark:block bg-gray-900 ring-gray-800` que lo tapa en dark; el icono decorativo pasa a `dark:text-gray-800`. Aplica automáticamente a Documentos, Vacunas, Alerta y Login. Se añaden también variantes `dark:` al enlace "Volver al perfil" en `alerta/page.tsx`.
- **Menú agrupado en un solo pill:** `SiteNav.tsx` reescrito como un único bloque agrupado (`divide-x rounded-full bg-white px-1.5 py-1.5 ring-1`) que junta la huella (Inicio) con Mascotas, Iniciar sesión y el botón de modo oscuro, separados por divisores verticales. En `<640px` los textos se ocultan (`hidden sm:inline`) y `Mascotas` gana el icono `Bone`, evitando desbordes; `AppShell.tsx` reduce su `gap` en mobile (`gap-2 sm:gap-4`) para que todo quepa junto al logo.
- **Subtítulo "Carnet Digital":** renombrado "Pasaporte Digital" → "Carnet Digital" en el header (`AppShell.tsx`), el hero (`page.tsx`) y la metadata de `layout.tsx` (título "PetCarnet | Carnet Digital").
- **Círculo de story en la galería:** `RecentPhotos.tsx` añade la prop `profilePhoto: string`; renderiza un círculo con ring tipo Instagram (gradiente `#feda75→#4f5bd5`, padding 3px, interior blanco/dark) con la foto de perfil de 64px y la etiqueta "Perfil". `perfil/[id]/page.tsx` pasa `profilePhoto={pet.mascota.fotoPerfilUrl}`.
- Verificado en browser: overlay `bg-gray-900` visible en dark en Documentos y Alerta; nav de 358px en desktop y 161px en mobile sin desborde; subtítulo y título "Carnet Digital" mostrados; 0 errores de consola.

### 12.5 Fix navbar del perfil, dark+WCAG en Instagram, imagen de alerta completa, modo alerta y filtro por especie
- **Navbar del perfil (ProfileNav):** los botones pasan a iconos de 18px e igual talla en todas las pantallas. En móvil son botones cuadrados de 40×40 centrados (solo el icono, con `h-10 w-10`); en `md+` mantienen icono + texto alineados (`md:h-auto md:w-auto`). El contenedor pasa a `w-full justify-between` para distribuir los botones con espacio uniforme (equivalente a `space-between`), llenando todo el ancho de la barra tanto en escritorio como en móvil.
- **Dark mode + WCAG en la sección Instagram (`RecentPhotos`):** el título, los chips (`pink`), el label "Perfil" y el grid ahora tienen variantes `dark:` con fondos translúcidos (`dark:bg-pink-500/15`, `dark:ring-pink-500/30`) y textos con contraste (`dark:text-pink-300`, `dark:text-gray-300`). El lightbox pasó a `dark:bg-gray-900` con textos e índices adaptados; los `alt` descriptivos se mantienen.
- **Imagen de alerta completa:** `LostPetAlertImage` deja de limitarse a `max-w-[480px]` y ocupa todo el ancho disponible (`w-full`). La vista previa se amplía a `max-w-3xl` y la captura/descarga sube a `pixelRatio: 3`, generando un PNG de ~2304×2565px (completo y nítido).
- **Modo alerta en el perfil restaurado:** nuevo hook `useLostAlerts` (localStorage versionado `petcarnet-alerta:v1:<id>`, con `useSyncExternalStore` para evitar hydration mismatch en SSG) que guarda zona/fecha/recompensa/mensaje. El generador de alerta (`LostPetAlertForm`) incorpora una tarjeta "Modo alerta en el perfil" para activar/desactivar. El perfil muestra vía `LostModeAlertSections` el banner "está perdido", las instrucciones y un panel con "Desactivar modo alerta" cuando está activo (además del flag estático `emergencia.perdido`).
- **Filtro por especie en la home:** nuevo componente cliente `PetsList` con chips "Todos / Perro / Gato", contador de resultados y estado vacío; reemplaza el listado estático del `GlassCard`.
- Verificado en browser: perfil con modo alerta muestra banner/instrucciones; preview de imagen 768px y PNG 2304×2565; filtro "Gato" muestra 8 mascotas; 0 errores de consola.

### Verificación Fase 12
- `tsc --noEmit` ✅ sin errores
- `npm run lint` ✅ sin errores
- `npm run build` ✅ compila y genera rutas SSG
- Prueba manual en browser (descarga de la imagen de alerta) ✅
- Prueba manual en browser (dark mode y responsive) ✅

### Dependencias
- **Añadida:** `html-to-image`
- **Eliminada:** `html2canvas`, `@types/html2canvas`

### Archivos modificados
- `src/app/layout.tsx`
- `src/app/providers.tsx`
- `src/components/features/lost-pet/LostPetAlertForm.tsx`
- `src/components/layout/SiteNav.tsx`
- `package.json`, `package-lock.json`

### Archivos de la sub-fase 12.4
- `src/components/ui/SubpageHeader.tsx`
- `src/components/layout/SiteNav.tsx`
- `src/components/layout/AppShell.tsx`
- `src/components/features/pet-profile/RecentPhotos.tsx`
- `src/app/page.tsx`
- `src/app/layout.tsx`
- `src/app/perfil/[id]/page.tsx`
- `src/app/perfil/[id]/alerta/page.tsx`

### Archivos de la sub-fase 12.5
- `src/components/features/pet-profile/ProfileNav.tsx`
- `src/components/features/pet-profile/RecentPhotos.tsx`
- `src/components/features/lost-pet/LostPetAlertImage.tsx`
- `src/components/features/lost-pet/LostPetAlertForm.tsx`
- `src/components/features/lost-pet/LostModeAlertSections.tsx` (creado)
- `src/components/features/home/PetsList.tsx` (creado)
- `src/lib/useLostAlerts.ts` (creado)
- `src/app/perfil/[id]/page.tsx`
- `src/app/page.tsx`

---

## FASE 11 — Rediseño de UI, Modo Noche y 9 correcciones

**Estado:** Completada
**Fecha:** 2026-08-29

Rama `feat/rediseno-ui` (commits en español, Conventional Commits). Rediseño de la interfaz, menú global, dark mode, y resolución de 9 problemas detectados. Se aplicaron las 5 skills instaladas (frontend-design, tailwind patterns, vercel-react, nextjs-app-router, typescript-pro).

### 11.1 Base de diseño: dark mode + tokens + menú global
- Tokens de color/superficie/sombra en `globals.css` con variantes `.dark`; patrón Tailwind v4 `@custom-variant dark`.
- `providers.tsx` nuevo: `ThemeProvider` + `useTheme` (persiste en `localStorage` `petcarnet-theme`, respeta `prefers-color-scheme`, aplica `color-scheme` y clase `.dark`).
- Menú global `SiteNav.tsx`: Inicio, Mascotas (/#mascotas), Iniciar sesión (placeholder `/login`) y toggle de modo noche.
- `layout.tsx`: envuelto en `ThemeProvider` + `suppressHydrationWarning`.
- `AppShell.tsx`: integrado `SiteNav`, eliminado badge "Perfil Verificado".
- **Fix**: corazón decorativo del hero ya no tapa el título "PetCarnet" en el rango `sm` (se quitó el decorativo que se superponía al `h1`).
- `app/login/page.tsx`: placeholder de login.
- **Nota lint:** corregido `set-state-in-effect` en `providers.tsx` con inicialización lazy del estado.

### 11.2 Fotos separadas de documentos + galería Instagram
- Los documentos de categoría `foto` se excluyen de la tarjeta "Documentos" y de la página de documentos (`profile.ts`, `documentos/page.tsx`); se quita la categoría/filtro "Fotos" de `documentCategory.ts`.
- `RecentPhotos.tsx` rediseñado como **galería estilo Instagram**: grid responsive, lightbox con `framer-motion` (`AnimatePresence` + `MotionConfig reducedMotion`), navegación con flechas y teclado, contador, vista previa.

### 11.3 Mini-nav del perfil
- `ProfileNav.tsx` rediseñado: contenedor segmentado (glow por debajo) con conmutador activo, soporte dark mode y `aria-current`.

### 11.4 Fix desborde de URL en QR
- `QRShareCard.tsx`: la URL ahora usa `break-all` para no desbordar; dark mode en la tarjeta.

### 11.5 Ubicación removida
- Quitado el botón "Ubicación" / enlace a Google Maps de `EmergencyContact.tsx` (se conserva el texto de zona/vecindario).
- Limpiados `locationUrl` y `locationLabel` del `ContactViewModel` en `profile.ts`.

### 11.6 Generador de alerta: cambiar foto + captura robusta
- `LostPetAlertForm.tsx`: opción "Cambiar foto" (subida de imagen local, vista previa, restaurar la del perfil) y captura `html2canvas` más robusta (sin `window`/`document` a nivel de módulo para no romper SSG; `scrollX/scrollY`, `windowWidth`, `allowTaint`, `logging`).

### 11.7 Dark mode en componentes restantes
- `.dark .soft-card` en `globals.css` hace los `GlassCard` oscuros automáticamente; `.dark body` con radial-gradients oscuros.
- `dark:` variants en: `Badge`, `SubpageHeader`, `PetHeader`, `page.tsx` (hero + card), `InfoCard`, `HealthCard`, `VetCard`, `VaccineTimeline`, `VaccineDetailCard`, `DocumentsCard`, `DocumentPreview`, `DocumentListClient`, `documentos/page`, `vacunas/page`, `LostPetBanner`, `LostPetInstructions`, `ThankYouBanner`, `LostPetAlertForm`, `EmergencyContact`.

### Verificación Fase 11
- `tsc --noEmit` ✅ sin errores
- `npm run lint` ✅ sin errores
- `npm run build` ✅ compila y genera 49 rutas SSG (home, login, perfil, alerta, documentos, vacunas + not-found + icon)

### Archivos creados
- `src/app/providers.tsx`
- `src/components/layout/SiteNav.tsx`
- `src/app/login/page.tsx`

### Archivos modificados
- `src/app/globals.css`
- `src/app/layout.tsx`
- `src/app/page.tsx`
- `src/components/layout/AppShell.tsx`
- `src/components/ui/GlassCard.tsx`, `Badge.tsx`, `SubpageHeader.tsx`
- `src/components/features/pet-profile/RecentPhotos.tsx`, `ProfileNav.tsx`, `PetHeader.tsx`, `EmergencyContact.tsx`, `QRShareCard.tsx`, `InfoCard.tsx`, `HealthCard.tsx`, `VetCard.tsx`, `VaccineTimeline.tsx`, `VaccineDetailCard.tsx`
- `src/components/features/documents/DocumentsCard.tsx`, `DocumentPreview.tsx`
- `src/components/features/lost-pet/LostPetAlertForm.tsx`, `LostPetBanner.tsx`, `LostPetInstructions.tsx`, `ThankYouBanner.tsx`
- `src/lib/mapping/profile.ts`
- `src/lib/domain/documentCategory.ts`
- `src/app/perfil/[id]/page.tsx`
- `src/app/perfil/[id]/documentos/page.tsx`
- `src/app/perfil/[id]/documentos/DocumentListClient.tsx`
- `src/app/perfil/[id]/vacunas/page.tsx`

---

## FASE 10 — Refactor de arquitectura (SOLID / DRY)

**Estado:** En progreso (Fases 10.1–10.3 completadas)
**Fecha:** 2026-08-27

Trabajo de limpieza de arquitectura con foco en SOLID, DRY y eliminación de deuda técnica. Se mantiene la arquitectura base (Next.js App Router + capas `types`/`lib`/`ui`/`features`/páginas), que ya era la correcta; se corrigen acoplamientos, duplicaciones y un bug latente.

### Objetivo
Dejar un proyecto con las piezas de dominio y presentación correctamente segregadas, sin lógica de negocio incrustada en la página, y eliminando la duplicación de estados/labels.

---

#### 10.1 Centralización de estados y categorías (FASE COMPLETADA)

##### 10.1.1 Módulo de dominio `vaccineStatus`
- **Nuevo** `src/lib/domain/vaccineStatus.ts`: fuente única de verdad para el estado de vacuna. Devuelve `{ label, icon, tones, iconTones }` para `al_dia | proxima_dosis | vencida`.
- **Bug corregido:** `toVaccineLabel` (antes en `page.tsx`) trataba `vencida` como "Al día"; ahora el estado "Vencida" se muestra correctamente en timeline, detalle y resumen.
- Consumidores actualizados:
  - `VaccineDetailCard.tsx`: eliminada la config local duplicada `statusConfig`; usa el módulo.
  - `VaccineTimeline.tsx`: usa `VaccineStatusLabel` tipado y el badge/lógica de "Próxima dosis".
  - `perfil/[id]/page.tsx`: eliminado `toVaccineLabel`; usa el módulo.
- Nueva función `getVaccineSummary(pet)` en `src/lib/mapping/vaccines.ts` para el resumen (al día / próximas / vencidas) de la página de vacunas.

##### 10.1.2 Módulo de dominio `documentCategory`
- **Nuevo** `src/lib/domain/documentCategory.ts`: registro único de categorías de documento con `{ label, icon, chipTones, activeTones }` y derivación de la lista de filtros (`todos` + 6 categorías).
- Consumidores actualizados (antes repetían labels/colores en 3 archivos):
  - `petDocuments.ts`: `getDocumentCategoryLabel` ahora re-exporta desde el módulo de dominio.
  - `DocumentFilters.tsx`: `filters[]`, `tones` y `activeTones` locales eliminados; usa `getDocumentFilterList()`.
  - `DocumentPreview.tsx`: `categoryIcons`/`categoryTones` local eliminados; usa `getDocumentCategoryMeta()`.

##### 10.1.3 Componente `SubpageHeader`
- **Nuevo** `src/components/ui/SubpageHeader.tsx`: hero parametrizado `{ eyebrow, eyebrowTone, title, description, icon, background }`.
- Reemplazó bloques hero duplicados en 3 páginas:
  - `documentos/page.tsx`
  - `alerta/page.tsx`
  - `vacunas/page.tsx`

##### 10.1.4 Código muerto eliminado
- `src/components/ui/SectionTitle.tsx` (sin uso en ningún lugar).
- `src/lib/constants.ts` (`TEMP_IMAGE_GUIDE`, sin uso).

### Errores o problemas encontrados
- **TS2367 / TS2322:** el tipo `DocumentFilterMeta` inicialmente extendía `DocumentCategoryMeta`, lo que provocaba que `"todos"` (no es una categoría) no compilara. Corregido separando los dos tipos.
- **Warning ESLint:** `FileText` importado sin usar en `DocumentPreview.tsx` tras la centralización. Eliminado.

### Verificación Fase 10.1
- `tsc --noEmit` ✅ sin errores
- `npm run lint` ✅ sin warnings
- `npm run build` ✅ compila y genera 48 páginas SSG

### Archivos modificados / creados
- `src/lib/domain/vaccineStatus.ts` — nuevo
- `src/lib/domain/documentCategory.ts` — nuevo
- `src/lib/mapping/vaccines.ts` — nuevo
- `src/components/ui/SubpageHeader.tsx` — nuevo
- `src/lib/petDocuments.ts` — re-export delegado
- `src/components/features/pet-profile/VaccineDetailCard.tsx` — usa módulo de dominio
- `src/components/features/pet-profile/VaccineTimeline.tsx` — usa módulo de dominio
- `src/components/features/pet-profile/DocumentFilters.tsx` — usa módulo de dominio
- `src/components/features/pet-profile/DocumentPreview.tsx` — usa módulo de dominio
- `src/app/perfil/[id]/page.tsx` — usa módulo de dominio para estado de vacuna
- `src/app/perfil/[id]/vacunas/page.tsx` — usa `SubpageHeader` y `getVaccineSummary`
- `src/app/perfil/[id]/documentos/page.tsx` — usa `SubpageHeader`
- `src/app/perfil/[id]/alerta/page.tsx` — usa `SubpageHeader`
- `src/components/ui/SectionTitle.tsx` — eliminado
- `src/lib/constants.ts` — eliminado

---

#### 10.2 Extracción de mappers a `lib/mapping` (FASE COMPLETADA)

##### 10.2.1 Mapper de perfil
- **Nuevo** `src/lib/mapping/profile.ts`: concentra toda la lógica de transformación `PetProfile → ProfileViewModel` que antes vivía en `perfil/[id]/page.tsx`.
  - `toProfileViewModel(pet)` (antes `toProfileProps`).
  - `formatPhoneForDisplay`.
  - Tipos del view-model exportados: `PetHeaderViewModel`, `ContactViewModel`, `InfoViewModel`, `HealthViewModel`, `VetViewModel`, `VaccineTimelineItem`, `PhotoViewModel`, `ProfileViewModel`.
- **Mejora SOLID/SRP:** la página dejó de ser un "adaptador dominio→presentación". Ahora es un orquestador fino (fetch + `notFound` + render) que depende de una abstracción (el mapper) y no del formato crudo (principio de inversión de dependencias).
- `formatPhoneForDisplay` ahora es consumible/reutilizable; si más adelante hay otra página que formatee teléfonos, se usa el mismo helper.
- `perfil/[id]/page.tsx`: eliminadas las ~90 líneas de `toProfileProps`/`formatPhoneForDisplay`.

### Verificación Fase 10.2
- `tsc --noEmit` ✅ sin errores
- `npm run lint` ✅ sin warnings

### Archivos modificados / creados
- `src/lib/mapping/profile.ts` — nuevo (mapper de perfil)
- `src/app/perfil/[id]/page.tsx` — usa `toProfileViewModel`; lógica del mapper removida

---

#### 10.3 Reorganización por feature y helpers (FASE COMPLETADA)

##### 10.3.1 Reorganización por feature
Se agruparon los componentes por responsabilidad de negocio (feature-slicing) para que el feature "perfil" deje de mezclar responsabilidades:
- **`src/components/features/lost-pet/`** (nueva): `LostPetBanner`, `LostPetInstructions`, `ThankYouBanner`, `LostPetAlertForm`, `LostPetAlertImage`.
- **`src/components/features/documents/`** (nueva): `DocumentsCard`, `DocumentFilters`, `DocumentPreview`.
- **`src/components/features/pet-profile/`**: conserva Header, Info, Salud, Veterinario, Contacto, Fotos, Navegación, QR y Vacunas.

Actualizados todos los imports afectados:
- `perfil/[id]/page.tsx`, `perfil/[id]/alerta/page.tsx`, `perfil/[id]/documentos/DocumentListClient.tsx`, `documents/DocumentsCard.tsx`.

##### 10.3.2 Helper de icono de especie
- **Nuevo** `src/lib/petIcon.tsx`: componente `PetSpeciesIcon` que retorna `Cat`/`Dog` por especie.
- Reemplazó el patrón duplicado `species.toLowerCase().includes("gato") ? Cat : Dog` en 4 lugares: `Home (page.tsx)`, `EmergencyContact`, `VetCard`, `ThankYouBanner`.
- **Problema encontrado:** la versión inicial (`getPetIcon` que retornaba el componente) disparaba la regla de eslint `react-hooks/static-components` ("Cannot create components during render"). Resuelto convirtiéndolo en componente `PetSpeciesIcon`.

##### 10.3.3 Helper `getPetOrNotFound`
- **Nuevo** `src/lib/getPetOrNotFound.ts`: envuelve `getPetById` + `notFound()`.
- Eliminó la repetición del patrón `if (!pet) { notFound(); }` en el cuerpo de las 4 páginas de perfil (`perfil`, `vacunas`, `documentos`, `alerta`).
- `generateMetadata` sigue usando `getPetById` + comprobación (ahí no se lanza `notFound`, se devuelve metadata "no encontrada").

##### 10.3.4 Limpieza de `DocumentsCard`
- Eliminado el filtro redundante `documents.filter((document) => document.visiblePublico)`: los documentos que recibe ya son públicos (filtrados en el mapper).

### Errores o problemas encontrados
- **ESLint `react-hooks/static-components`:** crear un componente dentro del render (asignando `const PetIcon = getPetIcon(species)`) está prohibido. Se resolvió con un componente estático `PetSpeciesIcon`.
- **TS2304** temporal: al mover `page.tsx` al helper, se quitó el import `getPetById` que `generateMetadata` aún necesitaba. Restaurado.

### Verificación Fase 10.3
- `tsc --noEmit` ✅ sin errores
- `npm run lint` ✅ sin warnings
- `npm run build` ✅ compila y genera 48 páginas SSG

### Archivos modificados / creados
- `src/components/features/lost-pet/` — carpeta nueva con 5 componentes movidos
- `src/components/features/documents/` — carpeta nueva con 3 componentes movidos
- `src/lib/petIcon.tsx` — nuevo (`PetSpeciesIcon`)
- `src/lib/getPetOrNotFound.ts` — nuevo
- `src/app/page.tsx` — usa `PetSpeciesIcon`
- `src/components/features/pet-profile/EmergencyContact.tsx` — usa `PetSpeciesIcon`
- `src/components/features/pet-profile/VetCard.tsx` — usa `PetSpeciesIcon`
- `src/components/features/lost-pet/ThankYouBanner.tsx` — usa `PetSpeciesIcon`
- `src/components/features/documents/DocumentsCard.tsx` — filtro redundante eliminado
- `src/app/perfil/[id]/page.tsx`, `vacunas/page.tsx`, `documentos/page.tsx`, `alerta/page.tsx` — usan `getPetOrNotFound` y rutas actualizadas

---

## FASE 0 — Limpieza de datos y tipos

**Estado:** Completada
**Fecha:** 2026-08-26

### Tareas realizadas

#### 0.1 Limpieza de `mascotas.json`
- Eliminados todos los strings `"No hay"` que debían ser `null` o `""`
- Campos corregidos: `emergencia.recompensa`, `emergencia.fechaPerdida`, `emergencia.zonaPerdida`, `emergencia.mensajeEmergencia`, `identificacion.microchip`, `contacto.email`, `contacto.telefonoSecundario`
- **Problema encontrado:** Viserys tenía documentos con IDs de Chicharrona (`chicharrona-cartilla`, `chicharrona-vet`, etc.). Corregidos a `viserys-doc-*`
- Estandarizadas todas las fechas a formato `YYYY-MM-DD` (antes había mezcla de `MM/DD/YYYY` y `YYYY-MM-DD`)
- Agregados `id` únicos a todas las vacunas (`lucca-vac-1`, `niko-vac-2`, etc.)
- Renumerados IDs de documentos con prefijo consistente (`{mascota}-doc-{n}`)

#### 0.2 Refinamiento de `types/pet.ts`
- Agregado type alias `PetId = string` para consistencia
- `mascota.genero` cambiado de `string` a `PetGender` (union type: `"Macho" | "Hembra"`)
- `mascota.talla` cambiado de `string` a `PetSize` (union type: `"Pequeño" | "Mediano" | "Grande" | "Miniatura"`)
- Agregado campo `id: string` a la interfaz `PetVaccine`

#### 0.3 Actualización de helpers
- `formatOptionalMexicanDate` en `dateFormat.ts`: eliminado check innecesario de `"No hay"` (ya no existe en los datos)

### Errores o problemas encontrados
- Ninguno. TypeScript compila sin errores (`tsc --noEmit` exitoso).

### Archivos modificados
- `src/data/mascotas.json` — reescritura completa
- `src/types/pet.ts` — reescritura completa
- `src/lib/dateFormat.ts` — eliminación de check `"No hay"`

---

## FASE 1 — Vaccination Hub

**Estado:** Completada
**Fecha:** 2026-08-26

### Tareas realizadas
- Nueva ruta `/perfil/[id]/vacunas` con `generateStaticParams`
- Componente `VaccineDetailCard` con todos los campos de `PetVaccine` (nombre, fecha aplicación, próxima dosis, estatus, lote, veterinario, enlace a documento)
- `VaccineTimeline` actualizado: link funcional a `/vacunas`, badge de total de vacunas
- Eliminado `.slice(0, 3)` del perfil — ahora muestra todas las vacunas en la página dedicada
- Empty state cuando no hay vacunas registradas
- Resumen de estadísticas (al día, próximas, vencidas) en header de la página

### Archivos creados/modificados
- `src/app/perfil/[id]/vacunas/page.tsx` — nueva página
- `src/components/features/pet-profile/VaccineDetailCard.tsx` — nuevo componente
- `src/components/features/pet-profile/VaccineTimeline.tsx` — actualizado
- `src/app/perfil/[id]/page.tsx` — actualizado

---

## FASE 2 — QR real

**Estado:** Completada
**Fecha:** 2026-08-26

### Tareas realizadas
- Instalada `qrcode.react` para generar QR escaneable
- `QRShareCard` reescrito: genera QR real con URL completa (`https://petcarnet.app/perfil/{id}`)
- Funcionalidad de descarga QR como PNG (SVG → Canvas → PNG)
- Eliminada clase `.qr-grid` decorativa de `globals.css`

### Errores o problemas encontrados
- Ninguno.

### Archivos modificados
- `src/components/features/pet-profile/QRShareCard.tsx` — reescrito como client component
- `src/app/globals.css` — eliminada clase `.qr-grid`
- `package.json` — nueva dependencia `qrcode.react`

---

## FASE 3 — Documentos mejorados

**Estado:** Completada
**Fecha:** 2026-08-26

### Tareas realizadas
- Componente `DocumentPreview` con thumbnail real para imágenes y badge de tipo (PDF/IMG)
- Componente `DocumentFilters` con toggles por categoría (vacunas, veterinario, identificación, salud, fotos, otros)
- Página de documentos reescrita: server component + client component para filtros interactivos
- Empty state por categoría cuando no hay documentos
- `DocumentsCard` del perfil ahora usa `DocumentPreview` con thumbnails
- Conteo de documentos por categoría en badges de filtro

### Archivos creados/modificados
- `src/components/features/pet-profile/DocumentPreview.tsx` — nuevo
- `src/components/features/pet-profile/DocumentFilters.tsx` — nuevo
- `src/app/perfil/[id]/documentos/DocumentListClient.tsx` — nuevo
- `src/app/perfil/[id]/documentos/page.tsx` — reescrito
- `src/components/features/pet-profile/DocumentsCard.tsx` — actualizado

---

## FASE 4 — HealthCard expandida

**Estado:** Completada
**Fecha:** 2026-08-26

### Tareas realizadas
- Mostrar `medicamentosActuales[]` y `dietaEspecial` (campos que existían en el tipo pero no se renderizaban)
- Botón "Ver más detalles" ahora funciona: expand/collapse inline
- Empty states bonitos para alergias y condiciones vacías ("Sin alergias registradas", etc.)
- Actualizado `toProfileProps` para incluir `medications` y `diet`

### Archivos modificados
- `src/components/features/pet-profile/HealthCard.tsx` — reescrito
- `src/app/perfil/[id]/page.tsx` — actualizado `toProfileProps`

---

## FASE 5 — Generador de imagen de alerta

**Estado:** Completada
**Fecha:** 2026-08-26

### Tareas realizadas
- Instalada `html2canvas` para renderizar componente a PNG
- Componente `LostPetAlertImage`: template de imagen con "SE BUSCA", foto, nombre, raza, rasgos distintivos, zona perdida, fecha, recompensa, contacto, QR al perfil y branding PetCarnet
- Componente `LostPetAlertForm`: formulario pre-rellenado con datos de la mascota, editable antes de generar la imagen
- Descarga como PNG y compartido via Web Share API
- Nueva ruta `/perfil/[id]/alerta` con `generateStaticParams`
- Botón de acceso al generador desde el perfil de la mascota

### Errores o problemas encontrados
- `@types/html2canvas` desactualizado: la opción `scale` no existía en los tipos. Solucionado con `as Parameters<typeof html2canvas>[1]`

### Archivos creados/modificados
- `src/components/features/pet-profile/LostPetAlertImage.tsx` — nuevo
- `src/components/features/pet-profile/LostPetAlertForm.tsx` — nuevo
- `src/app/perfil/[id]/alerta/page.tsx` — nueva página
- `src/app/perfil/[id]/page.tsx` — agregado link al generador
- `package.json` — nueva dependencia `html2canvas`

---

## FASE 6 — Pulido UI/UX

**Estado:** Completada
**Fecha:** 2026-08-26

### Tareas realizadas
- Componente `ProfileNav`: navegación sticky con IntersectionObserver que resalta la sección visible
- Secciones del perfil con IDs para scroll suave (`contacto`, `info`, `salud`, `veterinario`, `vacunas`, `documentos`)
- Botón "Ver más detalles" de HealthCard funcional (completado en Fase 4)

### Pendiente para futuro
- Loading states con Suspense
- Responsive audit completo
- Metadata/SEO mejorada (Open Graph, schema.org)
- Animaciones con Framer Motion (instalado pero no usado)

### Archivos creados/modificados
- `src/components/features/pet-profile/ProfileNav.tsx` — nuevo
- `src/app/perfil/[id]/page.tsx` — agregados IDs de sección y ProfileNav

---

## FASE 7 — Corrección de Responsive Design

**Estado:** Completada
**Fecha:** 2026-08-26

### Auditoría realizada
Se identificaron 17 problemas de responsive design en 11 archivos. Se corrigieron todos los de mayor impacto.

### Cambios realizados

#### Layout y navegación
- **AppShell**: Decorative elements (`Sparkles`, `PawPrint`, `Heart`, `doodle-line`) ahora `hidden sm:block`. Logo reducido a `h-11 w-11` en mobile, `h-14 w-14` en sm+. Badge "Perfil Verificado" ahora muestra "Verificado" en mobile.
- **ProfileNav**: Agregado `scrollbar-hide` para scroll horizontal limpio en mobile, labels ocultos en mobile (`hidden sm:inline`).

#### Páginas
- **Home (`page.tsx`)**: Heading de `text-5xl` a `text-4xl sm:text-5xl`, sub-heading de `text-2xl` a `text-xl sm:text-2xl`.
- **Perfil (`perfil/[id]/page.tsx`)**: Grid info/health/vet de `lg:grid-cols-3` a `md:grid-cols-2 lg:grid-cols-3`. Grid documentos/QR de `lg:grid-cols-[1fr_280px]` a `md:grid-cols-[1fr_240px] lg:grid-cols-[1fr_280px]`.

#### Componentes
- **VaccineTimeline**: Eliminado `min-w-[720px]`, grid de `grid-cols-3` a `grid-cols-1 sm:grid-cols-2 lg:grid-cols-3`.
- **LostPetAlertImage**: Ancho de `w-[480px]` a `w-full max-w-[480px]`.
- **PetHeader**: Heading de `text-6xl sm:text-7xl lg:text-8xl` a `text-5xl sm:text-6xl lg:text-8xl`, sub-heading de `text-2xl` a `text-lg sm:text-2xl`.
- **LostPetBanner**: Padding de `p-5` a `p-4`, heading de `text-5xl` a `text-3xl sm:text-5xl`, textos y botón responsivos.
- **DocumentsCard**: Grid de `lg:grid-cols-3` a `md:grid-cols-2 lg:grid-cols-3`, card min-height reducido en mobile.
- **ThankYouBanner**: Heading de `text-3xl` a `text-xl sm:text-3xl`.

#### CSS
- Agregada utilidad `.scrollbar-hide` en `globals.css`.

### Archivos modificados
- `src/components/layout/AppShell.tsx`
- `src/components/features/pet-profile/VaccineTimeline.tsx`
- `src/components/features/pet-profile/PetHeader.tsx`
- `src/components/features/pet-profile/LostPetBanner.tsx`
- `src/components/features/pet-profile/LostPetAlertImage.tsx`
- `src/components/features/pet-profile/DocumentsCard.tsx`
- `src/components/features/pet-profile/ThankYouBanner.tsx`
- `src/components/features/pet-profile/ProfileNav.tsx`
- `src/app/page.tsx`
- `src/app/perfil/[id]/page.tsx`
- `src/app/globals.css`

---

## FASE 8 — Iconos de Género, Fotos Tipo Stories y Ajustes UI

**Estado:** Completada
**Fecha:** 2026-08-26

### Cambios realizados

#### Iconos de género
- **PetHeader**: Icono `VenusAndMars` reemplazado por `Mars` (azul, tone="blue") para Macho y `Venus` (rosa, tone="pink") para Hembra

#### Fotos recientes (tipo stories)
- **RecentPhotos**: Componente nuevo con thumbnails circulares estilo Instagram stories
- Anillo gradiente rosa/fucsia/ámbar en cada thumbnail
- Lightbox con animación `scale-in` al hacer clic
- Muestra nombre, fecha y descripción de la foto
- **ProfileNav**: Agregado item "Fotos" con icono Camera
- **globals.css**: Keyframe `scale-in` para animación del lightbox

#### Ajustes UI
- **next.config.ts**: `devIndicators: false` para ocultar el icono de Next.js Dev Tools
- **perfil/[id]/page.tsx**: Año dinámico con `new Date().getFullYear()`
- **QRShareCard**: Layout tablet corregido con `md:grid-cols-1`

### Archivos creados
- `src/components/features/pet-profile/RecentPhotos.tsx`

### Archivos modificados
- `src/components/features/pet-profile/PetHeader.tsx`
- `src/components/features/pet-profile/ProfileNav.tsx`
- `src/components/features/pet-profile/QRShareCard.tsx`
- `src/app/perfil/[id]/page.tsx`
- `src/app/globals.css`
- `next.config.ts`

---

## FASE 9+ — Supabase, Auth, Notificaciones (POSTERIOR)

**Estado:** No iniciada
**Fecha:** —

Contenido diferido para después de las fases core:
- Migración a Supabase (tablas, RLS, Storage)
- Sistema de login/registro
- Dashboard protegido con CRUD de mascotas
- Notificaciones push para alertas de mascota perdida
- Soporte multi-tenant (refugios, rescatistas)
