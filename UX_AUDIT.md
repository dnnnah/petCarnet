# UX_AUDIT — PetCarnet como usuario (Black Box Test)

**Agente:** IA B (Product / Frontend / UX / QA funcional)
**Fecha:** 2026-09-14
**Método:** uso real de la aplicación sin estudiar el código primero:
home → listado → perfiles → subpáginas (vacunas/documentos/alerta) → login,
en resoluciones 375/390/414/768/1024/1440 px y modo claro/oscuro. Verificación
del DOM renderizado con Chrome headless y códigos HTTP.

---

## 1. Preguntas del Black Box Test

### 1.1 ¿Qué es PetCarnet?

Según la UI: "Pasaporte digital publico para mascotas con QR de
emergencia". El home lo presenta bien: una ficha pública para que cualquier
persona ayude a una mascota a volver a casa.

### 1.2 ¿Qué hace?

Publica fichas por mascota con: identificación (ID PetCarnet), datos
básicos, estado sanitario (alergias/condiciones/comportamiento), veterinario,
vacunas, documentos, galería de fotos, contacto (llamada + WhatsApp), QR y
generador de alerta de mascota perdida. Todo con datos locales (JSON) y
generación estática.

### 1.3 ¿Cómo encuentro una mascota?

**Sólo se puede navegar el listado del home y filtrar por especie**
(Todos/Perro/Gato). **No hay buscador** por nombre ni por ID PetCarnet.
Confusión: un rescatista que tiene un QR/ID en la mano **no puede buscar
por código**; si el QR no funciona (ver abajo), no hay vía alternativa de
llegar al perfil.

### 1.4 ¿Cómo veo su perfil?

Se hace clic en la tarjeta del listado. El perfil es largo pero está bien
organizado con navegación sticky interna (Contacto, Información, Salud,
Veterinario, Fotos, Vacunas, Documentos). En móvil la navegación interna
muestra sólo iconos (ver a11y).

### 1.5 ¿Cómo funciona el QR?

- Se renderiza un QR real (qrcode.react, SVG 112×112 px, nivel M) que
  codifica **`https://petcarnet.app/perfil/<id>`**.
- **Problema crítico:** `petcarnet.app` no está desplegado. Escanear el QR
  hoy no lleva a ningún perfil.
- Hay botón "Descargar QR" → PNG del tamaño renderizado (112 px), es decir
  **baja resolución inútil para imprimir una placa**.
- **No hay botón "Copiar URL"**, ni exportación SVG, ni instrucciones de
  impresión, ni validación visual (contraste/tamaño).
- Se puede usar como placa física hoy? **No**: dominio muerto + resolución
  de descarga insuficiente + ningún test de legibilidad a distancias.

### 1.6 ¿Qué hago si encuentro una mascota perdida?

- El banner del perfil lo dice: "Por favor contacta inmediatamente" y hay
  botones Llamar / WhatsApp. Además una tarjeta "Qué hacer si encontraste a
  X" con instrucciones.
- **Confusión clave:** no existe un CTA **"Encontré esta mascota"**. El
  flujo guiado (reportar ubicación / avisar) no existe. La persona debe
  deducir que llame o escriba.
- No hay forma de **compartir la ubicación** (geolocalización voluntaria).
- La alerta activa se guarda en `localStorage` (por navegador), el flag
  `emergencia.perdido` es estático del JSON: **no persiste / no es global**.

### 1.7 ¿Cómo contacto al responsable?

- Botones **Llamar** (`tel:`) y **WhatsApp** (`https://wa.me/...` con
  mensaje precargado del JSON) en la tarjeta "Contacto de Emergencia".
  Funcionan y son visibles.
- **Confusión:** el teléfono se muestra formateado mal para 8 de 11
  mascotas (`+55 22 0129 6480` en vez de `+52 55 22…`), lo que resta
  confianza al usuario que va a llamar.
- El contacto no diferencia "normal" de "urgente" más que por el modo
  perdido (estilos). No hay confirmación visual previa a acciones críticas.

### 1.8 ¿Dónde veo vacunas?

