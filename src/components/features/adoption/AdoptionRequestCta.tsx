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
      className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-violet-600 to-indigo-600 p-6 text-white shadow-[0_20px_44px_rgba(124,58,237,0.3)] sm:p-8"
    >
      <div className="pointer-events-none absolute -right-4 -top-6 text-white/15">
        <HeartHandshake size={96} aria-hidden="true" />
      </div>

      <div className="relative space-y-4">
        <p className="text-sm font-extrabold uppercase tracking-[0.18em] text-violet-200">
          Adopción
        </p>
        <h2
          id={`adopcion-cta-${petId}`}
          className="text-3xl font-extrabold tracking-tight sm:text-4xl"
        >
          ¿Te gustaría darle un hogar a {petName}?
        </h2>
        <p className="max-w-xl text-base font-semibold leading-7 text-violet-100">
          {shelterName
            ? `${petName} busca familia a través del refugio ${shelterName}. Cuéntanos por qué te gustaría adoptarlo y el refugio podrá revisar tu solicitud.`
            : `${petName} busca una familia que le brinde un hogar seguro y amoroso. Cuéntanos por qué te gustaría adoptarlo.`}
        </p>
        <Link
          href={`/perfil/${petId}/adopcion`}
          className="inline-flex min-h-14 items-center gap-2 rounded-full bg-white px-6 py-3 text-base font-extrabold text-violet-700 shadow-[0_14px_30px_rgba(109,40,217,0.35)] transition hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white focus-visible:ring-offset-2 focus-visible:ring-offset-violet-600"
        >
          <HeartHandshake size={20} aria-hidden="true" />
          Solicitar adopción
        </Link>
      </div>
    </section>
  );
}