# Fase 9A — Arquitectura de Services

## Objetivo

Preparar la capa de Services y sus adapters para que la fuente de datos pueda
cambiar de *JSON estático* a *Supabase/DB* en fases futuras **sin rehacer la UI
ni los contratos de dominio**.

Esta fase **no** introduce Supabase, DB, Auth ni RLS. Prepara los puertos y
adapters, y consolida lo que ya estaba disperso.

## Principio

Arquitectura por capas y responsabilidades, **no** "Clean Architecture" ni
"Hexagonal" en sentido estricto. La siguiente dirección es la que se quiere
alcanzar:

```
UI (app/, components/)
  ↓
Services (queries de negocio; sin framework)
  ↓
Ports (domain/ — contrato, sin implementación)
  ↓
Adapters / Infrastructure (implementación concreta)
  ↓
Fuente de datos actual: src/data/*.json  ·  localStorage
```

Y la dirección futura, sin cambios por encima de `Ports`:

```
UI → Services → Ports ← Adapters ← Supabase
```

El **dominio** no depende de React, Next.js, Supabase, `localStorage`, `fetch`
ni de componentes. Los puertos viven en `domain/` porque son tipos puros sin
implementación; las implementaciones, en `infra/`.

> Convención heredada de FASE 8: los puertos se declaran en
> `src/lib/domain/<feature>/types.ts` (p. ej. `TelemetryClient`), los adapters en
> `src/lib/infra/<feature>/` y la API consumidora en `src/lib/services/<feature>/`.

## Mapa de la capa

| Capa | Ruta | Responsabilidad |
| --- | --- | --- |
| Domain | `src/lib/domain/` | Reglas de negocio y **puertos** (contratos de datos). Cero infraestructura. |
| Services | `src/lib/services/` | API de consulta que usa UI y componentes. Sin framework, sin `src/data`. |
| Infra | `src/lib/infra/` | Implementaciones de puertos y acceso a fuentes concretas. |
| Mapping | `src/lib/mapping/` | Frontera entre dominio y modelos de presentación. Sin cambios en esta fase. |

## Services existentes

### `src/lib/services/pets/queries.ts`

| Función | Comportamiento |
| --- | --- |
| `getAllPets()` | Mascotas con perfil propio. |
| `getPetById(id)` | Resuelve por `id` o `codigoPublico`; **`null`** si no existe. |
| `getAdoptionDemoPets()` | Catálogo de adopción del prototipo. |
| `getAllProfilePets()` | Perfiles propios + catálogo de adopción. |
| `getPetByIdAny(id)` | Perfil propio primero, luego adopción; `null` si no existe. |

### `src/lib/services/shelters/queries.ts`

| Función | Comportamiento |
| --- | --- |
| `getMockShelters()` | Refugios de la fuente de datos. |

## Puertos (`src/lib/domain/directory/types.ts`)

```ts
type PetDirectory = {
  listProfilePets(): PetProfile[];
  listAdoptionPets(): PetProfile[];
  findProfilePet(identifier: string): PetProfile | null;
  findAdoptionPet(identifier: string): PetProfile | null;
};

type ShelterDirectory = {
  listShelters(): Shelter[];
};
```

Convenciones del contrato:

- El identificador se recibe *trimmed* y contrasta contra `id` **o**
  `identificacion.codigoPublico` (alias estable de la URL canónica).
- "No existe" es **siempre `null`**, nunca `undefined`. Antes de esta fase
  `getPetById` devolvía `undefined` y `getPetByIdAny` devolvía `null`; se
  normalizó a `null` para que la UI pueda decidir con una sola regla.

## Adapters (`src/lib/infra/directory/`)

| Adapter | Fuente | Nota |
| --- | --- | --- |
| `staticPets.ts` | `mascotas.json` + `adopciones.mock.json` | Valida al cargar con `assertValidPetProfiles` (fail-fast en dev y build). |
| `staticShelters.ts` | `shelters.mock.json` | Valida al cargar con `assertValidShelters`. |

