import { describe, expect, it } from "vitest";
import { staticPetDirectory } from "@/lib/infra/directory/staticPets";

describe("staticPetDirectory", () => {
  describe("listProfilePets", () => {
    it("devuelve los perfiles de la fuente estática", () => {
      const pets = staticPetDirectory.listProfilePets();

      expect(pets.length).toBeGreaterThan(0);
      expect(pets.every((pet) => typeof pet.id === "string")).toBe(true);
    });

    it("expone perfiles ya validados por el contrato de dominio", () => {
      for (const pet of staticPetDirectory.listProfilePets()) {
        expect(pet.identificacion.codigoPublico).toMatch(/^PC-/);
      }
    });
  });

  describe("listAdoptionPets", () => {
    it("devuelve el catálogo de adopción del prototipo", () => {
      expect(staticPetDirectory.listAdoptionPets().length).toBeGreaterThan(0);
    });

    it("es un conjunto disjunto de los perfiles propios", () => {
      const profileIds = new Set(staticPetDirectory.listProfilePets().map((pet) => pet.id));
      const overlapping = staticPetDirectory
        .listAdoptionPets()
        .filter((pet) => profileIds.has(pet.id));

      expect(overlapping).toEqual([]);
    });
  });

  describe("findProfilePet", () => {
    it("resuelve por id interno", () => {
      const pet = staticPetDirectory.findProfilePet("lucca");

      expect(pet?.identificacion.codigoPublico).toBe("PC-LUCCA-001");
    });

    it("resuelve por codigoPublico (alias estable de la ruta canónica)", () => {
      expect(staticPetDirectory.findProfilePet("PC-LUCCA-001")?.id).toBe("lucca");
    });

    it("ignora espacios alrededor del identificador", () => {
      expect(staticPetDirectory.findProfilePet("  PC-LUCCA-001  ")?.id).toBe("lucca");
    });

    it("devuelve null ante un identificador desconocido", () => {
      expect(staticPetDirectory.findProfilePet("no-existe-xyz")).toBeNull();
    });

    it("devuelve null y nunca undefined ante identificadores vacíos", () => {
      expect(staticPetDirectory.findProfilePet("")).toBeNull();
      expect(staticPetDirectory.findProfilePet("   ")).toBeNull();
    });
  });

  describe("findAdoptionPet", () => {
    it("resuelve una mascota del catálogo de adopción", () => {
      const [firstAdoption] = staticPetDirectory.listAdoptionPets();
      const found = staticPetDirectory.findAdoptionPet(firstAdoption.id);

      expect(found?.id).toBe(firstAdoption.id);
    });

    it("no encuentra mascotas que solo existen como perfil propio", () => {
      expect(staticPetDirectory.findAdoptionPet("lucca")).toBeNull();
    });

    it("devuelve null ante un identificador desconocido", () => {
      expect(staticPetDirectory.findAdoptionPet("no-existe-xyz")).toBeNull();
    });
  });
});
