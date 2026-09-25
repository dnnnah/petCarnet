import { CheckCircle2, ClipboardList, TriangleAlert } from "lucide-react";
import { Pill } from "@/components/ui/Pill";
import { Section } from "@/components/ui/Section";
import type { CompletenessViewModel } from "@/lib/mapping/health";

type HealthCompletenessCardProps = {
  petName: string;
  viewModel: CompletenessViewModel;
};

function Stat({ value, label }: { value: string | number; label: string }) {
  return (
    <div className="min-w-0 border-l-2 border-rule pl-3 sm:pl-4">
      <span className="tnum block text-2xl font-semibold leading-none text-ink">{value}</span>
      <span className="mt-1.5 block text-xs leading-4 text-ink-2">{label}</span>
    </div>
  );
}

export function HealthCompletenessCard({ petName, viewModel }: HealthCompletenessCardProps) {
  const { registered } = viewModel;

  return (
    <Section
      title="Completitud del expediente"
      eyebrow="Salud"
      icon={<ClipboardList size={18} />}
    >
      {!viewModel.hasRecords ? (
        <div className="rounded-md border border-dashed border-rule-strong px-4 py-8 text-center">
          <ClipboardList size={26} className="mx-auto text-ink-3" aria-hidden="true" />
          <p className="mt-3 text-base font-semibold text-ink">Expediente de {petName} en blanco</p>
          <p className="mx-auto mt-1.5 max-w-md text-sm leading-6 text-ink-2">
            Aún no hay vacunas, desparasitaciones ni consultas registradas. Este apartado solo
            mide los datos existentes, sin inventar resultados.
          </p>
        </div>
      ) : (
        <>
          <ul className="grid grid-cols-3 gap-x-4">
            <li>
              <Stat value={registered.vacunas} label="Vacunas" />
            </li>
            <li>
              <Stat value={registered.desparasitaciones} label="Desparasitaciones" />
            </li>
            <li>
              <Stat value={registered.consultas} label="Consultas" />
            </li>
          </ul>

          {viewModel.complete ? (
            <p className="mt-5 flex items-start gap-2.5 rounded-md bg-success-soft p-3.5 text-sm leading-6 text-success">
              <CheckCircle2 size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
              <span>Toda la información registrada está completa.</span>
            </p>
          ) : (
            <>
              <div className="mt-5 flex flex-wrap items-center gap-2">
                <Pill tone="warning" icon={<TriangleAlert size={13} />}>
                  {viewModel.incompleteRecords} registros con datos faltantes
                </Pill>
                {viewModel.totalMissing > 0 ? (
                  <Pill tone="muted">{viewModel.totalMissing} campos pendientes de llenado</Pill>
                ) : null}
              </div>

              <ul className="mt-4 space-y-2">
                {viewModel.items.map((item) => (
                  <li
                    key={`${item.kind}-${item.entityLabel}`}
                    className="rounded-md bg-canvas p-3.5"
                  >
                    <p className="text-sm font-semibold text-ink">{item.entityLabel}</p>
                    <p className="mt-1 text-sm leading-6 text-ink-2">
                      Falta: {item.missing.join(", ")}
                    </p>
                  </li>
                ))}
              </ul>

              <p className="mt-4 text-sm leading-6 text-ink-2">
                Completar estos datos ayuda a que el carné sea útil para tu veterinario.
              </p>
            </>
          )}
        </>
      )}
    </Section>
  );
}
