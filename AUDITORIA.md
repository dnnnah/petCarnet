# AUDITORÍA FASE 0 — PetCarnet

**Rama de auditoría:** `docs/fase-0-auditoria`
**Base:** `feat/rediseno-ui` (commit `6064523 docs: actualizar descripción de la navbar en sub-fase 12.5`)
**Fecha:** 2026-09-14
**Autor:** IA A (arquitectura / core engineering / revisión técnica)

Este documento clasifica el estado del prototipo después de una revisión integral del repositorio. **No implementa correcciones**: primero se analiza y clasifica; el orden de ejecución se propone al final como 5 PRs priorizados.

---

## 1. Alcance revisado

| Área | Archivos revisados | Estado |
| --- | --- | --- |
| Configuración | `package.json`, `next.config.ts`, `tsconfig.json`, `eslint.config.mjs`, `.gitignore`, `postcss.config.mjs` | ✅ |
| Datos | `src/data/mascotas.json` (11 mascotas) | ⚠️ hallazgos |
| Dominio/tipos | `src/types/pet.ts` | ⚠️ hallazgos |
| Acceso a datos | `src/lib/getAllPets.ts`, `getPetById.ts`, `getPetOrNotFound.ts` | ⚠️ hallazgos |
| Domain utils | `src/lib/domain/documentCategory.ts`, `vaccineStatus.ts` | ✅ |
| Mapping | `src/lib/mapping/profile.ts`, `mapping/vaccines.ts` | ✅ |
| Fechas | `src/lib/dateFormat.ts` | ✅ |
| Documentos | `src/lib/petDocuments.ts` | ⚠️ duplicación |
| Hook alerta | `src/lib/useLostAlerts.ts` | ⚠️ hallazgos |
| Rutas | `src/app/*` (home, login, perfil/[id], alerta, documentos, vacunas) | ✅ |
| Componentes | `src/components/*` (layout, ui, features) | ⚠️ hallazgos |
| Estilos | `src/app/globals.css` | ✅ |
| Documentación | `README.md`, `CHANGELOG.md`, `PetCarnet_Roadmap_Maestro.md` (untracked) | ⚠️ alineación |

## 2. Baseline ejecutado (Prototype Baseline v0.x)

| Comando | Resultado |
| --- | --- |
| `npm install` | ✅ sin errores (9 avisos `npm audit`, ver §3.1) |
| `npm run lint` | ✅ 0 errores |
| `npx tsc --noEmit` | ✅ 0 errores |
| `npm run build` | ✅ 49 páginas prerenderizadas (SSG) |
| Smoke test (`npm start` + `curl`) | ✅ todas las rutas responden 200; `/perfil/<inexistente>` responde 404 |
| Dependencias de entorno ocultas | ✅ ninguna: no requiere `.env`, credenciales ni config local |

### Conclusión de baseline

**Prototype Baseline v0.1 — CONFIRMADO.** Cumple los seis requisitos de la FASE 0:

- instala, ejecuta, pasa lint, pasa TypeScript, hace build
- se reconstruye desde Git sin configuraciones ocultas
- el árbol está limpio; `.next/`, `.playwright-mcp/`, `.DS_Store`, `*.tsbuildinfo`, `next-env.d.ts` ignorados correctamente
- `package-lock.json` intacto tras `npm install` (reproducible)

**No existen tags git todavía.** Se recomienda crear el tag `baseline-prototype-v0.1` en el punto actual como referencia de reconstrucción (PR de coordinación).

---

## 3. CLASIFICACIÓN DE HALLAZGOS

## 3.1 CRÍTICO

### C1. El QR apunta a un dominio hardcodeado y a la ruta por `pet.id`
- `QRShareCard.tsx:16` → `const fullUrl = \`https://petcarnet.app${profilePath}\``
- `LostPetAlertForm.tsx:31` → `const profileUrl = \`https://petcarnet.app/perfil/${pet.id}\``
- El contenido real del QR depende de un dominio quemado en el código. Si el prototipo se despliega en otro origin (Vercel, GitHub Pages, etc.), **every QR escaneado apunta a un dominio que puede no ser el desplegado**.
- Además el QR no usa el **identificador público estable** del roadmap (`/perfil/<public_code>`): usa `pet.id`. Ocurre en 3 lugares distintos (QRShareCard, LostPetAlertForm, `pet.qr.urlPublica` en `mascotas.json`).
- **Impacto:** el núcleo del producto (identificación por QR) es frágil por construcción y no cumple "el QR identifica, no almacena" (el QR embebe dominio + id).
- **Acción:** centralizar en un servicio `getPublicProfileUrl()` que derive `origin` de `NEXT_PUBLIC_APP_URL`/headers y mapee `codigoPublico → ruta estable`, con tests unitarios.

