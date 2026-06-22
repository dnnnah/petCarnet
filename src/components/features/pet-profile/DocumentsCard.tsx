import { ChevronRight, Download, FileText, Folder } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";

type DocumentsCardProps = {
  documents: ReadonlyArray<{
    name: string;
    meta: string;
    tone: "pink" | "mint" | "purple";
  }>;
};

const tones = {
  pink: "bg-pink-50 text-pink-400",
  mint: "bg-emerald-50 text-emerald-500",
  purple: "bg-violet-50 text-violet-400",
};

export function DocumentsCard({ documents }: DocumentsCardProps) {
  return (
    <GlassCard className="h-full p-6 lg:p-7">
      <div className="flex items-center justify-between gap-4">
        <h2 className="flex items-center gap-3 text-2xl font-extrabold text-gray-950">
          <Folder className="text-amber-400" size={28} />
          Documentos
        </h2>
        <a href="#" className="flex items-center gap-2 text-sm font-extrabold text-emerald-600">
          Ver todos
          <ChevronRight size={18} />
        </a>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        {documents.map((document) => (
          <div
            key={document.name}
            className="flex min-h-[112px] items-center justify-between gap-3 rounded-[1.45rem] border border-gray-100 bg-white p-4 shadow-[0_10px_24px_rgba(17,24,39,0.05)]"
          >
            <div className="flex items-center gap-3">
              <span className={["grid h-14 w-14 shrink-0 place-items-center rounded-2xl", tones[document.tone]].join(" ")}>
                <FileText size={28} />
              </span>
              <span>
                <span className="block font-extrabold leading-5 text-gray-950">{document.name}</span>
                <span className="mt-1 block text-sm font-semibold text-gray-500">{document.meta}</span>
              </span>
            </div>
            <button className="grid h-9 w-9 shrink-0 place-items-center rounded-full bg-white text-gray-900 shadow-[0_8px_18px_rgba(17,24,39,0.08)] ring-1 ring-gray-100">
              <Download size={17} />
            </button>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}