- En el perfil, sección "Registro de Vacunas" (resumen de las 3 últimas) y
  enlace "Ver cartilla completa" → `/perfil/<id>/vacunas` con resumen
  contado (al día / próxima dosis / vencidas) y detalle por vacuna.
- Estado vacío correcto en la subpágina ("Sin vacunas registradas").
- **Confusión:** en el perfil principal, si la mascota no tiene vacunas
  (gatos), la sección aparece vacía sin mensaje de estado vacío.

### 1.9 ¿Dónde veo documentos?

- En el perfil, sección "Documentos" (máx. 3 públicos) con "Ver todos" →
  `/perfil/<id>/documentos` con filtros por categoría y estado vacío.
- **Confusión:** los documentos privados se excluyen correctamente
  (`visiblePublico=false`), pero no se comunica que existen privados.
- Los enlaces apuntan a `/docs/<id>/*`; para **viserys todos los archivos
  están rotos (404)** → se ven talones rotos (ver mapa en sección 4).

### 1.10 ¿Qué significa el estado de la mascota?

- El dominio tiene `estado` (`en_casa | perdido`), pero **la UI nunca muestra
  "En casa"**. Sólo se comunica la anomalía: "Perdido".
- Confusión: el usuario no sabe si una mascota está "en casa bien" vs "en
  proceso"; no existe la etiqueta de estado en el header del perfil.
- No existe código de estados `en_adopcion`, `adoptado`, `rescatado` en
  tipos → la UI no puede mostrarlos aunque los datos lo dijeran.

### 1.11 ¿Qué información es pública?

Visible en el perfil público: nombre, especie, raza, foto, género, talla,
color, peso, fecha de nacimiento, rasgos distintivos, alergias,
condiciones, comportamiento, veterinario (clínica, doctor, teléfono y
dirección), vacunas, documentos públicos, **teléfono de contacto**,
WhatsApp, zona habitual/segura, ID PetCarnet.

### 1.12 ¿Qué información debería ser privada?

- **Email** y **teléfono secundario**: ocultos por configuración ✅.
- **Documentos `visiblePublico:false`**: excluidos ✅.
- **Pero hay riesgos:**
  - El **teléfono/WhatsApp del responsable** es público por defecto para
    todas las mascotas (¿aceptable para emergencia? Decisión de producto:
    debería ser configurable y el usuario entenderlo).
  - La **fecha de nacimiento completa** y la **dirección del veterinario**
    son públicas por defecto.
  - El teléfono de contacto aparece también en el **PNG de la alerta**
    (necesario para la utilidad, pero expone un número a quien vea la
    imagen — debería indicarse).

---

## 2. Confusiones registradas (resumen)

| # | Confusión | Impacto |
| --- | --- | --- |
| U-1 | QR apunta a dominio inexistente | El QR como producto no funciona |
| U-2 | Sin buscador por nombre/ID | No puedo llegar a un perfil si el QR falla |
| U-3 | No existe CTA "Encontré esta mascota" | El caso de uso central no tiene flujo |
| U-4 | Sin compartir ubicación (voluntaria) | No se puede reportar dónde está la mascota |
| U-5 | ID PetCarnet con icono "copiar" decorativo (no copia) | Parece interactivo y no lo es |
| U-6 | Teléfonos mal formateados | Desconfianza al llamar (8/11 mascotas) |
| U-7 | Estado nunca visible ("En casa" ausente) | El usuario no sabe el estado actual |
| U-8 | Sin estado de adopción (ni en datos) | No hay camino para "adoptar" |
| U-9 | Alertas sólo en `localStorage` | Activación/desactivación es local; cualquier visitante puede activar la alerta de otra mascota (sin autenticación) |
| U-10 | Vacunas vacías en el perfil principal sin mensaje | Estado vacío incompleto |
| U-11 | Documentos de viserys rotos | Talones rotos en perfil público |
| U-12 | "Descargar QR" baja resolución, sin SVG/copiar URL | No sirve para placa física |

---

## 3. Revisión por área

### 3.1 Perfil público (jerarquía, ID, navegación, estados vacíos, móvil)

✅ **Bien:**
- Jerarquía clara: nombre enorme → raza/especie → badges (edad/género/talla)
  → status cards (vacunas/esterilizado/microchip).
