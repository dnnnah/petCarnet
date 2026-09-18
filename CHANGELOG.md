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

## FASE 4 — Adopciones y refugios: Product/Frontend (PR `feat/adopciones-refugios-ui`)

**Estado:** UI de adopción/refugios conectada al contrato Core de FASE 4 (prototipo)
**Fecha:** 2026-09-18

Implementa la UI de adopción/refugios (§§4.1–4.4) sobre el contrato de dominio de A
(PR `feat/adopciones-refugios-core`, ya mergeado). Es la contraparte Product/Frontend
de la FASE 4: catálogo de mascotas en adopción, perfil de refugio, CTA de adopción en
el perfil de la mascota y formulario de solicitud de adopción **simulada**. La UI usa
las funciones puras de A (`filterAdoptablePets`, `buildAdoptionCatalogEntry`,
`resolveAdoptionAvailability`, `validateAdoptionRequest`, `findShelterForPet`) como
**única** derivación; no duplica reglas de negocio ni redefine tipos. Los datos del
catálogo son **mock de demostración** (sufijo `.mock.json`), claramente identificados
como prototipo en la UI y en la documentación. **No** implementa backend/Supabase,
Auth/RLS, adopciones reales, ni necesidades/transparencia (§4.5 → FASE 14).

### Flujo de dominio reutilizado (sin duplicar)

- Catálogo: `filterAdoptablePets(demoPets)` (canónico + efectivo, sin señal runtime en
  servidor) → `buildAdoptionCatalogEntry(pet, findShelterForPet(...))` → view model.
- CTA en el perfil: `AdoptionRequestCta` (cliente) re-evalúa en runtime con
  `useLostAlerts` + `resolveAdoptionAvailability`; si una alerta de pérdida se activa,
  el CTA desaparece (regla "perdido nunca es candidato a adopción" del Core).
- Formulario: `validateAdoptionRequest({ pet, alert, draft })` bloquea solicitudes de
  mascotas no disponibles en el envío (mismo mensaje que la validación del Core).

### Datos de demostración (prototipo, separados de los reales)

- `src/data/shelters.mock.json` (2 refugios: Patitas con Causa, Rincón Canino
  Ixtapaluca) y `src/data/adopciones.mock.json` (7 perfiles `PetProfile` válidos:
  5 `en_adopcion` [mila, toby, luna, simba, rocky], 1 `fallecido` [canela] para mostrar
  el memorial y 1 `perdido` [bruno] para mostrar que nunca es candidato).
- **No** se tocó `mascotas.json` (11 mascotas reales intactas) ni se inventaron datos
  reales: las fotos reutilizan `public/pets/*.jpeg` como placeholders y los
  cargadores (`getMockShelters`, `getAdoptionDemoPets`) validan los archivos al cargar
  (`assertValidPetProfiles` / `assertValidShelters`).
- `scripts/validate-data.mts` se extiende de forma aditiva para validar también los
  mocks (estructura + assets), sin cambiar la salida de `mascotas.json`.

### Rutas y componentes nuevos

- `/adopciones`: catálogo (server) con `AdoptionCatalog` (cliente) — filtros por
  especie y por refugio, contador de resultados, estado vacío accesible y tarjeta
  `AdoptionPetCard` (imagen, badges En adopción/Verificado, género, talla, edad, zona,
  refugio). Sección de "Refugios participantes" con enlaces a sus perfiles.
- `/refugios/[id]`: perfil de refugio (server) con `generateStaticParams`, contacto
  (llamada/WhatsApp con `buildWhatsAppHref`, correo, redes normalizadas), mascotas en
  adopción (con CTA "Solicitar adopción") y "otras mascotas bajo su cuidado" (estado
  efectivo sin CTA de adopción).
- `/perfil/[id]/adopcion`: formulario de solicitud (server gate + cliente
  `AdoptionRequestForm`). Las mascotas no disponibles (p. ej. `en_casa`, `fallecido`,
  `perdido`) ven un panel explicativo según su estado efectivo; las disponibles
  ven el formulario.
- `AdoptionRequestCta` en el perfil: sección violeta visible **solo** cuando el estado
  efectivo es `en_adopcion` (regla "CTA solo cuando corresponde"), tras `PetStatusSection`.
- Los mocks de adopción son navegables en todo el perfil (`/perfil/[id]` y sub-rutas
  `alerta`, `documentos`, `vacunas`, `adopcion`) vía `getPetByIdAny` (fusiona reales +
  demo) sin tocar el flujo de las 11 mascotas reales.
- `PrototypeNotice`: aviso visible y consistente de "datos simulados / sin envío real".

### Solicitud de adopción simulada

- Formulario validado con `validateAdoptionRequest`: nombre, teléfono MX
  (10/52/521), email opcional y motivo requeridos; errores por campo con
  `aria-invalid`/`aria-describedby`, resumen `role="alert"` para errores generales y
  foco al primer campo inválido.
- Envío simulado → confirmación que muestra folio, fecha, mascota, estado `Enviada` y
  enlace de regreso. Persistencia **prototipo** en `localStorage`
  (`petcarnet-adopcion:v1:<petId>`) con `adoptionRequestStorage.ts` (mismo patrón
  `StorageLike` + fallback en memoria que `lostAlertStorage`) y hook
  `useAdoptionRequests`. La UI y el CHANGELOG lo documentan: no llega a ningún servidor.

