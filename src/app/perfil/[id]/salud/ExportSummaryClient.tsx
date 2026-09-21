"use client";

import { useState } from "react";
import { Eye, Printer, X } from "lucide-react";
import { formatMexicanDate } from "@/lib/dateFormat";
import type { HealthExportSummary } from "@/types/health";

type ExportSummaryClientProps = {
  petName: string;
  summary: HealthExportSummary;
};

function PrintRow({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="print-row">
      <span className="print-row-label">{label}</span>
      <span className="font-bold text-gray-900 dark:text-gray-100">{value ?? "Sin registro"}</span>
    </div>
  );
}

function PrintSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="print-section">
      <h3 className="print-section-title mt-5 mb-2 text-xs font-extrabold uppercase tracking-wide text-emerald-600 dark:text-emerald-400">
        {title}
      </h3>
      {children}
    </section>
  );
}

export function ExportSummaryClient({ petName, summary }: ExportSummaryClientProps) {
  const [preview, setPreview] = useState(false);

  return (
    <div className="rounded-3xl border border-dashed border-emerald-300 bg-emerald-50/50 p-5 sm:p-6 lg:p-7 dark:border-emerald-800 dark:bg-emerald-500/5">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h3 className="text-xl sm:text-2xl font-extrabold text-gray-950 dark:text-white">
            Exportar expediente de salud
          </h3>
          <p className="mt-1 max-w-xl font-semibold leading-6 text-gray-600 dark:text-gray-300">
            Genera un resumen sanitario imprimible para llevar a tu veterinario.
          </p>
        </div>
        {!preview ? (
          <button
            type="button"
            onClick={() => setPreview(true)}
            className="inline-flex min-h-12 items-center gap-2 rounded-2xl bg-emerald-500 px-5 text-sm font-extrabold text-white shadow-[0_12px_24px_rgba(16,185,129,0.18)] transition hover:-translate-y-0.5 hover:bg-emerald-600"
          >
            <Eye size={18} aria-hidden="true" />
            Vista previa de impresión
          </button>
        ) : null}
      </div>

      <p className="mt-4 text-sm font-bold text-emerald-800 dark:text-emerald-300">
        Prototipo de exportación · El PDF y la descarga final llegan en la Fase 6 del roadmap.
      </p>

      {preview ? (
        <div className="mt-6">
          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={() => window.print()}
              className="inline-flex min-h-12 items-center gap-2 rounded-2xl bg-gray-950 px-5 text-sm font-extrabold text-white transition hover:-translate-y-0.5 hover:bg-gray-800 dark:bg-white dark:text-gray-950 dark:hover:bg-gray-200"
            >
              <Printer size={18} aria-hidden="true" />
              Imprimir resumen
            </button>
            <button
              type="button"
              onClick={() => setPreview(false)}
              className="inline-flex min-h-12 items-center gap-2 rounded-2xl bg-white px-5 text-sm font-extrabold text-gray-700 ring-1 ring-gray-200 transition hover:-translate-y-0.5 dark:bg-gray-900 dark:text-gray-200 dark:ring-gray-700"
            >
              <X size={18} aria-hidden="true" />
              Cerrar vista previa
            </button>
          </div>

          <div id="expediente-print" className="print-panel mt-6 rounded-2xl border border-gray-200 bg-white p-6 shadow-[0_18px_48px_rgba(17,24,39,0.08)] dark:border-gray-800 dark:bg-gray-900 dark:shadow-[0_18px_48px_rgba(0,0,0,0.45)]">
            <header className="border-b border-gray-200 pb-4 dark:border-gray-800">
              <p className="text-xs font-extrabold uppercase tracking-widest text-emerald-600 dark:text-emerald-400">
                Carnet de salud
              </p>
              <h2 className="mt-1 text-3xl font-black text-gray-950 dark:text-gray-100">
                Expediente sanitario de {petName}
              </h2>
              <p className="mt-2 text-sm font-semibold text-gray-500 dark:text-gray-400">
                Código público: {summary.pet.codigoPublico} · Generado:{" "}
                {formatMexicanDate(summary.generadoEn) ?? summary.generadoEn}
              </p>
            </header>

            <div className="mt-5 grid gap-5 sm:grid-cols-2">
              <PrintSection title="Identificación">
                <PrintRow label="Nombre" value={summary.pet.nombre} />
                <PrintRow label="Especie" value={summary.pet.especie} />
                <PrintRow label="Raza" value={summary.pet.raza} />
                <PrintRow label="Género" value={summary.pet.genero} />
                <PrintRow
                  label="Fecha de nacimiento"
                  value={
                    summary.pet.fechaNacimiento
                      ? formatMexicanDate(summary.pet.fechaNacimiento)
                      : null
                  }
                />
                <PrintRow label="Microchip" value={summary.identificacion.microchip} />
                <PrintRow label="Estado" value={summary.identificacion.estado} />
                <PrintRow label="Identidad verificada" value={summary.identificacion.verificado ? "Sí" : "No"} />
              </PrintSection>

              <PrintSection title="Veterinario">
                {summary.veterinario ? (
                  <>
                    <PrintRow label="Contacto" value={summary.veterinario.nombre} />
                    <PrintRow label="Clínica" value={summary.veterinario.clinica} />
                    <PrintRow label="Teléfono" value={summary.veterinario.telefono} />
                  </>
                ) : (
                  <p className="relative line-clamp-3 print-row text-gray-600 dark:text-gray-300">Sin veterinario del expediente.</p>
                )}
              </PrintSection>
            </div>

            <PrintSection title="Alergias y condiciones">
              <p className="print-row text-gray-600 dark:text-gray-300">
                {summary.alergias.length > 0 ? summary.alergias.join(" · ") : "Sin alergias registradas"}
              </p>
              <p className="print-row text-gray-600 dark:text-gray-300">
                {summary.condicionesMedicas.length > 0
                  ? summary.condicionesMedicas.join(" · ")
                  : "Sin condiciones médicas registradas"}
              </p>
              <p className="print-row text-gray-600 dark:text-gray-300">
                {summary.medicamentosActuales.length > 0
                  ? summary.medicamentosActuales.join(" · ")
                  : "Sin medicamentos actuales registrados"}
              </p>
            </PrintSection>

            <PrintSection title="Vacunas">
              {summary.vacunas.length > 0 ? (
                <ul className="space-y-2">
                  {summary.vacunas.map((vaccine) => (
                    <li key={vaccine.nombre} className="flex flex-wrap items-baseline justify-between gap-2 border-b border-gray-100 pb-2 dark:border-gray-800">
                      <span className="font-bold text-gray-900 dark:text-gray-100">{vaccine.nombre}</span>
                      <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                        {vaccine.fechaAplicacion ? `Aplicada ${formatMexicanDate(vaccine.fechaAplicacion)}` : "Sin fecha"}{" "}
                        {vaccine.proximaDosis ? `· próxima ${formatMexicanDate(vaccine.proximaDosis)}` : ""} · {vaccine.estatus ?? "Sin estado"}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="print-row text-gray-600 dark:text-gray-300">Sin vacunas registradas.</p>
              )}
            </PrintSection>

            <PrintSection title="Desparasitaciones">
              {summary.desparasitaciones.length > 0 ? (
                <ul className="space-y-2">
                  {summary.desparasitaciones.map((deworming) => (
                    <li key={deworming.producto} className="flex flex-wrap items-baseline justify-between gap-2 border-b border-gray-100 pb-2 dark:border-gray-800">
                      <span className="font-bold text-gray-900 dark:text-gray-100">{deworming.producto}</span>
                      <span className="text-sm font-semibold text-gray-600 dark:text-gray-400">
                        {formatMexicanDate(deworming.fecha)} · {deworming.dosis ?? "Sin dosis"}
                      </span>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="print-row text-gray-600 dark:text-gray-300">Sin desparasitaciones registradas.</p>
              )}
            </PrintSection>

            <PrintSection title="Historial médico">
              {summary.historialMedico.length > 0 ? (
                <ul className="space-y-3">
                  {summary.historialMedico.map((consultation) => (
                    <li key={consultation.motivo} className="border-b border-gray-100 pb-3 dark:border-gray-800">
                      <p className="font-bold text-gray-900 dark:text-gray-100">
                        {formatMexicanDate(consultation.fecha)} · {consultation.motivo}
                      </p>
                      {consultation.diagnostico ? (
                        <p className="mt-1 text-sm font-semibold text-gray-600 dark:text-gray-400">
                          Diagnóstico: {consultation.diagnostico}
                        </p>
                      ) : null}
                      {consultation.tratamiento ? (
                        <p className="mt-1 text-sm font-semibold text-gray-600 dark:text-gray-400">
                          Tratamiento: {consultation.tratamiento}
                        </p>
                      ) : null}
                      {consultation.medicamentos.length > 0 ? (
                        <p className="mt-1 text-sm font-semibold text-gray-600 dark:text-gray-400">
                          Medicamentos: {consultation.medicamentos.join(", ")}
                        </p>
                      ) : null}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="print-row text-gray-600 dark:text-gray-300">Sin historial médico registrado.</p>
              )}
            </PrintSection>

            <footer className="mt-6 border-t border-gray-200 pt-4 text-center text-xs font-semibold text-gray-400 dark:border-gray-800 dark:text-gray-500">
              Documento informativo generado desde PetCarnet. No sustituye la consulta veterinaria.
            </footer>
          </div>
        </div>
      ) : null}
    </div>
  );
}