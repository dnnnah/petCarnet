import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { EmergencyContact } from "./EmergencyContact";
import type { ComponentProps } from "react";

type Contact = ComponentProps<typeof EmergencyContact>["contact"];

const BASE_CONTACT: Contact = {
  name: "Donnovan Trejo",
  phone: "56 5609 1856",
  phoneHref: "5656091856",
  whatsapp: "https://wa.me/525656091856?text=Hola",
  neighborhood: "Zona segura: cerca de casa",
};

function render(contact: Contact, isLost: boolean): string {
  return renderToStaticMarkup(
    createElement(EmergencyContact, {
      contact,
      isLost,
      petName: "Lucca",
    }),
  );
}

describe("EmergencyContact", () => {
  it("refleja el estado resuelto sin urgencia", () => {
    const html = render(BASE_CONTACT, false);
    expect(html).toContain("Contacto de emergencia");
    expect(html).not.toContain("Contacto urgente ahora");
    expect(html).toContain("Si encontraste a Lucca, por favor contacta a su familia.");
    expect(html).not.toContain("llama o envía WhatsApp ahora");
    expect(html).toContain("Zona segura: cerca de casa");
    expect(html).toContain("href=\"tel:5656091856\"");
    expect(html).toContain("bg-brand text-white");
  });

  it("refleja el estado perdido activo con urgencia", () => {
    const contact: Contact = {
      ...BASE_CONTACT,
      neighborhood: "Zona donde se perdió: Parque de la Condesa",
    };
    const html = render(contact, true);
    expect(html).toContain("Contacto urgente ahora");
    expect(html).not.toContain("Contacto de emergencia");
    expect(html).toContain("llama o envía WhatsApp ahora");
    expect(html).not.toContain("Si encontraste a Lucca, por favor contacta a su familia.");
    expect(html).toContain("Zona donde se perdió: Parque de la Condesa");
    expect(html).toContain("bg-danger");
  });
});
