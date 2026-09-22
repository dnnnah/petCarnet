# FASE 7 — PWA / Campo: estrategia técnica

Documento técnico de la base PWA/offline de PetCarnet. Complementa el
CHANGELOG y detalla decisiones, límites y trabajo futuro.

## Estado actual del producto (pre-FASE 7)

- Next.js 16 (App Router) + React 19, SSG puro para el catálogo de mascotas
  (280 páginas generadas en build). Sin backend, sin Supabase, sin Auth.
  Los datos viven en `src/data/*.json` y se convierten en páginas estáticas.
- Sin manifest, sin service worker, sin estrategia offline previa.
- `localStorage` disperso en: `providers.tsx` (tema), `useLostAlerts.ts`,
  `useAdoptionRequests.ts` (con módulos `lostAlertStorage` /
  `adoptionRequestStorage` ya tolerantes a errores).
- Dependencias clientes relevantes: `qrcode.react` (QR), `html-to-image`
  (PNG de alerta), `framer-motion` (lightbox de fotos, una sola sección).

## Arquitectura

```
domain (puro, sin browser/React)
   ↓
mapping / services
   ↓
UI (client)
   ↓
infraestructura browser (src/lib/pwa/)
   - storage.ts        → acceso seguro a localStorage
   - connectivity.ts   → lecturas puras de red del dispositivo
   - registerServiceWorker.ts → registro del SW (solo producción)
   - useOnlineStatus.ts → hook cliente (única dependencia de React en la capa)
```

El `domain` sigue sin importar React/Next/browser APIs (guards existentes en
`src/lib/domain/purity.test.ts`). La nueva capa tiene su propio guard
(`src/lib/pwa/purity.test.ts`): los módulos de infraestructura son
React/Next-free salvo `useOnlineStatus.ts`.

## Web App Manifest

`src/app/manifest.ts` genera `/manifest.webmanifest`:

| Campo | Valor |
| --- | --- |
| `name` / `short_name` | PetCarnet \| Carnet Digital / PetCarnet |
| `start_url` / `scope` | `/` |
| `display` | `standalone` |
| `theme_color` | `#10B981` (esmeralda de la marca) |
| `background_color` | `#ffffff` |
| `icons` | `/icon.svg` (existe), `purpose` `any` + `maskable` |

**Íconos pendientes (bloque de diseño B):** PNG 192×192, PNG 512×512 y
`apple-touch-icon` (PNG 180×180). El manifest no referencia assets
inexistentes; cuando B entregue los PNG se añadirán a
`buildManifest().icons` y al metadata `icons` del layout.

## Service worker (`public/sw.js`)

- **Registro:** solo `NODE_ENV=production` y solo si
  `navigator.serviceWorker` existe. En dev nunca se activa (no interfiere con
  `next dev`). Ruta: `/sw.js`, scope `/`.
- **Caché:** versión manual `petcarnet-<VERSION>`; **subir `VERSION` en cada
  despliegue** para invalidar cachés viejas.
- **`install`:** precachea `/`, `/manifest.webmanifest`, `/icon.svg` de forma
  tolerante (fallos parciales no abortan la instalación).
- **`activate`:** borra cachés de versiones anteriores y hace `clients.claim`.

### Estrategia de cache (fetch)

| Tipo de request | Estrategia |
| --- | --- |
| Documento/navegación (`mode: navigate`) | network-first → caché local → shell `/` → 503 |
| `/_next/static/*`, `/pets/*`, `/docs/*`, `/_next/image`, `/icon.svg`, `/manifest.webmanifest` | stale-while-revalidate |
| POST / otros orígenes / datos API | ignorado |

Reglas de seguridad:
- Solo GET, solo mismo-origen.
- Nunca se cachea una respuesta que no sea `ok` (los fallos de red no se
  materializan en caché).
- No se cachean datos potencialmente inconsistentes (no hay backend; cuando
  exista, el acceso a datos remotos quedará fuera de la caché del SW).

## Qué funciona offline (hoy)

