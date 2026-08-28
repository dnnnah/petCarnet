import { Heart, PawPrint } from "lucide-react";
import { PetSpeciesIcon } from "@/lib/petIcon";

type ThankYouBannerProps = {
  isLost?: boolean;
  petName: string;
  species: string;
};

export function ThankYouBanner({ isLost = false, petName, species }: ThankYouBannerProps) {

  return (
    <footer
      className={[
        "relative overflow-hidden rounded-[2.25rem] p-6 sm:p-8",
        isLost
          ? "bg-gradient-to-r from-rose-50 via-pink-50 to-amber-50 shadow-[0_16px_38px_rgba(244,63,94,0.1)]"
          : "bg-gradient-to-r from-emerald-50 via-emerald-100/55 to-blue-50 shadow-[0_16px_38px_rgba(16,185,129,0.09)]",
      ].join(" ")}
    >
      <div className="grid items-center gap-6 md:grid-cols-[150px_1fr_220px]">
        <div className="relative mx-auto grid h-28 w-32 place-items-center rounded-[2rem] bg-white/70 text-amber-400 shadow-[0_12px_26px_rgba(17,24,39,0.07)] ring-1 ring-amber-100">
          <PetSpeciesIcon species={species} size={74} strokeWidth={1.7} />
          <div className="absolute bottom-5 left-3 text-pink-400">
            <Heart size={18} />
          </div>
          <div className="absolute right-0 top-0 text-amber-300">
            <PawPrint size={18} />
          </div>
        </div>

        <div className="text-center md:text-left">
          <p className="text-xl sm:text-3xl font-extrabold tracking-tight text-gray-950">
            {isLost ? `Ayuda a ${petName} a volver a casa` : `Gracias por ayudar a ${petName} a volver a casa`}
          </p>
          <p className="mt-3 text-lg font-semibold text-gray-700">
            {isLost ? "Cada aviso puede acercarlo a su familia." : "Tu ayuda hace la diferencia."}
          </p>
        </div>

        <div className="relative mx-auto rounded-[2rem] bg-white px-7 py-5 text-center shadow-[0_14px_30px_rgba(17,24,39,0.08)]">
          <div className="absolute -left-4 bottom-6 h-8 w-8 rotate-45 bg-white" />
          <p className="text-base font-semibold text-gray-700">Con amor,</p>
          <p className="text-2xl font-extrabold text-gray-950">{petName}</p>
          <PawPrint className="mx-auto mt-2 text-emerald-500" size={24} fill="currentColor" />
        </div>
      </div>
    </footer>
  );
}
