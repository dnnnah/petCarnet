import { describe, expect, it } from "vitest";
import {
  countVaccinesByStatus,
  evaluateVaccineCore,
  filterVaccines,
  filterVaccinesByQuery,
  filterVaccinesByStatus,
  getVaccineMissingFields,
  getVaccineNextDoseDate,
  getVaccinesNeedingNextDose,
  hasVaccineDocument,
  hasVaccineNextDose,
  isVaccineStatus,
  linkVaccineDocument,
  parseVaccineRecord,
  resolveVaccineNextDoseAlert,
  sortVaccinesByDate,
  VACCINE_STATUSES,
  VACCINE_STATUS_ALL,
} from "@/lib/domain/vaccine";
import type { VaccineRecordInput, VaccineNextDoseAlert } from "@/lib/domain/vaccine";
import type { PetVaccine, VaccineStatus } from "@/types/pet";

function makeVaccine(overrides: Partial<VaccineRecordInput> = {}): VaccineRecordInput {
  return {
    id: "vac-1",
    nombre: "Rabia",
    fechaAplicacion: "2025-01-15",
    proximaDosis: "2026-01-15",
    estatus: "al_dia",
    lote: "A123",
    veterinario: "Dr. López",
    documentoUrl: "/docs/cartilla.pdf",
    ...overrides,
  };
}

function makeFullVaccine(): PetVaccine {
  return {
    id: "vac-1",
    nombre: "Rabia",
    fechaAplicacion: "2025-01-15",
    proximaDosis: "2026-01-15",
    estatus: "al_dia",
    lote: "A123",
    veterinario: "Dr. López",
    documentoUrl: "/docs/cartilla.pdf",
  };
}

describe("VACCINE_STATUSES", () => {
  it("contiene exactamente los tres estados existentes", () => {
    expect(VACCINE_STATUSES).toEqual(["al_dia", "proxima_dosis", "vencida"]);
  });

  it("todos no es un estado de vacuna", () => {
    expect(isVaccineStatus(VACCINE_STATUS_ALL)).toBe(false);
  });
});

describe("isVaccineStatus", () => {
  it("acepta cada estado válido", () => {
    for (const status of VACCINE_STATUSES) {
      expect(isVaccineStatus(status)).toBe(true);
    }
  });

  it("rechaza valores inválidos", () => {
    expect(isVaccineStatus("al día")).toBe(false);
    expect(isVaccineStatus("Al_dia")).toBe(false);
    expect(isVaccineStatus("al_dia ")).toBe(false);
    expect(isVaccineStatus("")).toBe(false);
    expect(isVaccineStatus(null)).toBe(false);
    expect(isVaccineStatus(undefined)).toBe(false);
    expect(isVaccineStatus(42)).toBe(false);
    expect(isVaccineStatus({})).toBe(false);
  });
});

describe("parseVaccineRecord", () => {
  it("devuelve null si el payload no es un objeto", () => {
    expect(parseVaccineRecord(null)).toBeNull();
    expect(parseVaccineRecord("rabia")).toBeNull();
    expect(parseVaccineRecord(42)).toBeNull();
    expect(parseVaccineRecord([])).toBeNull();
    expect(parseVaccineRecord(undefined)).toBeNull();
  });

  it("devuelve null si no hay id (los datos actuales exigen id)", () => {
    expect(parseVaccineRecord({ nombre: "Rabia" })).toBeNull();
    expect(parseVaccineRecord({ id: "" })).toBeNull();
    expect(parseVaccineRecord({ id: "   " })).toBeNull();
  });

  it("normaliza un payload completo", () => {
    const parsed = parseVaccineRecord({
      ...makeVaccine(),
      fechaCreacion: "2025-01-01",
      origen: "veterinario",
      documentoId: "doc-1",
    });
    expect(parsed).not.toBeNull();
    expect(parsed?.id).toBe("vac-1");
    expect(parsed?.fechaAplicacion).toBe("2025-01-15");
    expect(parsed?.proximaDosis).toBe("2026-01-15");
    expect(parsed?.estatus).toBe("al_dia");
    expect(parsed?.fechaCreacion).toBe("2025-01-01");
    expect(parsed?.origen).toBe("veterinario");
    expect(parsed?.documentoId).toBe("doc-1");
  });

  it("descarta fechas inválidas pero conserva el resto", () => {
    const parsed = parseVaccineRecord({
      ...makeVaccine(),
      fechaAplicacion: "ayer",
      proximaDosis: "2026/01/15",
    });
    expect(parsed?.fechaAplicacion).toBeNull();
    expect(parsed?.proximaDosis).toBeNull();
    expect(parsed?.nombre).toBe("Rabia");
    expect(parsed?.estatus).toBe("al_dia");
  });

  it("trata un estatus inválido como null (no inventa un estado)", () => {
    const parsed = parseVaccineRecord({ ...makeVaccine(), estatus: "desconocido" });
    expect(parsed?.estatus).toBeNull();
  });

  it("recorta espacios en strings normales", () => {
    const parsed = parseVaccineRecord({ ...makeVaccine(), nombre: "  Rabia  ", lote: " A1 " });
    expect(parsed?.nombre).toBe("Rabia");
    expect(parsed?.lote).toBe("A1");
  });

  it("tolerancia a datos incompletos: campos vacíos a null", () => {
    const parsed = parseVaccineRecord({ id: "vac-1", estatus: "vencida" });
    expect(parsed).not.toBeNull();
    expect(parsed?.nombre).toBeNull();
    expect(parsed?.fechaAplicacion).toBeNull();
  });
});

