import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

/**
 * Guarda arquitectónica (FASE 7): la capa de infraestructura PWA permanece
 * independiente de React/Next.js y de la capa de presentación.
 *
 * La única excepción es `useOnlineStatus.ts`, un hook (capa cliente) que sí
 * importa React para suscribirse a `online`/`offline`.
 */

const PWA_DIR = resolve(process.cwd(), "src/lib/pwa");

const REACT_ALLOWLIST = new Set(["useOnlineStatus.ts"]);

const FORBIDDEN_PREFIXES = [
  "react",
  "next",
  "@",
  "lucide-react",
  "framer-motion",
];

const INFRA_FILES = ["connectivity.ts", "storage.ts", "registerServiceWorker.ts"].sort();

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

describe("pureza de la capa de infraestructura PWA", () => {
  for (const file of INFRA_FILES) {
    const source = readFileSync(resolve(PWA_DIR, file), "utf8");
    const specifiers = extractSpecifiers(source);

    it(`${file} no importa de React, Next.js, componentes ni UI`, () => {
      const violations = specifiers.filter((specifier) =>
        FORBIDDEN_PREFIXES.some(
          (prefix) =>
            specifier === prefix ||
            specifier.startsWith(`${prefix}/`) ||
            specifier.includes("/components/") ||
            specifier.includes("/ui/"),
        ),
      );
      expect(violations, `imports prohibidos en ${file}: ${violations.join(", ")}`).toEqual([]);
    });
  }

  it("el hook cliente es la única dependencia de React de la capa", () => {
    const files = ["useOnlineStatus.ts", ...INFRA_FILES];
    const withReact = files.filter((file) => {
      const source = readFileSync(resolve(PWA_DIR, file), "utf8");
      return extractSpecifiers(source).some(
        (specifier) => specifier === "react" || specifier.startsWith("react/"),
      );
    });
    expect(withReact.sort()).toEqual([...REACT_ALLOWLIST].sort());
  });
});