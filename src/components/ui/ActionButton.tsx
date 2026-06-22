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
  call: "from-emerald-300 to-teal-500 shadow-[0_16px_28px_rgba(16,185,129,0.22)]",
  whatsapp: "from-[#65dda0] to-emerald-500 shadow-[0_16px_28px_rgba(37,211,102,0.2)]",
  location: "from-violet-300 to-indigo-400 shadow-[0_16px_28px_rgba(129,140,248,0.22)]",
  urgentCall: "from-rose-600 to-red-500 shadow-[0_20px_38px_rgba(225,29,72,0.28)] ring-4 ring-rose-100",
  urgentWhatsapp: "from-emerald-500 to-green-600 shadow-[0_20px_38px_rgba(22,163,74,0.24)] ring-4 ring-emerald-100",
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
        "flex items-center justify-center gap-3 rounded-[1.45rem] bg-gradient-to-br px-5 text-white transition hover:-translate-y-0.5",
        size === "large" ? "min-h-[104px]" : "min-h-[76px]",
        tones[tone],
      ].join(" ")}
    >
      <span className={["grid shrink-0 place-items-center rounded-full bg-white/22", size === "large" ? "h-12 w-12" : "h-11 w-11"].join(" ")}>
        <Icon size={size === "large" ? 29 : 25} fill="none" />
      </span>
      <span className="min-w-0 text-left">
        <span className={["block font-extrabold leading-5", size === "large" ? "text-2xl" : "text-lg"].join(" ")}>{label}</span>
        {helper ? <span className="mt-1 block text-sm font-bold text-white/86">{helper}</span> : null}
      </span>
    </a>
  );
}
