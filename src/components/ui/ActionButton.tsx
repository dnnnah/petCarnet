import type { LucideIcon } from "lucide-react";

type ActionButtonProps = {
  href: string;
  label: string;
  helper?: string;
  icon: LucideIcon;
  tone?: "call" | "whatsapp" | "location" | "urgentCall" | "urgentWhatsapp";
  size?: "normal" | "large";
};

const tones = {
  call: "from-emerald-700 to-teal-700 shadow-[0_16px_28px_rgba(16,185,129,0.28)]",
  whatsapp: "from-green-700 to-emerald-700 shadow-[0_16px_28px_rgba(22,163,74,0.28)]",
  location: "from-violet-600 to-indigo-600 shadow-[0_16px_28px_rgba(129,140,248,0.3)]",
  urgentCall: "from-rose-600 to-red-700 shadow-[0_20px_38px_rgba(225,29,72,0.28)] ring-4 ring-rose-100",
  urgentWhatsapp: "from-green-700 to-emerald-700 shadow-[0_20px_38px_rgba(22,163,74,0.26)] ring-4 ring-emerald-100",
};

export function ActionButton({
  href,
  label,
  helper,
  icon: Icon,
  size = "normal",
  tone = "call",
}: ActionButtonProps) {
  return (
    <a
      href={href}
      className={[
        "grid w-full min-w-0 grid-cols-[auto_minmax(0,1fr)] items-center gap-3 overflow-hidden rounded-[1.45rem] bg-gradient-to-br text-white transition hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:ring-offset-2",
        size === "large" ? "min-h-[104px] px-4 py-4 sm:px-5" : "min-h-[76px] px-4 py-3 sm:px-5",
        tones[tone],
      ].join(" ")}
    >
      <span className={["grid shrink-0 place-items-center rounded-full bg-white/22", size === "large" ? "h-12 w-12" : "h-11 w-11"].join(" ")}>
        <Icon size={size === "large" ? 29 : 25} fill="none" />
      </span>
      <span className="min-w-0 max-w-full text-left">
        <span className={["block max-w-full overflow-wrap-anywhere break-words font-extrabold leading-5", size === "large" ? "text-xl sm:text-2xl" : "text-lg"].join(" ")}>{label}</span>
        {helper ? (
          <span className="mt-1 block max-w-full overflow-wrap-anywhere break-words text-xs font-semibold leading-4 text-white/90 sm:text-sm">
            {helper}
          </span>
        ) : null}
      </span>
    </a>
  );
}
