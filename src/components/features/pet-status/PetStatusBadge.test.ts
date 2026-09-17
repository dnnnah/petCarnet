import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import type { PetEmergency, PetStatus } from "@/types/pet";
import { PetStatusBadge } from "./PetStatusBadge";

function buildEmergency(): PetEmergency {
  return {
    perdido: false,
    fechaPerdida: null,
    zonaPerdida: null,
    mensajeEmergencia: null,
    recompensa: null,
    instrucciones: [],
  };
}

function renderBadge(status: PetStatus): string {
  return renderToStaticMarkup(
    createElement(PetStatusBadge, {
      petId: "test-1",
      emergency: buildEmergency(),
      status,
    }),
  );
}

describe("PetStatusBadge", () => {
  it("muestra la etiqueta de cada estado efectivo sin señal runtime", () => {
    expect(renderBadge("en_casa")).toContain("En casa");
    expect(renderBadge("perdido")).toContain("Perdido");
    expect(renderBadge("en_adopcion")).toContain("En adopción");
    expect(renderBadge("adoptado")).toContain("Adoptado");
    expect(renderBadge("rescatado")).toContain("Rescatado");
    expect(renderBadge("fallecido")).toContain("En memoria");
  });

  it("usa el tono rosa para perdido", () => {
    const html = renderBadge("perdido");
    expect(html).toContain("bg-rose-100");
  });

  it("muestra el estado terminal sin tono de alerta", () => {
    const html = renderBadge("fallecido");
    expect(html).toContain("En memoria");
    expect(html).not.toContain("Perdido");
  });
});