import { describe, expect, it } from "vitest";
import { getPetById } from "./getPetById";

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

  it("retorna undefined ante un identificador desconocido", () => {
    expect(getPetById("no-existe-xyz")).toBeUndefined();
  });
});