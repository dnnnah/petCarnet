import { describe, expect, it } from "vitest";
import {
  buildHealthExportSummary,
  getConsultationMissingFields,
  getConsultationsSummary,
  getDewormingMissingFields,
  getHealthCompletenessReport,
  getHealthRecordCounts,
  hasDewormingDocument,
  hasDewormingNextDate,
  hasHealthRecord,
  isHealthConsultation,
  isHealthDeworming,
  parseHealthConsultation,
  parseHealthDeworming,
  resolveNextDewormingDue,
  sortConsultationsByDate,
  sortDewormingsByDate,
} from "@/lib/domain/health";
import type { HealthConsultation, HealthDeworming } from "@/types/health";
import type { PetProfile } from "@/types/pet";

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
    vacunas: [
      {
        id: "vac-1",
        nombre: "Rabia",
        fechaAplicacion: "2025-01-15",
        proximaDosis: "2026-01-15",
        estatus: "al_dia",
        lote: "A123",
        veterinario: "Dr. López",
        documentoUrl: "/docs/cartilla.pdf",
      },
    ],
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

describe("parseHealthDeworming / isHealthDeworming", () => {
  it("parsea un registro válido y normaliza", () => {
    const parsed = parseHealthDeworming({ ...makeDeworming(), dosis: " 2 ml " });
    expect(parsed).not.toBeNull();
    expect(parsed?.producto).toBe("Praziquantel");
    expect(parsed?.fecha).toBe("2026-06-01");
    expect(parsed?.proximaFecha).toBe("2026-12-01");
    expect(parsed?.dosis).toBe("2 ml");
    expect(parsed?.veterinario).toBe("Dr. López");
  });

  it("devuelve null si no es objeto o falta id/producto/fecha", () => {
    expect(parseHealthDeworming(null)).toBeNull();
    expect(parseHealthDeworming("x")).toBeNull();
    expect(parseHealthDeworming([])).toBeNull();
    expect(parseHealthDeworming({ producto: "Praziquantel", fecha: "2026-06-01" })).toBeNull();
    expect(parseHealthDeworming({ id: "d-1", fecha: "2026-06-01" })).toBeNull();
    expect(parseHealthDeworming({ id: "d-1", producto: "Praziquantel" })).toBeNull();
    expect(parseHealthDeworming({ id: "d-1", producto: "Praziquantel", fecha: "ayer" })).toBeNull();
  });

  it("opcionales inválidos se convierten en undefined, no fallan", () => {
    const parsed = parseHealthDeworming({
      id: "desp-1",
      producto: "Praziquantel",
      fecha: "2026-06-01",
      proximaFecha: "2026/12/01",
      dosis: null,
      veterinario: "Dr. López",
      documentoUrl: undefined as unknown,
    });
    expect(parsed?.proximaFecha).toBeUndefined();
    expect(parsed?.dosis).toBeUndefined();
    expect(parsed?.id).toBe("desp-1");
  });

  it("el tipo guard coincide con parse", () => {
    expect(isHealthDeworming(makeDeworming())).toBe(true);
    expect(isHealthDeworming({})).toBe(false);
  });
});

describe("parseHealthConsultation / isHealthConsultation", () => {
  it("parsea una consulta válida y normaliza arrays", () => {
    const parsed = parseHealthConsultation({
      ...makeConsultation(),
      medicamentos: ["Amoxicilina", 42, "Metronidazol"],
    });
    expect(parsed).not.toBeNull();
    expect(parsed?.motivo).toBe("Chequeo general");
    expect(parsed?.diagnostico).toBe("Sano");
    expect(parsed?.medicamentos).toEqual(["Amoxicilina", "Metronidazol"]);
    expect(parsed?.documentos).toEqual([{ id: "doc-1", nombre: "Nota médica", url: "/docs/nota.pdf" }]);
  });

  it("devuelve null si no es objeto o falta id/fecha/motivo", () => {
    expect(parseHealthConsultation(null)).toBeNull();
    expect(parseHealthConsultation(undefined)).toBeNull();
    expect(parseHealthConsultation({ fecha: "2026-08-10", motivo: "Chequeo" })).toBeNull();
    expect(parseHealthConsultation({ id: "c-1", motivo: "Chequeo" })).toBeNull();
    expect(parseHealthConsultation({ id: "c-1", fecha: "2026-08-10" })).toBeNull();
    expect(parseHealthConsultation({ id: "c-1", fecha: "invalida", motivo: "Chequeo" })).toBeNull();
  });

  it("documentos no válidos se descartan o completan con nombre/url vacíos", () => {
    const parsed = parseHealthConsultation({
      ...makeConsultation(),
      documentos: [{ id: "doc-1", nombre: "Nota", url: "/x.pdf" }, "basura", { id: "doc-2" }],
    });
    expect(parsed?.documentos.length).toBe(2);
    expect(parsed?.documentos[0]?.id).toBe("doc-1");
    expect(parsed?.documentos[1]?.nombre).toBe("");
    expect(parsed?.documentos[1]?.url).toBe("");
  });

  it("el tipo guard coincide con parse", () => {
    expect(isHealthConsultation(makeConsultation())).toBe(true);
    expect(isHealthConsultation({})).toBe(false);
  });
});