### Navegación

- `SiteNav`: nuevo enlace "Adopciones" (icono `HeartHandshake`, texto visible en `sm+`,
  icono solo en móvil) y CTA secundaria en la home "Ver mascotas en adopción".

### Tests

- `adoptionRequestForm.test.ts`: limpieza del draft, email/notas vacías → `null`,
  `buildAdoptionRequestFromDraft` (folio `sol-<seed>`, estado `enviada`) y mapeo de
  errores por campo/general.
- `adoptionRequestStorage.test.ts`: round-trip con storage falso, fallback en memoria,
  datos corruptos descartados y filtrado de entradas que no parecen solicitudes.
- `adoptionPresentation.test.ts`: `buildCatalogCard` con datos mock, `buildShelterPetCard`
  (adoptable/fallecido/perdido) y normalización de URLs sociales.
- `adoptionMockData.test.ts`: los mocks validan, no comparten ids/códigos con
  `mascotas.json`, y los refugios referencian mascotas existentes.
- `AdoptionPetCard.test.ts` / `ShelterPetCard.test.ts`: render presentacional
  (`renderToStaticMarkup`, con `next/image` mockeado).
- Suite total estimada: **209 + 49 = 258 pruebas** al verificar.

### Verificación

- `npm run lint` ✅ · `npm run typecheck` ✅ · `npm test` ✅ · `npm run build` ✅ (SSG;
  se añaden `/adopciones` y 2 perfiles de refugio al build) · `npm run validate:data` ✅
  (11 reales + 7 mocks adopción + 2 mocks refugio).
- Smoke tests (Chrome): `/adopciones` (filtros por especie y refugio, 375 px sin
  overflow), `/refugios/patitas-con-causa` y `/refugios/rincon-canino`, perfil de
  mascota adoptable con CTA, flujo completo de solicitud → confirmación → guardado en
  `localStorage`, y casos negativos (canela `fallecido`, bruno `perdido`, lucca
  `en_casa`) sin CTA ni formulario.

### Cambios

- **Nuevos:** `src/components/features/adoption/*` (PrototypeNotice, AdoptionPetCard,
  AdoptionCatalog, ShelterPetCard, AdoptionRequestCta, AdoptionRequestForm + 2 tests),
  `src/app/adopciones/page.tsx`, `src/app/refugios/[id]/page.tsx`,
  `src/app/perfil/[id]/adopcion/page.tsx`, `src/data/shelters.mock.json`,
  `src/data/adopciones.mock.json`, `src/lib/getMockShelters.ts`,
  `src/lib/getAdoptionDemoPets.ts`, `src/lib/getPetByIdAny.ts`,
  `src/lib/mapping/adoptionPresentation.ts` (+test), `src/lib/adoptionRequestForm.ts`
  (+test), `src/lib/adoptionRequestStorage.ts` (+test),
  `src/lib/useAdoptionRequests.ts`, `src/lib/adoptionMockData.test.ts`.
- **Modificados:** `src/app/perfil/[id]/page.tsx` (CTA de adopción),
  `src/app/page.tsx` (enlace al catálogo), `src/components/layout/SiteNav.tsx`
  (enlace "Adopciones"), `scripts/validate-data.mts` (validación aditiva de mocks),
  `CHANGELOG.md`.
- **No** se tocaron `package.json`/`package-lock.json`, `mascotas.json`,
  `src/lib/domain/*` (incluido el Core de A), `petStatus.ts`, `useLostAlerts.ts`,
  `lostAlertStorage.ts` ni los componentes de FASE 2/3.

### Queda para backend / fases posteriores (explícitamente NO implementado)

- `src/data/shelters.json` / `adoptions.json` reales con servicio (FASES 9–10) y
  conector de catálogo con `filterAdoptablePets(data, resolverDeAlertas)`.
- Persistencia real de solicitudes y ciclo `enviada → en_revision → aprobada|rechazada|
  cancelada → completada` (FASES 10, 15), notificaciones al refugio y mapeo
  `AdoptionRequest.shelterId` (hoy `null`: el refugio se asocia a la mascota vía
  `Shelter.mascotas`).
- Necesidades/transparencia del refugio (§4.5): FASE 14.
- Enlace del formulario a canales reales del refugio (hoy simulado con
  `localStorage`).

---

## FASE 4 — Adopciones y refugios: Contrato Core (PR `feat/adopciones-refugios-core`)

**Estado:** Contrato de dominio y datos completado (base Core)
**Fecha:** 2026-09-18

Implementa únicamente el **contrato de dominio y datos** de la FASE 4 del
roadmap (§§4.1–4.4): perfil de refugio, catálogo de mascotas en adopción,
estado `en_adopcion` y solicitud de adopción **simulada**. Es la base que
conectará con backend real en Fases 9–10 (services/Supabase) sin rehacer el
dominio. **No** implementa UI/catálogo visual (bloque B), backend, Supabase,
Auth/RLS, adopciones reales, necesidades/transparencia (FASE 14) ni
persistencia remota.

### Contratos de dominio nuevos

