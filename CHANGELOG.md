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