describe("hasDewormingNextDate / hasDewormingDocument", () => {
  it("detección de próxima fecha", () => {
    expect(hasDewormingNextDate(makeDeworming())).toBe(true);
    expect(hasDewormingNextDate(makeDeworming({ proximaFecha: undefined }))).toBe(false);
    expect(hasDewormingNextDate(makeDeworming({ proximaFecha: "2026/12/01" }))).toBe(false);
  });

  it("detección de documento", () => {
    expect(hasDewormingDocument(makeDeworming())).toBe(true);
    expect(hasDewormingDocument(makeDeworming({ documentoUrl: "", documentoId: "doc-9" }))).toBe(true);
    expect(hasDewormingDocument(makeDeworming({ documentoUrl: undefined, documentoId: undefined }))).toBe(false);
  });
});

describe("sortDewormingsByDate", () => {
  it("ordena cronológicamente y en reverso", () => {
    const list = [
      makeDeworming({ id: "a", fecha: "2026-06-01" }),
      makeDeworming({ id: "b", fecha: "2026-01-01" }),
      makeDeworming({ id: "c", fecha: "2026-09-01" }),
    ];
    expect(sortDewormingsByDate(list).map((d) => d.id)).toEqual(["b", "a", "c"]);
    expect(sortDewormingsByDate(list, "reverso").map((d) => d.id)).toEqual(["c", "a", "b"]);
  });

  it("sin fecha válida van al final", () => {
    const sorted = sortDewormingsByDate([
      makeDeworming({ id: "a", fecha: "2026-01-01" }),
      makeDeworming({ id: "bad", fecha: "sin-fecha" }),
      makeDeworming({ id: "b", fecha: "2025-01-01" }),
    ]);
    expect(sorted.map((d) => d.id)).toEqual(["b", "a", "bad"]);
  });

  it("con array vacío devuelve array vacío", () => {
    expect(sortDewormingsByDate([])).toEqual([]);
  });
});

describe("resolveNextDewormingDue", () => {
  it("prioriza la próxima fecha vencida más reciente", () => {
    const due = resolveNextDewormingDue(
      [
        makeDeworming({ id: "old", proximaFecha: "2026-01-01" }),
        makeDeworming({ id: "reciente", proximaFecha: "2026-09-01" }),
      ],
      TODAY,
    );
    expect(due?.deworming.id).toBe("reciente");
    expect(due?.kind).toBe("vencida");
  });

  it("cuando hay vencidas, manda la vencida sobre la de hoy y las programadas", () => {
    const due = resolveNextDewormingDue(
      [
        makeDeworming({ id: "vencida", proximaFecha: "2026-09-01" }),
        makeDeworming({ id: "hoy", proximaFecha: TODAY }),
        makeDeworming({ id: "futura", proximaFecha: "2026-12-01" }),
      ],
      TODAY,
    );
    expect(due?.deworming.id).toBe("vencida");
    expect(due?.kind).toBe("vencida");
  });

  it("si no hay vencidas, reporta la de hoy", () => {
    const due = resolveNextDewormingDue(
      [
        makeDeworming({ id: "hoy", proximaFecha: TODAY }),
        makeDeworming({ id: "futura", proximaFecha: "2026-12-01" }),
      ],
      TODAY,
    );
    expect(due?.deworming.id).toBe("hoy");
    expect(due?.kind).toBe("entrega_hoy");
  });

  it("sin vencidas ni de hoy, elige la próxima programada más cercana", () => {
    const due = resolveNextDewormingDue(
      [
        makeDeworming({ id: "lejos", proximaFecha: "2027-03-01" }),
        makeDeworming({ id: "cerca", proximaFecha: "2026-10-01" }),
      ],
      TODAY,
    );
    expect(due?.deworming.id).toBe("cerca");
    expect(due?.kind).toBe("programada");
  });

  it("sin registros o sin próxima fecha devuelve null", () => {
    expect(resolveNextDewormingDue([], TODAY)).toBeNull();
    expect(resolveNextDewormingDue([makeDeworming({ proximaFecha: undefined })], TODAY)).toBeNull();
    expect(resolveNextDewormingDue([makeDeworming({ proximaFecha: "2026/12/01" })], TODAY)).toBeNull();
  });
});

