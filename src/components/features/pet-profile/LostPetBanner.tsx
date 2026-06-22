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
    <section className="relative overflow-hidden rounded-[2.25rem] border border-rose-200 bg-gradient-to-r from-rose-50 via-pink-50 to-amber-50 p-5 shadow-[0_18px_42px_rgba(244,63,94,0.12)] sm:p-7 lg:p-8">
      <div className="absolute -right-5 -top-8 text-rose-200">
        <AlertTriangle size={96} strokeWidth={1.8} />
      </div>
      <div className="absolute bottom-5 right-10 hidden h-16 w-28 -rotate-12 doodle-line opacity-60 md:block" />

      <div className="relative grid gap-6 lg:grid-cols-[1.25fr_1fr] lg:items-center">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full bg-white/85 px-4 py-2 text-sm font-extrabold text-rose-700 shadow-[0_8px_18px_rgba(244,63,94,0.08)] ring-1 ring-rose-100">
            <AlertTriangle size={18} />
            Mascota reportada como perdida
          </span>
          <h2 className="mt-5 text-4xl font-extrabold tracking-tight text-gray-950 sm:text-5xl">
            {petName} está perdido
          </h2>
          <p className="mt-4 max-w-2xl text-lg font-bold leading-8 text-gray-700">
            {message ?? `Si viste o encontraste a ${petName}, por favor contacta a su familia.`}
          </p>
          <p className="mt-4 inline-flex items-center gap-2 rounded-2xl bg-rose-500 px-5 py-3 text-base font-extrabold text-white shadow-[0_14px_28px_rgba(244,63,94,0.2)]">
            <Phone size={20} />
            Por favor contacta inmediatamente
          </p>
        </div>

        {details.length > 0 ? (
          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            {details.map((detail) => {
              const Icon = detail.icon;

              return (
                <article
                  key={detail.label}
                  className="rounded-[1.45rem] border border-rose-100 bg-white/88 p-4 shadow-[0_12px_28px_rgba(17,24,39,0.06)]"
                >
                  <div className="flex items-start gap-3">
                    <span className="grid h-11 w-11 shrink-0 place-items-center rounded-2xl bg-rose-100 text-rose-600">
                      <Icon size={22} />
                    </span>
                    <span>
                      <span className="block text-sm font-extrabold uppercase text-rose-500">
                        {detail.label}
                      </span>
                      <span className="mt-1 block text-lg font-extrabold leading-6 text-gray-950">
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
