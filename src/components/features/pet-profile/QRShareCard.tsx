"use client";

import { useRef, useState } from "react";
import { Download, Heart, QrCode } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { GlassCard } from "@/components/ui/GlassCard";

type QRShareCardProps = {
  petName: string;
  profilePath: string;
};

export function QRShareCard({ petName, profilePath }: QRShareCardProps) {
  const qrRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);
  const fullUrl = `https://petcarnet.app${profilePath}`;

  async function handleDownload() {
    setDownloading(true);

    try {
      const svgElement = qrRef.current?.querySelector("svg");
      if (!svgElement) return;

      const svgData = new XMLSerializer().serializeToString(svgElement);
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const img = new Image();
      const svgBlob = new Blob([svgData], { type: "image/svg+xml;charset=utf-8" });
      const url = URL.createObjectURL(svgBlob);

      await new Promise<void>((resolve, reject) => {
        img.onload = () => {
          canvas.width = img.width;
          canvas.height = img.height;
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, canvas.width, canvas.height);
          ctx.drawImage(img, 0, 0);
          URL.revokeObjectURL(url);
          resolve();
        };
        img.onerror = reject;
        img.src = url;
      });

      const pngUrl = canvas.toDataURL("image/png");
      const link = document.createElement("a");
      link.download = `petcarnet-qr-${petName.toLowerCase().replace(/\s+/g, "-")}.png`;
      link.href = pngUrl;
      link.click();
    } finally {
      setDownloading(false);
    }
  }

  return (
    <GlassCard className="h-full overflow-hidden bg-emerald-50/80 p-5 lg:p-6">
      <div className="grid h-full grid-cols-[1fr_auto] items-center gap-4 lg:grid-cols-1">
        <div>
          <div className="mb-4 grid h-10 w-10 place-items-center rounded-2xl bg-white text-emerald-600 shadow-[0_8px_18px_rgba(17,24,39,0.06)]">
            <QrCode size={22} />
          </div>
          <p className="max-w-[13rem] text-lg font-extrabold leading-6 text-gray-950">
            Escanea para ver el perfil de {petName}
          </p>
          <p className="mt-3 text-sm font-bold text-emerald-700">{fullUrl}</p>
          <div className="mt-4 flex gap-2 text-emerald-400">
            <Heart size={18} />
            <Heart size={18} />
          </div>
        </div>

        <div className="flex flex-col items-center gap-3">
          <div
            ref={qrRef}
            className="grid aspect-square w-32 shrink-0 place-items-center rounded-3xl bg-white p-2 shadow-[0_18px_32px_rgba(17,24,39,0.12)] sm:w-36 lg:mx-auto lg:w-40"
          >
            <QRCodeSVG
              value={fullUrl}
              size={112}
              bgColor="#ffffff"
              fgColor="#111827"
              level="M"
              includeMargin={false}
            />
          </div>
          <button
            onClick={handleDownload}
            disabled={downloading}
            className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-extrabold text-emerald-700 shadow-[0_8px_18px_rgba(17,24,39,0.06)] ring-1 ring-emerald-100 transition hover:-translate-y-0.5 disabled:opacity-50"
          >
            <Download size={16} />
            {downloading ? "Descargando..." : "Descargar QR"}
          </button>
        </div>
      </div>
    </GlassCard>
  );
}