- Navegación interna sticky con scroll suave e IntersectionObserver.
- Estados vacíos de salud y documentos correctos.
- Contraste general bueno en modo claro/oscuro.

❌ **A mejorar:**
- ID PetCarnet aparece como texto + icono Copy **no funcional**; sin
  retroalimentación (no usa `aria-live` ni toast).
- El estado del dominio (`en_casa`) nunca se renderiza; la jerarquía
  "Quién es → Estado → Salud → Contacto → Emergencia → QR" exigida **no se
  cumple**: no hay estado, la salud viene antes que el contacto, y la
  emergencia (perdido) depende de `localStorage`/JSON.
- En móvil, el header ocupa mucho espacio vertical para el nombre
  (text-5xl/6xl) antes del contenido útil.
- Fotos de perfil sin dimensiones `width/height` consistentes para rasgos
  (en cabecera sí usan Next Image con priority ✅).

### 3.2 Contacto

✅ Llamada/WhatsApp claros con `tel:`/`wa.me` y mensaje precargado.
❌ Formato de teléfono roto (12 dígitos); nº muy largo pegajoso en botones;
sin diferenciación visual real urgente vs normal fuera del modo perdido.

### 3.3 QR (ver también 1.5)

| Criterio | Estado | Detalle |
| --- | --- | --- |
| Escaneo | ⚠️ | Codifica dominio inexistente |
| Tamaño | ⚠️ | 112 px render / PNG de igual resolución |
| Contraste | ✅ | Módulos `#111827` sobre `#ffffff` |
| Impresión | ❌ | No hay tamaño/config de impresión; PNG pequeño |
| Móvil | ⚠️ | Cabecera QR ok, pero sin "copiar" rápido |
| Descarga | ⚠️ | Solo PNG a resolución del render; sin SVG |
| SVG | ❌ | No exportable |
| URL | ❌ | Hardcodeada, sin base dinámica |
| Legibilidad | ❌ | Sin pruebas documentadas a distancia |

### 3.4 Mascota perdida / emergencia

✅ Banner inequívoco, instrucciones, contacto urgente, generador de imagen
de alerta con preview, descarga PNG (alto pixelRatio) y compartir nativo.
❌ No hay CTA "Encontré esta mascota"; no hay geolocalización voluntaria ni
mensaje precargado con el mapa; no hay confirmación al activar el modo
alerta; la alerta no persiste (sólo localStorage); la imagen de alerta
incluye QR pequeño (72 px) apuntando al dominio muerto.

### 3.5 Estados

El tipo `PetStatus` sólo permite `en_casa | perdido`. Para soportar
`en_adopcion | adoptado | rescatado` (y eventualmente `fallecido`) hace
falta: (1) ampliar el tipo (Equipo A), (2) representación visual por estado
(badges/colores) en header + listado, sin inventar colores en el dominio.

### 3.6 Adopción

**No existe nada** en UI ni datos. Para preparar el flujo (MOCK/DEMO)
hace falta: banner "En adopción", datos del refugio/rescatista, botón
"Solicitar adopción", formulario y simulación con estado claramente
etiquetado como demo (sin backend no se puede fingir una solicitud real).

### 3.7 Carnet físico / expediente PDF / PWA

- Carnet físico: **no existe**. (QR + ID + instrucciones imprimibles).
- Expediente PDF: **no existe**. (vacunas + desparasitación + alergias +
  veterinario + historial).
- PWA: **no existe**. No hay `manifest.webmanifest`, ni Service Worker, ni
  estrategia offline. No declarar "PWA" todavía.

### 3.8 Responsive (375/390/414/768/1024/desktop)

✅ Probar en las 6 anchuras con capturas: sin overflow horizontal
aparente en home/perfil; nav sticky funciona; galería 3→4 columnas.

❌ **Hallazgos:**
- Navegación del perfil en móvil: iconos 40×40 px, algo por debajo del
  objetivo táctil recomendado (44 px) y sin `aria-label` (a11y).
- `SiteNav` en móvil muestra sólo iconos; los enlaces "Inicio/Mascotas/
  Iniciar sesión" **no tienen `aria-label`** cuando el texto está oculto.