1. Páginas previamente visitadas (HTML SSG cacheado por network-first) y su
   navegación posterior.
2. Assets de `/_next/static`, fotos de `/pets` (incluidas las variantes
   optimizadas por `next/image` vía `/_next/image`) y thumbnails de `/docs`.
3. Perfil estático de cualquier mascota ya visitado; el QR ya renderizado.
4. Alerta de mascota perdida y solicitudes de adopción registradas en
   `localStorage`; si el storage falla, siguen en memoria (sesión).

## Qué NO funciona offline (por diseño, sin backend)

1. Primer acceso a una página nunca cacheada (la app no tiene backend que
   sirva datos nuevos; los datos son SSG). Sin conocer la URL de antemano no
   hay copia local.
2. Sincronización remota de cualquier tipo: no existe backend.
3. Opera-ciones con dependencia de servidor: auth, dashboard, notificaciones
   push, donaciones/pagos, CRUD de mascotas (fases futuras). El SW no
   intercepta ese tráfico.
4. Navegación SPA profunda (RSC) por una ruta sin copia local: el fallback
   aplica a documentos completos; la UI de estado "sin conexión" y la
   navegación offline elegante son del bloque B.

## localStorage

- **Capa única:** `src/lib/pwa/storage.ts`.
- **Comportamiento ante fallos:** storage inexistente (SSR) → `null`/`false`;
  acceso bloqueado (cookies off, modo privado) → `null`/`false`; JSON
  corrupto → `null`; forma inválida → `null` vía `decode`; cuota excedida →
  se conserva el estado en memoria (fallback de sesión). La aplicación nunca
  se rompe: vuelve a un estado vacío razonable.
- **Reglas de negocio intactas:** `lostAlertStorage` y
  `adoptionRequestStorage` mantienen su contrato (relleno de `resolveLostState`
  etc.). `resolveLostState`, `resolveEffectivePetState` y
  `resolveEmergencyContactState` no se tocan: solo se endurece la
  infraestructura que las alimenta.

## Conectividad

- `connectivity.ts`: `getBrowserOnline()` (SSR-safe) y
  `resolveConnectivityStatus()` (puro). `navigator.onLine` es un **indicador
  del dispositivo**, no conectividad con servidor.
- `useOnlineStatus.ts`: hook cliente con `useSyncExternalStore`
  (`"unknown"` durante SSR). Disponible para que B construya la UI de "sin
  conexión" sin reabrir infraestructura.

## Fechas / tiempo

No se introdujeron timestamps nuevos. Cualquier código offline que requiera
fechas debe usar `src/lib/dateFormat.ts` (zona `America/Mexico_City`).

## Performance (auditoría FASE 7)

Medido sobre la build de producción (gzip):

- React/runtime y componentes compartidos dominan el peso (~180 KB gzip por
  página de perfil). Las librerías pesadas ya están **scoped por ruta**:
  `qrcode.react` solo en perfiles/carnet, `html-to-image` solo en `/alerta`,
  `framer-motion` solo en perfiles con fotos.
- **Oportunidades futuras (fuera de alcance para no romper UX ni la capa de
  B):** lazy-load con `next/dynamic` de `QRShareCard`/`CarnetStudio`;
  sustituir `framer-motion` del lightbox por CSS (≈61 KB gzip por página de
  perfil); `next/image` para fotos — **con precaución** porque el PNG de la
  alerta usa `html-to-image` y las imágenes deben permanecer same-origin
  (un `next/image` con dominio externo contaminaría el canvas).

## Dependencias nuevas

Ninguna. Manifest, service worker, storage y conectividad usan infraestructura
nativa de Next.js/navegador.

## Riesgos / pendientes

- Íconos PWA PNG (192/512) y `apple-touch-icon`: aportarlos en el bloque de
  diseño B y enlazarlos en el manifest.
- `VERSION` del SW es manual: debe incrementarse en cada despliegue (proceso).
- Sin backend no hay modo "primera visita offline": el usuario debe haber
  cargado la página alguna vez.
- El SW no captura la navegación SPA offline elegante (feat de UI de B).