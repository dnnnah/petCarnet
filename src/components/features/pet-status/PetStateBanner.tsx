import { getPetStatusMeta } from "@/lib/mapping/petStatusPresentation";
import type { PetStatus } from "@/types/pet";

type PetStateBannerProps = {
  petName: string;
  status: PetStatus;
};

type StateBannerCopy = {
  heading: string;
  sub: string;
  body: string;
  cta?: { label: string; href: string };
};

type StateBannerPalette = {
  wrap: string;
  bar: string;
  deco: string;
  blob: string;
  pill: string;
  accent: string;
  ctaButton: string;
  focus: string;
};

const copyByStatus: Record<PetStatus, StateBannerCopy> = {
  en_casa: {
    heading: "{petName} está en casa",
    sub: "Está en casa y a salvo.",
    body: "Su familia puede estar tranquila: todo está en orden.",
  },
  perdido: {
    heading: "{petName} está perdido",
    sub: "Reportado como perdido: toda ayuda es bienvenida.",
    body: "Si viste o encontraste a {petName}, contacta a su familia de inmediato.",
    cta: { label: "Contactar a su familia", href: "#contacto" },
  },
  en_adopcion: {
    heading: "{petName} está buscando familia",
    sub: "Busca un hogar donde recibir todo el amor que merece.",
    body: "Su familia está abierta a propuestas de adopción responsable. Escríbeles para conocer el proceso y darle a {petName} el hogar que necesita.",
    cta: { label: "Conocer el proceso de adopción", href: "#contacto" },
  },
  adoptado: {
    heading: "{petName} encontró un hogar",
    sub: "Encontró un hogar y comparte su vida con una familia.",
    body: "Ahora vive junto a una familia que lo quiere. Este perfil se conserva como parte de su historia.",
  },
  rescatado: {
    heading: "{petName} está a salvo",
    sub: "Fue rescatado y ahora está a salvo.",
    body: "Gracias a quienes lo avistaron y ayudaron a que volviera a casa.",
  },
  fallecido: {
    heading: "En memoria de {petName}",
    sub: "Con cariño y para siempre.",
    body: "Este perfil se conserva como un recuerdo de los momentos que compartieron.",
  },
};

const fallbackCopy: StateBannerCopy = {
  heading: "Estado desconocido",
  sub: "No pudimos determinar el estado actual de este perfil.",
  body: "Si tienes información, puedes contactar a su familia.",
  cta: { label: "Contactar a su familia", href: "#contacto" },
};

const palettes: Record<PetStatus, StateBannerPalette> = {
  en_casa: {
    wrap: "border-2 border-emerald-200 bg-gradient-to-r from-emerald-100 via-white to-teal-50 shadow-[0_18px_44px_rgba(16,185,129,0.12)] ring-4 ring-emerald-100 dark:from-emerald-950/40 dark:via-gray-900 dark:to-teal-950/40 dark:ring-emerald-900",
    bar: "from-emerald-500 via-teal-400 to-cyan-400",
    deco: "text-emerald-300/80 dark:text-emerald-900/70",
    blob: "bg-emerald-200/55",
    pill: "bg-emerald-600 ring-white/70 dark:ring-gray-900",
    accent: "text-emerald-700 dark:text-emerald-300",
    ctaButton: "from-emerald-600 to-teal-500",
    focus: "focus-visible:ring-emerald-500",
  },
  perdido: {
    wrap: "border-2 border-rose-200 bg-gradient-to-r from-rose-100 via-white to-amber-100 shadow-[0_20px_48px_rgba(225,29,72,0.16)] ring-4 ring-rose-100 dark:from-rose-950/40 dark:via-gray-900 dark:to-amber-950/40 dark:ring-rose-900",
    bar: "from-rose-500 via-red-400 to-amber-400",
    deco: "text-rose-300/80 dark:text-rose-900/70",
    blob: "bg-rose-200/55",
    pill: "bg-rose-600 ring-white/70 dark:ring-gray-900",
    accent: "text-rose-700 dark:text-rose-300",
    ctaButton: "from-rose-600 to-red-500",
    focus: "focus-visible:ring-rose-500",
  },
  en_adopcion: {
    wrap: "border-2 border-violet-200 bg-gradient-to-r from-violet-100 via-white to-pink-50 shadow-[0_18px_44px_rgba(124,58,237,0.16)] ring-4 ring-violet-100 dark:from-violet-950/40 dark:via-gray-900 dark:to-pink-950/40 dark:ring-violet-900",
    bar: "from-violet-500 via-fuchsia-400 to-pink-400",
    deco: "text-violet-300/80 dark:text-violet-900/70",
    blob: "bg-violet-200/55",
    pill: "bg-violet-600 ring-white/70 dark:ring-gray-900",
    accent: "text-violet-700 dark:text-violet-300",
    ctaButton: "from-violet-600 to-fuchsia-500",
    focus: "focus-visible:ring-violet-500",
  },
  adoptado: {
    wrap: "border-2 border-teal-200 bg-gradient-to-r from-teal-100 via-white to-emerald-50 shadow-[0_18px_44px_rgba(20,184,166,0.15)] ring-4 ring-teal-100 dark:from-teal-950/40 dark:via-gray-900 dark:to-emerald-950/40 dark:ring-teal-900",
    bar: "from-teal-500 via-emerald-400 to-emerald-300",
    deco: "text-teal-300/80 dark:text-teal-900/70",
    blob: "bg-teal-200/55",
    pill: "bg-teal-600 ring-white/70 dark:ring-gray-900",
    accent: "text-teal-700 dark:text-teal-300",
    ctaButton: "from-teal-600 to-emerald-500",
    focus: "focus-visible:ring-teal-500",
  },
  rescatado: {
    wrap: "border-2 border-amber-200 bg-gradient-to-r from-amber-100 via-white to-orange-50 shadow-[0_18px_44px_rgba(245,158,11,0.14)] ring-4 ring-amber-100 dark:from-amber-950/40 dark:via-gray-900 dark:to-orange-950/40 dark:ring-amber-900",
    bar: "from-amber-500 via-orange-400 to-yellow-300",
    deco: "text-amber-300/80 dark:text-amber-900/70",
    blob: "bg-amber-200/55",
    pill: "bg-amber-600 ring-white/70 dark:ring-gray-900",
    accent: "text-amber-700 dark:text-amber-300",
    ctaButton: "from-amber-500 to-orange-500",
    focus: "focus-visible:ring-amber-500",
  },
  fallecido: {
    wrap: "border border-stone-200 bg-gradient-to-r from-stone-100 via-white to-gray-100 shadow-[0_16px_40px_rgba(120,113,108,0.12)] ring-4 ring-stone-100 dark:border-stone-800 dark:from-stone-900 dark:via-gray-900 dark:to-stone-900 dark:ring-stone-800",
    bar: "from-stone-400 via-stone-300 to-gray-300",
    deco: "text-stone-300 dark:text-stone-700",
    blob: "bg-stone-200/55",
    pill: "bg-stone-600 ring-white/70 dark:ring-gray-900",
    accent: "text-stone-600 dark:text-stone-300",
    ctaButton: "from-stone-500 to-stone-400",
    focus: "focus-visible:ring-stone-400",
  },
};

