import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import type { PetEmergency, PetStatus } from "@/types/pet";
import { PetFooterBanner } from "./PetFooterBanner";

function buildEmergency(overrides: Partial<PetEmergency> = {}): PetEmergency {
  return {
    perdido: false,
    fechaPerdida: null,
    zonaPerdida: null,
    mensajeEmergencia: null,
    recompensa: null,
    instrucciones: [],
    ...overrides,
  };
}

function renderFooter(status: PetStatus, emergency?: PetEmergency): string {
  return renderToStaticMarkup(
    createElement(PetFooterBanner, {
      petId: "test-1",
      petName: "Lucca",
      species: "Perro",
      emergency: emergency ?? buildEmergency(),
      status,
    }),
  );
}

describe("PetFooterBanner", () => {
  it("agradece la ayuda para en_casa", () => {
    const html = renderFooter("en_casa");
    expect(html).toContain("Gracias por ayudar a Lucca a volver a casa");
    expect(html).toContain("Tu ayuda hace la diferencia.");
  });

  it("suma el llamado de ayuda cuando el estado efectivo es perdido", () => {
    const html = renderFooter("perdido", buildEmergency({ perdido: true }));
    expect(html).toContain("Ayuda a Lucca a volver a casa");
  });

  it("no renderiza nada para estados de adopción", () => {
    expect(renderFooter("en_adopcion")).toBe("");
    expect(renderFooter("adoptado")).toBe("");
    expect(renderFooter("rescatado")).toBe("");
  });

  it("no renderiza nada para un estado terminal", () => {
    expect(renderFooter("fallecido")).toBe("");
  });
});