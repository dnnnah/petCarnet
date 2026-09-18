import { describe, expect, it } from "vitest";
import {
  buildAdoptionRequestDraft,
  buildAdoptionRequestFromDraft,
  mapAdoptionValidationErrors,
  todayInMexicoISO,
  type AdoptionFormValues,
} from "@/lib/adoptionRequestForm";

const VALID_VALUES: AdoptionFormValues = {
  nombre: "  Ana López ",
  telefono: " 5512345678 ",
  email: " ana@correo.mx ",
  motivo: " Quiero darle un hogar ",
  notas: " Vivo en departamento ",
};

describe("buildAdoptionRequestDraft", () => {
  it("limpia los campos y deja notas como string", () => {
    const draft = buildAdoptionRequestDraft("mila", "2026-09-18", VALID_VALUES);
    expect(draft.petId).toBe("mila");
    expect(draft.fechaEnviada).toBe("2026-09-18");
    expect(draft.aspirante.nombre).toBe("Ana López");
    expect(draft.aspirante.telefono).toBe("5512345678");
    expect(draft.aspirante.email).toBe("ana@correo.mx");
    expect(draft.aspirante.motivo).toBe("Quiero darle un hogar");
    expect(draft.notas).toBe("Vivo en departamento");
  });

  it("convierte email vacío a null y notas vacías a null", () => {
    const draft = buildAdoptionRequestDraft("mila", "2026-09-18", {
      nombre: "Ana",
      telefono: "5512345678",
      email: "   ",
      motivo: "Motivo",
      notas: "",
    });
    expect(draft.aspirante.email).toBeNull();
    expect(draft.notas).toBeNull();
  });
});

describe("buildAdoptionRequestFromDraft", () => {
  it("crea una solicitud con estado enviada y folio basado en el seed", () => {
    const draft = buildAdoptionRequestDraft("mila", "2026-09-18", VALID_VALUES);
    const request = buildAdoptionRequestFromDraft(draft, "abc-123");
    expect(request.id).toBe("sol-abc-123");
    expect(request.petId).toBe("mila");
    expect(request.estado).toBe("enviada");
    expect(request.shelterId).toBeNull();
    expect(request.notas).toBe("Vivo en departamento");
    expect(request.aspirante.nombre).toBe("Ana López");
  });
});

describe("mapAdoptionValidationErrors", () => {
  it("asigna errores de campo y errores generales", () => {
    const mapped = mapAdoptionValidationErrors([
      "pet_no_disponible",
      "nombre_requerido",
      "telefono_invalido",
      "email_invalido",
      "motivo_requerido",
    ]);

    expect(mapped.fields.nombre).toBeDefined();
    expect(mapped.fields.telefono).toBeDefined();
    expect(mapped.fields.email).toBeDefined();
    expect(mapped.fields.motivo).toBeDefined();
    expect(mapped.fields.nombre).toContain("nombre");
    expect(mapped.general.some((message) => message.includes("no está disponible"))).toBe(true);
  });

  it("no genera errores con una lista vacía", () => {
    const mapped = mapAdoptionValidationErrors([]);
    expect(mapped.fields).toEqual({});
    expect(mapped.general).toEqual([]);
  });
});

describe("todayInMexicoISO", () => {
  it("devuelve una fecha en formato YYYY-MM-DD", () => {
    expect(todayInMexicoISO()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});