const fallbackPalette = palettes.fallecido;

function fill(petName: string, value: string) {
  return value.replaceAll("{petName}", petName);
}

export function PetStateBanner({ petName, status }: PetStateBannerProps) {
  const meta = getPetStatusMeta(status);
  const StatusIcon = meta.icon;
  const copy = copyByStatus[status] ?? fallbackCopy;
  const palette = palettes[status] ?? fallbackPalette;

  return (
    <section
      aria-labelledby="pet-state-banner-title"
      className={[
        "relative overflow-hidden rounded-[2.25rem] p-5 sm:p-7 lg:p-8",
        palette.wrap,
      ].join(" ")}
    >
      <div className={["absolute inset-x-0 top-0 h-3 bg-gradient-to-r", palette.bar].join(" ")} />
      <div className={["absolute -right-6 -top-10", palette.deco].join(" ")}>
        <StatusIcon size={124} strokeWidth={1.8} aria-hidden="true" />
      </div>
      <div className={["pointer-events-none absolute -left-8 bottom-8 hidden h-24 w-24 rounded-full blur-sm md:block", palette.blob].join(" ")} />
      <div className="pointer-events-none absolute bottom-5 right-10 hidden h-16 w-28 -rotate-12 doodle-line opacity-75 md:block" />

      <div className="relative">
        <span
          role="status"
          className={[
            "inline-flex items-center gap-2 rounded-full px-5 py-2.5 text-sm font-extrabold uppercase text-white shadow-[0_12px_26px_rgba(17,24,39,0.2)] ring-4",
            palette.pill,
          ].join(" ")}
        >
          <StatusIcon size={19} aria-hidden="true" />
          {meta.label.toUpperCase()}
        </span>
        <h2 id="pet-state-banner-title" className="mt-5 max-w-3xl text-3xl font-extrabold leading-tight tracking-tight text-gray-950 dark:text-white sm:text-4xl lg:text-5xl">
          {fill(petName, copy.heading)}
        </h2>
        <p className={["mt-2 sm:mt-3 text-base sm:text-xl font-extrabold", palette.accent].join(" ")}>
          {copy.sub}
        </p>
        <p className="mt-3 sm:mt-4 max-w-2xl text-base sm:text-lg font-bold leading-7 sm:leading-8 text-gray-800 dark:text-gray-100">
          {fill(petName, copy.body)}
        </p>
        {copy.cta ? (
          <a
            href={copy.cta.href}
            className={[
              "mt-4 sm:mt-5 inline-flex items-center gap-3 rounded-[1.35rem] bg-gradient-to-r px-5 py-3 sm:px-6 sm:py-4 text-base sm:text-lg font-extrabold text-white shadow-[0_18px_34px_rgba(17,24,39,0.18)] ring-4 ring-white/75 dark:ring-gray-900 transition hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
              palette.ctaButton,
              palette.focus,
            ].join(" ")}
          >
            {copy.cta.label}
          </a>
        ) : null}
      </div>
    </section>
  );
}