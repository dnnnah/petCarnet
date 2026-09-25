import { FileText, HeartPulse, Stethoscope, TestTube } from "lucide-react";
import { Pill } from "@/components/ui/Pill";
import { Section } from "@/components/ui/Section";
import { Surface } from "@/components/ui/Surface";
import type { MedicalHistoryViewModel } from "@/lib/mapping/health";

type MedicalHistorySectionProps = {
  petName: string;
  viewModel: MedicalHistoryViewModel;
};

export function MedicalHistorySection({ petName, viewModel }: MedicalHistorySectionProps) {
  const summary = viewModel.summary;

  return (
    <Section
      title="Historial médico"
      eyebrow="Salud"
      icon={<Stethoscope size={18} />}
      action={viewModel.total > 0 ? <Pill tone="muted">{viewModel.total}</Pill> : null}
    >
      {viewModel.total > 0 ? (
        <ul className="flex flex-wrap gap-1.5">
          <li>
            <Pill tone="muted" size="sm">
              {summary.total} consulta(s)
            </Pill>
          </li>
          <li>
            <Pill tone="muted" size="sm">
              {summary.conDiagnostico} con diagnóstico
            </Pill>
          </li>
          <li>
            <Pill tone="muted" size="sm">
              {summary.conTratamiento} con tratamiento
            </Pill>
          </li>
          <li>
            <Pill tone="muted" size="sm">
              {summary.conMedicamentos} con medicamentos
            </Pill>
          </li>
          {summary.sinVeterinario > 0 ? (
            <li>
              <Pill tone="warning" size="sm">
                {summary.sinVeterinario} sin veterinario
              </Pill>
            </li>
          ) : null}
        </ul>
      ) : null}

      {viewModel.items.length > 0 ? (
        <ol className="mt-6 space-y-4">
          {viewModel.items.map((item) => (
            <li key={item.id}>
              <Surface className="p-4">
                <div className="flex items-start gap-3">
                  <span
                    aria-hidden="true"
                    className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-info-soft text-info"
                  >
                    <HeartPulse size={19} />
                  </span>
                  <div className="min-w-0">
                    <h3 className="text-lg leading-tight text-ink">{item.motivo}</h3>
                    <p className="mt-1 text-sm text-ink-2">
                      {item.fecha ?? "Fecha no registrada"}
                    </p>
                  </div>
                </div>

                {item.diagnostico ? (
                  <p className="mt-3.5 rounded-md bg-canvas p-3 text-sm leading-6 text-ink">
                    <span className="font-semibold text-ink-2">Diagnóstico: </span>
                    {item.diagnostico}
                  </p>
                ) : null}

                {item.tratamiento ? (
                  <p className="mt-3.5 text-sm leading-6 text-ink">
                    <span className="font-semibold text-ink-2">Tratamiento: </span>
                    {item.tratamiento}
                  </p>
                ) : null}

                {item.medicamentos.length > 0 ? (
                  <ul className="mt-3.5 flex flex-wrap items-center gap-1.5">
                    <li aria-hidden="true" className="text-ink-3">
                      <TestTube size={15} />
                    </li>
                    {item.medicamentos.map((medication) => (
                      <li key={medication}>
                        <Pill tone="adoption" size="sm">
                          {medication}
                        </Pill>
                      </li>
                    ))}
                  </ul>
                ) : null}

                {item.veterinario ? (
                  <p className="mt-3.5 text-sm leading-6 text-ink-2">
                    <span className="font-semibold text-ink-2">Atendió: </span>
                    {item.veterinario}
                  </p>
                ) : null}

                {item.missingFields.length > 0 ? (
                  <p className="mt-3.5 text-sm leading-6 text-warning">
                    Datos faltantes: {item.missingFields.join(", ")}
                  </p>
                ) : null}

                {item.documentos.length > 0 ? (
                  <ul className="mt-4 flex flex-wrap gap-2 border-t border-rule pt-3.5">
                    {item.documentos.map((document) => (
                      <li key={document.id}>
                        <a
                          href={document.url}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex min-h-11 items-center gap-2 rounded-md border border-rule bg-surface px-3.5 text-sm font-semibold text-brand transition-colors hover:border-brand-rule hover:bg-brand-soft"
                        >
                          <FileText size={16} aria-hidden="true" />
                          {document.nombre}
                        </a>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </Surface>
            </li>
          ))}
        </ol>
      ) : (
        <div className="rounded-md border border-dashed border-rule-strong px-4 py-8 text-center">
          <Stethoscope size={26} className="mx-auto text-ink-3" aria-hidden="true" />
          <p className="mt-3 text-base font-semibold text-ink">Sin historial médico</p>
          <p className="mx-auto mt-1.5 max-w-md text-sm leading-6 text-ink-2">
            Aún no hay consultas registradas para {petName}.
          </p>
        </div>
      )}
    </Section>
  );
}
