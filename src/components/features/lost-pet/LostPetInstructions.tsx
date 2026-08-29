import { CheckCircle2, HeartHandshake } from "lucide-react";
import { GlassCard } from "@/components/ui/GlassCard";

type LostPetInstructionsProps = {
  petName: string;
  instructions: ReadonlyArray<string>;
};

export function LostPetInstructions({
  petName,
  instructions,
}: LostPetInstructionsProps) {
  if (instructions.length === 0) {
    return null;
  }

  return (
    <GlassCard className="relative overflow-hidden border-2 border-rose-200 bg-gradient-to-r from-rose-50 via-white to-amber-50 p-6 shadow-[0_18px_42px_rgba(225,29,72,0.12)] ring-2 ring-rose-100 dark:from-rose-950/40 dark:via-gray-900 dark:to-amber-950/40 dark:ring-rose-900 lg:p-7">
      <div className="absolute inset-x-0 top-0 h-2 bg-gradient-to-r from-rose-400 via-red-300 to-amber-300" />
      <div className="absolute -right-2 -top-4 text-rose-200">
        <HeartHandshake size={82} />
      </div>
      <h2 className="relative flex items-center gap-3 text-2xl font-extrabold text-gray-950 dark:text-white">
        <span className="grid h-10 w-10 place-items-center rounded-full bg-rose-600 text-white ring-4 ring-rose-100 dark:ring-rose-900">
          <HeartHandshake size={21} />
        </span>
        Qué hacer si encontraste a {petName}
      </h2>

      <div className="relative mt-5 grid gap-3 md:grid-cols-2">
        {instructions.map((instruction) => (
          <div
            key={instruction}
            className="flex items-start gap-3 rounded-[1.35rem] border border-rose-200 bg-white/92 dark:bg-gray-900/92 p-4 shadow-[0_12px_26px_rgba(225,29,72,0.08)]"
          >
            <CheckCircle2 className="mt-0.5 shrink-0 text-rose-600 dark:text-rose-300" size={22} />
            <p className="font-bold leading-6 text-gray-900 dark:text-white">{instruction}</p>
          </div>
        ))}
      </div>
    </GlassCard>
  );
}