### C2. Enlaces de documentos rotos (404)
- `viserys` declara 4 documentos con URLs `public/docs/viserys/*` que **no existen** en el repo (únicas carpetas de docs: `alix`, `chicarrona`, `loki`, `lucca`, `niko`).
- Verificado en smoke test: `/docs/viserys/cartilla-vacunacion.pdf` → **404**.
- `public/docs/chicarrona` es un typo de `chicharrona` y **no se referencia desde los datos** (chicharrona tiene `documentos: []`): carpeta muerta.
- **Impacto:** un visitante del perfil de Viserys abre/descarga documentos rotos. Es un estado roto del prototipo actual.
- **Acción:** decidir por mascota: subir assets reales o quitar documentos del JSON. Validar en CI que `documentos[].url` exista.

### C3. La fuente de datos está fuera de los tipos del dominio (drift silencioso)
- `getAllPets.ts:4` → `const pets = mascotas as PetProfile[]`
- El cast `as` **no valida** los datos: por reglas de comparabilidad de TypeScript, `talla: "Pequeña"` (chicharrona y freya) **no pertenece a `PetSize`** y aun así `tsc` pasa sin error (verificado con test mínimo en TS).
- `mascotas.json` puede evolucionar fuera del contrato de `PetProfile` sin ningún error de compilación ni runtime.
- **Impacto:** tipos que prometen más de lo que garantizan; el dominio se convierte en documentación aspiracional.
- **Acción:** validación de datos en build (script `validate:data`) con type guards, o rutas puras de tipo sin `as`.

## 3.2 ALTO

### A1. Vulnerabilidades de dependencias (`npm audit`: 2 moderadas, 6 altas, 1 crítica)
- **Next.js 16.2.9** afectado por varios GHSA críticos (incl. RCE en Image Optimization API con AVIF: `GHSA-2xp9-vwfh-vxw4`, DoS Server Actions: `GHSA-m99w-x7hq-7vfj`, disclosure de endpoints: `GHSA-955p-x3mx-jcvp`, etc.).
- `sharp` (transitiva de `next/image`) con CVEs de libvips/libheif.
- `postcss`/`@tailwindcss/postcss` y otras transitivas del tooling de build (browserslist, brace-expansion, js-yaml, nanoid, baseline-browser-mapping).
- Fix disponible en `next@16.3.5` (fuera del rango declarado porque `next` está fijado en versión exacta `16.2.9`).
- **Nota:** la app es SSG y no usa Server Actions ni middleware, pero `next/image` **sí** usa el optimizador. Actualizar Next minimiza la superficie crítica → alta prioridad.

### A2. Enlaces de WhatsApp inválidos o inconsistentes
- `lucca` / `niko`: `whatsapp` de 10 dígitos sin país → `https://wa.me/5656091856` es **inválido** en WhatsApp (requiere código de país).
- `alix`: usa formato 13 dígitos con el "1" móvil (`5215534567890`) — inconsistente con el resto.
- `formatPhoneForDisplay` (`mapping/profile.ts:157`) solo contempla 10 y 12 dígitos; con 13 dígitos devuelve el texto crudo.
- **Impacto:** el CTA de WhatsApp —segundo contacto de emergencia— falla en varios perfiles.
- **Acción:** normalizar `contacto.whatsapp` a formato internacional (52…); centralizar `getWhatsAppLink()` con tests.

### A3. Descarga de QR en baja resolución y sin SVG
- `QRShareCard.tsx`: el PNG se genera desde el SVG renderizado (≈112 px) → resolución insuficiente para impresión/placa.
- No existe exportar SVG, ni copiar URL, ni instrucciones de impresión (roadmap §1.3).
- **Acción:** generar PNG en alta resolución (2x-4x), exportar SVG nativo y botón "copiar URL".

### A4. Botón "copiar ID" sin función real
- `PetHeader.tsx:93` → icono `<Copy>` puramente decorativo. El roadmap (§1.1) pide "acción real de copiar ID". También falta copiar URL del perfil desde el header.

### A5. `html-to-image` importado estáticamente
- `LostPetAlertForm.tsx:4` → `import { toBlob, toPng } from "html-to-image"`.
- Infla el bundle de la ruta `/alerta` aunque la captura ocurre solo si el usuario presiona un botón. Roadmap FASE 7.1 pide carga dinámica (`dynamic()` / `import()` on demand).
- `framer-motion` (5.6 MB en node_modules) solo se usa en `RecentPhotos`; verificar que no entre en bundles compartidos.

