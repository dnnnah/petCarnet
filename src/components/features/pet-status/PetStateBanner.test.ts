import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import type { PetStatus } from "@/types/pet";
import { PetStateBanner } from "./PetStateBanner";

function renderBanner(status: PetStatus): string {
  return renderToStaticMarkup(
    createElement(PetStateBanner, {
      petName: "Lucca",
      status,
    }),
  );
}

describe("PetStateBanner", () => {
  it("anuncia que la mascota está en adopción", () => {
    const html = renderBanner("en_adopcion");
    expect(html).toContain("Lucca está buscando familia");
    expect(html).toContain("En adopción");
    expect(html).toContain("Conocer el proceso de adopción");
    expect(html).toContain('href="#contacto"');
  });

  it("celebra la adopción sin acciones", () => {
    const html = renderBanner("adoptado");
    expect(html).toContain("Lucca encontró un hogar");
    expect(html).toContain("Adoptado");
    expect(html).not.toContain('href="#contacto"');
  });

  it("muestra el estado rescatado", () => {
    const html = renderBanner("rescatado");
    expect(html).toContain("Lucca está a salvo");
    expect(html).toContain("Rescatado");
  });

  it("muestra un memorial respetuoso para fallecido", () => {
    const html = renderBanner("fallecido");
    expect(html).toContain("En memoria de Lucca");
    expect(html).toContain("En memoria");
    expect(html).toContain("Con cariño y para siempre.");
    expect(html).not.toContain("está perdido");
    expect(html).not.toContain("impact");
  });

  it("soporta el estado perdido sin modo perdido activo", () => {
    const html = renderBanner("perdido");
    expect(html).toContain("Lucca está perdido");
    expect(html).toContain("Contactar a su familia");
  });

  it("incluye un aria-labelledby accesible", () => {
    const html = renderBanner("fallecido");
    expect(html).toContain('id="pet-state-banner-title"');
    expect(html).toContain('aria-labelledby="pet-state-banner-title"');
  });
});