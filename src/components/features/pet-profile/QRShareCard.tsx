"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { BadgeCheck, Check, Download, FileCode2, Link2, Printer, QrCode, TriangleAlert } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { GlassCard } from "@/components/ui/GlassCard";

const QR_EXPORT_SIZE = 1024;
const QR_PRINT_SIZE = 2048;
const QR_PRINT_MARGIN = 256;

type QRShareCardProps = {
  petName: string;
  profileUrl: string;
  petCode: string;
};

type BusyAction = "png" | "svg" | null;
type CopyKind = "url" | "id" | null;

function cleanQrSvg(svg: SVGSVGElement): string {
  const clone = svg.cloneNode(true) as SVGSVGElement;
  clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
  clone.setAttribute("width", String(QR_EXPORT_SIZE));
  clone.setAttribute("height", String(QR_EXPORT_SIZE));
  clone.removeAttribute("style");
  return new XMLSerializer().serializeToString(clone);
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

async function copyText(text: string): Promise<boolean> {
  try {
    if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch {
    // fallback below
  }

  try {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    const ok = document.execCommand("copy");
    document.body.removeChild(textarea);
    return ok;
  } catch {
    return false;
  }
}

export function QRShareCard({ petName, profileUrl, petCode }: QRShareCardProps) {
  const qrRef = useRef<HTMLDivElement>(null);
  const timers = useRef<number[]>([]);
  const [busy, setBusy] = useState<BusyAction>(null);
  const [copied, setCopied] = useState<CopyKind>(null);
  const [copyFailed, setCopyFailed] = useState(false);
  const [downloadFailed, setDownloadFailed] = useState(false);
  const [liveMessage, setLiveMessage] = useState("");

  const later = useCallback((fn: () => void, ms: number) => {
    timers.current.push(window.setTimeout(fn, ms));
  }, []);

  useEffect(() => {
    const pending = timers.current;
    return () => pending.forEach((timer) => window.clearTimeout(timer));
  }, []);

  const announce = useCallback(
    (message: string) => {
      setLiveMessage(message);
      later(() => setLiveMessage(""), 3200);
    },
    [later]
  );

  const fileName = petName.toLowerCase().replace(/\s+/g, "-");

  const handleCopy = useCallback(
    async (kind: "url" | "id") => {
      const target = kind === "url" ? profileUrl : petCode;
      const ok = await copyText(target);
      setCopied(kind);
      later(() => setCopied(null), 1800);
      announce(
        ok
          ? kind === "url"
            ? "URL del perfil copiada"
            : "ID PetCarnet copiado"
          : "No se pudo copiar. Revisa los permisos del navegador."
      );
      if (!ok) {
        setCopyFailed(true);
        later(() => setCopyFailed(false), 3000);
      }
    },
    [profileUrl, petCode, announce, later]
  );

  const handleDownloadPng = useCallback(async () => {
    const svg = qrRef.current?.querySelector("svg");
    if (!svg || busy) return;
    setBusy("png");
    setDownloadFailed(false);
    try {
      const svgText = cleanQrSvg(svg);
      const blob = new Blob([svgText], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const img = new Image();
      const loaded = new Promise<void>((resolve, reject) => {
        img.onload = () => resolve();
        img.onerror = () => reject(new Error("No se pudo cargar el QR"));
      });
      img.src = url;

      await loaded;

      const canvas = document.createElement("canvas");
      canvas.width = QR_PRINT_SIZE;
      canvas.height = QR_PRINT_SIZE;
      const ctx = canvas.getContext("2d");
      if (!ctx) throw new Error("Canvas no disponible");

      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      const contentSize = QR_PRINT_SIZE - QR_PRINT_MARGIN * 2;
      ctx.drawImage(img, QR_PRINT_MARGIN, QR_PRINT_MARGIN, contentSize, contentSize);
      URL.revokeObjectURL(url);

      const pngUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.href = pngUrl;
      link.download = `petcarnet-qr-${fileName}.png`;
      link.click();

      announce("QR descargado en PNG de alta resolución");
    } catch {
      setDownloadFailed(true);
      later(() => setDownloadFailed(false), 3000);
      announce("No se pudo descargar el QR en PNG");
    } finally {
      setBusy(null);
    }
  }, [fileName, busy, announce, later]);

  const handleDownloadSvg = useCallback(() => {
    const svg = qrRef.current?.querySelector("svg");
    if (!svg || busy) return;
    setBusy("svg");
    setDownloadFailed(false);
    try {
      downloadBlob(
        new Blob([cleanQrSvg(svg)], { type: "image/svg+xml;charset=utf-8" }),
        `petcarnet-qr-${fileName}.svg`
      );
      announce("QR exportado en SVG");
    } catch {
      setDownloadFailed(true);
      later(() => setDownloadFailed(false), 3000);
      announce("No se pudo exportar el QR en SVG");
    } finally {
      setBusy(null);
    }
  }, [fileName, busy, announce, later]);

  const buttonClasses = [
    "inline-flex min-w-0 items-center justify-center gap-2 rounded-full px-3.5 py-2.5 text-sm font-extrabold",
    "bg-white text-emerald-700 shadow-[0_8px_18px_rgba(17,24,39,0.06)] ring-1 ring-emerald-100",
    "transition hover:-translate-y-0.5 hover:ring-emerald-300",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2",
    "disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:translate-y-0",
  ].join(" ");

  return (
    <GlassCard className="h-full overflow-hidden bg-emerald-50/80 p-5 lg:p-6 dark:bg-emerald-950/30">
      <div className="grid h-full gap-6">
        <div className="flex items-start gap-3">
          <span className="grid h-10 w-10 shrink-0 place-items-center rounded-2xl bg-white text-emerald-600 shadow-[0_8px_18px_rgba(17,24,39,0.06)] dark:bg-gray-900 dark:text-emerald-400">
            <QrCode size={22} />
          </span>
          <div className="min-w-0">
            <h2 className="text-lg font-extrabold leading-6 text-gray-950 dark:text-white">
              Comparte el perfil de {petName}
            </h2>
            <p className="mt-1 text-sm font-bold text-emerald-700 dark:text-emerald-400">
              Escanea con la cámara para ver el perfil.
            </p>
          </div>
        </div>

        {!profileUrl ? (
          <div className="rounded-3xl bg-white/80 p-4 dark:bg-gray-900/80">
            <p className="text-sm font-extrabold text-gray-950 dark:text-white">QR no disponible</p>
            <p className="mt-1 text-sm font-bold text-gray-600 dark:text-gray-300">
              Este perfil aún no tiene un identificador público asignado.
            </p>
          </div>
        ) : (
          <>
            <div className="mx-auto w-fit">
              <div
                ref={qrRef}
                className="grid h-44 w-44 place-items-center rounded-3xl bg-white p-2 shadow-[0_18px_32px_rgba(17,24,39,0.12)] ring-1 ring-emerald-100 sm:h-48 sm:w-48"
              >
                <QRCodeSVG
                  value={profileUrl}
                  size={QR_EXPORT_SIZE}
                  marginSize={4}
                  level="M"
                  bgColor="#ffffff"
                  fgColor="#111827"
                  role="img"
                  aria-label={`Código QR del perfil público de ${petName}`}
                  title={`Código QR del perfil público de ${petName}`}
                  style={{ width: "100%", height: "100%" }}
                />
              </div>
              <p className="mt-2 max-w-48 truncate text-center text-xs font-bold text-emerald-700/80 dark:text-emerald-400/80">
                <Link2 size={12} className="mr-1 inline" />
                {profileUrl}
              </p>
              <p className="mt-1 text-center text-xs font-extrabold text-gray-500 dark:text-gray-400">
                ID PetCarnet: {petCode}
              </p>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleCopy("url")}
                disabled={busy !== null}
                aria-label="Copiar la URL del perfil para compartir"
                className={buttonClasses}
              >
                {copied === "url" ? <Check size={16} /> : <Link2 size={16} />}
                <span className="truncate">{copied === "url" ? "¡Copiado!" : "Copiar URL"}</span>
              </button>

              <button
                type="button"
                onClick={() => handleCopy("id")}
                disabled={busy !== null}
                aria-label="Copiar el ID PetCarnet"
                className={buttonClasses}
              >
                {copied === "id" ? <Check size={16} /> : <BadgeCheck size={16} />}
                <span className="truncate">{copied === "id" ? "¡Copiado!" : "Copiar ID"}</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadPng}
                disabled={busy !== null}
                aria-label="Descargar el QR en PNG de alta resolución para imprimir"
                className={buttonClasses}
              >
                <Download size={16} />
                <span className="truncate">{busy === "png" ? "Generando…" : "Descargar PNG"}</span>
              </button>

              <button
                type="button"
                onClick={handleDownloadSvg}
                disabled={busy !== null}
                aria-label="Exportar el QR en formato vectorial SVG"
                className={buttonClasses}
              >
                <FileCode2 size={16} />
                <span className="truncate">{busy === "svg" ? "Generando…" : "Exportar SVG"}</span>
              </button>
            </div>

            <details className="group rounded-2xl bg-white/70 ring-1 ring-emerald-100 dark:bg-gray-900/70 dark:ring-emerald-500/20">
              <summary className="flex cursor-pointer list-none items-center gap-2 px-4 py-3 text-sm font-extrabold text-emerald-700 dark:text-emerald-400">
                <Printer size={16} />
                Cómo imprimir o usar el QR
                <TriangleAlert size={14} className="ml-auto transition-transform group-open:rotate-180" />
              </summary>
              <ul className="space-y-2 border-t border-emerald-100 px-4 py-3 text-sm font-bold leading-5 text-gray-700 dark:border-emerald-500/20 dark:text-gray-200">
                <li>Descarga el PNG (alta resolución) o el SVG y úsalo en una etiqueta, placa o colgante.</li>
                <li>Tamaño mínimo recomendado: 2.5 × 2.5 cm (elige 5 cm si va en una placa).</li>
                <li>No recortes el margen blanco alrededor del código.</li>
                <li>Evita rayones y cubre el QR con cinta transparente para uso físico.</li>
              </ul>
            </details>

            {copyFailed ? (
              <p role="status" className="text-center text-xs font-extrabold text-rose-600 dark:text-rose-400">
                No se pudo copiar, revisa los permisos del navegador.
              </p>
            ) : null}
            {downloadFailed ? (
              <p role="status" className="text-center text-xs font-extrabold text-rose-600 dark:text-rose-400">
                No se pudo generar la descarga. Inténtalo de nuevo.
              </p>
            ) : null}
          </>
        )}

        <span aria-live="polite" className="sr-only">
          {liveMessage}
        </span>
      </div>
    </GlassCard>
  );
}