describe("sortConsultationsByDate", () => {
  it("ordena cronológicamente y en reverso", () => {
    const list = [
      makeConsultation({ id: "a", fecha: "2026-08-10" }),
      makeConsultation({ id: "b", fecha: "2026-01-10" }),
      makeConsultation({ id: "c", fecha: "2026-12-10" }),
    ];
    expect(sortConsultationsByDate(list).map((c) => c.id)).toEqual(["b", "a", "c"]);
    expect(sortConsultationsByDate(list, "reverso").map((c) => c.id)).toEqual(["c", "a", "b"]);
  });
});

describe("getConsultationsSummary", () => {
  it("resume el historial médico", () => {
    const summary = getConsultationsSummary([
      makeConsultation({ id: "a", diagnostico: "Sano", tratamiento: "X", medicamentos: ["A"], veterinario: "Dr" }),
      makeConsultation({ id: "b", diagnostico: undefined, tratamiento: undefined, medicamentos: [], veterinario: undefined }),
    ]);
    expect(summary).toEqual({
      total: 2,
      conDiagnostico: 1,
      conTratamiento: 1,
      conMedicamentos: 1,
      sinVeterinario: 1,
    });
  });

  it("con array vacío todo en cero", () => {
    expect(getConsultationsSummary([])).toEqual({
      total: 0,
      conDiagnostico: 0,
      conTratamiento: 0,
      conMedicamentos: 0,
      sinVeterinario: 0,
    });
  });
});

describe("getDewormingMissingFields / getConsultationMissingFields", () => {
  it("campos faltantes de una desparasitación", () => {
    expect(getDewormingMissingFields(makeDeworming())).toEqual([]);
    const missing = getDewormingMissingFields(
      makeDeworming({ proximaFecha: undefined, dosis: "", veterinario: "", documentoUrl: "" }),
    );
    expect(missing.sort()).toEqual(["dosis", "documentoUrl", "proximaFecha", "veterinario"].sort());
  });

  it("campos faltantes de una consulta", () => {
    expect(getConsultationMissingFields(makeConsultation())).toEqual([]);
    const missing = getConsultationMissingFields(
      makeConsultation({
        motivo: "",
        diagnostico: "",
        tratamiento: undefined,
        veterinario: "",
        medicamentos: [],
        documentos: [],
      }),
    );
    expect(missing.sort()).toEqual(["diagnostico", "documentos", "medicamentos", "motivo", "tratamiento", "veterinario"]);
  });
});

describe("getHealthCompletenessReport", () => {
  it("un expediente completo (con vacunas íntegras y sin extras) reporta complete", () => {
    const report = getHealthCompletenessReport(makePet());
    expect(report.complete).toBe(true);
    expect(report.items).toEqual([]);
    expect(report.totalMissing).toBe(0);
  });

  it("reporta vacunas sin próxima dosis ni documento", () => {
    const pet = makePet({
      vacunas: [
        {
          id: "v1",
          nombre: "Rabia",
          fechaAplicacion: "2025-01-15",
          proximaDosis: "",
          estatus: "al_dia",
          lote: "",
          veterinario: "",
          documentoUrl: "",
        } as PetProfile["vacunas"][number],
      ],
    });
    const report = getHealthCompletenessReport(pet);
    expect(report.complete).toBe(false);
    expect(report.items).toHaveLength(1);
    expect(report.items[0]?.entity).toBe("vacuna");
    expect([...(report.items[0]?.missingFields ?? [])].sort()).toEqual([
      "documentoUrl",
      "lote",
      "proximaDosis",
      "veterinario",
    ]);
  });

  it("incluye desparasitaciones e historial en el reporte", () => {
    const pet = makePet({
      desparasitaciones: [makeDeworming({ proximaFecha: undefined })],
      historialMedico: [makeConsultation({ diagnostico: undefined })],
    });
    const report = getHealthCompletenessReport(pet);
    const entities = report.items.map((item) => item.entity).sort();
    expect(entities).toEqual(["consulta", "desparasitacion"]);
  });
});