- `src/types/shelter.ts`: `Shelter` / `ShelterId` / `ShelterContact` (roadmap
  §4.1, sin `necesidades`: transparencia es FASE 14). El refugio referencia
  mascotas por `mascotas: PetId[]`, lo que habilita el filtro "Por refugio"
  (§4.2).
- `src/types/adoption.ts`: `AdoptionRequest` / `AdoptionRequestDraft`,
  `AdoptionApplicant`, `AdoptionRequestStatus` (ciclo completo
  `enviada → en_revision → aprobada | rechazada | cancelada → completada`,
  según la regla "una solicitud debe tener estado" de FASE 15) y
  `AdoptionCatalogEntry` (proyección normalizada de `PetProfile` para el
  catálogo §4.2).
- Una mascota en adopción **no requiere entidad nueva**: `PetProfile` ya
  contiene los datos mínimos (nombre, especie, raza, talla, fecha, foto, zona,
  estado, contacto); `AdoptionCatalogEntry` es una proyección de lo que ya
  existe.

### Funciones puras de dominio (`src/lib/domain/adoption.ts`)

- `resolveAdoptionAvailability({ estado, emergencia, alert })`: reutiliza
  `resolveEffectivePetState` (FASE 3) como **única** derivación del estado
  efectivo. Devuelve `{ available, reason, effectiveStatus }` con razones
  `"estado_no_disponible" | "perdido" | "terminal"`.
  - `en_adopcion` + señal de pérdida (runtime o estática) → **no** disponible;
  - `fallecido` → nunca disponible, aunque haya datos/alertas inconsistentes
    (se conserva la regla de FASE 3: terminal no se comporta como perdido);
  - `adoptado` / `rescatado` / `en_casa` / `perdido` → no disponibles.
- `isPetAvailableForAdoption(...)`: boolean de conveniencia sobre la
  disponibilidad resuelta.
- `filterPetsInAdoption(pets)`: filtro por estado canónico `en_adopcion`
  (`PetStatus` sigue siendo la fuente canónica del catálogo).
- `filterAdoptablePets(pets, alertResolver?)`: catálogo completo = filtro
  canónico + disponibilidad efectiva (sacando mascotas perdidas/terminales);
  acepta un resolver de `LostAlert` por mascota (para conectar `useLostAlerts`
  en UI sin acoplar el dominio a localStorage).
- `buildAdoptionCatalogEntry(pet, shelter?)`: normalización de la tarjeta de
  catálogo (formatos sin acoplar: la edad queda como `fechaNacimiento` cruda;
  la zona cae a `contacto.zonaHabitual` cuando no hay refugio).
- `validateAdoptionRequest({ pet, alert?, draft })`: validación de solicitudes
  **simuladas** que bloquea solicitudes de mascotas no disponibles
  (`pet_no_disponible`), exige nombre/teléfono/motivo, valida formato de
  teléfono MX (10/52/521), email opcional y fecha `YYYY-MM-DD`, y comprueba que
  el borrador refiera a la misma mascota.
- `isAdoptionRequestStatus` / `ADOPTION_REQUEST_STATUSES` /
  `initialAdoptionRequestStatus()` (las simuladas nacen `enviada`).

### Búsquedas de refugio (`src/lib/domain/shelter.ts`)

- `findShelterById(shelters, id)` y `findShelterForPet(petId, shelters)`
  (primer refugio cuya lista incluye a la mascota) para el catálogo "Por
  refugio" (§4.2).

### Compatibilidad con FASE 2 y FASE 3

- No se tocaron `petStatus.ts`, `resolveEffectivePetState`, `emergency.ts`,
  `useLostAlerts.ts`, `lostAlertStorage.ts`, `dataValidation.ts` ni
  `mascotas.json` (11 mascotas intactas, `validate:data` sin errores).
- `PetStatus` sigue siendo la fuente canónica; `resolveEffectivePetState` el
  mecanismo único de resolución; la regla terminal→no-lost se preserva y se
  prueba explícitamente.
- Datos mock: solo fixtures tipados dentro de los tests (misma política que
  FASE 3); no se inventan `shelters.json`/`adoptions.json` ni arquitectura de
  backend.

### Tests

- `src/lib/domain/adoption.test.ts` (nuevo, +37): ciclo de estados de
  solicitud, guardas, disponibilidad con overlay runtime/estático/terminal,
  filtros de catálogo canónico y efectivo, normalización de tarjeta (con y sin
  refugio, y compuesta con `findShelterForPet`), validación de solicitudes
  (incluye rechazo de mascota no disponible, terminal, perdida por alerta y
  acumulación de errores).
- `src/lib/domain/shelter.test.ts` (nuevo, +7): búsquedas por id y por
  mascota, lista vacía y primer coincidencia.
- Suite total: **209 pruebas** (antes 165), 20 archivos.

### Verificación

- `npm run lint` ✅ · `npm run typecheck` ✅ · `npm test` ✅ (209) · `npm run
  build` ✅ (SSG, 93 páginas) · `npm run validate:data` ✅ (11 perfiles
  válidos, 26 avisos preexistentes, 0 errores).
- Smoke tests (`npm start`): `/`, `/perfil/lucca`, `/perfil/PC-LUCCA-001`,
  `.../alerta`, `.../vacunas`, `.../documentos`, `/perfil/niko`,
  `/perfil/PC-LOKI-001`, `/login` → 200; `/perfil/inexistente` → 404. El
  badge de estado FASE 3 se renderiza en el perfil.

