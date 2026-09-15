# REPRODUCIBILITY_REPORT — Clone Test desde cero

**Agente:** IA B (Product / Frontend / UX / QA funcional)
**Fecha:** 2026-09-14
**Rama de trabajo:** `ux/clone-test-audit` (basada en `origin/main` @ `8e2b8a3`)
**Entorno:** macOS (darwin), zsh, Node v25.9.0, npm 11.12.1

> Objetivo: verificar si una computadora nueva puede reconstruir y ejecutar
> PetCarnet a partir de Git. Este reporte documenta qué funcionó, qué falló,
> qué faltaba y qué dependía de la máquina original. **No se corrigieron
> bugs intencionalmente:** primero se registra, después se decide.

---

## 0. Cómo se obtuvo el repositorio

- El directorio local ya contenía `PetCarnet_Roadmap_Maestro.md` **fuera de
  Git** (archivo local, no versionado).
- El repo remoto se obtuvo con:

  ```bash
  git init
  git remote add origin https://github.com/dnnnah/petCarnet.git
  git branch -M main
  git pull origin main
  ```

- Estado inicial de la rama remota `main`: último commit `8e2b8a3 Merge pull
  request #1 from dnnnah/feat/rediseno-ui` — 20 commits de historia, sin ramas
  secundarias remotas (verificado con `git branch -a`).
- Se creó rama propia `ux/clone-test-audit` antes de cualquier cambio
  (regla: nunca trabajar sobre `main`).

---

## 1. Resultados del Clone Test

### 1.1 `npm install`

| Resultado | Detalle |
| --- | --- |
| ✅ Instalación correcta | 369 paquetes en 26 s |
| ⚠️ Vulnerabilidades | `npm audit`: **9 vulnerabilidades (2 moderate, 6 high, 1 critical)** |

La vulnerabilidad **critical** es `next@16.2.9`, dentro del rango afectado
`9.3.4-canary.0 - 16.3.2` según `GHSA-6gpp-xcg3-4w24` (bypass de
Middleware/Proxy en App Router), además de SSRF en Server Actions, DoS y
`sharp`. La versión más reciente publicada es **next@16.3.5** (fuera del
rango afectado). Otras dependencias señaladas: `browserslist`, `js-yaml`,
`nanoid`, `brace-expansion` (todas transitivas, la mayoría vía tooling de
ESLint/Next).

> **Acción pendiente (Equipo A):** decidir upgrade de `next` a `16.3.x`.
> No se ejecutó `npm audit fix --force` porque modificaría la versión
> declarada y afecta al build (dominio de arquitectura).

### 1.2 `npm run dev`

| Resultado | Detalle |
| --- | --- |
| ✅ Arranca | `Ready in 161ms` en `http://localhost:3000` |
| ✅ Rutas probadas | `/` y `/perfil/lucca` responden **200** |

### 1.3 `npm run lint`

| Resultado | Detalle |
| --- | --- |
| ✅ Sin errores | `eslint` termina limpio |

### 1.4 `npx tsc --noEmit`

| Resultado | Detalle |
| --- | --- |
| ✅ Sin errores | exit code 0 (TypeScript estricto) |

### 1.5 `npm run build`

| Resultado | Detalle |
| --- | --- |
| ✅ Compila | 1636 ms (Turbopack), TypeScript 1001 ms |
| ✅ SSG | 49 páginas estáticas generadas (11 perfiles × perfil/vacunas/documentos/alerta + home + login + not-found + icon) |

### 1.6 `npm run start` (servidor de producción)

| Ruta | Código |
| --- | --- |
| `/` | 200 |
| `/perfil/lucca` | 200 |
| `/perfil/lucca/vacunas` | 200 |
| `/perfil/lucca/documentos` | 200 |
| `/perfil/lucca/alerta` | 200 |
| `/perfil/loki` | 200 |
| `/perfil/niko` | 200 |
| `/login` | 200 |
| `/perfil/noexiste` | 404 (correcto) |

### 1.7 Errores de consola en navegador

- Verificado con Google Chrome headless (con `--enable-logging=stderr`):
  **0 errores de consola de la aplicación** (los únicos mensajes de error
  son internos de Chrome en headless de macOS: `CVDisplayLink`, `task_policy`
  — no relacionados con la app).

