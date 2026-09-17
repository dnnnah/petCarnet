import { describe, expect, it } from "vitest";
import { buildWhatsAppHref, toE164Digits } from "@/lib/phone";

describe("toE164Digits", () => {
  it("agrega el código de país 52 a números locales mexicanos de 10 dígitos", () => {
    expect(toE164Digits("5656091856")).toBe("525656091856");
    expect(toE164Digits("5522576308")).toBe("525522576308");
    expect(toE164Digits("5534567890")).toBe("525534567890");
  });

  it("no altera números internacionales ya válidos (52 + 10 dígitos)", () => {
    expect(toE164Digits("525656091856")).toBe("525656091856");
    expect(toE164Digits("525522576308")).toBe("525522576308");
  });

  it("no altera números WhatsApp legacy de México (521 + 10 dígitos)", () => {
    expect(toE164Digits("5215534567890")).toBe("5215534567890");
  });

  it("tolera separadores, espacios y prefijo +", () => {
    expect(toE164Digits("+52 55 5609 1856")).toBe("525556091856");
    expect(toE164Digits("55 - 5609-1856")).toBe("525556091856");
  });

  it("deja intactos formatos ambiguos que no pueden verificarse (placeholder)", () => {
    expect(toE164Digits("552201296480")).toBe("552201296480");
  });

  it("devuelve vacío para entradas vacías o sin dígitos", () => {
    expect(toE164Digits("")).toBe("");
    expect(toE164Digits("(abc)")).toBe("");
  });
});

describe("buildWhatsAppHref", () => {
  it("construye wa.me normalizando 10 dígitos a código de país 52", () => {
    const href = buildWhatsAppHref("5522576308", "Hola, tengo a Lucca");
    expect(href.startsWith("https://wa.me/525522576308?text=")).toBe(true);
    expect(decodeURIComponent(href.split("?text=")[1])).toBe("Hola, tengo a Lucca");
  });

  it("no rompe números internacionales ya válidos", () => {
    expect(buildWhatsAppHref("5215534567890", "Hola").startsWith("https://wa.me/5215534567890?text=")).toBe(true);
    expect(buildWhatsAppHref("525522576308", "Hola").startsWith("https://wa.me/525522576308?text=")).toBe(true);
  });

  it("codifica saltos de línea del mensaje", () => {
    const href = buildWhatsAppHref("5522576308", "Línea 1\nLínea 2");
    expect(href).toContain("L%C3%ADnea%201%0AL%C3%ADnea%202");
  });

  it("devuelve vacío sin número o sin mensaje", () => {
    expect(buildWhatsAppHref("", "mensaje")).toBe("");
    expect(buildWhatsAppHref("5522576308", "   ")).toBe("");
  });
});
