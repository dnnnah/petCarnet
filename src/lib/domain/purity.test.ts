import { readdirSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Guarda arquitectónica (FASE 5): la capa `domain` no debe depender de React,
 * Next.js, Supabase, componentes ni de la capa de mapeo/presentación.
 *
 * Excepciones conocidas (históricas, previas a FASE 5 y documentadas en el
 * CHANGELOG): `vaccineStatus.ts` y `documentCategory.ts` son metadata de UI
 * (iconos lucide-react) que se dejaron en `domain/` por inercia. Cualquier
 * archivo NUEVO en `domain/` debe ser puro.
 */

const DOMAIN_DIR = resolve(process.cwd(), "src/lib/domain");

const UI_LEGACY_ALLOWLIST = new Set(["vaccineStatus.ts", "documentCategory.ts"]);

const FORBIDDEN_PREFIXES = ["react", "next", "@supabase", "lucide-react", "framer-motion"];

function isForbiddenSpecifier(specifier: string): boolean {
  return FORBIDDEN_PREFIXES.some(
    (prefix) => specifier === prefix || specifier.startsWith(`${prefix}/`) || specifier.startsWith(`${prefix}@`),
  );
}

function isBusinessImport(specifier: string): boolean {
  return (
    (specifier.startsWith("@/") && specifier.includes("/mapping/")) ||
    specifier.includes("/components/") ||
    specifier.includes("/ui/")
  );
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

function listDomainFiles(): string[] {
  return readdirSync(DOMAIN_DIR)
    .filter((file) => file.endsWith(".ts"))
    .filter((file) => !file.endsWith(".test.ts"))
    .sort();
}

describe("pureza de la capa domain", () => {
  const files = listDomainFiles();

  it("no está vacía y contiene los módulos de FASE 5", () => {
    expect(files).toContain("health.ts");
    expect(files).toContain("vaccine.ts");
    expect(files).toContain("dateRules.ts");
  });

  for (const file of files) {
    const source = readFileSync(resolve(DOMAIN_DIR, file), "utf8");
    const specifiers = extractSpecifiers(source);

    const violations = specifiers.filter(isForbiddenSpecifier);
    const businessViolations = specifiers.filter(isBusinessImport);

    it(`${file} no importa de dependencias de UI ni de la capa de presentación`, () => {
      const legacy = UI_LEGACY_ALLOWLIST.has(file);
      const expected = legacy ? violations : [];
      expect(violations, `imports prohibidos en ${file}: ${violations.join(", ")}`).toEqual(expected);
      expect(businessViolations).toEqual([]);
    });
  }
});

describe("pureza de los contratos FASE 5", () => {
  it("src/types/health.ts solo depende de otros contratos y no de UI", () => {
    const source = readFileSync(resolve(process.cwd(), "src/types/health.ts"), "utf8");
    const specifiers = extractSpecifiers(source);
    expect(specifiers.filter(isForbiddenSpecifier)).toEqual([]);
  });
});