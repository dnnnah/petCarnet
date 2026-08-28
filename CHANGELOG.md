# PetCarnet — Registro de Fases

Registro de avances, cambios y decisiones tomadas durante el desarrollo.

---

## FASE 10 — Refactor de arquitectura (SOLID / DRY)

**Estado:** En progreso (Fase 10.1 completada)
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
