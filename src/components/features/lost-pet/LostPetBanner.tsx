import { AlertTriangle, CalendarDays, Gift, MapPin, Phone } from "lucide-react";

type LostPetBannerProps = {
  petName: string;
  message: string | null;
  lostDate: string | null;
  lostZone: string | null;
  reward: number | null;
};

export function LostPetBanner({
  petName,
  message,
  lostDate,
  lostZone,
  reward,
}: LostPetBannerProps) {
  const details = [
    lostZone
      ? {
          label: "Última vez visto",
          value: lostZone,
          icon: MapPin,
        }
      : null,
    lostDate
      ? {
          label: "Fecha",
          value: lostDate,
          icon: CalendarDays,
        }
      : null,
    reward
      ? {
          label: "Recompensa",
          value: formatReward(reward),
          icon: Gift,
        }
      : null,
  ].filter(isLostDetail);

  return (
    <section
      aria-labelledby="lost-pet-banner-title"
      className="relative overflow-hidden rounded-[2.25rem] border-2 border-rose-300 bg-gradient-to-r from-rose-100 via-pink-50 to-amber-100 p-4 shadow-[0_22px_58px_rgba(225,29,72,0.22)] ring-4 ring-rose-100 dark:from-rose-950/40 dark:via-gray-900 dark:to-amber-950/40 dark:ring-rose-900 sm:p-7 lg:p-8"
    >
      <div className="absolute inset-x-0 top-0 h-3 bg-gradient-to-r from-rose-500 via-red-400 to-amber-400" />
      <div className="absolute -right-6 -top-10 text-rose-300/80">
        <AlertTriangle size={124} strokeWidth={1.8} />
      </div>
      <div className="absolute -left-8 bottom-8 hidden h-24 w-24 rounded-full bg-rose-200/55 blur-sm md:block" />
      <div className="absolute bottom-5 right-10 hidden h-16 w-28 -rotate-12 doodle-line opacity-75 md:block" />

      <div className="relative grid gap-6 lg:grid-cols-[1.25fr_1fr] lg:items-center">
        <div>
          <span role="status" className="inline-flex items-center gap-2 rounded-full bg-rose-600 px-5 py-2.5 text-sm font-extrabold uppercase text-white shadow-[0_12px_26px_rgba(225,29,72,0.24)] ring-4 ring-white/70 dark:ring-gray-900">
            <AlertTriangle size={19} />
            Alerta activa
          </span>
          <h2 id="lost-pet-banner-title" className="mt-5 text-3xl sm:text-5xl font-extrabold leading-none tracking-tight text-gray-950 dark:text-white sm:text-6xl">
            {petName} está perdido
          </h2>
          <p className="mt-2 sm:mt-3 text-base sm:text-xl font-extrabold text-rose-700 dark:text-rose-300">
            Mascota reportada como perdida
          </p>
          <p className="mt-3 sm:mt-4 max-w-2xl text-base sm:text-lg font-bold leading-7 sm:leading-8 text-gray-800 dark:text-gray-100">
            {message ?? `Si viste o encontraste a ${petName}, por favor contacta a su familia.`}
          </p>
          <a
            href="#contacto"
            className="mt-4 sm:mt-5 inline-flex items-center gap-3 rounded-[1.35rem] bg-gradient-to-r from-rose-600 to-red-500 px-5 py-3 sm:px-6 sm:py-4 text-base sm:text-lg font-extrabold text-white shadow-[0_18px_34px_rgba(225,29,72,0.28)] ring-4 ring-white/75 dark:ring-gray-900 transition hover:-translate-y-0.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:ring-offset-2"
          >
            <Phone size={23} />
            Por favor contacta inmediatamente
          </a>
        </div>

        {details.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            {details.map((detail) => {
              const Icon = detail.icon;

              return (
                <article
                  key={detail.label}
                  className="rounded-[1.45rem] border-2 border-rose-200 bg-white/92 dark:bg-gray-900/92 p-4 shadow-[0_14px_32px_rgba(225,29,72,0.1)]"
                >
                  <div className="flex items-start gap-3">
                    <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300 ring-1 ring-rose-200">
                      <Icon size={22} />
                    </span>
                    <span>
                      <span className="block text-sm font-extrabold uppercase text-rose-600 dark:text-rose-300">
                        {detail.label}
                      </span>
                      <span className="mt-1 block text-lg font-extrabold leading-6 text-gray-950 dark:text-white">
                        {detail.value}
                      </span>
                    </span>
                  </div>
                </article>
              );
            })}
          </div>
        ) : null}
      </div>
    </section>
  );
}

type LostDetail = {
  label: string;
  value: string;
  icon: typeof MapPin;
};

function isLostDetail(detail: LostDetail | null): detail is LostDetail {
  return detail !== null;
}

function formatReward(reward: number) {
  const amount = new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
    maximumFractionDigits: 0,
  }).format(reward);

  return `${amount} MXN`;
}