Son la **única** capa que conoce la existencia de `src/data/`. El guardián
`src/lib/architecture.test.ts` lo verifica: ningún otro fichero de `src/`
puede importar `@/data`.

## Fuente de datos actual

- Mascotas y refugios: JSON estático en `src/data/`, validado al importar.
- Alertas de pérdida y solicitudes de adopción: `localStorage` a través de
  `StorageLike` (`src/lib/pwa/storage.ts`), con *fallback* en memoria,
  persistencia de sesión cuando el storage está bloqueado y sincronización
  cross-tab.

## Cómo cambiar la fuente de datos en el futuro

1. Implementar el puerto en un adapter nuevo
   (`src/lib/infra/directory/supabasePets.ts`, por ejemplo) respetando el
   contrato: `null` para "no existe", `codigoPublico` como alias estable.
2. Cambiar **una sola línea** en `src/lib/services/pets/queries.ts`
   (`const directory: PetDirectory = ...`).
3. Si el modelo de respuesta difiere, decidir en esa frontera si hace falta un
   mapper; el dominio y la UI no se tocan.
4. `npm test` valida el contrato: si el adapter nuevo devuelve `undefined` en
   lugar de `null`, los tests de `services/pets/queries.test.ts` fallan.

Las operaciones de escritura (altas de adopción, alerta de pérdida) migrate
después, en la fase que introduzca Supabase; hoy no tienen adapter porque
todavía no hay backend.

## Estrategia de errores

Deliberadamente pequeña. No se creó una jerarquía de clases de error porque
ninguna tendría consumidores hoy:

| Situación | Cómo se expresa |
| --- | --- |
| Recurso inexistente | `null` (contrato de los puertos). La ruta decide: `notFound()` o estado vacío. |
| Datos inválidos | `assertValid*` lanza al cargar la fuente, con la lista agregada de fallos. Falla en dev/build, no en runtime. |
| Operación no disponible | `isStorageAvailable()` en `pwa/storage.ts`; la persistencia degrada a memoria en vez de fallar. |
| Error inesperado | Se propaga. `validate:data` y los tests son la red. |

Regla de UI: los errores técnicos de infraestructura no se muestran al
usuario; se traducen a estado vacío o a un mensaje de UX.

## Migraciones realizadas (15 ficheros)

Solo se movió el acceso a datos. **Cero cambios de lógica, UX, rutas o URLs.**

- Rutas (10): `app/page.tsx`, `app/adopciones/page.tsx`,
  `app/refugios/[id]/page.tsx` y los 7 `app/perfil/[id]/*`.
- Tests (3): `adoptionMockData.test.ts`, `domain/carnet.test.ts`,
  `mapping/adoptionPresentation.test.ts` (solo la ruta de import).

### Corrección de dependencia inversa

`src/lib/domain/carnet.ts` importaba `@/lib/services/publicProfileUrl`:
`domain → services`. Se movió el módulo a `src/lib/publicProfileUrl.ts` (util
puro, sin imports, usado por domain, app, components y types), siguiendo la
convención de `dateFormat.ts`, `phone.ts` y `clipboard.ts`. Es la única
dependencia inversa que existía.

### Ficheros eliminados

`getAllPets.ts`, `getPetById.ts`, `getPetByIdAny.ts`, `getMockShelters.ts`,
`getAdoptionDemoPets.ts` (relocalizados) y `getPetOrNotFound.ts` + su test
(código muerto, ver abajo).

## Decisiones: qué NO se hizo

- **No se creó `LostAlertStorageAdapter` ni un repositorio de localStorage.**
  `localStorage` ya está encapsulado tras `StorageLike` con inyección, *fallback*
  en memoria y Tolerancia a storage bloqueado (`pwa/storage.ts`). Envolverlo
  otra vez habría añadido indirección sin permitir ningún swap a backend.
- **No se extrajo el tema de `app/providers.tsx`.** Toca `localStorage`
  directamente, y el script anti-FOUC de `app/layout.tsx` debe seguir siendo JS
  plano. Es deuda documentada, no un olvido.
