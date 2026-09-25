import { FileText, Syringe, TriangleAlert } from "lucide-react";
import { Pill } from "@/components/ui/Pill";
import { Surface } from "@/components/ui/Surface";
import type { VaccineItemViewModel } from "@/lib/mapping/health";
import { resolveTone } from "@/lib/ui/tone";

type VaccineDetailCardProps = {
  vaccine: VaccineItemViewModel;
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

export function VaccineDetailCard({ vaccine }: VaccineDetailCardProps) {
  const tone = resolveTone(vaccine.statusTone);

  return (
    <Surface className="p-4 sm:p-5">
      <div className="flex items-start gap-4">
        <span
          aria-hidden="true"
          className={[
            "grid h-11 w-11 shrink-0 place-items-center rounded-md",
            tone.soft,
          ].join(" ")}
        >
          <Syringe size={20} />
        </span>

        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="text-lg leading-tight text-ink">{vaccine.name}</h3>
            <Pill tone={vaccine.statusTone}>{vaccine.status ?? "Sin estado registrado"}</Pill>
          </div>

          {vaccine.alert ? (
            <div className="mt-2.5">
              <Pill tone={vaccine.alert.tone} icon={<TriangleAlert size={13} />}>
                {vaccine.alert.label}
              </Pill>
            </div>
          ) : null}

          <div className="mt-4 grid gap-x-4 gap-y-3.5 sm:grid-cols-2">
            <Field label="Fecha de aplicación" value={vaccine.applicationDate} />
            <Field label="Próxima dosis" value={vaccine.nextDoseDate} />
            <Field label="Lote" value={vaccine.lote} />
            <Field label="Veterinario" value={vaccine.veterinario} />
            {vaccine.origen ? <Field label="Origen del registro" value={vaccine.origen} /> : null}
            {vaccine.fechaCreacion ? (
              <Field label="Fecha de registro" value={vaccine.fechaCreacion} />
            ) : null}
          </div>

          {vaccine.missingFields.length > 0 ? (
            <p className="mt-4 flex items-start gap-2 text-sm leading-6 text-warning">
              <TriangleAlert size={15} className="mt-0.5 shrink-0" aria-hidden="true" />
              <span>Datos faltantes: {vaccine.missingFields.join(", ")}</span>
            </p>
          ) : null}
        </div>
      </div>

      {vaccine.document ? (
        <div className="mt-4 border-t border-rule pt-3.5">
          <a
            href={vaccine.document.url}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-11 items-center gap-2 rounded-md border border-rule bg-surface px-3.5 text-sm font-semibold text-brand transition-colors hover:border-brand-rule hover:bg-brand-soft"
          >
            <FileText size={16} aria-hidden="true" />
            {vaccine.document.nombre}
          </a>
        </div>
      ) : null}
    </Surface>
  );
}
