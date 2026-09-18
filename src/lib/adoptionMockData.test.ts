import { describe, expect, it } from "vitest";
import { filterAdoptablePets } from "@/lib/domain/adoption";
import { getAdoptionDemoPets } from "@/lib/getAdoptionDemoPets";
import { getAllPets } from "@/lib/getAllPets";
import { getMockShelters } from "@/lib/getMockShelters";

describe("datos mock del prototipo de adopción", () => {
  it("carga perfiles mock válidos", () => {
    const pets = getAdoptionDemoPets();
    expect(pets.length).toBeGreaterThan(0);
    expect(new Set(pets.map((pet) => pet.identificacion.codigoPublico)).size).toBe(pets.length);
  });

  it("incluye casos demostrativos para el dominio", () => {
    const pets = getAdoptionDemoPets();
    expect(pets.some((pet) => pet.estado === "en_adopcion")).toBe(true);
    expect(pets.some((pet) => pet.estado === "fallecido")).toBe(true);
    expect(pets.some((pet) => pet.estado === "perdido")).toBe(true);
  });

  it("expone mascotas disponibles para el catálogo", () => {
    const adoptable = filterAdoptablePets(getAdoptionDemoPets());
    expect(adoptable.length).toBeGreaterThanOrEqual(3);
  });

  it("carga refugios mock válidos", () => {
    const shelters = getMockShelters();
    expect(shelters.length).toBeGreaterThan(0);
    expect(new Set(shelters.map((shelter) => shelter.id)).size).toBe(shelters.length);
  });

  it("referencia mascotas que existen en los mocks", () => {
    const pets = getAdoptionDemoPets();
    const petIds = new Set(pets.map((pet) => pet.id));

    for (const shelter of getMockShelters()) {
      for (const petId of shelter.mascotas) {
        expect(petIds.has(petId), `El refugio ${shelter.id} referencia la mascota inexistente ${petId}`).toBe(true);
      }
    }
  });

  it("al menos un refugio tiene una mascota adoptable", () => {
    const pets = getAdoptionDemoPets();
    const adoptableIds = new Set(filterAdoptablePets(pets).map((pet) => pet.id));

    const hasAdoptable = getMockShelters().some((shelter) =>
      shelter.mascotas.some((petId) => adoptableIds.has(petId)),
    );
    expect(hasAdoptable).toBe(true);
  });

  it("no comparte IDs ni códigos con las mascotas reales", () => {
    const demo = getAdoptionDemoPets();
    const real = getAllPets();
    const realIds = new Set(real.map((pet) => pet.id));
    const realCodes = new Set(real.map((pet) => pet.identificacion.codigoPublico));

    for (const pet of demo) {
      expect(realIds.has(pet.id), `id ${pet.id} ya existe en mascotas.json`).toBe(false);
      expect(realCodes.has(pet.identificacion.codigoPublico), `código ${pet.identificacion.codigoPublico} ya existe en mascotas.json`).toBe(false);
    }
  });
});