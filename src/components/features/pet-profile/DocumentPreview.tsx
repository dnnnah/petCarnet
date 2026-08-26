import {
  FileImage,
  FileText,
  HeartPulse,
  IdCard,
  ShieldCheck,
  Stethoscope,
} from "lucide-react";
import type { PetDocument, PetDocumentCategory, PetDocumentType } from "@/types/pet";

type DocumentPreviewProps = {
  document: PetDocument;
  size?: "sm" | "md";
};

const categoryIcons: Record<PetDocumentCategory, typeof ShieldCheck> = {
  vacunas: ShieldCheck,
  veterinario: Stethoscope,
  identificacion: IdCard,
  salud: HeartPulse,
  foto: FileImage,
  otro: FileText,
};

const categoryTones: Record<PetDocumentCategory, string> = {
  vacunas: "bg-emerald-50 text-emerald-600 ring-emerald-100",
  veterinario: "bg-blue-50 text-blue-600 ring-blue-100",
  identificacion: "bg-violet-50 text-violet-500 ring-violet-100",
  salud: "bg-pink-50 text-pink-500 ring-pink-100",
  foto: "bg-amber-50 text-amber-500 ring-amber-100",
  otro: "bg-gray-50 text-gray-600 ring-gray-100",
};

const typeBadge: Record<PetDocumentType, { label: string; tones: string }> = {
  pdf: { label: "PDF", tones: "bg-red-50 text-red-600" },
  imagen: { label: "IMG", tones: "bg-blue-50 text-blue-600" },
  otro: { label: "Archivo", tones: "bg-gray-50 text-gray-600" },
};

export function DocumentPreview({ document, size = "md" }: DocumentPreviewProps) {
  const Icon = categoryIcons[document.categoria];
  const badge = typeBadge[document.tipo];
  const isImage = document.tipo === "imagen";
  const iconSize = size === "sm" ? 20 : 28;
  const boxSize = size === "sm" ? "h-10 w-10" : "h-14 w-14";

  return (
    <div className="flex items-center gap-3">
      {isImage ? (
        <div className="relative shrink-0 overflow-hidden rounded-2xl">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={document.url}
            alt={document.nombre}
            className={[
              "object-cover",
              size === "sm" ? "h-10 w-10" : "h-14 w-14",
            ].join(" ")}
          />
          <span className="absolute -bottom-1 -right-1 rounded-full bg-white px-1.5 py-0.5 text-[10px] font-extrabold text-gray-600 shadow ring-1 ring-gray-100">
            {badge.label}
          </span>
        </div>
      ) : (
        <span className={["relative grid shrink-0 place-items-center rounded-2xl ring-1", boxSize, categoryTones[document.categoria]].join(" ")}>
          <Icon size={iconSize} />
          <span className="absolute -bottom-1 -right-1 rounded-full bg-white px-1.5 py-0.5 text-[10px] font-extrabold text-gray-600 shadow ring-1 ring-gray-100">
            {badge.label}
          </span>
        </span>
      )}
    </div>
  );
}
