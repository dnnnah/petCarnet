"use client";

import { useEffect, useRef, useState } from "react";
import {
  Check,
  Copy,
  ExternalLink,
  HeartHandshake,
  MapPin,
  Send,
  X,
} from "lucide-react";
import { ActionButton } from "@/components/ui/ActionButton";
import {
  buildFoundPetMessage,
  buildMapsLocationUrl,
  buildWhatsAppHref,
  getLocationErrorKey,
  LOCATION_ERROR_COPY,
  type LocationErrorKey,
} from "@/lib/foundPetReport";
import { copyTextToClipboard } from "@/lib/clipboard";

type IdleLocation = { status: "idle" };
type LocatingLocation = { status: "locating" };
type LocatedLocation = { status: "located"; lat: number; lng: number };
type ErrorLocation = { status: "error"; errorKey: LocationErrorKey };

type LocationState =
  | IdleLocation
  | LocatingLocation
  | LocatedLocation
  | ErrorLocation;

type FoundPetPanelProps = {
  petName: string;
  lastZone: string | null;
  whatsappNumber: string;
};

const GEOLOCATION_TIMEOUT_MS = 10000;
const GEOLOCATION_MAXIMUM_AGE_MS = 60_000;

export function FoundPetPanel({
  petName,
  lastZone,
  whatsappNumber,
}: FoundPetPanelProps) {
  const [flowOpen, setFlowOpen] = useState(false);
  const [location, setLocation] = useState<LocationState>({ status: "idle" });
  const [message, setMessage] = useState("");
  const [copied, setCopied] = useState(false);
  const [copyFailed, setCopyFailed] = useState(false);
  const [announcement, setAnnouncement] = useState("");
  const headingRef = useRef<HTMLHeadingElement>(null);

  const locationUrl =
    location.status === "located"
      ? buildMapsLocationUrl(location.lat, location.lng)
      : "";

  const whatsappHref = buildWhatsAppHref(whatsappNumber, message);

  useEffect(() => {
    if (flowOpen) {
      headingRef.current?.focus();
    }
  }, [flowOpen]);

  function openFlow() {
    setMessage(buildFoundPetMessage({ petName, lastZone }));
    setLocation({ status: "idle" });
    setFlowOpen(true);
  }

  function closeFlow() {
    setFlowOpen(false);
    setLocation({ status: "idle" });
    setCopied(false);
    setCopyFailed(false);
    setAnnouncement("");
  }

  function handleShareLocation() {
    setLocation({ status: "locating" });
    setAnnouncement("Obteniendo tu ubicación…");

    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setLocation({ status: "error", errorKey: "unavailable" });
      setAnnouncement(LOCATION_ERROR_COPY.unavailable);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const { latitude, longitude } = position.coords;
        const url = buildMapsLocationUrl(latitude, longitude);
        setLocation({ status: "located", lat: latitude, lng: longitude });
        setMessage(buildFoundPetMessage({ petName, lastZone, locationUrl: url }));
        setAnnouncement("Ubicación obtenida. Revisa el mensaje antes de enviarlo.");
      },
      (error) => {
        const errorKey = getLocationErrorKey(error?.code);
        setLocation({ status: "error", errorKey });
        setAnnouncement(LOCATION_ERROR_COPY[errorKey]);
      },
      { enableHighAccuracy: false, timeout: GEOLOCATION_TIMEOUT_MS, maximumAge: GEOLOCATION_MAXIMUM_AGE_MS }
    );
  }

  function handleSkipLocation() {
    setLocation({ status: "idle" });
    setMessage(buildFoundPetMessage({ petName, lastZone }));
    setAnnouncement("Puedes enviar el mensaje sin compartir tu ubicación.");
  }

  async function handleCopyMessage() {
    const ok = await copyTextToClipboard(message);
    if (!ok) {
      setCopyFailed(true);
      setCopied(false);
      setAnnouncement("No se pudo copiar el mensaje. Intenta de nuevo.");
      return;
    }
    setCopied(true);
    setCopyFailed(false);
    setAnnouncement("Mensaje copiado.");
  }

  return (
    <section
      aria-labelledby="encontre-panel-titulo"
      className="relative overflow-hidden rounded-[2rem] border-2 border-rose-200 bg-gradient-to-r from-rose-100/70 via-white to-amber-100/70 p-5 shadow-[0_18px_42px_rgba(225,29,72,0.14)] ring-2 ring-rose-100 dark:from-rose-950/50 dark:via-gray-900 dark:to-amber-950/40 dark:ring-rose-900 sm:p-7"
    >
      <div className="absolute inset-x-0 top-0 h-2 bg-gradient-to-r from-rose-500 via-red-400 to-amber-400" />
      <div className="pointer-events-none absolute -right-3 -top-5 text-rose-200">
        <HeartHandshake size={86} />
      </div>

      {!flowOpen ? (
        <div className="relative grid items-center gap-5 lg:grid-cols-[1fr_auto]">
          <div>
            <h2
              id="encontre-panel-titulo"
              className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-950 dark:text-white"
            >
              ¿Encontraste a {petName}?
            </h2>
            <p className="mt-2 max-w-2xl text-base font-bold leading-6 text-gray-700 dark:text-gray-200">
              Esta mascota está reportada como perdida. Si la tienes cerca,
              avisa a su familia con un mensaje desde aquí.
            </p>
          </div>
          <button
            type="button"
            onClick={openFlow}
            className="inline-flex min-h-14 items-center justify-center gap-2 rounded-full bg-gradient-to-r from-rose-600 to-red-500 px-6 py-4 text-base sm:text-lg font-extrabold text-white shadow-[0_18px_34px_rgba(225,29,72,0.28)] ring-4 ring-rose-100 dark:ring-rose-900 transition hover:-translate-y-0.5 hover:from-rose-700 hover:to-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2"
          >
            <Send size={22} aria-hidden="true" />
            Encontré esta mascota
          </button>
        </div>
      ) : (
        <div className="relative space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <h2
              ref={headingRef}
              id="encontre-panel-titulo"
              tabIndex={-1}
              className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-950 dark:text-white outline-none"
            >
              Avisa que encontraste a {petName}
            </h2>
            <button
              type="button"
              onClick={closeFlow}
              aria-label="Cancelar y volver"
              className="inline-flex h-11 w-11 items-center justify-center rounded-full bg-white text-gray-700 shadow-[0_8px_18px_rgba(17,24,39,0.08)] ring-1 ring-gray-200 transition hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2 dark:bg-gray-900 dark:text-gray-100 dark:ring-gray-700 dark:hover:bg-gray-800"
            >
              <X size={20} aria-hidden="true" />
            </button>
          </div>

          {lastZone ? (
            <p className="inline-flex items-center gap-2 rounded-full bg-rose-50 px-4 py-2 text-sm font-extrabold text-rose-700 ring-1 ring-rose-100 dark:bg-rose-500/15 dark:text-rose-300 dark:ring-rose-900">
              <MapPin size={16} aria-hidden="true" />
              Última vez visto cerca de: {lastZone}
            </p>
          ) : null}

          <div className="rounded-[1.45rem] border border-rose-100 bg-white/90 p-4 dark:border-rose-900 dark:bg-gray-900/90">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <p className="text-base font-extrabold text-gray-950 dark:text-white">
                Lo haces saber con tu ubicación actual
              </p>
            </div>
            <p className="mt-1 text-sm font-bold text-gray-600 dark:text-gray-300">
              La ubicación es opcional y solo se envía si tú la compartes.
            </p>

            <div className="mt-4 flex flex-wrap gap-3">
              <button
                type="button"
                onClick={handleShareLocation}
                disabled={location.status === "locating"}
                className={[
                  "inline-flex min-h-14 items-center justify-center gap-2 rounded-full px-5 py-3.5 text-sm font-extrabold text-white shadow-[0_14px_26px_rgba(129,140,248,0.28)] transition hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2",
                  "bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-700 hover:to-indigo-700",
                  "disabled:cursor-not-allowed disabled:opacity-60 disabled:hover:translate-y-0",
                ].join(" ")}
              >
                <MapPin size={20} aria-hidden="true" />
                {location.status === "locating"
                  ? "Obteniendo ubicación…"
                  : location.status === "located"
                    ? "Actualizar ubicación"
                    : "Compartir mi ubicación"}
              </button>

              <button
                type="button"
                onClick={handleSkipLocation}
                disabled={location.status === "locating"}
                className="inline-flex min-h-14 items-center justify-center gap-2 rounded-full bg-white px-5 py-3.5 text-sm font-extrabold text-gray-800 ring-1 ring-gray-200 transition hover:bg-gray-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60 dark:bg-gray-900 dark:text-gray-100 dark:ring-gray-700 dark:hover:bg-gray-800"
              >
                Omitir ubicación
              </button>
            </div>

            {location.status === "located" && locationUrl ? (
              <p className="mt-3 flex flex-wrap items-center gap-2 text-sm font-extrabold text-emerald-700 dark:text-emerald-300">
                <Check size={16} aria-hidden="true" />
                Ubicación confirmada.
                <a
                  href={locationUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-3 py-1.5 text-emerald-700 ring-1 ring-emerald-200 transition hover:bg-emerald-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2 dark:bg-emerald-500/15 dark:text-emerald-300 dark:ring-emerald-800"
                >
                  Abrir mapa
                  <ExternalLink size={14} aria-hidden="true" />
                </a>
              </p>
            ) : null}

            {location.status === "error" ? (
              <p
                role="status"
                className="mt-3 rounded-2xl bg-amber-50 px-4 py-3 text-sm font-bold text-amber-800 ring-1 ring-amber-100 dark:bg-amber-500/15 dark:text-amber-300 dark:ring-amber-900"
              >
                {LOCATION_ERROR_COPY[location.errorKey]}
              </p>
            ) : null}

            {location.status === "locating" ? (
              <p
                role="status"
                className="mt-3 text-sm font-bold text-violet-700 dark:text-violet-300"
              >
                Obteniendo tu ubicación… Tarda unos segundos.
              </p>
            ) : null}
          </div>

          <div>
            <label
              htmlFor="encontre-mensaje"
              className="block text-sm font-extrabold text-gray-800 dark:text-gray-100"
            >
              Mensaje para la familia
            </label>
            <textarea
              id="encontre-mensaje"
              value={message}
              onChange={(event) => {
                setMessage(event.target.value);
                setCopied(false);
                setCopyFailed(false);
              }}
              rows={4}
              className="mt-2 w-full rounded-2xl border border-gray-200 bg-white px-4 py-3 text-sm font-bold text-gray-900 shadow-[0_10px_24px_rgba(17,24,39,0.05)] outline-none transition focus:border-rose-300 focus:ring-2 focus:ring-rose-400 dark:border-gray-700 dark:bg-gray-900 dark:text-white resize-none dark:focus:border-rose-700"
            />
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {whatsappHref ? (
              <ActionButton
                href={whatsappHref}
                label="Enviar por WhatsApp"
                helper="Abre WhatsApp con el mensaje listo"
                icon={Send}
                tone="whatsapp"
                size="large"
              />
            ) : null}
            <button
              type="button"
              onClick={handleCopyMessage}
              className={[
                "inline-flex min-h-14 items-center justify-center gap-2 rounded-[1.45rem] px-4 py-3.5 text-base font-extrabold transition hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2",
                copied
                  ? "bg-emerald-500 text-white shadow-[0_14px_26px_rgba(16,185,129,0.28)]"
                  : "bg-white text-gray-900 shadow-[0_10px_22px_rgba(17,24,39,0.06)] ring-1 ring-gray-200 hover:bg-gray-100 dark:bg-gray-900 dark:text-white dark:ring-gray-700 dark:hover:bg-gray-800",
              ].join(" ")}
            >
              {copied ? <Check size={22} aria-hidden="true" /> : <Copy size={22} aria-hidden="true" />}
              {copied ? "¡Mensaje copiado!" : "Copiar mensaje"}
            </button>
          </div>

          {copyFailed ? (
            <p role="status" className="text-sm font-bold text-rose-600 dark:text-rose-400">
              No se pudo copiar el mensaje. Revisa los permisos del navegador.
            </p>
          ) : null}
        </div>
      )}

      <span aria-live="polite" className="sr-only">
        {announcement}
      </span>
    </section>
  );
}