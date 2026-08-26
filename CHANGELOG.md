# PetCarnet — Registro de Fases

Registro de avances, cambios y decisiones tomadas durante el desarrollo.

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

## FASE 7+ — Supabase, Auth, Notificaciones (POSTERIOR)

**Estado:** No iniciada
**Fecha:** —

Contenido diferido para después de las fases core:
- Migración a Supabase (tablas, RLS, Storage)
- Sistema de login/registro
- Dashboard protegido con CRUD de mascotas
- Notificaciones push para alertas de mascota perdida
- Soporte multi-tenant (refugios, rescatistas)
