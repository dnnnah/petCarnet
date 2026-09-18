import { describe, expect, it } from "vitest";
import { findShelterById, findShelterForPet } from "@/lib/domain/shelter";
import type { Shelter } from "@/types/shelter";

const SHELTER_A: Shelter = {
  id: "ref-uno",
  nombre: "Refugio Uno",
  descripcion: "Primer refugio de prueba",
  ubicacion: "Iztapalapa, CDMX",
  contacto: {
    nombreResponsable: "María Gómez",
    telefono: "5555000011",
    whatsapp: "5555000011",
    email: null,
  },
  redes: [],
  logoUrl: null,
  mascotas: ["pet-uno", "pet-dos"],
  verificado: true,
};

const SHELTER_B: Shelter = {
  id: "ref-dos",
  nombre: "Refugio Dos",
  descripcion: "Segundo refugio de prueba",
  ubicacion: "Nezahualcóyotl, EDOMEX",
  contacto: {
    nombreResponsable: "Pedro López",
    telefono: "5555000022",
    whatsapp: "5555000022",
    email: "refugio@example.com",
  },
  redes: ["https://instagram.com/refdos"],
  logoUrl: "/logos/ref-dos.png",
  mascotas: ["pet-tres", "pet-uno"],
  verificado: false,
};

describe("findShelterById", () => {
  it("devuelve el refugio que coincide por id", () => {
    expect(findShelterById([SHELTER_A, SHELTER_B], "ref-dos")).toEqual(SHELTER_B);
  });

  it("devuelve null cuando el id no coincide", () => {
    expect(findShelterById([SHELTER_A, SHELTER_B], "ref-inexistente")).toBeNull();
  });

  it("devuelve null con una lista vacía", () => {
    expect(findShelterById([], "ref-uno")).toBeNull();
  });
});

describe("findShelterForPet", () => {
  it("devuelve el refugio que tiene a la mascota en su lista", () => {
    expect(findShelterForPet("pet-dos", [SHELTER_A, SHELTER_B])).toEqual(SHELTER_A);
  });

  it("devuelve null cuando ninguna mascota está registrada en los refugios", () => {
    expect(findShelterForPet("pet-desconocida", [SHELTER_A, SHELTER_B])).toBeNull();
  });

  it("devuelve el primer refugio cuando varias listas comparten la misma mascota", () => {
    const shared = findShelterForPet("pet-uno", [SHELTER_B, SHELTER_A]);
    expect(shared).toEqual(SHELTER_B);
    expect(shared?.id).toBe("ref-dos");
  });

  it("devuelve null con una lista vacía", () => {
    expect(findShelterForPet("pet-uno", [])).toBeNull();
  });
});