describe("getVaccineNextDoseDate / hasVaccineNextDose", () => {
  it("devuelve la próxima dosis cuando es válida", () => {
    expect(getVaccineNextDoseDate(makeVaccine())).toBe("2026-01-15");
    expect(hasVaccineNextDose(makeVaccine())).toBe(true);
  });

  it("devuelve null cuando falta o es inválida", () => {
    expect(getVaccineNextDoseDate(makeVaccine({ proximaDosis: null }))).toBeNull();
    expect(getVaccineNextDoseDate(makeVaccine({ proximaDosis: "" }))).toBeNull();
    expect(getVaccineNextDoseDate(makeVaccine({ proximaDosis: "2026/01/15" }))).toBeNull();
    expect(hasVaccineNextDose(makeVaccine({ proximaDosis: null }))).toBe(false);
  });
});

describe("evaluateVaccineCore", () => {
  it("considera completa una vacuna con núcleo válido", () => {
    const result = evaluateVaccineCore(makeVaccine());
    expect(result.complete).toBe(true);
    expect(result.missing).toEqual([]);
  });

  it("también acepta el tipo PetVaccine completo", () => {
    expect(evaluateVaccineCore(makeFullVaccine()).complete).toBe(true);
  });

  it("reporta id/nombre/fecha/estatus faltantes", () => {
    const result = evaluateVaccineCore({
      nombre: "  ",
      estatus: null,
    });
    expect(result.complete).toBe(false);
    expect(result.missing).toContain("id");
    expect(result.missing).toContain("nombre");
    expect(result.missing).toContain("fechaAplicacion");
    expect(result.missing).toContain("estatus");
  });
});

describe("getVaccineMissingFields", () => {
  it("sin campos faltantes devuelve array vacío", () => {
    expect(getVaccineMissingFields(makeVaccine())).toEqual([]);
  });

  it("reporta la próxima dosis ausente", () => {
    expect(getVaccineMissingFields(makeVaccine({ proximaDosis: null }))).toContain("proximaDosis");
  });

  it("reporta lote y veterinario ausentes", () => {
    const missing = getVaccineMissingFields(makeVaccine({ lote: "", veterinario: "  " }));
    expect(missing).toContain("lote");
    expect(missing).toContain("veterinario");
  });

  it("reporta documento ausente solo si no hay url ni id", () => {
    expect(getVaccineMissingFields(makeVaccine({ documentoUrl: null }))).toContain("documentoUrl");
    expect(
      getVaccineMissingFields(makeVaccine({ documentoUrl: null, documentoId: "doc-1" })),
    ).not.toContain("documentoUrl");
  });
});