describe("getHealthRecordCounts / hasHealthRecord", () => {
  it("cuenta cada dimensión", () => {
    const pet = makePet({
      historialMedico: [makeConsultation()],
      salud: { alergias: ["Penicilina"], condicionesMedicas: ["Asma"], medicamentosActuales: ["X"], dietaEspecial: "", comportamiento: "" },
    });
    const counts = getHealthRecordCounts(pet);
    expect(counts).toEqual({
      vacunas: 1,
      desparasitaciones: 0,
      consultas: 1,
      alergias: 1,
      condicionesMedicas: 1,
      medicamentosActuales: 1,
      veterinarioRegistrado: true,
    });
    expect(hasHealthRecord(pet)).toBe(true);
  });

  it("un expediente vacío no cuenta como salud registrada", () => {
    const empty = makePet({
      vacunas: [],
      veterinario: { nombre: "", clinica: "", telefono: "", direccion: "", horario: "" },
    });
    expect(hasHealthRecord(empty)).toBe(false);
    expect(getHealthRecordCounts(empty).veterinarioRegistrado).toBe(false);
  });

  it("sin veterinario registrado, veterinarioRegistrado es false", () => {
    const pet = makePet({
      veterinario: { nombre: "", clinica: "", telefono: "", direccion: "", horario: "" },
    });
    expect(getHealthRecordCounts(pet).veterinarioRegistrado).toBe(false);
  });
});

describe("buildHealthExportSummary", () => {
  it("estructura el contenido definido en FASE 5.4", () => {
    const pet = makePet({
      desparasitaciones: [makeDeworming()],
      historialMedico: [makeConsultation()],
      salud: {
        alergias: [],
        condicionesMedicas: ["Ansiedad"],
        medicamentosActuales: ["Gabapentina"],
        dietaEspecial: "",
        comportamiento: "",
      },
    });

    const summary = buildHealthExportSummary(pet, TODAY);

    expect(summary.pet).toMatchObject({
      id: "p-1",
      nombre: "Luna",
      codigoPublico: "PC-LUNA-001",
      especie: "Gato",
      raza: "Doméstico",
      genero: "Hembra",
    });
    expect(summary.pet.fechaNacimiento).toBe("2021-03-10");
    expect(summary.identificacion).toEqual({ microchip: "ABC123", estado: "en_casa", verificado: true });
    expect(summary.alergias).toEqual([]);
    expect(summary.condicionesMedicas).toEqual(["Ansiedad"]);
    expect(summary.medicamentosActuales).toEqual(["Gabapentina"]);
    expect(summary.veterinario?.clinica).toBe("Clínica Condesa");
    expect(summary.vacunas).toHaveLength(1);
    expect(summary.vacunas[0]?.nombre).toBe("Rabia");
    expect(summary.vacunas[0]?.proximaDosis).toBe("2026-01-15");
    expect(summary.desparasitaciones).toHaveLength(1);
    expect(summary.desparasitaciones[0]?.producto).toBe("Praziquantel");
    expect(summary.historialMedico).toHaveLength(1);
    expect(summary.historialMedico[0]?.motivo).toBe("Chequeo general");
    expect(summary.generadoEn).toBe(TODAY);
  });

  it("generadoEn usa la fecha inyectada", () => {
    expect(buildHealthExportSummary(makePet(), "2026-01-01").generadoEn).toBe("2026-01-01");
    // solo si la fecha inyectada es válida; si no, genera la fecha actual
    expect(buildHealthExportSummary(makePet(), "invalida").generadoEn).not.toBe("invalida");
  });

  it("contenido con datos faltantes se vuelve null (no se inventa)", () => {
    const pet = makePet({
      vacunas: [
        {
          id: "v1",
          nombre: "Rabia",
          fechaAplicacion: "2025-01-15",
          proximaDosis: "",
          estatus: "proxima_dosis",
          lote: "",
          veterinario: "",
          documentoUrl: "",
        } as PetProfile["vacunas"][number],
      ],
      veterinario: { nombre: "", clinica: "", telefono: "", direccion: "", horario: "" },
      identificacion: { codigoPublico: "PC-LUNA-001", microchip: "", notas: "" },
    });

    const summary = buildHealthExportSummary(pet, TODAY);
    expect(summary.identificacion.microchip).toBeNull();
    expect(summary.veterinario).toBeNull();
    expect(summary.vacunas[0]?.proximaDosis).toBeNull();
    expect(summary.vacunas[0]?.lote).toBeNull();
    expect(summary.vacunas[0]?.veterinario).toBeNull();
  });

  it("arrays vacíos cuando no hay registros", () => {
    const summary = buildHealthExportSummary(makePet(), TODAY);
    expect(summary.desparasitaciones).toEqual([]);
    expect(summary.historialMedico).toEqual([]);
    expect(summary.vacunas).toHaveLength(1); // las vacunas existentes sí se exportan
  });

  it("fecha de nacimiento inválida se exporta como null", () => {
    const pet = makePet({ mascota: { ...makePet().mascota, fechaNacimiento: "desconocida" } });
    expect(buildHealthExportSummary(pet, TODAY).pet.fechaNacimiento).toBeNull();
  });
});