---

## 2. ✅ Qué funcionó correctamente

- Dependencias reproducibles (`package-lock.json` presente).
- Lint, TypeScript y build limpios.
- Todas las rutas públicas responden (SSG correcto, 0 rutas rotas de
  navegación).
- Datos legibles para las 11 mascotas.
- Render correcto de: header del perfil, salud, veterinario, vacunas,
  documentos, galería, contacto, QR, alerta, login.
- `useLostAlerts` y `theme` toleran `localStorage` bloqueado (try/catch +
  fallback en memoria).

---

## 3. ⚠️ Qué falló / faltaba / no estaba documentado

### 3.1 IU con recursos rotos (datos + carpeta estática)

- **`public/docs/viserys/` NO existe** pero `mascotas.json` referencia
  `/docs/viserys/*` (cartilla, comprobante, `foto-reciente.jpg`,
  `estudios-medicos.pdf`). Verificado: **404 en HTTP**.
  - Impacto visible: la galería "Fotos recientes" de Viserys renderiza una
    imagen rota (`/docs/viserys/foto-reciente.jpg`) y los documentos
    públicos de Viserys apuntan a PDFs inexistentes.
- **`public/docs/chicarrona/` (typo) existe pero su mascota es
  `chicharrona`.** La carpeta correcta `public/docs/chicharrona/` NO existe.
  - Impacto: sin enlaces rotos en la UI (Chicharrona no declara
    documentos), pero es una carpeta muerta con el nombre mal escrito.
- **`public/pets/viserys.jpeg`** sí existe ✅ (la foto del header funciona);
  el problema es sólo `docs`.

### 3.2 Dominio QR "de mentira" (no documentado)

- El QR codifica `https://petcarnet.app/perfil/<id>` de forma **hardcodeada**
  en `QRShareCard.tsx:16`, `LostPetAlertForm.tsx:31` y
  `LostPetAlertImage.tsx` (`profileUrl`).
- `petcarnet.app` **no está desplegado** (no existe). Verificado en el repo:
  no hay variables de entorno ni `metadataBase`; la app se ejecuta en
  `localhost`.
- Consecuencia real: un QR escaneado en campo **no llevaría a ninguna parte**
  en producción actual. Para una placa física esto hace el producto inútil.
- La URL también se muestra en la UI como texto (`https://petcarnet.app/…`),
  confundiendo al usuario en entorno local.

### 3.3 README desactualizado

- `README.md:24` declara «Alertas: **html2canvas** para generacion de
  imagenes», pero `CHANGELOG` (sub-fase 12.2) reemplazó `html2canvas` por
  **`html-to-image`**. La documentación desactualizada confunde a quien
  reconstruye.
- `README.md` no menciona los comandos `lint` ni `tsc` (aunque la tabla de
  comandos lista `lint`).
- No existe `DOCUMENTACION.md` versionado, aunque el `PetCarnet_Roadmap_Maestro.md`
  (no versionado) la referencia.

### 3.4 Datos inconsistentes (validación de datos pendiente)

- **Teléfonos de formato inconsistente:**
  - `loki`, `viserys`, `frey`, `sandor`, `bizcocho`, `chicharrona`, `freya`,
    `arya`: `telefonoPrincipal = "552201296480"` (12 dígitos, con código de
    país duplicado/ambigüedad).
  - `alix`: `telefonoPrincipal "5534567890"` pero `whatsapp "5215534567890"`
    (formato diferente al resto).
  - `formatPhoneForDisplay` (`src/lib/mapping/profile.ts:157`) formatea 12
    dígitos como `+55 22 0129 6480` — **agrupación rota** vs. lo esperado
    (`+52 55 2201 2964…`). Se ve mal en la UI para 8 de 11 mascotas.
- **Representación inconsistente de "no tiene":**
  - `alergias`: `["Ninguna registrada"]` (lucca/niko/alix) vs `[]` (resto).
  - `condicionesMedicas`: `["Ninguna"]` (lucca/niko) vs `[]` (resto).
  - El frontend codifica el caso "Ninguna registrada" en `HealthCard.tsx`,
    lo que **duplica la regla** en UI + datos.
