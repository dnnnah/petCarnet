import { Bug, CalendarDays, FileText, Package } from "lucide-react";
import { Pill } from "@/components/ui/Pill";
import { Section } from "@/components/ui/Section";
import { Surface } from "@/components/ui/Surface";
import type { DewormingSectionViewModel } from "@/lib/mapping/health";
import { resolveTone } from "@/lib/ui/tone";

type DewormingSectionProps = {
  petName: string;
  viewModel: DewormingSectionViewModel;
};

const DUE_CONTEXT: Record<string, string> = {
  vencida: "Requiere aplicar la próxima desparasitación.",
  entrega_hoy: "Corresponde aplicar la desparasitación hoy.",
  programada: "Siguiente desparasitación programada.",
};

function Field({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="min-w-0">
      <span className="block text-xs uppercase tracking-[0.1em] text-ink-3">{label}</span>
      <span className="mt-1 block text-sm leading-6 text-ink">
        {value ?? <span className="text-ink-3">Sin registro</span>}
      </span>
    </div>
  );
}

export function DewormingSection({ petName, viewModel }: DewormingSectionProps) {
  const due = viewModel.nextDue;
  const dueTone = due ? resolveTone(due.tone) : null;

  return (
    <Section
      title="Desparasitación"
      eyebrow="Salud"
      icon={<Bug size={18} />}
      action={
        viewModel.total > 0 ? <Pill tone="muted">{viewModel.total}</Pill> : null
      }
    >
      {due && dueTone ? (
        <div className={["rounded-md p-4", dueTone.panel].join(" ")}>
          <Pill tone={due.tone} icon={<CalendarDays size={13} />}>
            {due.label}
          </Pill>
          <p className="mt-2.5 text-sm font-semibold text-ink">{due.fecha}</p>
          <p className="mt-0.5 text-sm leading-6 text-ink-2">{DUE_CONTEXT[due.kind]}</p>
        </div>
      ) : null}

      {viewModel.items.length > 0 ? (
        <ul className="mt-5 space-y-3">
          {viewModel.items.map((item) => (
            <li key={item.id}>
              <Surface className="p-4">
                <div className="flex items-start gap-3">
                  <span
                    aria-hidden="true"
                    className="grid h-10 w-10 shrink-0 place-items-center rounded-md bg-info-soft text-info"
                  >
                    <Package size={19} />
                  </span>
                  <div className="min-w-0">
                    <h3 className="text-lg leading-tight text-ink">{item.producto}</h3>
                    <p className="mt-1 text-sm text-ink-2">
                      Aplicada el {item.fecha ?? "fecha no registrada"}
                    </p>
                  </div>
                </div>

                <div className="mt-4 grid gap-x-4 gap-y-3.5 sm:grid-cols-2 lg:grid-cols-4">
                  <Field label="Fecha" value={item.fecha} />
                  <Field label="Próxima fecha" value={item.proximaFecha} />
                  <Field label="Dosis" value={item.dosis} />
                  <Field label="Veterinario" value={item.veterinario} />
                </div>

                {item.missingFields.length > 0 ? (
                  <p className="mt-4 text-sm leading-6 text-warning">
                    Datos faltantes: {item.missingFields.join(", ")}
                  </p>
                ) : null}

                {item.documentoUrl ? (
                  <div className="mt-4 border-t border-rule pt-3.5">
                    <a
                      href={item.documentoUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex min-h-11 items-center gap-2 rounded-md border border-rule bg-surface px-3.5 text-sm font-semibold text-brand transition-colors hover:border-brand-rule hover:bg-brand-soft"
                    >
                      <FileText size={16} aria-hidden="true" />
                      Ver documento
                    </a>
                  </div>
                ) : null}
              </Surface>
            </li>
          ))}
        </ul>
      ) : (
        <div className="rounded-md border border-dashed border-rule-strong px-4 py-8 text-center">
          <Bug size={26} className="mx-auto text-ink-3" aria-hidden="true" />
          <p className="mt-3 text-base font-semibold text-ink">
            Sin desparasitaciones registradas
          </p>
          <p className="mx-auto mt-1.5 max-w-md text-sm leading-6 text-ink-2">
            Aún no hay registros de desparasitación para {petName}.
          </p>
        </div>
      )}

      <p className="mt-5 text-sm leading-6 text-ink-2">
        La próxima fecha es informativa: el calendario real lo define tu veterinario.
      </p>
    </Section>
  );
}
