"use client";

import Link from "next/link";
import { HeartHandshake } from "lucide-react";
import { resolveAdoptionAvailability } from "@/lib/domain/adoption";
import { useLostAlerts } from "@/lib/useLostAlerts";
import type { PetEmergency, PetStatus } from "@/types/pet";

type AdoptionRequestCtaProps = {
  petId: string;
  petName: string;
  emergency: PetEmergency;
  status: PetStatus;
  shelterName?: string | null;
};

export function AdoptionRequestCta({
  petId,
  petName,
  emergency,
  status,
  shelterName = null,
}: AdoptionRequestCtaProps) {
  const { alert } = useLostAlerts(petId);
  const availability = resolveAdoptionAvailability({ estado: status, emergencia: emergency, alert });

  if (!availability.available) {
    return null;
  }

  return (
    <section
      aria-labelledby={`adopcion-cta-${petId}`}
      className="rounded-lg border border-adoption-rule bg-adoption-soft p-6 sm:p-7"
    >
      <div className="flex flex-wrap items-start justify-between gap-5">
        <div className="max-w-xl">
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-adoption">
            Adopción
          </p>
          <h2
            id={`adopcion-cta-${petId}`}
            className="mt-2 font-display text-2xl leading-snug text-ink sm:text-3xl"
          >
            ¿Te gustaría darle un hogar a {petName}?
          </h2>
          <p className="mt-2.5 text-sm leading-6 text-ink-2">
            {shelterName
              ? `${petName} busca familia a través del refugio ${shelterName}. Cuéntanos por qué te gustaría adoptarlo y el refugio podrá revisar tu solicitud.`
              : `${petName} busca una familia que le brinde un hogar seguro y amoroso. Cuéntanos por qué te gustaría adoptarlo.`}
          </p>
        </div>
        <Link
          href={`/perfil/${petId}/adopcion`}
          className="inline-flex min-h-11 items-center gap-2 rounded-md bg-adoption px-4 text-sm font-semibold text-on-solid transition-colors hover:brightness-110"
        >
          <HeartHandshake size={17} aria-hidden="true" />
          Solicitar adopción
        </Link>
      </div>
    </section>
  );
}