- **`qr.urlPublica` es relativo** (`/perfil/<id>`) pero el componente ignora
  ese valor y hardcodea el dominio.

### 3.5 Estado de vacunas resumen "Al día" engañoso

- `PetHeader` muestra «Vacunas: Al día» salvo que exista una vacuna con
  `estatus === "vencida"`. `niko` tiene `proxima_dosis` en Triple Canina y
  nuevamente muestra "Al día" sin aviso de próxima dosis en el resumen.
  - Debería existir un aviso de próxima dosis o "pendiente", no sólo
    vencido.

### 3.6 SEO / Open Graph inexistente

- Los perfiles tienen `title` + `description` básicos
  (`perfil/[id]/page.tsx:40-45`) pero **sin Open Graph, Twitter Card,
  canonical, imagen social ni `metadataBase`** (`app/layout.tsx`).
- No se puede compartir un perfil con vista previa rica (objetivamente
  importante para la alerta de mascota perdida).

### 3.7 Estado de la `main` vs. requisitos de proceso

- No hay CI configurado; `main` recibe merges directos (sólo hubo un PR
  histórico). No hay ramas remotas de trabajo.
- `PetCarnet_Roadmap_Maestro.md` no está versionado — los nuevos integrantes
  no lo tienen por Git.

---

## 4. Qué depende de la computadora original (dependencias de entorno)

| Aspecto | Dependencia de máquina original | Cómo se resolvió aquí |
| --- | --- | --- |
| Nada obligatorio para build/dev | — | Se ejecutó sin config extra |
| Chrome headless para pruebas (sólo QA manual/visual) | El equipo original usó verificación en browser | `Google Chrome` ya instalado en macOS; comandos de captura funcionan |
| Versión de Node | `package.json` sin `engines` ni `.nvmrc`; Next 16 exige Node ≥ 18.18 | Node v25.9.0 funciona |
| Puerto 3000 | Ninguna app original en uso | Disponible |

**Conclusión:** la reconstrucción es posible y funciona **sin configuración
adicional** excepto Node moderno. El proyecto es genuinamente reproducible.
Lo que NO es reproducible es el *producto real* (el QR apunta a un dominio
inexistente) — eso no es un problema de build sino de despliegue.

---

## 5. Media de confianza del Clone Test

| Comando | Estado |
| --- | --- |
| `npm install` | ⚠️ con 9 vulnerabilidades |
| `npm run dev` | ✅ |
| `npm run lint` | ✅ |
| `npx tsc --noEmit` | ✅ |
| `npm run build` | ✅ |
| `npm run start` | ✅ |

## 6. Resumen de issues registrados (para priorizar con Equipo A)

| # | Issue | Gravedad | Área |
| --- | --- | --- | --- |
| R-1 | Recursos `/docs/viserys/*` rotos (404) → imagen/PDF rotos en perfil | Alta | Datos/estáticos |
| R-2 | QR hardcodeado a `petcarnet.app` (dominio inexistente) | Crítica (producto) | Frontend/Despliegue |
| R-3 | `next@16.2.9` con vulnerabilidad crítica; subir a 16.3.5 | Alta (seguridad) | Arquitectura |
| R-4 | Teléfonos inconsistentes + `formatPhoneForDisplay` mal para 12 dígitos | Media | Datos/lib |
| R-5 | README desactualizado (`html2canvas`), sin comando de QA en docs | Media | Docs |
| R-6 | "Al día" oculta próxima dosis en resumen del header | Media | Frontend |
| R-7 | Sin SEO/OG/canonical/social image | Media | Frontend |
| R-8 | Datos duplican "no tiene" como `["Ninguna registrada"]` vs `[]` | Baja | Datos |

---

## 7. Método y artefactos de esta auditoría

- Las rutas se probaron contra `npm run start` y `npm run dev` con
  `curl` (códigos HTTP).
- El render real de la app se verificó con Chrome headless
  (`--dump-dom` en `/`, `/perfil/lucca`, `/perfil/lucca/{vacunas,alerta,documentos}`,
  `/login`) y capturas en 375, 390, 414, 768, 1024 y 1440 px.
- Errores de consola: 0 de la aplicación.
- Los hallazgos de UX están en `UX_AUDIT.md`.