import { describe, expect, it } from "vitest";
import {
  toDewormingSectionViewModel,
  toMedicalHistoryViewModel,
  toCompletenessViewModel,
  toVaccineItemViewModel,
  toVaccineSummaryViewModel,
  MISSING_FIELD_LABELS,
} from "@/lib/mapping/health";
import type { PetProfile } from "@/types/pet";
import type { HealthConsultation, HealthDeworming } from "@/types/health";

const TODAY = "2026-09-18";

function makeDeworming(overrides: Partial<HealthDeworming> = {}): HealthDeworming {
  return {
    id: "desp-1",
    producto: "Praziquantel",
    fecha: "2026-06-01",
    proximaFecha: "2026-12-01",
    dosis: "2 ml",
    veterinario: "Dr. López",
    documentoUrl: "/docs/desparasitacion.pdf",
    ...overrides,
  };
}

function makeConsultation(overrides: Partial<HealthConsultation> = {}): HealthConsultation {
  return {
    id: "cons-1",
    fecha: "2026-08-10",
    motivo: "Chequeo general",
    diagnostico: "Sano",
    tratamiento: "Observación",
    medicamentos: ["Analgésico"],
    veterinario: "Dra. Méndez",
    documentos: [{ id: "doc-1", nombre: "Nota médica", url: "/docs/nota.pdf" }],
    ...overrides,
  };
}

function makePet(overrides: Partial<PetProfile> = {}): PetProfile {
  return {
    id: "p-1",
    estado: "en_casa",
    verificado: true,
    mascota: {
      nombre: "Luna",
      especie: "Gato",
      raza: "Doméstico",
      fotoPerfilUrl: "/pets/luna.jpeg",
      genero: "Hembra",
      talla: "Pequeño",
      color: "Negro",
      pesoKg: 4,
      fechaNacimiento: "2021-03-10",
      rasgosDistintivos: [],
      esterilizado: true,
    },
    identificacion: { codigoPublico: "PC-LUNA-001", microchip: "ABC123", notas: "" },
    contacto: {
      nombrePublico: "Fam. Luna",
      telefonoPrincipal: "5555555555",
      whatsapp: "5555555555",
      telefonoSecundario: "",
      email: "",
      zonaSegura: "Condesa",
      zonaHabitual: "Condesa",
      mensajeWhatsapp: "Hola",
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
      comportamiento: "",
    },
    veterinario: {
      nombre: "Dra. Méndez",
      clinica: "Clínica Condesa",
      telefono: "5555667788",
      direccion: "Condesa",
      horario: "L-V 10-19",
    },
    vacunas: [],
    documentos: [],
    configuracionPublica: {
      mostrarEmail: false,
      mostrarTelefonoSecundario: false,
      mostrarDireccionVet: false,
      mostrarDocumentosPrivados: false,
    },
    ...overrides,
  };
}

describe("toVaccineItemViewModel", () => {
  it("presenta una vacuna completa sin alertas de próxima dosis cuando está al día", () => {
    const vm = toVaccineItemViewModel(
      {
        id: "v1",
        nombre: "Rabia",
        fechaAplicacion: "2025-01-15",
        proximaDosis: "2026-12-01",
        estatus: "al_dia",
        lote: "A123",
        veterinario: "Dr. López",
        documentoUrl: "/docs/cartilla.pdf",
      },
      [],
      TODAY,
    );
    expect(vm.name).toBe("Rabia");
    expect(vm.applicationDate).not.toBeNull();
    expect(vm.status).toBe("Al día");
    expect(vm.hasDocument).toBe(true);
    expect(vm.alert).toBeNull();
    expect(vm.coreMissing).toBe(false);
    expect(vm.missingFields).toEqual([]);
  });

  it("usa el estado explícito vencida como alerta", () => {
    const vm = toVaccineItemViewModel(
      { id: "v1", nombre: "Rabia", fechaAplicacion: "2025-01-15", proximaDosis: "2026-01-15", estatus: "vencida", lote: "", veterinario: "", documentoUrl: "" },
      [],
      TODAY,
    );
    expect(vm.alert?.kind).toBe("vencida");
    expect(vm.missingFields.length).toBeGreaterThan(0);
  });

  it("detecta vence hoy por fecha aunque el estado explícito no lo marque", () => {
    const vm = toVaccineItemViewModel(
      { id: "v1", nombre: "Rabia", fechaAplicacion: "2025-01-15", proximaDosis: TODAY, estatus: "al_dia", lote: "L", veterinario: "V", documentoUrl: "" },
      [],
      TODAY,
    );
    expect(vm.alert?.kind).toBe("vence_hoy");
  });

  it("resuelve el documento por documentoId entre los documentos del perfil", () => {
    const vm = toVaccineItemViewModel(
      { id: "v1", nombre: "Rabia", fechaAplicacion: "2025-01-15", proximaDosis: "2026-01-15", estatus: "al_dia", lote: "A", veterinario: "V", documentoUrl: "/docs/viejo.pdf", documentoId: "doc-9" },
      [{ id: "doc-9", url: "/docs/nuevo.pdf", nombre: "Cartilla 2026" }],
      TODAY,
    );
    expect(vm.document?.url).toBe("/docs/nuevo.pdf");
    expect(vm.document?.nombre).toBe("Cartilla 2026");
  });
});

