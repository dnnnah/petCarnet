"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  CheckCircle2,
  HeartHandshake,
  Loader2,
  Send,
} from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { validateAdoptionRequest } from "@/lib/domain/adoption";
import {
  buildAdoptionRequestDraft,
  buildAdoptionRequestFromDraft,
  mapAdoptionValidationErrors,
  todayInMexicoISO,
  type AdoptionFormValues,
  type AdoptionFieldError,
} from "@/lib/adoptionRequestForm";
import { formatMexicanDate } from "@/lib/dateFormat";
import { useLostAlerts } from "@/lib/useLostAlerts";
import { useAdoptionRequests } from "@/lib/useAdoptionRequests";
import type { AdoptionRequest } from "@/types/adoption";
import type { PetProfile } from "@/types/pet";

type AdoptionRequestFormProps = {
  pet: PetProfile;
  shelterName?: string | null;
};

const inputClass =
  "mt-1 w-full rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900 px-4 py-3 text-sm font-bold text-gray-900 dark:text-white outline-none ring-emerald-300 transition focus:border-emerald-400 focus:ring-2";

function inputErrorClass(hasError: boolean, base: string) {
  return hasError ? `${base} border-rose-300 ring-rose-200 focus:border-rose-400 focus:ring-rose-200` : base;
}

export function AdoptionRequestForm({ pet, shelterName = null }: AdoptionRequestFormProps) {
  const [values, setValues] = useState<AdoptionFormValues>({
    nombre: "",
    telefono: "",
    email: "",
    motivo: "",
    notas: "",
  });
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<AdoptionFieldError, string>>>({});
  const [generalErrors, setGeneralErrors] = useState<string[]>([]);
  const [phase, setPhase] = useState<"form" | "sending" | "success">("form");
  const [submitted, setSubmitted] = useState<AdoptionRequest | null>(null);

  const nombreRef = useRef<HTMLInputElement>(null);
  const telefonoRef = useRef<HTMLInputElement>(null);
  const emailRef = useRef<HTMLInputElement>(null);
  const motivoRef = useRef<HTMLTextAreaElement>(null);

  const fieldRefs = {
    nombre: nombreRef,
    telefono: telefonoRef,
    email: emailRef,
    motivo: motivoRef,
  } as const;

  const FIELD_ORDER: AdoptionFieldError[] = ["nombre", "telefono", "email", "motivo"];

  const { alert } = useLostAlerts(pet.id);
  const { requests, submit } = useAdoptionRequests(pet.id);

  const petName = pet.mascota.nombre;

  function handleChange(field: keyof AdoptionFormValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }));
    setFieldErrors((current) => {
      if (!(field in current)) {
        return current;
      }
      const next = { ...current };
      delete next[field as AdoptionFieldError];
      return next;
    });
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (phase === "sending") {
      return;
    }

    const draft = buildAdoptionRequestDraft(pet.id, todayInMexicoISO(), values);
    const validation = validateAdoptionRequest({ pet, alert, draft });