### Cambios

- `src/types/shelter.ts` (nuevo), `src/types/adoption.ts` (nuevo),
  `src/lib/domain/adoption.ts` (nuevo), `src/lib/domain/adoption.test.ts`
  (nuevo), `src/lib/domain/shelter.ts` (nuevo),
  `src/lib/domain/shelter.test.ts` (nuevo), `CHANGELOG.md`.
- **No** se tocaron `package.json`/`package-lock.json`, `mascotas.json`,
  `petStatus.ts`, componentes de UI, QR, `dataValidation.ts`, servicios ni
  rutas; no hay UI de catálogo/solicitud (bloque B) ni backend/Auth/RLS.

### Queda para B (Product/Frontend)

- `src/data/shelters.json` / `adoptions.json` reales (o el servicio que los
  cargue) y conector de catálogo con `filterAdoptablePets(data, resolverDeAlertas)`.
- Vista de catálogo de adopción (home §4.2) y perfil de refugio (§4.1).
- En `en_adopcion`, reemplazar el CTA de contacto por «Solicitar adopción»
  (§4.3) y flujo formulario → confirmación (§4.4) con estado local
  (`localStorage`) y los contratos de este Core.
- Mapper de presentación del catálogo (formatear edad/zona, roles por especie
  y refugio) y URLs públicas por `codigoPublico`.
- Necesidades/transparencia (§4.5): FASE 14, fuera de este contrato.

---

## FASE 3 — Estados y ciclo de vida de la mascota: Product/Frontend (PR `feat/estados-ui`)

**Estado:** UI de estados conectada al estado efectivo (integr. de FASE 3 completada)
**Fecha:** 2026-09-17

Conecta el contrato Core de FASE 3 (§3.1–3.3) con la UI del perfil: el estado
efectivo (`ProfileViewModel.status` + `resolveEffectivePetState`) se representa
en la cabecera, como banner de estado, en el contacto y en el pie, sin repetir la
fuente de verdad del dominio y **sin tocar** el lost mode runtime de FASE 2.
No implementa flujos de negocio por estado (adopciones, refugios, panel, backend),
que siguen en FASE 4+.

### Una sola derivación

- `EmergencyContactSection` y `LostModeAlertSections` consumen ahora el mismo
  selector unificado `resolveEffectivePetState` (antes `resolveLostState` /
  `resolveEmergencyContactState`). `resolveLostState` no se modificó.
- `ProfileViewModel.status` ya se renderiza: badge de estado en `PetHeader` y
  todos los gateos del perfil usan el estado canónico expuesto por el view model.

### Nuevos componentes (`src/components/features/pet-status/`)

- `PetStatusBadge` (cliente): badge del estado efectivo en la fila de badges de la
  cabecera (mint=En casa, rose=Perdido, violet=En adopción, teal=Adoptado,
  amber=Rescatado, stone=En memoria).
- `PetStatusSection` (cliente): reemplaza el uso directo de `LostModeAlertSections`
  en el perfil. Decide por `resolvePetStatusView`:
  - estado perdido efectivo → delega en la UI de FASE 2 (sin cambios);
  - `en_casa` → nada;
  - resto → `PetStateBanner`.
- `PetStateBanner` (presentacional): banner informativo por estado
  (`en_adopcion` con ancla `#contacto`, `adoptado`, `rescatado`, `fallecido`
  como memorial sin acciones).
- `PetFooterBanner` (cliente): `ThankYouBanner` solo para estados `en_casa` /
  `perdido` efectivos (ninguno para adopción/terminal).

### Terminal y estados contradictorios

- `fallecido` nunca muestra overlay de perdido: ni banner, ni contacto urgente, ni
  animación, aunque exista una señal estática o runtime stale en `localStorage`.
- `EmergencyContact` gana `isTerminal` → encabezado neutro «Contacto de su familia».
- En el perfil se oculta el enlace «Generar alerta de mascota perdida» para
  terminal; `/perfil/[id]/alerta` muestra un aviso de estado terminal y no genera
  alertas (metadata acorde).

### Presentación desacoplada del dominio

- `src/lib/mapping/petStatusPresentation.ts`: `getPetStatusMeta` (label/tono/icono
  por estado con fallback seguro) y `resolvePetStatusView` (decisión
  lost-mode/banner/none desde `resolveEffectivePetState`). Sin duplicar el dominio
  (§10.2: los colores no entran a `petStatus.ts`).
- `Badge` gana el tono `rose`.

### Tests

- `petStatusPresentation.test.ts` (nuevo): meta de los 6 estados + fallback, y
  `resolvePetStatusView` para en_casa, runtime→perdido, estático→perdido,
  adopción→banner y terminal que bloquea el overlay.
- `PetStatusBadge.test.ts` (nuevo): etiquetas por estado efectivo y tono rosa
  para perdido.
- `PetStateBanner.test.ts` (nuevo): adopción/adoptado/rescatado/fallecido/perdido
  y accesibilidad (`aria-labelledby`).
- `PetStatusSection.test.ts` (nuevo): en_casa vacío, estático delega en FASE 2,
  adopción→banner, fallecido sin overlay.
