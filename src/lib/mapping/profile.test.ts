import { describe, expect, it } from "vitest";
import { toProfileViewModel } from "@/lib/mapping/profile";
import type { PetProfile } from "@/types/pet";

function buildPet(status: PetProfile["estado"]): PetProfile {
  return {
    id: "test-1",
    estado: status,
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
    vacunas: [],
    documentos: [],
    configuracionPublica: {
      mostrarEmail: false,
      mostrarTelefonoSecundario: false,
      mostrarDireccionVet: false,
      mostrarDocumentosPrivados: false,
    },
  };
}

describe("toProfileViewModel", () => {
  it("expone el estado canónico en_casa", () => {
    const vm = toProfileViewModel(buildPet("en_casa"));
    expect(vm.status).toBe("en_casa");
  });

  it("expone el estado canónico perdido", () => {
    const vm = toProfileViewModel(buildPet("perdido"));
    expect(vm.status).toBe("perdido");
  });

  it("expone estados futuros del ciclo de vida sin romper el mapeo", () => {
    const vm = toProfileViewModel(buildPet("en_adopcion"));
    expect(vm.status).toBe("en_adopcion");
    expect(vm.header.name).toBe("Prueba");
  });

  it("expone sin romper el mapeo todos los estados del ciclo de vida", () => {
    const statuses: PetProfile["estado"][] = [
      "en_casa",
      "perdido",
      "en_adopcion",
      "adoptado",
      "rescatado",
      "fallecido",
    ];

    for (const status of statuses) {
      const vm = toProfileViewModel(buildPet(status));
      expect(vm.status).toBe(status);
      expect(vm.header.name).toBe("Prueba");
    }
  });
});