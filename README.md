# PetCarnet

Pasaporte digital publico para mascotas con QR de emergencia.

## Descripcion

PetCarnet es una aplicacion web que genera fichas publicas e interactivas para mascotas. Cada perfil incluye informacion de contacto, historial medico, vacunas, documentos y un codigo QR que cualquier persona puede escanar para ayudar a una mascota perdida a volver a casa.

## Caracteristicas

- **Perfiles publicos** con informacion de contacto, salud, vacunas y documentos
- **Codigo QR** por mascota que enlaza a su perfil publico
- **Alerta de mascota perdida** con imagen descargable y compartible
- **Galeria de fotos** tipo stories con lightbox
- **Diseno responsive** optimizado para movil, tablet y escritorio
- **Generacion estatica** (SSG) para maximo rendimiento

## Stack tecnico

- **Framework:** Next.js 16 (App Router, SSG)
- **UI:** React 19, TypeScript, Tailwind CSS v4
- **Iconografia:** Lucide React
- **QR:** qrcode.react
- **Alertas:** html2canvas para generacion de imagenes

## Estructura del proyecto

```
src/
├── app/
│   ├── page.tsx                    # Landing page
│   └── perfil/[id]/
│       ├── page.tsx                # Perfil de mascota
│       ├── documentos/page.tsx     # Documentos publicos
│       ├── vacunas/page.tsx        # Cartilla de vacunacion
│       └── alerta/page.tsx         # Generador de alerta
├── components/
│   ├── layout/                     # AppShell
│   ├── features/pet-profile/       # Componentes del perfil
│   └── ui/                         # GlassCard, Badge, ActionButton
├── data/mascotas.json              # Datos de mascotas
├── lib/                            # Helpers y utilidades
└── types/pet.ts                    # Interfaces TypeScript

.agents/skills/                     # Skills de agentes (ver abajo)
```

## Instalacion

```bash
git clone https://github.com/dnnnah/petCarnet.git
cd petCarnet
npm install
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000) en tu navegador.

## Comandos

| Comando | Descripcion |
|---------|-------------|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Generacion estatica |
| `npm run start` | Servidor en produccion |
| `npm run lint` | Verificacion de codigo |

## Skills de agentes

En `.agents/skills/` viven las skills que guiaan a un agente de codigo
(Claude Code, Codex, opencode...) cuando toca esta interfaz. Se instalan desde
GitHub y el origen de cada una queda fijado con su hash en
`skills-lock.json`, asi que todos работа con la misma version.

### Diseno e interfaz

| Skill | Para que |
|--------|-----------|
| `impeccable` | Toolkit de trabajo de diseno: critique, audit, polish, typeset, colorize. La mas usada del set |
| `design-taste-frontend` | Anti-generico: evita que una landing o un rediseño termine pareciendo plantilla |
| `frontend-design` | Direccion estetica, tipografia y decisiones que no se leen como default |
| `web-design-guidelines` | Revision de codigo UI contra las guias de interfaz web (accesibilidad, foco, teclado) |

`impeccable` trae un launcher que se invoca desde el repo. Ojo con la
distincion: **el launcher solo expone unos pocos comandos**, y el resto
(`critique`, `audit`, `polish`, `typeset`, `colorize`, `live`...) no son
comandos de terminal sino flujos que el agente ejecuta leyendo su playbook en
`.agents/skills/impeccable/reference/`.

```bash
S=.agents/skills/impeccable/scripts/impeccable

$S context              # vuelca el contexto del producto (PRODUCT.md); una vez por sesion
$S detect src           # escanea anti-patrones de UI y problemas de calidad
$S ignores              # reglas y archivos de excepcion del detector
$S help                 # lista los comandos disponibles
```

`detect` sale con codigo distinto de cero cuando encuentra algo, asi que no lo
trates como fallo en un script. `check` y `update` necesitan red y ahora mismo
fallan con un 404 al verificar el bundle (arriba del todo, issue #479 de
impeccable); por eso no son la via normal para actualizar esta skill, que se
actualiza a mano con el hash de `skills-lock.json`.

Los flujos de evaluacion y refinado se elegyen leyendo el playbook
correspondiente:

| Flujo | Lee | Para que |
|-------|-----|----------|
| `critique` | `reference/critique.md` | Review UX con scoring heuristico |
| `audit` | `reference/audit.md` | Calidad tecnica: a11y, perf, responsive |
| `polish` | `reference/polish.md` | Pasada final de calidad antes de entregar |
| `typeset` | `reference/typeset.md` | Jerarquia y tipografia |
| `layout` | `reference/layout.md` | Espaciado, ritmo y jerarquia visual |
| `colorize` | `reference/colorize.md` | Color con intencion en UI monocroma |
| `harden` | `reference/harden.md` | Errores, i18n y casos limite |
| `adapt` | `reference/adapt.md` | Dispositivos y anchos |
| `live` | `reference/live.md` | Iterar sobre el navegador |

Dos flujos escriben archivos de contexto: `init` genera `PRODUCT.md` y
`document` genera `DESIGN.md` a partir del codigo existente. El resto
(`shape`, `extract`, `optimize`, `animate`, `clarify`, `delight`, `distill`,
`bolder`, `quieter`, `overdrive`) estan en `reference/` con el mismo nombre.

`detect` tiene un detalle que conviene conocer: marca cualquier
`border-l-2` como `side-tab`, asi que en una interfaz que usa filete lateral
como acento hay que leer ese aviso en contexto, no aplicarlo a ciegas.

Ojo: `impeccable` trae sus scripts y datos vendorizados (~2.2 MB, incluido un
indice de fuentes de 1 MB). Se suben enteros a proposito, porque sin ellos la
skill no se puede ejecutar.

### Framework y codigo

| Skill | Para que |
|--------|-----------|
| `nextjs-app-router-patterns` | App Router: Server Components, streaming, data fetching, cache |
| `vercel-react-best-practices` | Reglas de rendimiento de React y Next.js, con `rules/` por patron |
| `tailwind-css-patterns` | Utilidades de Tailwind, responsive, layout, tipografia |
| `tailwind-design-system` | Tokens y librerias de componentes con Tailwind v4 |
| `typescript-pro` | Tipos avanzados, type guards, branded types, tRPC |

### Anadir o actualizar una skill

1. Copia la skill a `.agents/skills/<nombre>/`, con su `SKILL.md` y lo que
   necesite (`references/`, `rules/`, `scripts/`).
2. Anade la entrada en `skills-lock.json` con `source`, `sourceType`,
   `skillPath` y `computedHash`.
3. Actualiza la tabla de arriba y el arbol de `Estructura del proyecto` si
   aporta un directorio nuevo.

## Mascotas de ejemplo

El proyecto incluye 11 mascotas de ejemplo: Lucca, Niko, Alix, Loki, Viserys, Frey, Sandor, Bizcocho, Chicharrona, Freya y Arya.

## licencia

MIT
