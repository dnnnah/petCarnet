import { describe, expect, it } from "vitest";
import { staticShelterDirectory } from "@/lib/infra/directory/staticShelters";

describe("staticShelterDirectory", () => {
  it("devuelve el catálogo de refugios de la fuente estática", () => {
    const shelters = staticShelterDirectory.listShelters();

    expect(shelters.length).toBeGreaterThan(0);
    expect(shelters.every((shelter) => typeof shelter.id === "string")).toBe(true);
  });

  it("expone refugios ya validados por el contrato de dominio", () => {
    for (const shelter of staticShelterDirectory.listShelters()) {
      expect(shelter.nombre.trim()).not.toBe("");
      expect(shelter.mascotas.length).toBeGreaterThan(0);
    }
  });

  it("es estable entre llamadas (misma fuente, sin recomputar)", () => {
    expect(staticShelterDirectory.listShelters()).toBe(staticShelterDirectory.listShelters());
  });
});
