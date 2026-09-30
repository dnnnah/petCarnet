import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, resolve } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Guardián de la dirección de dependencias (FASE 9A).
 *
 * Complementa `domain/purity.test.ts` (que vigila el aislamiento del dominio
 * respecto a UI/frameworks) comprobando la DIRECCIÓN entre capas:
 *
 *   domain  ←  services  ←  infra  ←  app / components
 *
 * Reglas:
 * - `domain` no conoce `services`, `infra` ni los ficheros de `src/data`.
 * - `services` no conoce `src/data` (debe pasar por un puerto) ni frameworks.
 * - `infra` no conoce la UI (`app`, `components`) ni frameworks.
 * - Solo `infra` puede importar los datos estáticos de `src/data`.
 *
 * Los tests quedan exentos: usan datos reales como fixtures, que es legítimo.
 */

const SRC = resolve(process.cwd(), "src");

const FRAMEWORK_PREFIXES = ["react", "next", "@supabase", "lucide-react", "framer-motion"];

const UI_PREFIXES = ["@/app", "@/components"];

function listSourceFiles(dir: string): string[] {
  const entries = readdirSync(dir);

  return entries.flatMap((entry) => {
    const full = join(dir, entry);

    if (statSync(full).isDirectory()) {
      return listSourceFiles(full);
    }

    if (!/\.tsx?$/.test(entry) || entry.endsWith(".test.ts") || entry.endsWith(".test.tsx")) {
      return [];
    }

    return [full];
  });
}

function extractSpecifiers(source: string): string[] {
  const specifiers: string[] = [];
  const fromPattern = /\bfrom\s*["']([^"']+)["']/g;
  let match: RegExpExecArray | null;

  while ((match = fromPattern.exec(source)) !== null) {
    specifiers.push(match[1]);
  }

  const sideEffectPattern = /^\s*import\s*["']([^"']+)["']/gm;
  while ((match = sideEffectPattern.exec(source)) !== null) {
    specifiers.push(match[1]);
  }

  return specifiers;
}

function isFramework(specifier: string): boolean {
  return FRAMEWORK_PREFIXES.some(
    (prefix) =>
      specifier === prefix || specifier.startsWith(`${prefix}/`) || specifier.startsWith(`${prefix}@`),
  );
}

function isUi(specifier: string): boolean {
  return UI_PREFIXES.some((prefix) => specifier === prefix || specifier.startsWith(`${prefix}/`));
}

function isRawData(specifier: string): boolean {
  return specifier === "@/data" || specifier.startsWith("@/data/");
}

function filesUnder(relativeDir: string): Array<{ file: string; specifiers: string[] }> {
  return listSourceFiles(resolve(SRC, relativeDir)).map((file) => ({
    file: file.slice(SRC.length + 1),
    specifiers: extractSpecifiers(readFileSync(file, "utf8")),
  }));
}

const domainFiles = filesUnder("lib/domain");
const serviceFiles = filesUnder("lib/services");
const infraFiles = filesUnder("lib/infra");
const allFiles = listSourceFiles(SRC).map((file) => ({
  file: file.slice(SRC.length + 1),
  specifiers: extractSpecifiers(readFileSync(file, "utf8")),
}));

describe("dirección de dependencias: domain", () => {
  it("la capa domain no está vacía", () => {
    expect(domainFiles.length).toBeGreaterThan(0);
  });

  for (const { file, specifiers } of domainFiles) {
    it(`${file} no depende de services, infra ni datos crudos`, () => {
      const violations = specifiers.filter(
        (specifier) =>
          specifier.includes("/services/") ||
          specifier.includes("/infra/") ||
          isRawData(specifier),
      );

      expect(violations, `dependencias inversas en ${file}: ${violations.join(", ")}`).toEqual([]);
    });
  }
});

describe("dirección de dependencias: services", () => {
  for (const { file, specifiers } of serviceFiles) {
    it(`${file} accede a los datos por puerto, no por src/data`, () => {
      expect(specifiers.filter(isRawData), `${file} importa datos crudos`).toEqual([]);
    });

    it(`${file} no depende de frameworks`, () => {
      const violations = specifiers.filter(isFramework);

      expect(violations, `framework en ${file}: ${violations.join(", ")}`).toEqual([]);
    });

    it(`${file} no depende de la UI`, () => {
      expect(specifiers.filter(isUi), `${file} importa UI`).toEqual([]);
    });
  }
});

describe("dirección de dependencias: infra", () => {
  for (const { file, specifiers } of infraFiles) {
    it(`${file} no depende de la UI ni de frameworks`, () => {
      const violations = specifiers.filter((specifier) => isUi(specifier) || isFramework(specifier));

      expect(violations, `dependencia prohibida en ${file}: ${violations.join(", ")}`).toEqual([]);
    });
  }
});

describe("aislamiento de la fuente de datos estática", () => {
  it("solo la capa infra importa los JSON de src/data", () => {
    const offenders = allFiles
      .filter(({ file }) => !file.startsWith("lib/infra/"))
      .filter(({ specifiers }) => specifiers.some(isRawData))
      .map(({ file }) => file);

    expect(
      offenders,
      `src/data solo debe importarse desde lib/infra. Offenders: ${offenders.join(", ")}`,
    ).toEqual([]);
  });

  it("existe al menos un adapter de directorio sobre los datos estáticos", () => {
    const adapters = infraFiles
      .filter(({ specifiers }) => specifiers.some(isRawData))
      .map(({ file }) => file);

    expect(adapters.length).toBeGreaterThan(0);
    expect(adapters).toContain("lib/infra/directory/staticPets.ts");
  });
});
