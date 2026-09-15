# FASE 0 — COORDINACIÓN ENTRE AGENTES (A × B)

**Fecha:** 2026-09-14
**Equipo A (arquitectura / core / QA técnico):** `AUDITORIA.md` en `docs/fase-0-auditoria` (base `6064523`, = contenido de `main`).
**Equipo B (product / frontend / UX):** `REPRODUCIBILITY_REPORT.md` + `UX_AUDIT.md` en `ux/clone-test-audit` (base `origin/main` @ `8e2b8a3` = PR #1 merge de `feat/rediseno-ui`).

> Estado de sincronización verificado: `main` === contenido de `feat/rediseno-ui`.
> Ambas auditorías se ejecutaron sobre el mismo código. No hay divergencia de base.
> **Este documento NO implementa nada**: es el plan técnico coordinado para FASE 1.

---

## 1. Hallazgos coincidentes A/B

| Hallazgo | Versión A | Versión B | Evidencia compartida |
| --- | --- | --- | --- |
| QR hardcodeado a dominio inexistente | **C1** (CRÍTICO): `petcarnet.app` en 3 sitios + no usa ruta estable | **R-2** (Crítica) + **U-1**: `petcarnet.app` no desplegado, QR escaneado no lleva a nada | `QRShareCard.tsx:16`, `LostPetAlertForm.tsx:31`, `LostPetAlertImage.tsx` |
| Documentos de Viserys rotos (404) | **C2** (CRÍTICO): `public/docs/viserys/*` no existe; `chicarrona` typo | **R-1** (Alta) + **U-11** + mapa de recursos: 4 archivos 404; `chicharrona` sin carpeta | Smoke test `curl`/HTTP |
| Vulnerabilidad crítica de dependencias | **A1** (ALTO): `next@16.2.9` fijado, afectado; fix en `16.3.5` | **R-3** (Alta): `GHSA-6gpp-xcg3-4w24`, subir a `16.3.5` | `npm audit` (9: 2 mod / 6 high / 1 crit) |
| Teléfonos inconsistentes / formato roto | **A2** (ALTO): `whatsapp` 10 dígitos sin país (lucca/niko), 13 dígitos (alix) | **R-4** + **U-6**: 12 dígitos mal agrupados en `formatPhoneForDisplay` (8/11 mascotas) | `mapping/profile.ts:157` |
| QR baja resolución / sin SVG | **A3** (ALTO): PNG de ≈112 px inútil para placa | **U-12**: igual + sin copiar URL ni impresión | `QRShareCard.tsx` (qrcode.react SVG) |
| "Copiar ID" decorativo sin función | **A4** (ALTO) | **U-5**: mismo icono, no es `<button>` | `PetHeader.tsx:93` |
| Sin SEO / Open Graph | **M5** (MEDIO) | **R-7** + UX §3.10: sin `og:/twitter:/canonical/metadataBase` | `layout.tsx`, `perfil/[id]/page.tsx` |
| Sentinels "Ninguna registrada" vs `[]` | **B2** (BAJO) | **R-8** (Baja) | `mascotas.json`, `HealthCard.tsx:26-27` |
| Accesibilidad técnica incompleta | **M6** (MEDIO): skip-link, focus-visible, aria-current | UX §3.9: sí, más casos concretos (contraste `ActionButton` 2:1, targets <44 px) | `globals.css`, icon-only buttons |

**Conclusión §1:** no hay ningún hallazgo de A contradicho por B ni viceversa. Los 9 coinciden en gravedad relativa y evidencia. A detecta el *porqué técnico*; B detecta el *impacto real de producto*. Son complementarios.

---

## 2. Hallazgos SOLO de A (nivel arquitectura/código, invisibles en black-box)

| ID | Hallazgo | Nota |
| --- | --- | --- |
| C3 | Datos fuera de tipos (`as PetProfile[]`, `talla:"Pequeña"` inválida pasa `tsc`) | B no puede verlo sin leer tipos |
| M1 | `qr.texto` muerto + `qr.urlPublica` compite con URLs regeneradas a mano | — |
| M2 | `useLostAlerts` valida solo `parsed.active`, no el shape del payload | — |
| M4 | `ProfileNav` ofrece "Fotos"/"Documentos" aun si no existen en esa mascota | — |
| M3 | Assets locales grandes para `next/image` | — |
| A5 | `html-to-image` importado estáticamente (infla bundle) | — |
| M7 | Tema no escucha `matchMedia` en caliente | menor |
| A6 | **Cero testing automatizado** (no hay framework ni un caso) | Bloqueante Definition of Done |
| B1 | Duplicación de labels de tipo documento (`petDocuments.ts` vs `DocumentPreview.tsx`) | — |
| B3 / B4 / B5 | UI en `lib/`, `/login` stub, build files gitignored | decisiones triviales |
| DT1–DT9 | Tabla de deuda técnica (validación, URL 3 sitios, dominio, `generateStaticParams` repetido, sin `typecheck/test`, sin CI) | resumen de C/M |

---

## 3. Hallazgos SOLO de B (nivel producto/UX)

| ID | Hallazgo | Fase del roadmap | Requiere A |
| --- | --- | --- | --- |
| R-5 | README desactualizado: dice `html2canvas`, el código usa `html-to-image`; sin comandos de QA documentados | ahora | no |
| R-6 | Resumen "Vacunas: Al día" oculta próxima dosis (`niko`) en `PetHeader` | FASE 1 (UI) | datos |
| U-2 | No hay buscador por nombre / ID PetCarnet (rescatista con QR roto no llega al perfil) | FASE 1/2 | parcial (ruta estable) |
| U-3 | No existe CTA "Encontré esta mascota" | FASE 2 (backend) | sí |
| U-4 | No hay compartir ubicación voluntaria | FASE 2 (backend) | sí |
| U-7 | El estado del dominio (`en_casa | perdido`) nunca se renderiza | FASE 3 (tipos) | sí |
| U-8 | No existe "En adopción" en UI ni tipos | FASE 3 | sí |
| U-9 | Alertas solo en `localStorage`; cualquier visitante activa la alerta de otro (sin auth) | FASE 2 | sí |
| U-10 | Vacunas vacías en el **perfil principal** sin mensaje de estado vacío | FASE 1 (UI) | no |
| U-5b | Contraste de `ActionButton` (blanco sobre `emerald-300→teal-500` ≈ 2:1) | FASE 1 (UI) | no |
| a11y | targets táctiles 40 px < 44 px; sin `aria-label` en icon-only; sin skip-link; focus-visible ausente | FASE 1 (UI) | trasversal |
| Privacidad | Teléfono/WhatsApp del responsable púbico por defecto; decisión de producto pendiente | FASE 1 (decisión) | config |

**Nota de alineación:** U-7/U-8 coinciden con la "mejora futura FASE 3" de A (máquina de estados). No hay conflicto: ambos la postergan; B necesita los tipos ampliados (decisión de A) antes de pintar badges.

---

## 4. Conflictos o interpretaciones diferentes

1. **Teléfonos (A2 vs R-4/U-6):** aparentemente distintos, son dos facetas del mismo problema. A: `whatsapp` mal en el *dato* (10 y 13 dígitos). B: `telefonoPrincipal` de 12 dígitos mal *formateado en UI* (`+55 22 0129 6480`). Resolución: normalizar el dato y reescribir `formatPhoneForDisplay` en un solo PR (PR-3 §9).
2. **Estados del dominio (M/mejora futura de A vs prioridad 3 de B):** B lo prioriza alto desde producto; A lo posterga a FASE 3 por respetar el roadmap. Acuerdo: se hace **badge de estado real (`en_casa|perdido`)** ya en FASE 1 (bajo riesgo, sin ampliar tipos), y la ampliación a adopción/rescatado se mantiene en FASE 3.
3. **Seguridad de la alerta (U-9):** B lo ve como riesgo de producto (activación sin auth). A lo registra como M2/D9 (validación técnica). Acuerdo: en FASE 1 solo se endurece la validación y persistencia local; la autenticación real queda para FASE 2 con backend.
4. **Dominio del QR:** A enfatiza la arquitectura (centralizar origen + ruta estable por `codigoPublico`); B enfatiza el despliegue (dominio muerto). Ambos convergen en el mismo fix; el despliegue real es decisión aparte (no en FASE 1).

Ninguna diferencia bloqueante; todas resueltas arriba.

---

## 5. Responsables por problema

| Problema | Responsable principal | Colabora / revisa |
| --- | --- | --- |
| C1 / M1 / DT2 / DT3 — URL pública centralizada | **A** | B consume el servicio |
| C2 / C3 / A2 / B2 / DT1 / DT4 — datos, validación, docs | **A** | B decide producto (¿Viserys debe tener docs?) |
| A3 / A4 / U-12 — QR descarga avanzada + copiar | **A** | B valida UX/impresión |
| A5 / M2 / U-9(parcial) — alerta robusta | **A** | B valida confirmación al activar |
| A6 / DT6 / DT7 — testing, scripts, CI | **A** | B propone casos funcionales |
| A1 / R-3 — upgrade `next` + audit deps | **A** (riesgo build) | B re-valida rutas después |
| M5 / R-7 — SEO/OG/metadataBase | **A** (estructura) | B aporta imagen social |
| R-5 — README / docs de reconstrucción | **B** | A confirma comandos |
| R-6 / U-10 — resumen de vacunas + estados vacíos | **B** | A normaliza datos |
| U-2 — buscador por nombre/ID | **B** (UI) | A expone índice por `codigoPublico` |
| a11y (skip-link, aria-label, contraste, targets) | **B** | A evita cambiar semántica del nav |
| U-7 — badge de estado real en header | **B** (UI) | A confirma que el dato está en el dominio |
| U-3 / U-4 / U-8 / U-9(full) | **NO en FASE 1** (FASE 2/3, require backend) | — |
| Privacidad de contacto | **B** (decisión de producto) | A implementa config |

---

## 6. Dependencias entre tareas

```
PR-2 fix/qr-url-estable ──────────────┐
                                      ├─► PR-4 feat/qr-descarga-avanzada (usa servicio de URL)
PR-3 fix/data-higiene ──► desbloquea UI de teléfonos (U-6) y docs (U-11) ──► UI de B (R-4/U-6)
PR-1 feat/next-seguridad ──► sincronizar con PR-2..4 (rebuild)              ──► independiente en paralelo
PR-5 refactor/lost-alert ──► tras PR-4 (comparte archivos de alerta)
PR-6 test/unit-inicial ──► tras PR-2 y PR-3 (los servicios nuevos son los primeros tests)
PR-7 docs/readme-qareport (B) ──► independiente, cualquier momento
PR-8 feat/accesibilidad-base (B) ──► independiente; toca componentes que A también toca (ver §8)
```
- **U-2 (buscador)** depende de que PR-2 entregue la ruta estable por `codigoPublico`.
- **U-7 (badge de estado)** depende solo de la lectura del dominio actual (no de tipos nuevos) → se puede paralelizar.
- **Privacidad de contacto** es decisión previa a tocar la tarjeta de contacto en UI; bloqueará cualquier cambio de B en `ContactCard`/`ContactSection` hasta que se decida.

---

## 7. Qué cambios deben hacerse PRIMERO (secuencia coordinada)

1. **PR-1 `feat/next-seguridad` (A)** — `next@16.3.5` + audit. Independiente, desbloquea riesgo crítico mientras todo lo demás avanza.
2. **PR-2 `fix/qr-url-estable` (A)** — servicio `getPublicProfileUrl()` + `NEXT_PUBLIC_APP_URL` + ruta por `codigoPublico`. Base de los demás.
3. **PR-3 `fix/data-higiene` (A)** — valida datos (C3), repara docs de Viserys (decisión con B), normaliza teléfonos y sentinels. Desbloquea la UI de contacto de B.
4. **PR-4 `feat/qr-descarga-avanzada` (A)** — alta resolución, SVG, copiar URL e ID real. Requiere PR-2.
5. **PR-7 `docs/readme-qareport` (B)** — README real + comandos de QA. Puede ir en paralelo desde el día 1.
6. **PR-8 `feat/accesibilidad-base` (B)** — skip-link, aria-labels, contraste, targets. En paralelo con PR-2..4 con vigilancia de §8.
7. Luego **PR-5, PR-6** (alertas robustas, testing) — dependen de que el terreno esté estable.

---

## 8. Archivos con riesgo de CONFLICTO si A y B trabajan en paralelo

| Archivo | Cambios de A | Cambios de B | Mitigación |
| --- | --- | --- | --- |
| `src/components/features/pet-profile/QRShareCard.tsx` | PR-2 (servicio URL), PR-4 (resolución/SVG) | copiar URL, instrucciones de impresión | B espera a PR-4 o los toca después |
| `src/components/features/lost-pet/LostPetAlertForm.tsx` e `Image` | PR-2 (URL), PR-5 (dynamic import) | confirmación al activar alerta | secuencia: A primero |
| `src/app/perfil/[id]/page.tsx` | M4 (derivar `navItems`) | U-10 (vacunas vacías), jerarquía de secciones | cambios pequeños; coordinar |
| `src/components/features/pet-profile/PetHeader.tsx` | A4 (copiar ID real) | U-7 (badge de estado) | distintos bloques del file |
| `src/lib/mapping/profile.ts` | A2 (normalizar teléfono) | (contacto UI usa su salida) | A solo; B solo consume |
| `src/data/mascotas.json` | PR-3 (teléfonos, sentinels, docs) | solo si edita datos para demo | **convención: A es dueño de los datos en FASE 1** |
| `package.json` / `package-lock.json` | PR-1 (next), PR-6 (test scripts) | ninguno | solo A |
| `src/app/layout.tsx` | M5 (metadataBase/OG) | a11y (skip-link, lang) | módulos distintos, sin conflictos directos |
| `README.md` | — | R-5 | solo B |

**Regla de oro:** en FASE 1 A toca capas `lib/`, `data/`, `services/`, `types/`, scripts y metadata; B toca presentación (`components/features/*`, `styles/`, `app/*` layout visual, README). En caso de solape (QRShareCard, PetHeader, `perfil/[id]/page`, lost-pet) el orden es: **A primero, B después**, o se coordina en PRs separados mirando el diff de B antes de mergear.

---

## 9. Orden recomendado para los primeros PRs de FASE 1

| Orden | PR | Rama | Equipo | Resuelve | Prioridad |
| --- | --- | --- | --- | --- | --- |
| 1 | Upgrade `next` + audit limpio | `fix/next-seguridad` | A | A1, R-3 | ALTA (seguridad) |
| 2 | URL pública centralizada (QR estable) | `fix/qr-url-estable` | A | C1, DT2, DT3, M1, U-1, R-2 | CRÍTICA |
| 3 | Higiene y validación de datos + docs | `fix/data-higiene` | A (dato) + B (decisión Viserys) | C2, C3, A2, B2, DT1, DT4, U-11 | CRÍTICA |
| 4 | QR: alta resolución + SVG + copiar URL/ID | `feat/qr-descarga-avanzada` | A + B (UX impresión) | A3, A4, U-5, U-12 | ALTA |
| 5 | README actualizado + comandos de QA | `docs/readme-qareport` | B | R-5 | BAJA (paralelo) |
| 6 | Accesibilidad base | `feat/accesibilidad-base` | B | M6, a11y, U-5b | MEDIA (paralelo) |
| 7 | Alerta robusta + dynamic import | `refactor/lost-alert-robusto` | A | A5, M2, D9 | ALTA |
| 8 | Testing unitario inicial | `test/unit-inicial` | A | A6 | ALTA |

**Después (no en los 8 primeros):** U-10 / R-6 (estados vacíos y aviso de próxima dosis), U-2 (buscador), U-7 (badge de estado con tipos actuales), privacidad de contacto.
**Explicitamente NO en FASE 1:** U-3, U-4, U-8, U-9(backend), máquina de estados ampliada — requieren FASE 2/3 y/o backend Supabase.

---

## 10. Verificación de este documento

- `git fetch origin` ✅ (rama `ux/clone-test-audit` traída; `main` en `8e2b8a3`)
- `git show origin/ux/clone-test-audit:{REPRODUCIBILITY_REPORT,UX_AUDIT}.md` ✅
- Comparación con `AUDITORIA.md` (docs/fase-0-auditoria) ✅
- **Baselines coinciden:** instalación limpia, lint/tsc/build OK (49 SSG), 11 mascotas, 0 errores de consola.
- No se modificó código funcional en esta tarea (ver `git status`/`git diff`).