- El ID PetCarnet largo + botón WhatsApp en una columna de ≈ 375 px
  pueden desbordar líneas (verificado sin overflow en 375, pero al límite
  en 320 px no probado).
- El botón "Generar alerta" y "Por favor contacta inmediatamente" son
  grandes y táctiles ✅.

### 3.9 Accesibilidad

✅ Prácticas buenas detectadas: `aria-label` en galería, `aria-pressed` en
filtros, `role="dialog"/aria-modal` en lightbox, teclado (Escape/←/→) en
galería, alt descriptivos, `aria-current` en nav del perfil, `lang="es"`.

❌ **Problemas detectados:**
- Botones icon-only (ProfileNav móvil, SiteNav móvil) sin `aria-label`.
- Sin enlace "Saltar al contenido" (`skip link`).
- `ActionButton` tono `call`: texto blanco sobre gradiente
  `emerald-300→teal-500` — **contraste insuficiente** (blanco sobre
  #34c99a ≈ 2:1, muy por debajo de 4.5:1).
- Etiquetas `text-gray-400/500` sobre fondos claros; riesgo de fallo de
  contraste en textos pequeños (categorías de documentos, "Uppercase"
  pequeños).
- Faltan estilos de foco visibles (`focus-visible`) en varios botones
  (ProfileNav, chips del PetsList, tarjetas clickeables).
- El icono Copy del ID no es un `<button>`: inaccesible por teclado y
  engañoso para lector de pantalla.
- `Picture` por defecto: no se declara `dir` ni se usa `noreferrer` en
  todos los `<a target="_blank">` (DocumentosCard usa `rel="noreferrer"`
  ✅; QRShareCard no tiene enlaces externos ❌ n/a).

### 3.10 SEO / Open Graph

- `title`/`description` por perfil OK, pero **sin** `og:*`, `twitter:`,
  `metadataBase`, `canonical` ni imagen social. Al compartir un perfil (o
  una alerta) la preview es pobre.

---

## 4. Mapa de recursos con estado (datos → estáticos)

| Recurso esperado por datos | ¿Existe en `public/`? | HTTP |
| --- | --- | --- |
| `/pets/lucca.jpeg` … `/pets/arya.jpeg` | ✅ | 200 |
| `/docs/lucca/*`, `/docs/niko/*`, `/docs/alix/*`, `/docs/loki/*` | ✅ | 200 |
| `/docs/viserys/*` (4 archivos) | ❌ carpeta ausente | **404** |
| `/docs/chicharrona/*` | ❌ (sólo existe `chicarrona` con typo) | 404 |
| `/docs/frey/*` | ❌ (sin documentos declarados → sin UI rota) | 404 |

---

## 5. Prioridades propuestas (producto, ordenadas)

1. **QR funcional**: base URL dinámica/real (+ copiar URL, SVG, resolución
   alta para placa) — sin esto el producto no sirve.
2. **Flujo "Encontré esta mascota"** + compartir ubicación voluntaria +
   confirmación de alerta.
3. **Perfil**: render del estado real del dominio (badge claro), ID copiable
   de verdad, jerarquía "quién es → estado → salud → contacto → emergencia
   → QR", estado vacío de vacunas en perfil, teléfonos bien formateados.
4. **Adopción (MOCK/DEMO)**: badge "En adopción", tarjeta de refugio/
   rescatista, botón "Solicitar adopción", formulario etiquetado como demo
   (sin backend no fingir solicitud real).
5. **Base de accesibilidad/responsive**: skip-link, aria-label en
   icon-only, foco visible, contraste de ActionButton, targets ≥44 px.

Prioridades transversales (con Equipo A): arreglar `/docs/viserys`
(recursos o datos), decidir política de privacidad de contacto y subir
`next` (vulnerabilidades).

---

## 6. Nota sobre el alcance

Este es un **audit de producto/UX** (capa de presentación). Los cambios de
dominio (`PetStatus`, nuevos estados, servicios, persistencia de alertas)
requieren Coordinación con Equipo A antes de implementarse; aquí se
documentan como necesidades compatibles para no romper la arquitectura
actual (JSON/SSG → servicios → Supabase en el futuro).