if (!validation.valid) {
      const mapped = mapAdoptionValidationErrors(validation.errors);
      setFieldErrors(mapped.fields);
      setGeneralErrors(mapped.general);
      setPhase("form");

      const firstInvalid = FIELD_ORDER.find((field) => mapped.fields[field] !== undefined);
      const target = firstInvalid ? fieldRefs[firstInvalid].current : null;
      if (target) {
        target.focus();
        target.scrollIntoView({ block: "center", behavior: "smooth" });
      }
      return;
    }

    setFieldErrors({});
    setGeneralErrors([]);
    setPhase("sending");

    const seed =
      typeof crypto !== "undefined" && typeof crypto.randomUUID === "function"
        ? crypto.randomUUID()
        : `${Date.now()}`;
    const request = buildAdoptionRequestFromDraft(draft, seed);

    window.setTimeout(() => {
      submit(request);
      setSubmitted(request);
      setPhase("success");
    }, 900);
  }

  if (phase === "success" && submitted) {
    const formattedDate = formatMexicanDate(submitted.fechaEnviada) ?? submitted.fechaEnviada;

    return (
      <div className="space-y-6">
        <GlassCard className="p-6 lg:p-8">
          <div className="text-center">
            <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-500/15 dark:text-emerald-400">
              <CheckCircle2 size={34} aria-hidden="true" />
            </span>
            <h3 className="mt-4 text-2xl font-extrabold text-gray-950 dark:text-white sm:text-3xl">
              Solicitud registrada
            </h3>
            <p className="mx-auto mt-2 max-w-md text-sm font-semibold text-gray-600 dark:text-gray-300">
              ¡Gracias por querer darle un hogar a {petName}! Registramos tu solicitud con el
              estado <strong>Enviada</strong>.
            </p>
          </div>

          <dl className="mx-auto mt-6 grid max-w-xl gap-3 rounded-2xl border border-gray-100 bg-gray-50/60 p-5 dark:border-gray-800 dark:bg-gray-800/60">
            <div className="flex items-center justify-between gap-4">
              <dt className="text-sm font-extrabold text-gray-500 dark:text-gray-400">Folio</dt>
              <dd className="font-mono text-sm font-bold text-gray-900 dark:text-white">
                {submitted.id}
              </dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="text-sm font-extrabold text-gray-500 dark:text-gray-400">Fecha</dt>
              <dd className="text-sm font-bold text-gray-900 dark:text-white">{formattedDate}</dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="text-sm font-extrabold text-gray-500 dark:text-gray-400">Mascota</dt>
              <dd className="text-sm font-bold text-gray-900 dark:text-white">{petName}</dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="text-sm font-extrabold text-gray-500 dark:text-gray-400">Estado</dt>
              <dd className="inline-flex items-center gap-1.5 rounded-full bg-violet-100 px-3 py-1 text-xs font-extrabold text-violet-700 dark:bg-violet-500/15 dark:text-violet-300">
                Enviada
              </dd>
            </div>
            <div className="flex items-center justify-between gap-4">
              <dt className="text-sm font-extrabold text-gray-500 dark:text-gray-400">A través de</dt>
              <dd className="text-sm font-bold text-gray-900 dark:text-white">
                {shelterName ?? "Adopción directa"}
              </dd>
            </div>
          </dl>

          <p className="mx-auto mt-5 max-w-md rounded-2xl border border-dashed border-violet-300 bg-violet-50/70 p-4 text-center text-xs font-bold leading-5 text-violet-800 dark:border-violet-700/60 dark:bg-violet-500/10 dark:text-violet-200">
            Esto es un prototipo: tu solicitud no llegó a ningún refugio real. Quedó guardada solo en
            este navegador para demostrar el flujo.
          </p>

          <div className="mt-6 flex flex-wrap justify-center gap-3">
            <Link
              href={`/perfil/${pet.id}`}
              className="inline-flex min-h-11 items-center gap-2 rounded-full bg-violet-600 px-6 py-2.5 text-sm font-extrabold text-white shadow-[0_12px_24px_rgba(124,58,237,0.28)] transition hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2"
            >
              <ArrowLeft size={18} aria-hidden="true" />
              Volver al perfil de {petName}
            </Link>
          </div>
        </GlassCard>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {generalErrors.length > 0 ? (
        <div
          role="alert"
          className="rounded-2xl border border-rose-200 bg-rose-50 p-4 text-sm font-bold text-rose-700 dark:border-rose-800 dark:bg-rose-500/10 dark:text-rose-200"
        >
          <p className="font-extrabold">No se pudo enviar la solicitud:</p>
          <ul className="mt-1 list-inside list-disc space-y-1">
            {generalErrors.map((error) => (
              <li key={error}>{error}</li>
            ))}
          </ul>
        </div>
      ) : null}

      <GlassCard className="p-6 lg:p-8">
        <div className="flex items-center gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-violet-100 text-violet-600 dark:bg-violet-500/15 dark:text-violet-300">
            <HeartHandshake size={22} aria-hidden="true" />
          </span>
          <div>
            <h3 className="text-xl font-extrabold text-gray-950 dark:text-white">
              Solicitud de adopción de {petName}
            </h3>
            <p className="text-sm font-semibold text-gray-500 dark:text-gray-400">
              {shelterName ? `A través del refugio ${shelterName}` : "Adopción directa"} · Prototipo,
              sin envío real
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} noValidate className="mt-6 grid gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="adopcion-nombre" className="block text-xs font-extrabold uppercase text-gray-400">
              Tu nombre completo
            </label>
            <input
              ref={nombreRef}
              id="adopcion-nombre"
              name="nombre"
              type="text"
              autoComplete="name"
              value={values.nombre}
              onChange={(event) => handleChange("nombre", event.target.value)}
              aria-invalid={fieldErrors.nombre ? true : undefined}
              aria-describedby={fieldErrors.nombre ? "adopcion-nombre-error" : undefined}
              placeholder="Ej: Ana López"
              className={inputErrorClass(Boolean(fieldErrors.nombre), inputClass)}
            />
            {fieldErrors.nombre ? (
              <p id="adopcion-nombre-error" className="mt-1 text-sm font-bold text-rose-600 dark:text-rose-300">
                {fieldErrors.nombre}
              </p>
            ) : null}
          </div>

          <div>
            <label htmlFor="adopcion-telefono" className="block text-xs font-extrabold uppercase text-gray-400">
              Teléfono (WhatsApp)
            </label>
            <input
              ref={telefonoRef}
              id="adopcion-telefono"
              name="telefono"
              type="tel"
              autoComplete="tel"
              inputMode="numeric"
              value={values.telefono}
              onChange={(event) => handleChange("telefono", event.target.value)}
              aria-invalid={fieldErrors.telefono ? true : undefined}
              aria-describedby={fieldErrors.telefono ? "adopcion-telefono-error" : "adopcion-telefono-helper"}
              placeholder="10 dígitos"
              className={inputErrorClass(Boolean(fieldErrors.telefono), inputClass)}
            />
            {fieldErrors.telefono ? (
              <p id="adopcion-telefono-error" className="mt-1 text-sm font-bold text-rose-600 dark:text-rose-300">
                {fieldErrors.telefono}
              </p>
            ) : (
              <p id="adopcion-telefono-helper" className="mt-1 text-xs font-semibold text-gray-400">
                10 dígitos o formato México (52/521).
              </p>
            )}
          </div>

          <div>
            <label htmlFor="adopcion-email" className="block text-xs font-extrabold uppercase text-gray-400">
              Correo electrónico <span className="font-semibold normal-case text-gray-300 dark:text-gray-500">(opcional)</span>
            </label>
            <input
              ref={emailRef}
              id="adopcion-email"
              name="email"
              type="email"
              autoComplete="email"
              value={values.email}
              onChange={(event) => handleChange("email", event.target.value)}
              aria-invalid={fieldErrors.email ? true : undefined}
              aria-describedby={fieldErrors.email ? "adopcion-email-error" : undefined}
              placeholder="opcional@correo.mx"
              className={inputErrorClass(Boolean(fieldErrors.email), inputClass)}
            />
            {fieldErrors.email ? (
              <p id="adopcion-email-error" className="mt-1 text-sm font-bold text-rose-600 dark:text-rose-300">
                {fieldErrors.email}
              </p>
            ) : null}
          </div>

          <div>
            <label htmlFor="adopcion-motivo" className="block text-xs font-extrabold uppercase text-gray-400">
              ¿Por qué quieres adoptar a {petName}?
            </label>
            <textarea
              ref={motivoRef}
              id="adopcion-motivo"
              name="motivo"
              rows={3}
              value={values.motivo}
              onChange={(event) => handleChange("motivo", event.target.value)}
              aria-invalid={fieldErrors.motivo ? true : undefined}
              aria-describedby={fieldErrors.motivo ? "adopcion-motivo-error" : undefined}
              placeholder="Cuéntanos sobre tu hogar y el cuidado que le ofrecerías."
              className={inputErrorClass(Boolean(fieldErrors.motivo), `${inputClass} resize-none`)}
            />
            {fieldErrors.motivo ? (
              <p id="adopcion-motivo-error" className="mt-1 text-sm font-bold text-rose-600 dark:text-rose-300">
                {fieldErrors.motivo}
              </p>
            ) : null}
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="adopcion-notas" className="block text-xs font-extrabold uppercase text-gray-400">
              Notas adicionales <span className="font-semibold normal-case text-gray-300 dark:text-gray-500">(opcional)</span>
            </label>
            <textarea
              id="adopcion-notas"
              name="notas"
              rows={2}
              value={values.notas}
              onChange={(event) => handleChange("notas", event.target.value)}
              placeholder="Ej: vivo en un departamento, tengo espacio para pasearla."
              className={`${inputClass} resize-none`}
            />
          </div>

          <div className="sm:col-span-2">
            <button
              type="submit"
              disabled={phase === "sending"}
              className="inline-flex min-h-14 w-full items-center justify-center gap-2 rounded-full bg-violet-600 px-8 py-3 text-base font-extrabold text-white shadow-[0_16px_30px_rgba(124,58,237,0.3)] transition hover:-translate-y-0.5 hover:bg-violet-700 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 sm:w-auto"
            >
              {phase === "sending" ? (
                <>
                  <Loader2 size={20} className="animate-spin" aria-hidden="true" />
                  Enviando...
                </>
              ) : (
                <>
                  <Send size={20} aria-hidden="true" />
                  Enviar solicitud
                </>
              )}
            </button>
          </div>
        </form>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-dashed border-violet-300 bg-violet-50/70 p-4 text-xs font-bold leading-5 text-violet-800 dark:border-violet-700/60 dark:bg-violet-500/10 dark:text-violet-200">
          <p>
            Prototipo: la solicitud no se envía a ningún servidor. Queda registrada solo en este
            navegador. {requests.length > 0 ? `Solicitudes guardadas en este dispositivo: ${requests.length}.` : ""}
          </p>
          <Link
            href={`/perfil/${pet.id}`}
            className="inline-flex items-center gap-1.5 rounded-full bg-white px-4 py-2 font-extrabold text-violet-700 ring-1 ring-violet-200 transition hover:bg-violet-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2 dark:bg-gray-900 dark:text-violet-300 dark:ring-violet-700"
          >
            <ArrowLeft size={16} aria-hidden="true" />
            Cancelar y volver al perfil
          </Link>
        </div>
      </GlassCard>
    </div>
  );
}