describe("toVaccineSummaryViewModel", () => {
  it("cuenta por estado explícito vía core", () => {
    const pet = makePet({
      vacunas: [
        { id: "v1", nombre: "A", fechaAplicacion: "2025-01-01", proximaDosis: "2026-01-01", estatus: "al_dia", lote: "", veterinario: "", documentoUrl: "" },
        { id: "v2", nombre: "B", fechaAplicacion: "2025-01-01", proximaDosis: "2026-01-01", estatus: "proxima_dosis", lote: "", veterinario: "", documentoUrl: "" },
        { id: "v3", nombre: "C", fechaAplicacion: "2025-01-01", proximaDosis: "2026-01-01", estatus: "vencida", lote: "", veterinario: "", documentoUrl: "" },
      ],
    });
    const summary = toVaccineSummaryViewModel(pet.vacunas);
    expect(summary.total).toBe(3);
    expect(summary.al_dia).toBe(1);
    expect(summary.proxima_dosis).toBe(1);
    expect(summary.vencida).toBe(1);
    expect(summary.desconocido).toBe(0);
  });
});

describe("toDewormingSectionViewModel", () => {
  it("ordena en reverso y reporta la próxima desparasitación vencida", () => {
    const pet = makePet({
      desparasitaciones: [
        makeDeworming({ id: "a", fecha: "2026-01-01", proximaFecha: "2026-06-01" }),
        makeDeworming({ id: "b", fecha: "2026-09-01", proximaFecha: "2026-08-01" }),
      ],
    });
    const vm = toDewormingSectionViewModel(pet.desparasitaciones ?? [], TODAY);
    expect(vm.items.map((item) => item.id)).toEqual(["b", "a"]);
    expect(vm.nextDue?.kind).toBe("vencida");
    expect(vm.nextDue?.label).toBe("Desparasitación vencida");
  });

  it("reporta campos faltantes traducidos", () => {
    const pet = makePet({
      desparasitaciones: [
        makeDeworming({ proximaFecha: undefined, dosis: "", veterinario: "", documentoUrl: "" }),
      ],
    });
    const vm = toDewormingSectionViewModel(pet.desparasitaciones ?? [], TODAY);
    expect(vm.items[0]?.missingFields).toContain(MISSING_FIELD_LABELS.proximaFecha);
    expect(vm.items[0]?.missingFields).toContain(MISSING_FIELD_LABELS.documentoUrl);
    expect(vm.nextDue).toBeNull();
  });

  it("sin registros muestra un estado vacío (items y nextDue vacíos)", () => {
    const vm = toDewormingSectionViewModel([], TODAY);
    expect(vm.total).toBe(0);
    expect(vm.items).toEqual([]);
    expect(vm.nextDue).toBeNull();
  });

  it("suprime la próxima fecha accionable en mascotas terminales", () => {
    const pet = makePet({
      desparasitaciones: [
        makeDeworming({ id: "a", fecha: "2026-01-01", proximaFecha: "2026-06-01" }),
      ],
    });
    const vm = toDewormingSectionViewModel(pet.desparasitaciones ?? [], TODAY, {
      suppressDue: true,
    });
    expect(vm.items).toHaveLength(1);
    expect(vm.nextDue).toBeNull();
  });
});