- `PetFooterBanner.test.ts` (nuevo): gracias en en_casa, llamado en perdido, nulo
  en adopción/terminal.
- `EmergencyContactSection.test.ts` (nuevo): contacto normal/urgente y terminal
  que nunca es urgente.
- `profile.test.ts` (extendido): passthrough de los 6 estados en el view model.

### Verificación

- `npm run lint` ✅ · `npm run typecheck` ✅ · `npm run test` ✅ · `npm run build` ✅
  (SSG) · `npm run validate:data` ✅.
- Smoke tests: perfil normal, modo perdido runtime activado/desactivado, rutas por
  `codigoPublico`, 375 px sin overflow y rutas de FASE 1+2 intactas.

### Cambios

- `src/lib/mapping/petStatusPresentation.ts` (nuevo) y su test,
  `src/components/features/pet-status/*` (nuevos: 4 componentes + 5 tests),
  `src/components/ui/Badge.tsx`, `src/components/features/pet-profile/PetHeader.tsx`,
  `src/components/features/pet-profile/EmergencyContact.tsx`,
  `src/components/features/pet-profile/EmergencyContactSection.tsx` (+test),
  `src/app/perfil/[id]/page.tsx`, `src/app/perfil/[id]/alerta/page.tsx`,
  `src/lib/mapping/profile.test.ts`, `CHANGELOG.md`.
- **No** se tocaron `package.json`/`package-lock.json`, `mascotas.json`,
  `petStatus.ts`, `resolveLostState`/`useLostAlerts`/`lostAlertStorage.ts`,
  `getPublicProfileUrl()`, QR, ni se adelantó FASE 4+.

---

## FASE 3 — Estados y ciclo de vida de la mascota: Contrato Core (PR `feat/estados-core`)

**Estado:** Contrato de dominio y datos completado (base Core)
**Fecha:** 2026-09-17

Implementa únicamente el **contrato de dominio y datos** de la FASE 3 del roadmap
(§§3.1–3.3): tipo/unión de estados, estado canónico, reglas de validación,
relación con el lost mode runtime y compatibilidad con los datos actuales.
**No** implementa los flujos de negocio por estado (adopciones reales, refugios,
panel, backend, etc.), que siguen fuera de alcance.

### Modelo de estado

- `PetStatus` (`src/types/pet.ts`) se amplía de `"en_casa" | "perdido"` a la unión
  de ciclo de vida completa: `en_casa | perdido | en_adopcion | adoptado |
  rescatado | fallecido` (roadmap §3.1). `PetProfile.estado` es el **estado
  canónico** serializable, que mapea 1:1 al futuro `pets.status` (§6.4).
- Nuevo módulo de dominio `src/lib/domain/petStatus.ts` (sin colores/labels de UI,
  §10.2): única fuente de `PET_STATUSES` y guardas `isPetStatus`,
  `isLostPetStatus`, `isTerminalPetStatus`, `isAdoptionPetStatus`; agrupaciones
  `LOST_PET_STATUSES`, `TERMINAL_PET_STATUSES`, `ADOPTION_PET_STATUSES`.

### Relación con el lost mode runtime (FASE 2)

- `resolveLostState` (FASE 2) queda **intacto**: la alerta de `localStorage` y el
  flag estático `emergencia.perdido` siguen alimentando el modo perdido; los
  componentes de emergencia no se reescriben.
- Nuevo selector unificado `resolveEffectivePetState({ estado, emergencia, alert })`
  que **delega en `resolveLostState`** (una sola derivación) y añade:
  - `status`: estado efectivo (runtime `perdido` si hay señal de pérdida, si no el
    canónico);
  - `lostOverlay`: `"runtime" | "static" | "none"` — de dónde viene la señal.
- Precedencia: alerta runtime activa → efectivo `perdido`; en su ausencia manda el
  `estado` canónico. Los estados terminales (`fallecido`) bloquean el overlay de
  lost mode.

### Evitar dos fuentes de verdad

- `PET_STATUSES` deja de estar duplicado en `dataValidation.ts`: ahora re-exporta
  el del dominio (una sola lista).
- `dataValidation.ts` añade reglas de consistencia `estado` ↔ `emergencia.perdido`:
  - `estado: "perdido"` exige `emergencia.perdido: true`;
  - `emergencia.perdido: true` exige `estado: "perdido"`;
  - `estado: "fallecido"` no admite modo perdido.
- `ProfileViewModel` expone `status: PetStatus` (mapper, sin render nuevo).

### Migración / compatibilidad

- **No se modificó `mascotas.json`**: las 11 mascotas ya son `estado: "en_casa"` con
  `emergencia.perdido: false`, válidas bajo la unión ampliada. No se inventan datos.
- El schema se **ancha** (compatibilidad hacia atrás): los estados nuevos quedan
  disponibles para FASE 4+, sin tocar los flujos actuales.

### Tests

- `src/lib/domain/petStatus.test.ts` (nuevo): estados válidos, estados inválidos,
  agrupaciones (`perdido`/terminal/adopción), resolución del estado con overlay
  runtime y estático, precedencia runtime sobre estático, fallback de campos y
  bloqueo del overlay en estados terminales.
