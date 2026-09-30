import { describe, expect, it } from "vitest";
import {
  getAdoptionDemoPets,
  getAllPets,
  getAllProfilePets,
  getPetById,
  getPetByIdAny,
} from "@/lib/services/pets/queries";

describe("getPetById", () => {
  it("resuelve por id interno existente", () => {
    expect(getPetById("lucca")?.identificacion.codigoPublico).toBe("PC-LUCCA-001");
  });

  it("resuelve por codigoPublico como alias estable (ruta canónica)", () => {
    expect(getPetById("PC-LUCCA-001")?.id).toBe("lucca");
  });

  it("resuelve ignorando espacios alrededor del identificador", () => {
    expect(getPetById("  PC-LUCCA-001  ")?.id).toBe("lucca");
  });

  it("retorna null ante un identificador desconocido", () => {
    expect(getPetById("no-existe-xyz")).toBeNull();
  });

  it("normaliza a null en lugar de undefined (contrato uniforme)", () => {
    expect(getPetById("no-existe-xyz")).not.toBeUndefined();
    expect(getPetById("")).toBeNull();
  });
});

describe("getPetByIdAny", () => {
  it("resuelve una mascota con perfil propio", () => {
    expect(getPetByIdAny("lucca")?.id).toBe("lucca");
  });

  it("resuelve por codigoPublico de un perfil propio", () => {
    expect(getPetByIdAny("PC-LUCCA-001")?.id).toBe("lucca");
  });

  it("resuelve como fallback una mascota del catálogo de adopción", () => {
    const [firstAdoption] = getAdoptionDemoPets();

    expect(getPetByIdAny(firstAdoption.id)?.id).toBe(firstAdoption.id);
  });

  it("prioriza el perfil propio sobre el catálogo de adopción", () => {
    const own = getPetByIdAny("lucca");
    const byPublicCode = getPetByIdAny("PC-LUCCA-001");

    expect(own).toEqual(byPublicCode);
  });

  it("retorna null cuando la mascota no existe en ninguna fuente", () => {
    expect(getPetByIdAny("no-existe-xyz")).toBeNull();
  });

  it("retorna null y nunca undefined ante identificadores vacíos", () => {
    expect(getPetByIdAny("")).toBeNull();
    expect(getPetByIdAny("   ")).toBeNull();
  });
});

describe("getAllProfilePets", () => {
  it("concatena perfiles propios y catálogo de adopción", () => {
    expect(getAllProfilePets()).toHaveLength(getAllPets().length + getAdoptionDemoPets().length);
  });

  it("no contiene identificadores duplicados", () => {
    const ids = getAllProfilePets().map((pet) => pet.id);

    expect(new Set(ids).size).toBe(ids.length);
  });

  it("mantiene los perfiles propios antes que el catálogo de adopción", () => {
    const pets = getAllProfilePets();

    expect(pets.slice(0, getAllPets().length)).toEqual(getAllPets());
  });
});
