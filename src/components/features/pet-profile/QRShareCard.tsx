import { Heart, QrCode } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";

type QRShareCardProps = {
  petName: string;
  profilePath: string;
};

export function QRShareCard({ petName, profilePath }: QRShareCardProps) {
  return (
    <GlassCard className="h-full overflow-hidden bg-emerald-50/80 p-5 lg:p-6">
      <div className="grid h-full grid-cols-[1fr_auto] items-center gap-4 lg:grid-cols-1">
        <div>
          <div className="mb-4 grid h-10 w-10 place-items-center rounded-2xl bg-white text-emerald-600 shadow-[0_8px_18px_rgba(17,24,39,0.06)]">
            <QrCode size={22} />
          </div>
          <p className="max-w-[13rem] text-lg font-extrabold leading-6 text-gray-950">
            Escanea para compartir el perfil de {petName}
          </p>
          <p className="mt-3 text-sm font-bold text-emerald-700">{profilePath}</p>
          <div className="mt-4 flex gap-2 text-emerald-400">
            <Heart size={18} />
            <Heart size={18} />
          </div>
        </div>

        <div className="grid aspect-square w-32 shrink-0 place-items-center rounded-3xl bg-white p-3 shadow-[0_18px_32px_rgba(17,24,39,0.12)] sm:w-40 lg:mx-auto lg:w-44">
          <div className="qr-grid h-full w-full rounded-xl" />
        </div>
      </div>
    </GlassCard>
  );
}