describe("hasVaccineDocument", () => {
  it("detecta documento por url", () => {
    expect(hasVaccineDocument(makeVaccine())).toBe(true);
  });

  it("detecta documento por id aunque la url esté vacía", () => {
    expect(hasVaccineDocument(makeVaccine({ documentoUrl: "", documentoId: "doc-9" }))).toBe(true);
  });

  it("false cuando no hay url ni id", () => {
    expect(hasVaccineDocument(makeVaccine({ documentoUrl: null, documentoId: null }))).toBe(false);
    expect(hasVaccineDocument({ id: "vac-1" })).toBe(false);
  });
});

describe("sortVaccinesByDate", () => {
  it("ordena cronológicamente por fecha de aplicación", () => {
    const sorted = sortVaccinesByDate([
      makeVaccine({ id: "a", fechaAplicacion: "2026-01-15" }),
      makeVaccine({ id: "b", fechaAplicacion: "2025-08-01" }),
      makeVaccine({ id: "c", fechaAplicacion: "2025-01-01" }),
    ]);
    expect(sorted.map((v) => v.id)).toEqual(["c", "b", "a"]);
  });

  it("ordena en reverso cuando se pide", () => {
    const sorted = sortVaccinesByDate(
      [
        makeVaccine({ id: "a", fechaAplicacion: "2025-01-01" }),
        makeVaccine({ id: "b", fechaAplicacion: "2026-01-01" }),
      ],
      "reverso",
    );
    expect(sorted.map((v) => v.id)).toEqual(["b", "a"]);
  });

  it("coloca sin fecha al final conservando su orden relativo", () => {
    const sorted = sortVaccinesByDate([
      makeVaccine({ id: "a", fechaAplicacion: "2026-01-01" }),
      makeVaccine({ id: "b", fechaAplicacion: null }),
      makeVaccine({ id: "c", fechaAplicacion: "2025-01-01" }),
      makeVaccine({ id: "d", fechaAplicacion: undefined }),
    ]);
    expect(sorted.map((v) => v.id)).toEqual(["c", "a", "b", "d"]);
  });

  it("mantiene orden estable ante fechas iguales", () => {
    const sorted = sortVaccinesByDate([
      makeVaccine({ id: "a", fechaAplicacion: "2025-01-01" }),
      makeVaccine({ id: "b", fechaAplicacion: "2025-01-01" }),
    ]);
    expect(sorted.map((v) => v.id)).toEqual(["a", "b"]);
  });

  it("con array vacío devuelve array vacío", () => {
    expect(sortVaccinesByDate([])).toEqual([]);
  });
});

describe("filterVaccinesByStatus", () => {
  const list = [
    makeVaccine({ id: "a", estatus: "al_dia" as VaccineStatus }),
    makeVaccine({ id: "b", estatus: "proxima_dosis" as VaccineStatus }),
    makeVaccine({ id: "c", estatus: "vencida" as VaccineStatus }),
  ];

  it("con 'todos' devuelve una copia completa", () => {
    const result = filterVaccinesByStatus(list, VACCINE_STATUS_ALL);
    expect(result.map((v) => v.id)).toEqual(["a", "b", "c"]);
    expect(result).not.toBe(list);
  });

  it("filtra por un estado específico", () => {
    expect(filterVaccinesByStatus(list, "vencida").map((v) => v.id)).toEqual(["c"]);
  });

  it("un estado sin coincidencias devuelve array vacío", () => {
    expect(filterVaccinesByStatus(list, "vencida").filter((v) => v.estatus === "al_dia")).toEqual([]);
  });
});

describe("filterVaccinesByQuery", () => {
  const list = [
    makeVaccine({ id: "a", nombre: "Rabia", lote: "A123", veterinario: "Dr. López", origen: "veterinario" }),
    makeVaccine({ id: "b", nombre: "Parvovirus", lote: "P456", veterinario: "Dra. Méndez", origen: "manual" }),
  ];

  it("busca sin distinguir mayúsculas ni acentos", () => {
    expect(filterVaccinesByQuery(list, "RABIA").map((v) => v.id)).toEqual(["a"]);
    expect(filterVaccinesByQuery(list, "lopez").map((v) => v.id)).toEqual(["a"]);
    expect(filterVaccinesByQuery(list, "parvo").map((v) => v.id)).toEqual(["b"]);
  });

  it("busca en lote y origen", () => {
    expect(filterVaccinesByQuery(list, "A123").map((v) => v.id)).toEqual(["a"]);
    expect(filterVaccinesByQuery(list, "veterinario").map((v) => v.id)).toEqual(["a"]);
  });

  it("query vacía o con solo espacios devuelve todo el array", () => {
    expect(filterVaccinesByQuery(list, "").map((v) => v.id)).toEqual(["a", "b"]);
    expect(filterVaccinesByQuery(list, "   ").map((v) => v.id)).toEqual(["a", "b"]);
  });

  it("sin coincidencias devuelve array vacío", () => {
    expect(filterVaccinesByQuery(list, "no existe")).toEqual([]);
  });
});

