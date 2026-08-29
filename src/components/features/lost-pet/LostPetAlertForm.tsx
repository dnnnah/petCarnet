"use client";

import { useRef, useState } from "react";
import html2canvas from "html2canvas";
import { AlertTriangle, Camera, Download, Share2, X } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";
import { LostPetAlertImage } from "./LostPetAlertImage";
import { formatMexicanDate } from "@/lib/dateFormat";
import type { PetProfile } from "@/types/pet";

type LostPetAlertFormProps = {
  pet: PetProfile;
};

export function LostPetAlertForm({ pet }: LostPetAlertFormProps) {
  const alertRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [downloading, setDownloading] = useState(false);
  const [sharing, setSharing] = useState(false);
  const [customPhoto, setCustomPhoto] = useState<string | null>(null);

  const [lostZone, setLostZone] = useState(pet.emergencia.zonaPerdida ?? "");
  const [lostDate, setLostDate] = useState(pet.emergencia.fechaPerdida ?? "");
  const [reward, setReward] = useState(pet.emergencia.recompensa?.toString() ?? "");
  const [message, setMessage] = useState(pet.emergencia.mensajeEmergencia ?? "");

  const profileUrl = `https://petcarnet.app/perfil/${pet.id}`;
  const formattedDate = lostDate ? formatMexicanDate(lostDate) ?? lostDate : "";
  const photoUrl = customPhoto ?? pet.mascota.fotoPerfilUrl;

  function handlePhotoChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => setCustomPhoto(reader.result as string);
    reader.readAsDataURL(file);
    event.target.value = "";
  }

  async function captureCanvas() {
    const element = alertRef.current;
    if (!element) return null;
    return html2canvas(element, {
      scale: 2,
      useCORS: true,
      allowTaint: true,
      logging: false,
      backgroundColor: "#ffffff",
      scrollX: -window.scrollX,
      scrollY: -window.scrollY,
      windowWidth: document.documentElement.offsetWidth,
    } as Parameters<typeof html2canvas>[1]);
  }

  async function handleDownload() {
    setDownloading(true);
    try {
      const canvas = await captureCanvas();
      if (!canvas) return;

      const link = document.createElement("a");
      link.download = `petcarnet-alerta-${pet.mascota.nombre.toLowerCase().replace(/\s+/g, "-")}.png`;
      link.href = canvas.toDataURL("image/png");
      link.click();
    } finally {
      setDownloading(false);
    }
  }

  async function handleShare() {
    setSharing(true);
    try {
      const canvas = await captureCanvas();
      if (!canvas) return;

      const blob = await new Promise<Blob>((resolve) =>
        canvas.toBlob((b) => resolve(b!), "image/png")
      );

      const text = `SE BUSCA: ${pet.mascota.nombre} (${pet.mascota.especie})\n${lostZone ? `Última vez visto: ${lostZone}\n` : ""}${message ? `${message}\n` : ""}Más info: ${profileUrl}`;

      if (navigator.share && navigator.canShare) {
        const file = new File([blob], `alerta-${pet.mascota.nombre.toLowerCase()}.png`, { type: "image/png" });
        if (navigator.canShare({ files: [file] })) {
          await navigator.share({ files: [file], text });
          return;
        }
      }

      const link = document.createElement("a");
      link.download = `petcarnet-alerta-${pet.mascota.nombre.toLowerCase().replace(/\s+/g, "-")}.png`;
      link.href = URL.createObjectURL(blob);
      link.click();
    } finally {
      setSharing(false);
    }
  }

  return (
    <div className="space-y-6">
      <GlassCard className="p-6 lg:p-7">
        <h3 className="flex items-center gap-3 text-xl font-extrabold text-gray-950 dark:text-white">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-amber-50 text-amber-600 dark:bg-amber-500/15 dark:text-amber-300 ring-1 ring-amber-100">
            <AlertTriangle size={20} />
          </span>
          Personalizar alerta
        </h3>
        <p className="mt-2 text-sm font-semibold text-gray-600 dark:text-gray-300">
          Modifica los datos antes de generar la imagen. Los campos se pre-rellenan con la información existente.
        </p>

        <div className="mt-5 flex items-center gap-4 rounded-2xl border border-gray-100 bg-gray-50/60 dark:border-gray-800 dark:bg-gray-800/60 p-4">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={photoUrl}
            alt="Foto de la alerta"
            className="h-20 w-20 rounded-2xl object-cover ring-1 ring-gray-200"
          />
          <div className="min-w-0">
            <p className="text-sm font-extrabold text-gray-900 dark:text-white">Foto de la alerta</p>
            <p className="text-xs font-semibold text-gray-500 dark:text-gray-400">
              {customPhoto ? "Cargaste una foto nueva" : "Se usa la foto del perfil por defecto"}
            </p>
            <div className="mt-2 flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-2 rounded-full bg-white dark:bg-gray-900 px-3 py-1.5 text-xs font-extrabold text-gray-800 dark:text-gray-100 ring-1 ring-gray-200 dark:ring-gray-700 transition hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <Camera size={14} />
                Cambiar foto
              </button>
              {customPhoto ? (
                <button
                  type="button"
                  onClick={() => setCustomPhoto(null)}
                  className="inline-flex items-center gap-2 rounded-full bg-white dark:bg-gray-900 px-3 py-1.5 text-xs font-extrabold text-rose-600 dark:text-rose-300 ring-1 ring-rose-200 transition hover:bg-rose-50 dark:hover:bg-rose-500/15"
                >
                  <X size={14} />
                  Restaurar foto del perfil
                </button>
              ) : null}
            </div>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={handlePhotoChange}
            className="hidden"
          />
        </div>

        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-xs font-extrabold uppercase text-gray-400">
              Última vez visto
            </label>
            <input
              type="text"
              value={lostZone}
              onChange={(e) => setLostZone(e.target.value)}
              placeholder="Ej: Parque de la Condesa"
              className="mt-1 w-full rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900 px-4 py-3 text-sm font-bold text-gray-900 dark:text-white outline-none ring-emerald-300 transition focus:border-emerald-400 focus:ring-2"
            />
          </div>
          <div>
            <label className="block text-xs font-extrabold uppercase text-gray-400">
              Fecha de pérdida
            </label>
            <input
              type="date"
              value={lostDate}
              onChange={(e) => setLostDate(e.target.value)}
              className="mt-1 w-full rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900 px-4 py-3 text-sm font-bold text-gray-900 dark:text-white outline-none ring-emerald-300 transition focus:border-emerald-400 focus:ring-2"
            />
          </div>
          <div>
            <label className="block text-xs font-extrabold uppercase text-gray-400">
              Recompensa (MXN)
            </label>
            <input
              type="number"
              value={reward}
              onChange={(e) => setReward(e.target.value)}
              placeholder="Opcional"
              min="0"
              className="mt-1 w-full rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900 px-4 py-3 text-sm font-bold text-gray-900 dark:text-white outline-none ring-emerald-300 transition focus:border-emerald-400 focus:ring-2"
            />
          </div>
          <div>
            <label className="block text-xs font-extrabold uppercase text-gray-400">
              Teléfono de contacto
            </label>
            <input
              type="text"
              value={pet.contacto.telefonoPrincipal}
              disabled
              className="mt-1 w-full rounded-xl border border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800/60 px-4 py-3 text-sm font-bold text-gray-500 dark:text-gray-400"
            />
          </div>
        </div>

        <div className="mt-4">
          <label className="block text-xs font-extrabold uppercase text-gray-400">
            Mensaje de alerta
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Ej: Se perdió cerca del parque. Por favor ayúdame a encontrarlo."
            rows={3}
            className="mt-1 w-full rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900 px-4 py-3 text-sm font-bold text-gray-900 dark:text-white outline-none ring-emerald-300 transition focus:border-emerald-400 focus:ring-2 resize-none"
          />
        </div>
      </GlassCard>

      <div className="flex flex-col items-center gap-6">
        <p className="text-sm font-extrabold uppercase tracking-wider text-gray-400">
          Vista previa de la imagen
        </p>

        <div className="overflow-x-auto">
          <div ref={alertRef}>
            <LostPetAlertImage
              petName={pet.mascota.nombre}
              species={pet.mascota.especie}
              breed={pet.mascota.raza}
              photoUrl={photoUrl}
              color={pet.mascota.color}
              distinctiveTraits={pet.mascota.rasgosDistintivos}
              lostZone={lostZone}
              lostDate={formattedDate}
              reward={reward ? Number(reward) : null}
              message={message}
              contactPhone={pet.contacto.telefonoPrincipal}
              profileUrl={profileUrl}
            />
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-3">
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="inline-flex items-center gap-2 rounded-full bg-emerald-500 px-6 py-3 text-sm font-extrabold text-white shadow-[0_16px_30px_rgba(16,185,129,0.2)] transition hover:-translate-y-0.5 hover:bg-emerald-600 disabled:opacity-50"
          >
            <Download size={18} />
            {downloading ? "Generando..." : "Descargar imagen PNG"}
          </button>
          <button
            onClick={handleShare}
            disabled={sharing}
            className="inline-flex items-center gap-2 rounded-full bg-white dark:bg-gray-900 px-6 py-3 text-sm font-extrabold text-gray-900 dark:text-white shadow-[0_10px_22px_rgba(17,24,39,0.06)] ring-1 ring-gray-100 dark:ring-gray-700 transition hover:-translate-y-0.5 disabled:opacity-50"
          >
            <Share2 size={18} />
            {sharing ? "Compartiendo..." : "Compartir"}
          </button>
        </div>
      </div>
    </div>
  );
}
