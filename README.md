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

## Mascotas de ejemplo

El proyecto incluye 11 mascotas de ejemplo: Lucca, Niko, Alix, Loki, Viserys, Frey, Sandor, Bizcocho, Chicharrona, Freya y Arya.

## licencia

MIT
