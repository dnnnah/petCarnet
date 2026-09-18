import { describe, expect, it } from "vitest";
import {
  ADOPTABLE_PET_STATUS,
  ADOPTION_REQUEST_STATUSES,
  buildAdoptionCatalogEntry,
  filterAdoptablePets,
  filterPetsInAdoption,
  initialAdoptionRequestStatus,
  isAdoptionRequestStatus,
  isPetAvailableForAdoption,
  resolveAdoptionAvailability,
  validateAdoptionRequest,
} from "@/lib/domain/adoption";
import { findShelterForPet } from "@/lib/domain/shelter";
import type { PetEmergency, PetProfile } from "@/types/pet";
import type { AdoptionRequestDraft } from "@/types/adoption";
import type { Shelter } from "@/types/shelter";
import type { LostAlert } from "@/types/emergency";

const EMERGENCIA: PetEmergency = {
  perdido: false,
  fechaPerdida: null,
  zonaPerdida: null,
  mensajeEmergencia: null,
  recompensa: null,
  instrucciones: [],
};

const EMERGENCIA_PERDIDA: PetEmergency = {
  ...EMERGENCIA,
  perdido: true,
  fechaPerdida: "2026-09-01",
  zonaPerdida: "Parque de la Condesa",
  mensajeEmergencia: "Ayuda a encontrar a Rex",
  recompensa: 500,
};

function makePet(overrides: Partial<PetProfile> = {}): PetProfile {
  return {
    id: "pet-en-adopcion",
    estado: "en_adopcion",
    verificado: true,
    mascota: {
      nombre: "Rex",
      especie: "Perro",
      raza: "Mestizo",
      fotoPerfilUrl: "/pets/rex.jpeg",
      genero: "Macho",
      talla: "Mediano",
      color: "Café con blanco",
      pesoKg: 10,
      fechaNacimiento: "2023-01-15",
      rasgosDistintivos: ["Oreja derecha caída"],
      esterilizado: true,
    },
    identificacion: {
      codigoPublico: "PC-REX-001",
      microchip: null,
      notas: "",
    },
    contacto: {
      nombrePublico: "Refugio Amigos",
      telefonoPrincipal: "5555000011",
      whatsapp: "5555000011",
      telefonoSecundario: "",
      email: "",
      zonaSegura: "cerca del refugio",
      zonaHabitual: "Iztapalapa, CDMX",
      mensajeWhatsapp: "Hola, encontré a Rex.",
    },
    emergencia: EMERGENCIA,
    salud: {
      alergias: [],
      condicionesMedicas: [],
      medicamentosActuales: [],
      dietaEspecial: "",
      comportamiento: "Amigable",
    },
    veterinario: {
      nombre: "Vet de prueba",
      clinica: "Clínica de prueba",
      telefono: "5555000033",
      direccion: "Iztapalapa",
      horario: "L-S 9-18",
    },
    vacunas: [],
    documentos: [],
    configuracionPublica: {
      mostrarEmail: false,
      mostrarTelefonoSecundario: false,
      mostrarDireccionVet: true,
      mostrarDocumentosPrivados: false,
    },
    ...overrides,
  };
}

const SHELTER: Shelter = {
  id: "ref-amigos",
  nombre: "Refugio Amigos",
  descripcion: "Refugio de prueba",
  ubicacion: "Zona Centro, Iztapalapa",
  contacto: {
    nombreResponsable: "María Gómez",
    telefono: "5555000011",
    whatsapp: "5555000011",
    email: "amigos@example.com",
  },
  redes: [],
  logoUrl: null,
  mascotas: ["pet-en-adopcion"],
  verificado: true,
};

const VALID_DRAFT: AdoptionRequestDraft = {
  petId: "pet-en-adopcion",
  fechaEnviada: "2026-09-18",
  aspirante: {
    nombre: "Juan Pérez",
    telefono: "5551234567",
    email: "juan@example.com",
    motivo: "Quiero darle un hogar responsable.",
  },
};

const RUNTIME_ALERT: LostAlert = { active: true, zonaPerdida: "Parque", fechaPerdida: "2026-09-17" };

describe("ADOPTION_REQUEST_STATUSES", () => {
  it("define el ciclo de vida completo de una solicitud", () => {
    expect(ADOPTION_REQUEST_STATUSES).toEqual([
      "enviada",
      "en_revision",
      "aprobada",
      "rechazada",
      "cancelada",
      "completada",
    ]);
  });
});

