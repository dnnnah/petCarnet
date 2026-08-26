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

**Estado:** Pendiente
**Fecha:** —

### Tareas planificadas
- Crear página `/perfil/[id]/vacunas` con timeline vertical completa
- Componente `VaccineDetailCard` con todos los campos de `PetVaccine`
- Actualizar `VaccineTimeline` para que "Ver cartilla completa" apunte a la nueva ruta
- Eliminar `.slice(0, 3)` hardcodeado en `toProfileProps`
- Agregar `generateStaticParams` a la nueva ruta

---

## FASE 2 — QR real

**Estado:** Pendiente
**Fecha:** —

### Tareas planificadas
- Instalar `qrcode.react`
- Reemplazar placeholder CSS `.qr-grid` con QR funcional
- Funcionalidad de descarga QR como PNG
- Variante QR para impresión en collar
- Eliminar clase `.qr-grid` de `globals.css`

---

## FASE 3 — Documentos mejorados

**Estado:** Pendiente
**Fecha:** —

### Tareas planificadas
- Filtrado por categoría en `/documentos`
- Empty state por categoría
- Preview de imágenes con `next/image`
- Lightbox/modal para imágenes
- Ícono diferenciado por tipo de archivo
- Componente `DocumentPreview` reutilizable

---

## FASE 4 — HealthCard expandida

**Estado:** Pendiente
**Fecha:** —

### Tareas planificadas
- Mostrar `medicamentosActuales[]` y `dietaEspecial` (campos existentes pero no renderizados)
- Hacer funcional el botón "Ver más detalles" (expandir/colapsar inline)
- Empty states bonitos para secciones vacías

---

## FASE 5 — Generador de imagen de alerta

**Estado:** Pendiente
**Fecha:** —

### Tareas planificadas
- Instalar `html2canvas`
- Componente `LostPetAlertImage` con template predefinido
- Formulario pre-rellenado `LostPetAlertForm`
- Preview en tiempo real
- Botón descarga como PNG
- Botón compartir (Web Share API + fallback)
- Toggle activar/desactivar modo perdida

---

## FASE 6 — Pulido UI/UX

**Estado:** Pendiente
**Fecha:** —

### Tareas planificadas
- Hacer funcionales botones dead
- Loading states con Suspense
- Navegación sticky entre secciones del perfil
- Responsive audit
- Metadata/SEO mejorada (Open Graph, schema.org)
- Animaciones con Framer Motion

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
