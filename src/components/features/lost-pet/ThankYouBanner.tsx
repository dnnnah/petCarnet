import { PawPrint } from "lucide-react";
import { PetSpeciesIcon } from "@/lib/petIcon";
import { cx } from "@/lib/ui/tone";

type ThankYouBannerProps = {
  isLost?: boolean;
  petName: string;
  species: string;
};

export function ThankYouBanner({ isLost = false, petName, species }: ThankYouBannerProps) {
  return (
    <footer
      className={cx(
        "rounded-lg border p-6",
        isLost ? "border-danger-rule bg-danger-soft" : "border-rule bg-sunken"
      )}
    >
      <div className="grid items-center gap-6 md:grid-cols-[120px_1fr_auto]">
        <div
          aria-hidden="true"
          className="mx-auto grid size-28 place-items-center rounded-md bg-surface ring-1 ring-rule md:size-32"
        >
          <PetSpeciesIcon
            species={species}
            size={64}
            strokeWidth={1.5}
            className="text-ink-3"
          />
        </div>

        <div className="text-center md:text-left">
          <p className="font-display text-2xl leading-snug text-ink sm:text-3xl">
            {isLost
              ? `Ayuda a ${petName} a volver a casa`
              : `Gracias por ayudar a ${petName} a volver a casa`}
          </p>
          <p className="mt-2 text-sm leading-6 text-ink-2">
            {isLost ? "Cada aviso puede acercarlo a su familia." : "Tu ayuda hace la diferencia."}
          </p>
        </div>

        <div className="mx-auto text-center">
          <p className="text-sm text-ink-2">Con amor,</p>
          <p className="mt-0.5 font-display text-xl leading-tight text-ink">{petName}</p>
          <PawPrint
            className={cx("mx-auto mt-2", isLost ? "text-danger" : "text-brand")}
            size={20}
            aria-hidden="true"
          />
        </div>
      </div>
    </footer>
  );
}