describe("isAdoptionRequestStatus", () => {
  it("acepta cada estado válido", () => {
    for (const status of ADOPTION_REQUEST_STATUSES) {
      expect(isAdoptionRequestStatus(status)).toBe(true);
    }
  });

  it("rechaza estados inválidos", () => {
    expect(isAdoptionRequestStatus("enviar")).toBe(false);
    expect(isAdoptionRequestStatus("ENVIADA")).toBe(false);
    expect(isAdoptionRequestStatus("")).toBe(false);
    expect(isAdoptionRequestStatus(null)).toBe(false);
    expect(isAdoptionRequestStatus(42)).toBe(false);
  });
});

describe("initialAdoptionRequestStatus", () => {
  it("una solicitud simulada nace como 'enviada'", () => {
    expect(initialAdoptionRequestStatus()).toBe("enviada");
  });
});

describe("ADOPTABLE_PET_STATUS", () => {
  it("el único estado de catálogo es en_adopcion", () => {
    expect(ADOPTABLE_PET_STATUS).toBe("en_adopcion");
  });
});

describe("resolveAdoptionAvailability", () => {
  it("en_adopcion sin señal de pérdida es disponible", () => {
    const result = resolveAdoptionAvailability({ estado: "en_adopcion", emergencia: EMERGENCIA, alert: null });
    expect(result).toEqual({ available: true, reason: null, effectiveStatus: "en_adopcion" });
  });

  it("en_adopcion con flag estático de perdido no es disponible", () => {
    const result = resolveAdoptionAvailability({ estado: "en_adopcion", emergencia: EMERGENCIA_PERDIDA, alert: null });
    expect(result).toEqual({ available: false, reason: "perdido", effectiveStatus: "perdido" });
  });

  it("en_adopcion con alerta runtime de perdido no es disponible", () => {
    const result = resolveAdoptionAvailability({ estado: "en_adopcion", emergencia: EMERGENCIA, alert: RUNTIME_ALERT });
    expect(result.available).toBe(false);
    expect(result.reason).toBe("perdido");
    expect(result.effectiveStatus).toBe("perdido");
  });

  it("mascota en casa no es adoptable", () => {
    const result = resolveAdoptionAvailability({ estado: "en_casa", emergencia: EMERGENCIA, alert: null });
    expect(result).toEqual({ available: false, reason: "estado_no_disponible", effectiveStatus: "en_casa" });
  });

  it("mascota perdida canónica no es adoptable", () => {
    const result = resolveAdoptionAvailability({ estado: "perdido", emergencia: EMERGENCIA_PERDIDA, alert: null });
    expect(result).toEqual({ available: false, reason: "perdido", effectiveStatus: "perdido" });
  });

  it("adoptado y rescatado no aparecen en el catálogo", () => {
    for (const estado of ["adoptado", "rescatado"] as const) {
      const result = resolveAdoptionAvailability({ estado, emergencia: EMERGENCIA, alert: null });
      expect(result.available).toBe(false);
      expect(result.reason).toBe("estado_no_disponible");
      expect(result.effectiveStatus).toBe(estado);
    }
  });

  it("fallecido bloquea el catálogo aunque tenga señal runtime de perdido", () => {
    const result = resolveAdoptionAvailability({ estado: "fallecido", emergencia: EMERGENCIA, alert: RUNTIME_ALERT });
    expect(result).toEqual({ available: false, reason: "terminal", effectiveStatus: "fallecido" });
  });

  it("fallecido bloquea el catálogo aunque los datos sean inconsistentes", () => {
    const result = resolveAdoptionAvailability({ estado: "fallecido", emergencia: EMERGENCIA_PERDIDA, alert: null });
    expect(result).toEqual({ available: false, reason: "terminal", effectiveStatus: "fallecido" });
  });
});

describe("isPetAvailableForAdoption", () => {
  it("delega en la disponibilidad resuelta", () => {
    expect(isPetAvailableForAdoption({ estado: "en_adopcion", emergencia: EMERGENCIA, alert: null })).toBe(true);
    expect(isPetAvailableForAdoption({ estado: "en_casa", emergencia: EMERGENCIA, alert: null })).toBe(false);
    expect(isPetAvailableForAdoption({ estado: "fallecido", emergencia: EMERGENCIA, alert: null })).toBe(false);
  });
});

