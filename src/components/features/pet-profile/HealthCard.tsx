"use client";

import { useState } from "react";
import { ChevronDown, ChevronUp, Heart } from "lucide-react";
import { Section } from "@/components/ui/Section";
import { cx } from "@/lib/ui/tone";

type HealthCardProps = {
  health: {
    allergies: ReadonlyArray<string>;
    conditions: ReadonlyArray<string>;
    medications: ReadonlyArray<string>;
    diet: string;
    behavior: string;
  };
};

const PLACEHOLDER = "Sin registro";

function DetailBlock({
  label,
  items,
  tone,
}: {
  label: string;
  items: ReadonlyArray<string>;
  tone: string;
}) {
  return (
    <div>
      <span
        className={cx(
          "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.08em] ring-1 ring-inset",
          tone
        )}
      >
        {label}
      </span>
      {items.length > 0 ? (
        <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6 text-ink">
          {items.map((item) => (
            <li key={item}>{item}</li>
          ))}
        </ul>
      ) : (
        <p className="mt-2 text-sm text-ink-3">{PLACEHOLDER}</p>
      )}
    </div>
  );
}

function TextBlock({ label, value, tone }: { label: string; value: string; tone: string }) {
  return (
    <div>
      <span
        className={cx(
          "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold uppercase tracking-[0.08em] ring-1 ring-inset",
          tone
        )}
      >
        {label}
      </span>
      <p className="mt-2 text-sm leading-6 text-ink">{value}</p>
    </div>
  );
}

export function HealthCard({ health }: HealthCardProps) {
  const [expanded, setExpanded] = useState(false);

  const allergies = health.allergies.filter(
    (item) => item !== "Ninguna registrada"
  );
  const conditions = health.conditions.filter((item) => item !== "Ninguna");
  const hasDiet = health.diet.trim().length > 0;
  const hasDetails = health.medications.length > 0 || hasDiet;

  return (
    <Section title="Salud" eyebrow="Datos sensibles" icon={<Heart size={18} />}>
      <div className="space-y-5">
        <DetailBlock
          label="Alergias"
          items={allergies}
          tone="bg-danger-soft text-danger ring-danger-rule"
        />
        <DetailBlock
          label="Condiciones"
          items={conditions}
          tone="bg-warning-soft text-warning ring-warning-rule"
        />
        <TextBlock
          label="Comportamiento"
          value={health.behavior}
          tone="bg-info-soft text-info ring-info-rule"
        />

        {hasDetails ? (
          <>
            {expanded ? (
              <div className="space-y-5 border-t border-rule pt-5">
                {health.medications.length > 0 ? (
                  <DetailBlock
                    label="Medicamentos"
                    items={health.medications}
                    tone="bg-adoption-soft text-adoption ring-adoption-rule"
                  />
                ) : null}
                {hasDiet ? (
                  <TextBlock
                    label="Dieta especial"
                    value={health.diet}
                    tone="bg-settled-soft text-settled ring-settled-rule"
                  />
                ) : null}
              </div>
            ) : null}

            <button
              type="button"
              onClick={() => setExpanded((value) => !value)}
              aria-expanded={expanded}
              className="inline-flex min-h-11 items-center gap-1.5 text-sm font-semibold text-brand transition-colors hover:text-brand-hover"
            >
              {expanded ? "Ocultar detalles" : "Ver más detalles"}
              {expanded ? (
                <ChevronUp size={16} aria-hidden="true" />
              ) : (
                <ChevronDown size={16} aria-hidden="true" />
              )}
            </button>
          </>
        ) : null}
      </div>
    </Section>
  );
}
