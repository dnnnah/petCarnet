import { describe, expect, it } from "vitest";
import {
  assertValidPetProfiles,
  collectDataWarnings,
  collectValidationErrors,
  isPetProfileArray,
} from "@/lib/dataValidation";
import type { PetProfile } from "@/types/pet";
import mascotas from "@/data/mascotas.json";

function buildPet(overrides: Partial<PetProfile> = {}): PetProfile {
  const base: PetProfile = {
    id: "test-1",
    estado: "en_casa",
    verificado: true,
    mascota: {
      nombre: "Prueba",
      especie: "Perro",
      raza: "Poodle",
      fotoPerfilUrl: "/pets/prueba.jpeg",
      genero: "Macho",
      talla: "Pequeño",
      color: "Negro",
      pesoKg: 8,
      fechaNacimiento: "2020-01-01",
      rasgosDistintivos: ["Mancha blanca"],
      esterilizado: true,
    },
    identificacion: { codigoPublico: "PC-TEST-001", microchip: null, notas: "" },
    contacto: {
      nombrePublico: "Dueño",
      telefonoPrincipal: "5551234567",
      whatsapp: "5215551234567",
      telefonoSecundario: "",
      email: "",
      zonaSegura: "Colonia Centro",
      zonaHabitual: "Parque",
      mensajeWhatsapp: "Encontré a Prueba",
    },
    emergencia: {
      perdido: false,
      fechaPerdida: null,
      zonaPerdida: null,
      mensajeEmergencia: null,
      recompensa: null,
      instrucciones: [],
    },
    salud: {
      alergias: [],
      condicionesMedicas: [],
      medicamentosActuales: [],
      dietaEspecial: "",
      comportamiento: "Amistoso",
    },
    veterinario: {
      nombre: "Dr. Test",
      clinica: "Clínica Test",
      telefono: "5551234567",
      direccion: "Calle 1",
      horario: "L-V 9-18",
    },
    vacunas: [
      {
        id: "test-vac-1",
        nombre: "Rabia",
        fechaAplicacion: "2025-01-01",
        proximaDosis: "2026-01-01",
        estatus: "al_dia",
        lote: "A1",
        veterinario: "Dr. Test",
        documentoUrl: "/docs/test/cartilla.pdf",
      },
    ],
    documentos: [
      {
        id: "test-doc-1",
        nombre: "Cartilla",
        tipo: "pdf",
        categoria: "vacunas",
        url: "/docs/test/cartilla.pdf",
        fecha: "2025-01-01",
        visiblePublico: true,
      },
    ],
    configuracionPublica: {
      mostrarEmail: false,
      mostrarTelefonoSecundario: false,
      mostrarDireccionVet: true,
      mostrarDocumentosPrivados: false,
    },
  };

  return { ...base, ...overrides };
}