describe("filterPetsInAdoption", () => {
  it("solo incluye mascotas con estado canónico en_adopcion", () => {
    const pets = [
      makePet({ id: "a", estado: "en_adopcion" }),
      makePet({ id: "b", estado: "en_casa" }),
      makePet({ id: "c", estado: "adoptado" }),
      makePet({ id: "d", estado: "en_adopcion" }),
    ];
    expect(filterPetsInAdoption(pets).map((pet) => pet.id)).toEqual(["a", "d"]);
  });

  it("devuelve una lista vacía sin mascotas en adopción", () => {
    const pets = [makePet({ id: "a", estado: "en_casa" }), makePet({ id: "b", estado: "fallecido" })];
    expect(filterPetsInAdoption(pets)).toEqual([]);
  });

  it("devuelve una lista vacía con entrada vacía", () => {
    expect(filterPetsInAdoption([])).toEqual([]);
  });
});

describe("filterAdoptablePets", () => {
  it("sin resolver de alerta filtra por disponibilidad efectiva", () => {
    const pets = [
      makePet({ id: "a", estado: "en_adopcion" }),
      makePet({ id: "b", estado: "en_adopcion" }),
      makePet({ id: "c", estado: "en_casa" }),
    ];
    expect(filterAdoptablePets(pets).map((pet) => pet.id)).toEqual(["a", "b"]);
  });

  it("excluye mascotas con alerta runtime de perdido", () => {
    const pets = [
      makePet({ id: "a", estado: "en_adopcion" }),
      makePet({ id: "b", estado: "en_adopcion" }),
    ];
    const resolver = (pet: PetProfile): LostAlert | null => (pet.id === "b" ? RUNTIME_ALERT : null);
    const result = filterAdoptablePets(pets, resolver);
    expect(result.map((pet) => pet.id)).toEqual(["a"]);
  });

  it("excluye mascotas con flag estático de perdido", () => {
    const pets = [
      makePet({ id: "a", estado: "en_adopcion" }),
      makePet({ id: "b", estado: "en_adopcion", emergencia: EMERGENCIA_PERDIDA }),
    ];
    expect(filterAdoptablePets(pets).map((pet) => pet.id)).toEqual(["a"]);
  });
});

describe("buildAdoptionCatalogEntry", () => {
  it("normaliza los datos de la mascota para el catálogo", () => {
    const pet = makePet();
    expect(buildAdoptionCatalogEntry(pet, SHELTER)).toEqual({
      petId: "pet-en-adopcion",
      nombre: "Rex",
      especie: "Perro",
      raza: "Mestizo",
      genero: "Macho",
      talla: "Mediano",
      fotoUrl: "/pets/rex.jpeg",
      codigoPublico: "PC-REX-001",
      fechaNacimiento: "2023-01-15",
      zona: SHELTER.ubicacion,
      verificado: true,
      shelterId: "ref-amigos",
      shelterNombre: "Refugio Amigos",
    });
  });

  it("sin refugio usa la zona habitual del perfil y deja la referencia nula", () => {
    const pet = makePet();
    const entry = buildAdoptionCatalogEntry(pet);
    expect(entry.zona).toBe("Iztapalapa, CDMX");
    expect(entry.shelterId).toBeNull();
    expect(entry.shelterNombre).toBeNull();
  });

  it("se compone con la búsqueda de refugio por mascota", () => {
    const pet = makePet();
    const shelter = findShelterForPet(pet.id, [SHELTER]);
    const entry = buildAdoptionCatalogEntry(pet, shelter);
    expect(entry.shelterId).toBe("ref-amigos");
    expect(entry.shelterNombre).toBe("Refugio Amigos");
    expect(entry.zona).toBe(SHELTER.ubicacion);
  });
});