describe("filterVaccines", () => {
  const list = [
    makeVaccine({ id: "a", nombre: "Rabia", estatus: "al_dia" as VaccineStatus }),
    makeVaccine({ id: "b", nombre: "Rabia", estatus: "vencida" as VaccineStatus }),
    makeVaccine({ id: "c", nombre: "Parvovirus", estatus: "vencida" as VaccineStatus }),
  ];

  it("combina status y query", () => {
    expect(filterVaccines(list, { status: "vencida", query: "rabia" }).map((v) => v.id)).toEqual([
      "b",
    ]);
  });

  it("solo status", () => {
    expect(filterVaccines(list, { status: "vencida" }).map((v) => v.id)).toEqual(["b", "c"]);
  });

  it("solo query", () => {
    expect(filterVaccines(list, { query: "parvo" }).map((v) => v.id)).toEqual(["c"]);
  });

  it("sin filtro devuelve copia completa", () => {
    expect(filterVaccines(list).map((v) => v.id)).toEqual(["a", "b", "c"]);
  });
});

describe("countVaccinesByStatus", () => {
  it("cuenta por estado explícito", () => {
    const result = countVaccinesByStatus([
      makeVaccine({ id: "a", estatus: "al_dia" as VaccineStatus }),
      makeVaccine({ id: "b", estatus: "proxima_dosis" as VaccineStatus }),
      makeVaccine({ id: "c", estatus: "proxima_dosis" as VaccineStatus }),
      makeVaccine({ id: "d", estatus: "vencida" as VaccineStatus }),
    ]);
    expect(result).toEqual({ total: 4, al_dia: 1, proxima_dosis: 2, vencida: 1, desconocido: 0 });
  });

  it("un estatus no reconocido se cuenta como desconocido (no se inventa)", () => {
    const result = countVaccinesByStatus([makeVaccine({ id: "x", estatus: null })]);
    expect(result.desconocido).toBe(1);
    expect(result.al_dia).toBe(0);
  });

  it("con array vacío todos los contadores en cero", () => {
    expect(countVaccinesByStatus([])).toEqual({
      total: 0,
      al_dia: 0,
      proxima_dosis: 0,
      vencida: 0,
      desconocido: 0,
    });
  });
});

it("un elemento fuera del contrato no rompe el conteo", () => {
    const extras = countVaccinesByStatus([
      makeVaccine({ id: "ok" }),
      makeVaccine({ id: "sin-estatus", estatus: null }),
    ]);
    expect(extras.al_dia).toBe(1);
    expect(extras.desconocido).toBe(1);
  });