- **No se borró `getPetOrNotFound`.** Tenía **cero** consumidores: las 7 rutas
  hacen `getPetByIdAny(...)` + `notFound()` en línea. La decisión de renderizar
  un 404 pertenece a la *ruta*, no al service, así que el patrón en línea ya
  es correcto. Se eliminó el fichero muerto, no una capacidad.
- **No se movieron `dataValidation.ts` ni `shelterValidation.ts`.** Los
  consumen tanto el adapter como `scripts/validate-data.mts` por ruta directa;
  una ubicación plana neutral evita churn sin ganancia.
- **No se tocó `domain/carnet.test.ts` más allá del import.** Usa datos reales
  como fixtures; los tests están exentos del guardián de dependencias por
  diseño (así lo hace ya `domain/purity.test.ts`).
- **No se unificó `listProfilePets` / `listAdoptionPets`.** Hoy son dos ficheros
  estáticos disjuntos. Con backend real ambos saldrán de la misma tabla
  filtrando por estado; unificar ahora habría cambiado datos y risked la
  regresión de `validate:data`.
- **No se renombró `getAdoptionDemoPets`.** El nombre "Demo" es deuda de
  nomenclatura, pero renombrarlo es churn sin beneficio funcional.
- **No se migró el resto de `src/lib/*.ts`.** `phone`, `clipboard`,
  `adoptionRequestForm`, `foundPetReport`, etc. son utilidades puras o lógica de
  un solo consumidor, no acceso a datos.

## Guardián arquitectónico

`src/lib/architecture.test.ts` verifica la dirección de dependencias:

- `domain` no importa `services`, `infra` ni `src/data`.
- `services` no importa `src/data` (debe pasar por un puerto) ni frameworks ni UI.
- `infra` no importa UI ni frameworks.
- Solo `infra` importa `src/data`.

`src/lib/domain/purity.test.ts` (preexistente de FASE 5) se extendió para
incluir los puertos de Fase 9 y `publicProfileUrl.ts`.

## Verificación

| Comando | Resultado |
| --- | --- |
| `npm test` | 709 tests, 54 ficheros, 0 fallos |
| `npm run lint` | sin errores |
| `npm run typecheck` | sin errores |
| `npm run build` | correcto, todas las rutas prererenderizadas |
| `npm run validate:data` | 11 perfiles + 10 mocks de adopción + 2 refugios válidos |

Smoke tests sobre `next start` (200 en todos): `/`, `/perfil/lucca`,
`/perfil/niko`, `/perfil/frey`, `/perfil/PC-LUCCA-001`, `/adopciones`,
`/refugios/patitas-con-causa`, `/perfil/lucca/{salud,carnet,alerta,vacunas,documentos,adopcion}`,
`/perfil/mila/adopcion`, `/login`, `/manifest.webmanifest`, `/sw.js`.
`/perfil/no-existe-xyz` → 404 correcto.

Comprobado sin regresión: canonical y Open Graph siguen apuntando a
`/perfil/PC-LUCCA-001`, el QR mantiene ese payload, el manifest y el service
worker responden, y telemetría de FASE 8, KPIs, mapping y PWA no se modificaron.

**Nota preexistente:** `/refugios` (índice) devuelve 404 porque el proyecto solo
tiene `app/refugios/[id]/page.tsx`. No es una regresión de esta fase.

## Deuda técnica restante

1. `app/providers.tsx` y el script anti-FOUC de `app/layout.tsx` acceden a
   `localStorage` sin pasar por `StorageLike`. Deuda documentada, diferida a
   propósito.
2. Nomenclatura "Demo" en `getAdoptionDemoPets`.
3. `listProfilePets` / `listAdoptionPets` se simplificarán cuando exista una
   tabla única con estado.
4. `domain/carnet.test.ts` depende de services como fuente de fixtures.
5. La telemetría de FASE 8 sigue sin conectarse a la UI: `services/telemetry/trackers.ts`
   solo lo consume su propio test. Queda pendiente de una fase de instrumentación.