- `src/lib/dataValidation.test.ts` (+6): acepta los 6 estados consistentes,
  rechaza estados inválidos, y detecta las inconsistencias `estado` ↔
  `emergencia.perdido` (incluido terminal).
- `src/lib/mapping/profile.test.ts` (nuevo): el view model expone el estado
  canónico (incluido `en_adopcion`) sin romper el mapeo.

### Verificación

- `npm run lint` ✅ · `npm run typecheck` ✅ · `npm run test` ✅ (134 pruebas, 12
  archivos) · `npm run build` ✅ (SSG, 93 páginas) · `npm run validate:data` ✅
  (11 perfiles válidos, 26 avisos preexistentes, 0 errores).
- Smoke tests (servidor `npm start`): `/`, `/perfil/lucca`, `/perfil/PC-LUCCA-001`,
  `/perfil/PC-LUCCA-001/alerta`, `.../vacunas`, `.../documentos`, `/login` → 200;
  `/perfil/inexistente` → 404. Modo perdido runtime (FASE 2) verificado en
  navegador: sin alerta no hay banner; con alerta en `localStorage` aparecen banner,
  «Modo alerta activo», «Encontré esta mascota», contacto urgente y la zona runtime;
  al limpiar la alerta vuelve al estado normal.

### Cambios

- `src/types/pet.ts`, `src/lib/domain/petStatus.ts` (nuevo),
  `src/lib/domain/petStatus.test.ts` (nuevo), `src/lib/dataValidation.ts`,
  `src/lib/dataValidation.test.ts`, `src/lib/mapping/profile.ts`,
  `src/lib/mapping/profile.test.ts` (nuevo), `CHANGELOG.md`.
- **No** se tocaron `package.json`/`package-lock.json`, `mascotas.json`,
  `emergency.ts`/`useLostAlerts.ts`/`lostAlertStorage.ts`, componentes de UI,
  `getPublicProfileUrl()`, QR, ni se adelantó FASE 4+ (adopciones/refugios/backend).

### Pendientes (para Product/Frontend)

- Conectar `LostModeAlertSections`/`EmergencyContactSection` a
  `resolveEffectivePetState` (misma derivación, hoy usan `resolveLostState`) y
  usar `ProfileViewModel.status` para representar el estado canónico en el perfil.
- Flujos de negocio por estado (`en_adopcion`, `rescatado`, `adoptado`,
  `fallecido`) y migración de datos reales: FASE 4+.

---

## Cierre de FASE 2 — Emergencias (PR `fix/emergencias-cierre`)

**Estado:** Pendientes técnicos cerrados / FASE 2 técnicamente completada
**Fecha:** 2026-09-17

Cierra los dos pendientes técnicos identificados al cierre de FASE 2
(Emergencias, Product/Frontend). No implementa funcionalidad nueva; solo
corrige la fuente de verdad efectiva del estado perdido y la higiene de
WhatsApp en el punto único de construcción de enlaces.

### Pendiente 1 — `EmergencyContact` ahora usa el estado efectivo

- `EmergencyContact` dejó de recibir `isLost={pet.emergencia.perdido}` (flag
  estático). Ahora el perfil renderiza un nuevo componente cliente
  `EmergencyContactSection` que usa `useLostAlerts` + la resolución del contrato
  de Fase 2 (`resolveLostState`), igual que `LostModeAlertSections`.
- Sin segunda fuente de verdad: un selector puro nuevo
  `resolveEmergencyContactState` (en `src/lib/domain/emergency.ts`) deriva
  `{ isLost, neighborhood }` a partir del contrato efectivo. La etiqueta de
  vecindario se centraliza en `buildNeighborhoodLabel` y dejó de calcularse en el
  mapeo a partir del flag estático (se elimina `neighborhood` de
  `ContactViewModel`).

### Pendiente 2 — Higiene de WhatsApp

- Nuevo `src/lib/phone.ts`: `toE164Digits` normaliza los números de 10 dígitos
  (formato nacional mexicano) a E.164 agregando el código de país `52` al
  construir enlaces `wa.me` — sin alterar `mascotas.json` (el dato fuente se
  mantiene como está documentado en FASE 14).
- `buildWhatsAppHref` pasa a ser el **único** constructor de enlaces `wa.me`
  (Core): `src/lib/mapping/profile.ts` y `src/lib/foundPetReport.ts` (como
  facade) lo usan. Ya no hay construcción duplicada.
- No se rompe ninguno de los números ya válidos: `52...` y `521...` se conservan
  tal cual.
- El placeholder `552201296480` (8 mascotas de la familia, formato no mexicano)
  **no se normaliza ni se inventa**: queda documentado como pendiente de
  verificar en producción (misma conclusión que FASE 14, sin cambios de datos).

### Tests

- `src/lib/phone.test.ts` (nuevo, +10): normalización E.164, no-regresión de
  números válidos y construcción de `wa.me`.
- `src/lib/domain/emergency.test.ts` (+6): `buildNeighborhoodLabel` y
  `resolveEmergencyContactState` en estado perdido activo y resuelto/inactivo.
- `src/components/features/pet-profile/EmergencyContact.test.ts` (nuevo, +2):
  el componente refleja el estado urgente (perdido) y el normal (resuelto).