describe("resolveVaccineNextDoseAlert", () => {
  const today = "2026-09-18";

  it("estatus vencida produce alerta vencida aunque la fecha sea futura", () => {
    expect(resolveVaccineNextDoseAlert(makeVaccine({ estatus: "vencida", proximaDosis: "2027-01-01" }), today)?.kind).toBe("vencida");
  });

  it("próxima dosis en el pasado produce alerta vencida (regla calendárica)", () => {
    const alert = resolveVaccineNextDoseAlert(
      makeVaccine({ estatus: "al_dia", proximaDosis: "2026-01-01" }),
      today,
    );
    expect(alert?.kind).toBe("vencida");
  });

  it("próxima dosis hoy produce alerta vence_hoy", () => {
    const alert = resolveVaccineNextDoseAlert(
      makeVaccine({ estatus: "al_dia", proximaDosis: today }),
      today,
    );
    expect(alert?.kind).toBe("vence_hoy");
  });

  it("próxima dosis futura sin marcado no produce alerta", () => {
    expect(
      resolveVaccineNextDoseAlert(makeVaccine({ estatus: "al_dia", proximaDosis: "2027-01-01" }), today),
    ).toBeNull();
  });

  it("próxima dosis futura marcada como proxima_dosis produce alerta marcada_proxima", () => {
    const alert = resolveVaccineNextDoseAlert(
      makeVaccine({ estatus: "proxima_dosis", proximaDosis: "2027-01-01" }),
      today,
    );
    expect(alert?.kind).toBe("marcada_proxima");
  });

  it("marcada proxima_dosis sin fecha futura no produce alerta (no se inventa la fecha)", () => {
    expect(
      resolveVaccineNextDoseAlert(makeVaccine({ estatus: "proxima_dosis", proximaDosis: null }), today),
    ).toBeNull();
  });

  it("sin fecha y con estatus al_dia no produce alerta", () => {
    expect(
      resolveVaccineNextDoseAlert(makeVaccine({ estatus: "al_dia", proximaDosis: null }), today),
    ).toBeNull();
  });

  it("marcada proxima_dosis con fecha hoy se reporta como vence_hoy (la fecha manda)", () => {
    expect(
      resolveVaccineNextDoseAlert(makeVaccine({ estatus: "proxima_dosis", proximaDosis: today }), today)?.kind,
    ).toBe("vence_hoy");
  });
});

describe("getVaccinesNeedingNextDose", () => {
  const today = "2026-09-18";

  it("devuelve solo las vacunas con alerta activa", () => {
    const alerts = getVaccinesNeedingNextDose(
      [
        makeVaccine({ id: "a", estatus: "proxima_dosis", proximaDosis: "2026-10-01" }),
        makeVaccine({ id: "b", estatus: "al_dia", proximaDosis: "2027-01-01" }),
        makeVaccine({ id: "c", estatus: "vencida" }),
        makeVaccine({ id: "d", estatus: "al_dia", proximaDosis: "2026-01-01" }),
      ],
      today,
    );
    expect(alerts.map((a) => a.vaccine.id).sort()).toEqual(["a", "c", "d"]);
    expect(alerts.map((a) => a.kind).sort()).toEqual(["marcada_proxima", "vencida", "vencida"]);
  });

  it("conserva el objeto de la vacuna en la alerta", () => {
    const vaccine = makeVaccine({ estatus: "vencida" });
    const alerts: Array<VaccineNextDoseAlert> = getVaccinesNeedingNextDose([vaccine], today);
    expect(alerts[0]?.vaccine).toBe(vaccine);
  });

  it("con array vacío no hay alertas", () => {
    expect(getVaccinesNeedingNextDose([], today)).toEqual([]);
  });
});

describe("linkVaccineDocument", () => {
  const documents = [
    { id: "doc-1", url: "/docs/cartilla.pdf" },
    { id: "doc-2", url: "/docs/otro.pdf" },
  ];

  it("resuelve por documentoId con preferencia", () => {
    const linked = linkVaccineDocument(makeVaccine({ documentoId: "doc-2", documentoUrl: "/docs/cartilla.pdf" }), documents);
    expect(linked?.id).toBe("doc-2");
  });

  it("resuelve por documentoUrl si no hay documentoId", () => {
    const linked = linkVaccineDocument(makeVaccine({ documentoId: null, documentoUrl: "/docs/cartilla.pdf" }), documents);
    expect(linked?.id).toBe("doc-1");
  });

  it("si el documentoId no existe, cae a documentoUrl", () => {
    const linked = linkVaccineDocument(makeVaccine({ documentoId: "no-existe", documentoUrl: "/docs/otro.pdf" }), documents);
    expect(linked?.id).toBe("doc-2");
  });

  it("sin coincidencias devuelve null", () => {
    expect(linkVaccineDocument(makeVaccine({ documentoId: null, documentoUrl: "/otro.pdf" }), documents)).toBeNull();
    expect(linkVaccineDocument(makeVaccine({ documentoId: null, documentoUrl: null }), documents)).toBeNull();
  });

  it("con lista de documentos vacía devuelve null", () => {
    expect(linkVaccineDocument(makeVaccine(), [])).toBeNull();
  });
});