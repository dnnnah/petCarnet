import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import type { PetEmergency, PetStatus } from "@/types/pet";
import { PetStatusSection } from "./PetStatusSection";

function buildEmergency(overrides: Partial<PetEmergency> = {}): PetEmergency {
  return {
    perdido: false,
    fechaPerdida: null,
    zonaPerdida: null,
    mensajeEmergencia: null,
    recompensa: null,
    instrucciones: ["Reportar a la familia"],
    ...overrides,
  };
}

function renderSection(status: PetStatus, emergency?: PetEmergency): string {
  return renderToStaticMarkup(
    createElement(PetStatusSection, {
      petId: "test-1",
      petName: "Lucca",
      emergency: emergency ?? buildEmergency(),
      whatsappNumber: "5215551234567",
      status,
    }),
  );
}

describe("PetStatusSection", () => {
  it("no renderiza nada para en_casa sin señal", () => {
    expect(renderSection("en_casa")).toBe("");
  });

  it("delega en la UI de Fase 2 cuando el modo perdido es estático", () => {
    const html = renderSection("perdido", buildEmergency({ perdido: true, zonaPerdida: "Parque de la Condesa" }));

    expect(html).toContain("Lucca está perdido");
    expect(html).toContain("Alerta activa");
    expect(html).toContain("Última vez visto");
    expect(html).toContain("Parque de la Condesa");
  });

  it("muestra el banner de adopción para en_adopcion", () => {
    const html = renderSection("en_adopcion");
    expect(html).toContain("Lucca está buscando familia");
    expect(html).not.toContain("está perdido");
  });

  it("muestra el memorial y bloquea el overlay para fallecido aunque la señal estática esté activa", () => {
    const html = renderSection("fallecido", buildEmergency({ perdido: true }));

    expect(html).toContain("En memoria de Lucca");
    expect(html).not.toContain("está perdido");
    expect(html).not.toContain("Alerta activa");
  });
});