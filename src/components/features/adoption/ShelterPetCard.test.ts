import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it, vi } from "vitest";
import { ShelterPetCard } from "./ShelterPetCard";
import type { ShelterPetCardPresentation } from "@/lib/mapping/adoptionPresentation";

vi.mock("next/image", () => ({
  default: (props: Record<string, unknown>) => createElement("img", props),
}));

function buildPet(overrides: Partial<ShelterPetCardPresentation> = {}): ShelterPetCardPresentation {
  return {
    petId: "mila",
    name: "Mila",
    species: "Perro",
    breed: "Mestizo",
    image: "/pets/alix.jpeg",
    code: "PC-MILA-001",
    statusLabel: "En adopción",
    statusTone: "purple",
    adoptable: true,
    profileHref: "/perfil/mila",
    adoptionHref: "/perfil/mila/adopcion",
    ...overrides,
  };
}

function renderPet(pet: ShelterPetCardPresentation): string {
  return renderToStaticMarkup(createElement(ShelterPetCard, { pet }));
}

describe("ShelterPetCard", () => {
  it("muestra la etiqueta de estado efectivo", () => {
    const html = renderPet(buildPet());
    expect(html).toContain("En adopción");
  });

  it("muestra el botón de solicitar adopción solo para mascotas disponibles", () => {
    const html = renderPet(buildPet());
    expect(html).toContain("Solicitar adopción");
    expect(html).toContain('href="/perfil/mila/adopcion"');

    const htmlNoAdoptable = renderPet(
      buildPet({ adoptable: false, statusLabel: "Perdido", statusTone: "rose" }),
    );
    expect(htmlNoAdoptable).not.toContain("Solicitar adopción");
    expect(htmlNoAdoptable).toContain("Perdido");
  });

  it("siempre ofrece el enlace al perfil completo", () => {
    const html = renderPet(buildPet());
    expect(html).toContain('href="/perfil/mila"');
    expect(html).toContain("Ver perfil");
  });

  it("muestra el código público de la mascota", () => {
    const html = renderPet(buildPet());
    expect(html).toContain("PC-MILA-001");
  });
});