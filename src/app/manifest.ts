import type { MetadataRoute } from "next";

export const PWA_THEME_COLOR = "#10B981";
export const PWA_BACKGROUND_COLOR = "#ffffff";
export const PWA_ICON_SRC = "/icon.svg";

/**
 * Construye el Web App Manifest de forma pura y testeable.
 *
 * Solo referencia assets que existen (`/icon.svg`, servido por Next desde
 * `src/app/icon.svg`). Los íconos PWA dedicados (PNG 192/512, apple-touch)
 * los aportará el bloque de diseño B posteriormente; ninguna URL se inventa.
 */
export function buildManifest(): MetadataRoute.Manifest {
  return {
    id: "/",
    name: "PetCarnet | Carnet Digital",
    short_name: "PetCarnet",
    description:
      "Pasaporte digital público para mascotas con QR de emergencia.",
    lang: "es",
    start_url: "/",
    scope: "/",
    display: "standalone",
    background_color: PWA_BACKGROUND_COLOR,
    theme_color: PWA_THEME_COLOR,
    categories: ["pet", "emergency", "utilities"],
    icons: [
      {
        src: PWA_ICON_SRC,
        sizes: "any",
        type: "image/svg+xml",
        purpose: "any",
      },
      {
        src: PWA_ICON_SRC,
        sizes: "any",
        type: "image/svg+xml",
        purpose: "maskable",
      },
    ],
  };
}

export default function manifest(): MetadataRoute.Manifest {
  return buildManifest();
}