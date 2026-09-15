import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { collectDataWarnings, collectValidationErrors } from "../src/lib/dataValidation.ts";

const root = fileURLToPath(new URL("..", import.meta.url));
const dataPath = resolve(root, "src/data/mascotas.json");

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function asRecordArray(value: unknown): Array<Record<string, unknown>> {
  return Array.isArray(value) ? (value as unknown[]).filter(isRecord) : [];
}

function collectAssetErrors(data: unknown): string[] {
  const missing: string[] = [];

  if (!Array.isArray(data)) return missing;

  const check = (url: unknown, owner: string): void => {
    if (typeof url !== "string" || url.trim() === "") return;
    if (/^(https?:|data:|blob:)/.test(url)) return;

    const relative = url.replace(/^\//, "");
    const filePath = resolve(root, "public", relative);
    if (!existsSync(filePath)) {
      missing.push(`${owner}: falta el asset ${url}`);
    }
  };

  for (const entry of data) {
    if (!isRecord(entry)) continue;
    const petId = typeof entry.id === "string" ? entry.id : "?";

    const mascota = entry.mascota;
    if (isRecord(mascota)) {
      check(mascota.fotoPerfilUrl, `${petId}.mascota.fotoPerfilUrl`);
    }

    for (const vacuna of asRecordArray(entry.vacunas)) {
      check(vacuna.documentoUrl, `${petId}.vacunas.documentoUrl`);
    }

    for (const doc of asRecordArray(entry.documentos)) {
      check(doc.url, `${petId}.documentos.url`);
    }
  }

  return missing;
}

const pets = JSON.parse(readFileSync(dataPath, "utf8")) as unknown;
const errors = collectValidationErrors(pets);
const warnings = collectDataWarnings(pets);
const assets = collectAssetErrors(pets);

for (const warning of warnings) {
  console.log(`AVISO: ${warning}`);
}

let failed = false;

if (errors.length > 0) {
  failed = true;
  console.error(`ERRORES (${errors.length}):`);
  for (const error of errors) {
    console.error(`  - ${error}`);
  }
}

if (assets.length > 0) {
  failed = true;
  console.error(`ASSETS FALTANTES (${assets.length}):`);
  for (const asset of assets) {
    console.error(`  - ${asset}`);
  }
}

if (failed) {
  console.error("Validación de datos FALLÓ.");
  process.exit(1);
}

const count = Array.isArray(pets) ? pets.length : 0;
console.log(`OK: ${count} perfiles válidos. Avisos: ${warnings.length}.`);