describe("collectValidationErrors", () => {
  it("acepta un perfil válido", () => {
    expect(collectValidationErrors([buildPet()])).toEqual([]);
  });

  it("acepta los datos reales de mascotas.json", () => {
    expect(collectValidationErrors(mascotas)).toEqual([]);
  });

  it("rechaza una talla inválida", () => {
    const pet = buildPet({
      mascota: { ...buildPet().mascota, talla: "Pequeña" as PetProfile["mascota"]["talla"] },
    });
    const errors = collectValidationErrors([pet]);
    expect(errors.some((error) => error.includes("talla"))).toBe(true);
  });

  it("rechaza ids duplicados", () => {
    const pet = buildPet({ id: "test-1" });
    const errors = collectValidationErrors([buildPet(), pet]);
    expect(errors.some((error) => error.includes("id duplicado"))).toBe(true);
  });

  it("rechaza codigosPublico duplicados", () => {
    const pet = buildPet({
      id: "test-2",
      identificacion: { ...buildPet().identificacion, codigoPublico: "PC-TEST-001" },
    });
    const errors = collectValidationErrors([buildPet(), pet]);
    expect(errors.some((error) => error.includes("codigoPublico duplicado"))).toBe(true);
  });

  it("rechaza un estado de vacuna inválido", () => {
    const pet = buildPet({
      vacunas: [
        {
          ...buildPet().vacunas[0],
          estatus: "desconocido" as PetProfile["vacunas"][number]["estatus"],
        },
      ],
    });
    const errors = collectValidationErrors([pet]);
    expect(errors.some((error) => error.includes("estatus"))).toBe(true);
  });

  it("rechaza una fecha de nacimiento mal formada", () => {
    const pet = buildPet({
      mascota: { ...buildPet().mascota, fechaNacimiento: "01/01/2020" },
    });
    const errors = collectValidationErrors([pet]);
    expect(errors.some((error) => error.includes("fechaNacimiento"))).toBe(true);
  });

  it("rechaza un microchip que no es string ni null", () => {
    const pet = buildPet({
      identificacion: {
        ...buildPet().identificacion,
        microchip: 123 as unknown as string | null,
      },
    });
    const errors = collectValidationErrors([pet]);
    expect(errors.some((error) => error.includes("microchip"))).toBe(true);
  });

  it("rechaza una recompensa negativa", () => {
    const pet = buildPet({
      emergencia: { ...buildPet().emergencia, recompensa: -100 },
    });
    const errors = collectValidationErrors([pet]);
    expect(errors.some((error) => error.includes("recompensa") && error.includes(">= 0"))).toBe(true);
  });

  it("rechaza una recompensa que no es number ni null", () => {
    const pet = buildPet({
      emergencia: {
        ...buildPet().emergencia,
        recompensa: "500" as unknown as number | null,
      },
    });
    const errors = collectValidationErrors([pet]);
    expect(errors.some((error) => error.includes("recompensa"))).toBe(true);
  });

  it("acepta una recompensa válida", () => {
    const pet = buildPet({
      emergencia: { ...buildPet().emergencia, recompensa: 0 },
    });
    expect(collectValidationErrors([pet])).toEqual([]);
  });

  it("acepta cada estado válido del ciclo de vida cuando hay consistencia", () => {
    const cases: Array<{ estado: PetProfile["estado"]; perdido: boolean }> = [
      { estado: "en_casa", perdido: false },
      { estado: "perdido", perdido: true },
      { estado: "en_adopcion", perdido: false },
      { estado: "adoptado", perdido: false },
      { estado: "rescatado", perdido: false },
      { estado: "fallecido", perdido: false },
    ];

    for (const { estado, perdido } of cases) {
      const pet = buildPet({
        estado,
        emergencia: { ...buildPet().emergencia, perdido },
      });
      expect(collectValidationErrors([pet])).toEqual([]);
    }
  });

  it("rechaza un estado inválido fuera de la unión", () => {
    const pet = buildPet({
      estado: "extraviado" as PetProfile["estado"],
    });
    const errors = collectValidationErrors([pet]);
    expect(errors.some((error) => error.includes("estado"))).toBe(true);
  });

  it("rechaza estado perdido sin flag emergencia.perdido", () => {
    const pet = buildPet({
      estado: "perdido",
      emergencia: { ...buildPet().emergencia, perdido: false },
    });
    const errors = collectValidationErrors([pet]);
    expect(errors.some((error) => error.includes('estado es "perdido"') && error.includes("perdido no es true"))).toBe(true);
  });

  it("rechaza flag perdido con un estado canónico distinto de perdido", () => {
    const pet = buildPet({
      estado: "en_casa",
      emergencia: { ...buildPet().emergencia, perdido: true },
    });
    const errors = collectValidationErrors([pet]);
    expect(errors.some((error) => error.includes("pero emergencia.perdido es true"))).toBe(true);
  });

  it("rechaza modo perdido en un estado terminal (fallecido)", () => {
    const pet = buildPet({
      estado: "fallecido",
      emergencia: { ...buildPet().emergencia, perdido: true },
    });
    const errors = collectValidationErrors([pet]);
    expect(errors.some((error) => error.includes("un estado terminal no admite modo perdido"))).toBe(true);
  });

  it("rechaza datos que no son un array", () => {
    expect(collectValidationErrors({})).toHaveLength(1);
  });
});