### A6. No existe testing automatizado
- No hay framework (`vitest`/`jest`), ni script `test`, ni un solo caso de prueba.
- El "funciona en mi computadora" del CHANGELOG es el único criterio de verificación usado hasta ahora.
- **Bloqueante** para la Definition of Done del roadmap (mappers, fechas, datos, QR, alerta, estados, servicios).

## 3.3 MEDIO

### M1. Generación de URL pública duplicada y datos muertos en `qr`
- `qr.texto` ("QR temporal de …") no se usa en ningún componente (verificado con grep).
- `qr.urlPublica` compite con las URLs que se regeneran a mano en los componentes.
- Debe haber **un solo** servicio de URL pública (§ C1) y eliminar el campo muerto.

### M2. `useLostAlerts` valida solo `active`
- `useLostAlerts.ts:29-31` → valida `parsed.active === true`, pero no valida el shape del payload (`zonaPerdida`, `fechaPerdida`, `recompensa`, `mensaje`).
- El roadmap FASE 7.2 exige: try/catch (ya existe), **fallback en memoria** y **validación de payload**.
- La cache en memoria (`cache = new Map`) no se hidrata con el storage tras un cambio externo en otra pestaña al primer render (depende del evento `storage`); aceptable, pero sin tests de los escenarios storage bloqueado / JSON corrupto.

### M3. `next/image` con assets locales grandes
- Fotografías de perfil de 100–280 KB (lucca 109 KB → arya 275 KB, frey 238 KB, viserys 271 KB…).
- `next/image` las optimiza en runtime, pero para "conectividad reducida" (amenaza del proyecto académico) conviene comprimirlas/redimensionarlas desde el repo.
- `alt` correctos; `priority` solo en `PetHeader` (correcto). `DocumentPreview` usa `<img>` crudo para thumbnails (correcto para captura, pero sin optimización).

### M4. `ProfileNav` ofrece secciones que pueden no existir
- El nav incluye `fotos` y `documentos`, pero `fotos` se omite del DOM cuando no hay fotos (perfil/[id]/page.tsx:87). Clic en "Fotos" hace scroll a nada.
- `navItems` debería derivarse de qué secciones existen en esa mascota.

### M5. Metadata social ausente
- No hay Open Graph, Twitter Card ni imagen social en `layout.tsx` ni en los `generateMetadata` de perfil. Roadmap §1.1 lo pide. Relevante además porque los perfiles se comparten vía QR/alerta.

### M6. Accesibilidad técnica incompleta
- Cursor global custom en `body *` y `button/a` (`globals.css:65-71`, `140-142`): decisión de diseño, pero degrada la affordance del puntero clásico.
- Faltan: skip-link, `focus-visible` consistente en todos los botones interactivos (varios solo tienen `hover`), y `aria-current` inconsistente (se usa en ProfileNav pero no en SiteNav).
- La mayoría de estados vacíos, `alt` e iconos con `aria-label` están bien resueltos. WCAG pendiente en contraste de ciertos textos `text-gray-400` sobre fondos claros.

### M7. Riesgo de hidratación residual en tema
- `ThemeProvider` usa `useSyncExternalStore` con `getServerSnapshot = "light"` (correcto, elimina mismatch) y script inline pre-hidratación en `layout.tsx`.
- **No se escucha `matchMedia` change** en caliente: si el SO cambia de tema con la app abierta no se propaga. Menor; documentado como mejora.

## 3.4 BAJO

### B1. Duplicación de metadatos de tipo de documento
- `getDocumentTypeLabel` (`petDocuments.ts:14`) y `typeBadge` (`DocumentPreview.tsx:9`) definen por separado PDF/Imagen/Archivo y sus variantes.

### B2. Valores centinela en datos de salud
- `alergias: ["Ninguna registrada"]` y `condicionesMedicas: ["Ninguna"]` en lucca/niko/alix; `HealthCard` los filtra "a mano" con string-matching frágil (`HealthCard.tsx:26-27`). Normalizar datos a `[]` y simplificar el componente.

### B3. Componente UI dentro de `lib/`
- `petIcon.tsx` es un componente JSX en la capa de lib. Trivial, pero desdibuja la separación de capas.
- `formatPhoneForDisplay` vive en `mapping/profile.ts`; es un helper de presentación, mejor en `lib`.

### B4. Rutas ausentes intencionales
- `/login` es un stub (correcto según roadmap FASE 11, no implementar Auth aún). Registrar como decisión explícita.

### B5. Archivos de build presentes en el repo de trabajo
- `next-env.d.ts` en disco (gitignored, se regenera) y `tsconfig.tsbuildinfo` (gitignored). Correcto.

## 3.5 DEUDA TÉCNICA