describe("supresión de alertas en mascotas terminales", () => {
  it("no marca próxima dosis cuando suppressAlerts está activo", () => {
    const vm = toVaccineItemViewModel(
      { id: "v1", nombre: "Rabia", fechaAplicacion: "2025-01-15", proximaDosis: "2026-01-15", estatus: "al_dia", lote: "", veterinario: "", documentoUrl: "" },
      [],
      TODAY,
      { suppressAlerts: true },
    );
    expect(vm.alert).toBeNull();
    expect(vm.status).toBe("Al día");
  });
});

describe("toMedicalHistoryViewModel", () => {
  it("ordena consultas en reverso y resume con core", () => {
    const pet = makePet({
      historialMedico: [
        makeConsultation({ id: "a", fecha: "2026-01-10" }),
        makeConsultation({ id: "b", fecha: "2026-12-10" }),
      ],
    });
    const vm = toMedicalHistoryViewModel(pet.historialMedico ?? []);
    expect(vm.items.map((item) => item.id)).toEqual(["b", "a"]);
    expect(vm.total).toBe(2);
    expect(vm.summary.total).toBe(2);
    expect(vm.summary.conDiagnostico).toBe(2);
  });

  it("expone documentos de la consulta", () => {
    const vm = toMedicalHistoryViewModel([makeConsultation()]);
    expect(vm.items[0]?.documentos.length).toBe(1);
    expect(vm.items[0]?.documentos[0]?.nombre).toBe("Nota médica");
  });

  it("marca campos faltantes de una consulta incompleta", () => {
    const pet = makePet({
      historialMedico: [
        makeConsultation({ diagnostico: undefined, tratamiento: "", medicamentos: [], documentos: [] }),
      ],
    });
    const vm = toMedicalHistoryViewModel(pet.historialMedico ?? []);
    expect(vm.items[0]?.missingFields.length).toBeGreaterThan(0);
  });
});

describe("toCompletenessViewModel", () => {
  it("distingue información registrada de registro completo", () => {
    const pet = makePet({
      vacunas: [
        { id: "v1", nombre: "Rabia", fechaAplicacion: "2025-01-15", proximaDosis: "", estatus: "al_dia", lote: "", veterinario: "", documentoUrl: "" },
      ],
    });
    const vm = toCompletenessViewModel(pet);
    expect(vm.registered.vacunas).toBe(1);
    expect(vm.complete).toBe(false);
    expect(vm.incompleteRecords).toBe(1);
    expect(vm.completeRecords).toBe(0);
    expect(vm.items[0]?.entityLabel).toContain("Rabia");
  });

  it("no inventa completitud cuando no hay salud registrada", () => {
    const pet = makePet({
      veterinario: { nombre: "", clinica: "", telefono: "", direccion: "", horario: "" },
    });
    const vm = toCompletenessViewModel(pet);
    expect(vm.hasAny).toBe(false);
    expect(vm.hasRecords).toBe(false);
    expect(vm.complete).toBe(true);
    expect(vm.items).toEqual([]);
    expect(vm.completeRecords).toBe(0);
  });

  it("separa registros clínicos del resto de la información de salud", () => {
    const pet = makePet({
      vacunas: [],
      veterinario: {
        nombre: "Dra. Méndez",
        clinica: "Clínica Central",
        telefono: "5555555555",
        direccion: "",
        horario: "",
      },
    });
    const vm = toCompletenessViewModel(pet);
    expect(vm.hasAny).toBe(true);
    expect(vm.hasRecords).toBe(false);
  });

  it("incluye desparasitaciones y consultas en el reporte", () => {
    const pet = makePet({
      desparasitaciones: [makeDeworming({ proximaFecha: undefined })],
      historialMedico: [makeConsultation({ diagnostico: undefined })],
    });
    const vm = toCompletenessViewModel(pet);
    const kinds = vm.items.map((item) => item.kind).sort();
    expect(kinds).toEqual(["consulta", "desparasitacion"]);
  });
});