describe("isPetProfileArray", () => {
  it("es true para datos válidos", () => {
    expect(isPetProfileArray([buildPet()])).toBe(true);
  });

  it("es false ante drift de tipos", () => {
    const pet = buildPet({
      mascota: { ...buildPet().mascota, talla: "Mediana" as PetProfile["mascota"]["talla"] },
    });
    expect(isPetProfileArray([pet])).toBe(false);
  });
});

describe("assertValidPetProfiles", () => {
  it("lanza con mensaje descriptivo cuando hay errores", () => {
    const pet = buildPet({
      mascota: { ...buildPet().mascota, talla: "Pequeña" as PetProfile["mascota"]["talla"] },
    });
    expect(() => assertValidPetProfiles([pet])).toThrow(/Datos de mascotas inválidos/);
  });

  it("no lanza para datos válidos", () => {
    expect(() => assertValidPetProfiles([buildPet()])).not.toThrow();
  });
});

describe("collectDataWarnings", () => {
  it("avisa sobre sentineles en alergias", () => {
    const pet = buildPet({
      salud: { ...buildPet().salud, alergias: ["Ninguna registrada"] },
    });
    const warnings = collectDataWarnings([pet]);
    expect(warnings.some((warning) => warning.includes("alergias") && warning.includes("sentinel"))).toBe(true);
  });

  it("avisa cuando muchas mascotas comparten el mismo teléfono", () => {
    const shared = { telefonoPrincipal: "552201296480", whatsapp: "552201296480" } as const;
    const pets = ["a", "b", "c"].map((id) =>
      buildPet({ id, contacto: { ...buildPet().contacto, ...shared } }),
    );
    const warnings = collectDataWarnings(pets);
    expect(warnings.some((warning) => warning.includes("compartido por"))).toBe(true);
  });

  it("avisa cuando notas está vacío", () => {
    const warnings = collectDataWarnings([buildPet()]);
    expect(warnings.some((warning) => warning.includes("notas está vacío"))).toBe(true);
  });

  it("avisa cuando perdido es true pero falta fechaPerdida", () => {
    const pet = buildPet({
      emergencia: {
        ...buildPet().emergencia,
        perdido: true,
        fechaPerdida: null,
        zonaPerdida: "Parque",
      },
    });
    const warnings = collectDataWarnings([pet]);
    expect(warnings.some((w) => w.includes("perdido") && w.includes("fechaPerdida"))).toBe(true);
  });

  it("avisa cuando perdido es true pero falta zonaPerdida", () => {
    const pet = buildPet({
      emergencia: {
        ...buildPet().emergencia,
        perdido: true,
        fechaPerdida: "2026-01-01",
        zonaPerdida: null,
      },
    });
    const warnings = collectDataWarnings([pet]);
    expect(warnings.some((w) => w.includes("perdido") && w.includes("zonaPerdida"))).toBe(true);
  });

  it("avisa cuando perdido es false pero hay datos de emergencia huérfanos", () => {
    const pet = buildPet({
      emergencia: {
        ...buildPet().emergencia,
        perdido: false,
        fechaPerdida: "2026-09-01",
      },
    });
    const warnings = collectDataWarnings([pet]);
    expect(warnings.some((w) => w.includes("perdido es false") && w.includes("emergencia"))).toBe(true);
  });

  it("no avisa de emergencia huérfana para mascotas en estado normal", () => {
    const warnings = collectDataWarnings([buildPet()]);
    expect(warnings.some((w) => w.includes("perdido es false"))).toBe(false);
  });
});