| ID | Deuda | Detalle |
| --- | --- | --- |
| DT1 | Datos sin validación de tipos | `as PetProfile[]` enmascara drift (C3). |
| DT2 | URL pública generada en 3 sitios | QRShareCard, LostPetAlertForm, `qr.urlPublica` (C1). |
| DT3 | Dominio hardcodeado | `petcarnet.app` en 2 componentes (C1). |
| DT4 | Carpetas de docs inconsistentes | typos + 7 mascotas sin carpeta de docs (C2). |
| DT5 | `generateStaticParams` repetido en 4 rutas | perfil, alerta, documentos, vacunas → extraer `getAllPetStaticParams()`. |
| DT6 | Sin scripts de calidad | `package.json` no tiene `typecheck` ni `test` separados; versión `0.1.0` sin estrategia. |
| DT7 | Sin CI/CD | roadmap §13: lint → typecheck → build → tests → preview. Nada automatizado. |
| DT8 | Sentinels y cartografía de estados | datos "Ninguna/Ninguna registrada" + `PetStatus` sin máquina de estados (roadmap FASE 3). |
| DT9 | Sin test del hook de alerta | localStorage no testeado (M2). |

## 3.6 MEJORA FUTURA (fases siguientes, NO ahora)

Alineadas al Roadmap Maestro para no adelantar trabajo:

- **FASE 1:** copiar URL real, alta resolución + SVG del QR, Open Graph, estados y consistencia (los PRs 1-5 cubren la parte técnica).
- **FASE 2 (emergencias):** "Encontré esta mascota", geolocalización voluntaria, instrucciones dinámicas de manejo, avistamientos (requerirá backend).
- **FASE 3:** máquina de estados `en_casa/perdido/en_adopcion/adoptado/rescatado/fallecido` como estado real del dominio.
- **FASE 5:** expediente sanitario (desparasitación, historial médico, exportación PDF).
- **FASE 6:** carnet físico imprimible (PrintableCard, PNG/SVG/PDF, placa/dije).
- **FASE 7:** PWA (manifest, service worker, estrategia offline) y performance del perfil QR.
- **FASE 8:** telemetría mínima y pruebas reales de escaneo QR (>95%).
- **FASE 9+:** capa de `services` (ya preparada por el mapeo actual), luego Supabase + Auth + RLS, luego refugios/adopciones/transparencia.
- Config mínima de despliegue (vercel) solo cuando se decida subir a producción.

---

## 4. PRÓXIMOS 5 PRs PROPUESTOS (orden de prioridad)

Según el criterio del roadmap (núcleo QR/emergencia → robustez → testing) y la severidad de hallazgos:

| # | PR sugerido | Rama | Resuelve | Prioridad |
| --- | --- | --- | --- | --- |
| 1 | Centralizar URL pública del perfil (QR estable) | `fix/qr-url-estable` | C1, DT2, DT3, M1 | CRÍTICA |
| 2 | Higiene y validación de datos de mascotas | `fix/data-higiene` | C2, C3, A2, B2, DT4 | CRÍTICA |
| 3 | QR: alta resolución + SVG + copiar URL/ID | `feat/qr-descarga-avanzada` | A3, A4 | ALTA |
| 4 | Robustecer `useLostAlerts` + carga dinámica de `html-to-image` | `refactor/lost-alert-robusto` | A5, M2 | ALTA |
| 5 | Framework de tests unitarios + primeros casos | `test/unit-inicial` | A6 (inicio) | ALTA |

### Contrato tentativo para EQUIPO B (coordinación)

- **Service de URL pública** que B podrá consumir al integrar backend:
  - Tipo: `getPublicProfileUrl(pet: PetProfile): string` (testeable, sin dependencia de `window`)
  - Entrada: `identificacion.codigoPublico` (ruta estable) + `NEXT_PUBLIC_APP_URL` (fallback a origin/nombre canónico)
  - Cuando llegue Supabase, la URL NO depende de filas: se construye con la identidad pública inmutable.
- **Validación de datos**: `validate:data` correrá en CI antes de build; si B edita `mascotas.json`, deberá pasar validación de tipos y de rutas de documentos.
- **Sin cambios en el área de diseño**: los PRs 1-5 no tocan estilos de componentes excepto los interactivos del QR/ID en PR 3.

---

## 5. VERIFICACIÓN DE ESTE DOCUMENTO

- `npm run lint` ✅
- `npx tsc --noEmit` ✅
- `npm run build` ✅ (49 páginas SSG)
- Smoke test servidor: 200 en todas las rutas; 404 correcto para `/perfil/<inexistente>`; **404 confirmado para `/docs/viserys/*`** (C2).
- Dependencia del entorno oculta: ninguna.