- `src/lib/services/publicProfileUrl.test.ts` (+1): ninguna URL pública de los
  datos reales usa `pet.id` (siempre `codigoPublico`).

### Verificación

- `npm run lint` ✅ · `npm run typecheck` ✅ · `npm run test` ✅ (112 pruebas) ·
  `npm run build` ✅ (SSG, 93 páginas) · `npm run validate:data` ✅ (26 avisos
  informativos preexistentes, 0 errores).

### Cambios

- `src/lib/phone.ts` (nuevo), `src/lib/phone.test.ts` (nuevo),
  `src/components/features/pet-profile/EmergencyContactSection.tsx` (nuevo),
  `src/components/features/pet-profile/EmergencyContact.test.ts` (nuevo),
  `src/lib/domain/emergency.ts`, `src/lib/domain/emergency.test.ts`,
  `src/lib/mapping/profile.ts`, `src/lib/foundPetReport.ts`,
  `src/lib/foundPetReport.test.ts`, `src/lib/services/publicProfileUrl.test.ts`,
  `src/app/perfil/[id]/page.tsx`, `CHANGELOG.md`.
- **No** se tocaron `package.json`/`package-lock.json`, `mascotas.json`,
  `emergency.ts` (contrato `resolveLostState` no modificado),
  `lostAlertStorage.ts` ni `useLostAlerts.ts`; no se inventaron números, no se
  adelantó backend/Auth/RLS/FASE 3/adopciones.

---

## FASE 2 — Emergencias: Product/Frontend (PR `feat/emergencias-ui`)

**Estado:** Completada (bloque Product/Frontend de FASE 2)
**Fecha:** 2026-09-15

Implementa la capa de UX de emergencias sobre el contrato Core ya mergeado
(`feat/emergencias-core-estado-perdido`: `src/types/emergency.ts`,
`src/lib/domain/emergency.ts`, `src/lib/lostAlertStorage.ts`,
`src/lib/useLostAlerts.ts`). Corresponde al roadmap FASE 2 §§2.1–2.3 y a las
prioridades **U-3/U-4** de `UX_AUDIT.md` («Encontré esta mascota» y
«compartir ubicación voluntaria»).

### Feature: "Encontré esta mascota"

- Nuevo componente `FoundPetPanel` (`src/components/features/lost-pet/FoundPetPanel.tsx`),
  visible **únicamente cuando el perfil está en modo perdido** (`resolveLostState`),
  es decir «cuando corresponde».
- Flujo guiado: CTA «Encontré esta mascota» → panel «Avisa que encontraste a {nombre}»
  → compartir ubicación (voluntaria) → mensaje editable → enviar por WhatsApp o copiar.
- Geolocalización con `navigator.geolocation.getCurrentPosition()`: voluntaria,
  explícita, opcional, nunca recopilada en silencio (microcopy de privacidad visible).
- Estados completos: `locating` (cargando), `located` (con «Abrir mapa»),
  `error` contextual (denegado / no disponible / timeout) y cancelación.
- Enlace de mapa `https://www.google.com/maps?q=lat,lng` y mensaje precargado
  contextual (7.2 del roadmap: flujo QR → perfil → perdido → encontré → ubicación → mensaje).
- Accesibilidad: targets ≥44 px, `focus-visible`, `aria-live`/`role="status"` para
  estados, foco movido al título al abrir el panel, `aria-labelledby` en la sección.

### Lógica UI testeable extraída

- `src/lib/foundPetReport.ts` (puro, sin DOM): `buildFoundPetMessage`,
  `buildMapsLocationUrl`, `buildWhatsAppHref`, `formatCoordinate`,
  `getLocationErrorKey` y `LOCATION_ERROR_COPY` (con `src/lib/foundPetReport.test.ts`).
  Usa `src/lib/clipboard.ts` (ya existente, Core) para el copiado.

### Mejora visual del modo perdido

- `LostPetBanner`: el «Por favor contacta inmediatamente» era un `<p>` con
  estética de botón (engañoso para a11y). Ahora es un `<a href="#contacto">`
  funcional con `focus-visible`. Se añade `role="status"` a la insignia
  «Alerta activa» y `aria-labelledby` a la sección del banner.
- Jerarquía en modo perdido: banner (estado) → «Encontré esta mascota» (acción
  primaria) → instrucciones → contacto urgente con Llamar/WhatsApp. Coherente con
  la dirección visual rosa/ámbar existente.

### QR de emergencia — pendiente documentado (no implementado)

No se crea QR de emergencia nuevo:

- El QR de perfil (FASE 1, `QRShareCard`) ya cubre «escanear → perfil» con la URL
  pública estable por `codigoPublico` via `getPublicProfileUrl()`.
- Un QR específico de emergencia (p. ej. que codifique contacto/instrucciones o un
  payload firmado) **no tiene contrato en el Core** (`emergency.ts`/
  `lostAlertStorage.ts` no lo definen). Requiere decisión de Core/backend antes de
  poder construirse sin duplicar lógica; se documenta como pendiente, no se inventa.
- No se repitió la UX de QR de FASE 1.

### Verificación

- `npm run lint` ✅ · `npm run typecheck` ✅ · `npm run test` ✅ (96 pruebas, +13 en
  `foundPetReport.test.ts`) · `npm run build` ✅ (SSG, 49 páginas).
