import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import type { ComponentProps } from "react";
import type { PetEmergency, PetStatus } from "@/types/pet";
import { EmergencyContactSection } from "./EmergencyContactSection";

type Contact = ComponentProps<typeof EmergencyContactSection>["contact"];

const BASE_CONTACT: Contact = {
  name: "Donnovan Trejo",
  phone: "56 5609 1856",
  phoneHref: "5656091856",
  whatsapp: "https://wa.me/525656091856?text=Hola",
};

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

function renderContactSection(
  status: PetStatus,
  emergency?: PetEmergency,
): string {
  return renderToStaticMarkup(
    createElement(EmergencyContactSection, {
      petId: "test-1",
      petName: "Lucca",
      emergency: emergency ?? buildEmergency(),
      status,
      zonaSegura: "Colonia Centro",
      contact: BASE_CONTACT,
    }),
  );
}

describe("EmergencyContactSection", () => {
  it("muestra contacto normal para en_casa", () => {
    const html = renderContactSection("en_casa");
    expect(html).toContain("Contacto de emergencia");
    expect(html).not.toContain("Contacto urgente ahora");
    expect(html).toContain("Zona segura: Colonia Centro");
  });

  it("muestra contacto urgente cuando el modo perdido está activo", () => {
    const html = renderContactSection(
      "perdido",
      buildEmergency({ perdido: true, zonaPerdida: "Parque de la Condesa" }),
    );

    expect(html).toContain("Contacto urgente ahora");
    expect(html).toContain("Zona donde se perdió: Parque de la Condesa");
  });

  it("nunca muestra contacto urgente para un estado terminal, aunque haya señal estática stale", () => {
    const html = renderContactSection("fallecido", buildEmergency({ perdido: true }));

    expect(html).toContain("Contacto de su familia");
    expect(html).not.toContain("Contacto urgente ahora");
    expect(html).not.toContain("Zona donde se perdió");
    expect(html).toContain("Zona segura: Colonia Centro");
  });
});