describe("validateAdoptionRequest", () => {
  it("acepta una solicitud simulada válida", () => {
    const result = validateAdoptionRequest({ pet: makePet(), draft: VALID_DRAFT });
    expect(result.valid).toBe(true);
    expect(result.errors).toEqual([]);
  });

  it("acepta un email null sin marcarlo como inválido", () => {
    const pet = makePet();
    const draft: AdoptionRequestDraft = {
      ...VALID_DRAFT,
      aspirante: { ...VALID_DRAFT.aspirante, email: null, telefono: "5215551234567" },
    };
    const result = validateAdoptionRequest({ pet, draft });
    expect(result.valid).toBe(true);
  });

  it("no permite solicitar una mascota en casa", () => {
    const pet = makePet({ estado: "en_casa" });
    const result = validateAdoptionRequest({ pet, draft: VALID_DRAFT });
    expect(result.valid).toBe(false);
    expect(result.errors).toContain("pet_no_disponible");
  });

  it("no permite solicitar una mascota fallecida aunque el borrador sea válido", () => {
    const pet = makePet({ estado: "fallecido" });
    const result = validateAdoptionRequest({ pet, draft: VALID_DRAFT });
    expect(result.errors).toContain("pet_no_disponible");
  });

  it("no permite solicitar una mascota perdida por alerta runtime", () => {
    const pet = makePet({ id: "pet-perdida" });
    const draft: AdoptionRequestDraft = { ...VALID_DRAFT, petId: "pet-perdida" };
    const result = validateAdoptionRequest({ pet, draft, alert: RUNTIME_ALERT });
    expect(result.errors).toContain("pet_no_disponible");
  });

  it("no permite solicitar una mascota perdida por flag estático", () => {
    const pet = makePet({ estado: "en_adopcion", emergencia: EMERGENCIA_PERDIDA });
    const result = validateAdoptionRequest({ pet, draft: VALID_DRAFT });
    expect(result.errors).toContain("pet_no_disponible");
  });

  it("rechaza una solicitud para otra mascota", () => {
    const pet = makePet();
    const draft: AdoptionRequestDraft = { ...VALID_DRAFT, petId: "otra-mascota" };
    const result = validateAdoptionRequest({ pet, draft });
    expect(result.errors).toContain("pet_no_coincide");
  });

  it("rechaza un borrador sin referencia de mascota", () => {
    const result = validateAdoptionRequest({
      pet: makePet(),
      draft: { petId: "", fechaEnviada: "2026-09-18", aspirante: VALID_DRAFT.aspirante },
    });
    expect(result.errors).toContain("pet_requerido");
  });

  it("exige nombre, teléfono y motivo", () => {
    const draft: AdoptionRequestDraft = {
      petId: "pet-en-adopcion",
      fechaEnviada: "2026-09-18",
      aspirante: { nombre: "", telefono: "", email: null, motivo: "" },
    };
    const result = validateAdoptionRequest({ pet: makePet(), draft });
    expect(result.errors).toEqual([
      "nombre_requerido",
      "telefono_requerido",
      "motivo_requerido",
    ]);
  });

  it("reporta teléfonos inválidos", () => {
    for (const telefono of ["abc", "12345", "12345678901234567890", ""]) {
      const draft: AdoptionRequestDraft = {
        ...VALID_DRAFT,
        aspirante: { ...VALID_DRAFT.aspirante, telefono },
      };
      const result = validateAdoptionRequest({ pet: makePet(), draft });
      expect(result.errors.some((error) => error === "telefono_requerido" || error === "telefono_invalido")).toBe(true);
    }
  });

  it("reporta un email con formato inválido", () => {
    const draft: AdoptionRequestDraft = {
      ...VALID_DRAFT,
      aspirante: { ...VALID_DRAFT.aspirante, email: "no-es-un-email" },
    };
    const result = validateAdoptionRequest({ pet: makePet(), draft });
    expect(result.errors).toContain("email_invalido");
  });

  it("acepta un email vacío como opcional", () => {
    const draft: AdoptionRequestDraft = {
      ...VALID_DRAFT,
      aspirante: { ...VALID_DRAFT.aspirante, email: "" },
    };
    const result = validateAdoptionRequest({ pet: makePet(), draft });
    expect(result.errors).not.toContain("email_invalido");
  });

  it("rechaza una fecha de envío inválida", () => {
    const draft: AdoptionRequestDraft = { ...VALID_DRAFT, fechaEnviada: "18/09/2026" };
    const result = validateAdoptionRequest({ pet: makePet(), draft });
    expect(result.errors).toContain("fecha_invalida");
  });

  it("acumula errores de mascota y borrador cuando ambos fallan", () => {
    const pet = makePet({ estado: "fallecido" });
    const draft: AdoptionRequestDraft = {
      petId: "otra-mascota",
      fechaEnviada: "cualquier cosa",
      aspirante: { nombre: "", telefono: "abc", email: null, motivo: "" },
    };
    const result = validateAdoptionRequest({ pet, draft });
    expect(result.errors).toEqual([
      "pet_no_disponible",
      "pet_no_coincide",
      "nombre_requerido",
      "telefono_invalido",
      "motivo_requerido",
      "fecha_invalida",
    ]);
  });
});