- Smoke tests (Chrome headless sobre `npm start`):
  - perfil normal sin banner ni CTA de emergencia;
  - activar modo perdido desde `/alerta` → perfil muestra banner «está perdido» + panel;
  - flujo completo «Encontré esta mascota» (compartir ubicación, mensaje con URL de
    mapa, copiar mensaje, omitir ubicación, cancelar);
  - error contextual cuando la geolocalización es denegada;
  - desactivar modo perdido oculta banner y panel;
  - responsive 375 px sin overflow horizontal;
  - rutas públicas válidas (200) e inválidas (404);
  - URLs públicas generadas con `codigoPublico` (nunca `pet.id`).

### Cambios

- `src/components/features/lost-pet/FoundPetPanel.tsx` (nuevo),
  `src/lib/foundPetReport.ts` (nuevo), `src/lib/foundPetReport.test.ts` (nuevo),
  `src/components/features/lost-pet/LostModeAlertSections.tsx`,
  `src/components/features/lost-pet/LostPetBanner.tsx`,
  `src/app/perfil/[id]/page.tsx`, `CHANGELOG.md`.
- **No** se tocaron `package.json`/`package-lock.json`, `mascotas.json`,
  `emergency.ts`, `lostAlertStorage.ts` ni `useLostAlerts.ts`; no se inventó
  backend/Auth/RLS ni se adelantó FASE 3 ni adopciones.

### Pendientes (fuera de alcance, requiere Core/producto)

- QR de emergencia específico: requiere contrato de Core (ver arriba).
- `EmergencyContact` recibe `isLost={pet.emergencia.perdido}` (flag estático); alinear
  su estilo urgente con `resolveLostState` en una evolución posterior del perfil.
- Números de WhatsApp de 10 dígitos sin código de país (`A2` de AUDITORIA.md):
  higiene de datos de Core pendiente; este PR reutiliza la misma construcción
  `wa.me/<número>` que usa el mapeo actual para no crear lógica paralela.

---

## FASE 16 — SEO, Open Graph y Twitter Card del perfil público (PR `feat/seo-og`)

**Estado:** Completada
**Fecha:** 2026-09-14

Resuelve el hallazgo **M5** de `AUDITORIA.md` / **§3.10** de `UX_AUDIT.md` (metadata social ausente) y las mejoras «Revisar metadata SEO / Agregar Open Graph / Agregar Twitter card / Definir imagen social del perfil» del roadmap FASE 1 §1.1. Compatible con Next.js 16.3.5.

### 16.1 `metadataBase` global en `src/app/layout.tsx`

- `metadataBase` derivado de `NEXT_PUBLIC_APP_URL` (misma fuente que el servicio de URLs), con fallback a `http://localhost:3000` en desarrollo.
- `openGraph` base (`type: website`, `siteName: PetCarnet`, `locale: es_MX`) y `twitter.card: summary` por defecto.
- Corrige el typo «publico» → «público» en la description del layout.

### 16.2 Metadata por perfil (`src/lib/seo.ts` + `generateMetadata`)

- Nuevo helper testeable `buildPetProfileMetadata(pet)` y derivados `getPetProfileSeoTitle` / `getPetProfileSeoDescription`.
- `title` y `description` derivados del perfil: `nombre`, `raza`, `especie` y aviso de «modo perdido» cuando `emergencia.perdido`.
- `alternates.canonical` y `og:url` → `getPublicProfileUrl(pet)` (ruta canónica por `codigoPublico`), **nunca** `pet.id`.
- `og:title`, `og:description`, `og:type=website`, `og:site_name`, `og:locale`, `og:image` (foto real del perfil, `alt` = nombre).
- `twitter:card` con `summary_large_image` cuando hay foto; `summary` sin imagen (fallback).
- Fallback sin invención de datos: si falta `fotoPerfilUrl` o `codigoPublico`, se omiten imagen/canonical.

### 16.3 404 de perfiles inexistentes

- `generateMetadata` de perfil no encontrado agrega `robots: { index: false }` (noindex).

### 16.4 Verificación

- `npm run lint` ✅ · `npm run typecheck` ✅ · `npm test` ✅ (46 pruebas, +15 en `seo.test.ts`) · `npm run build` ✅ (SSG).
- Smoke tests de metadata (servidor `npm start`):
  - `/perfil/PC-LUCCA-001`: title, description, canonical, og:title/description/url/image, twitter:card/image todos correctos con URL canónica por `codigoPublico`.
  - `/perfil/PC-VISERYS-001`: idem (og:image = `/pets/viserys.jpeg`).
  - Ruta inexistente: HTTP 404 + `<meta name="robots" content="noindex"/>`.
  - `/perfil/lucca` (ruta legacy): canonical y `og:url` apuntan a `PC-LUCCA-001`; sin referencias a `pet.id` en metadata (solo enlaces internos de navegación).

### 16.5 Cambios

- `src/app/layout.tsx`, `src/app/perfil/[id]/page.tsx`, `src/lib/seo.ts` (nuevo), `src/lib/seo.test.ts` (nuevo), `CHANGELOG.md`.
- **No** se tocaron `package.json`/`package-lock.json`, `mascotas.json`, QR, accesibilidad, tipos de dominio, rutas públicas ni backend.

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
