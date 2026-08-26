import { QRCodeSVG } from "qrcode.react";

type LostPetAlertImageProps = {
  petName: string;
  species: string;
  breed: string;
  photoUrl: string;
  color: string;
  distinctiveTraits: string[];
  lostZone: string;
  lostDate: string;
  reward: number | null;
  message: string;
  contactPhone: string;
  profileUrl: string;
};

export function LostPetAlertImage({
  petName,
  species,
  breed,
  photoUrl,
  color,
  distinctiveTraits,
  lostZone,
  lostDate,
  reward,
  message,
  contactPhone,
  profileUrl,
}: LostPetAlertImageProps) {
  return (
    <div
      id="lost-pet-alert-image"
      className="inline-block w-full max-w-[480px] overflow-hidden rounded-[2rem] bg-white shadow-[0_32px_64px_rgba(0,0,0,0.25)]"
      style={{ fontFamily: "Nunito, Arial, sans-serif" }}
    >
      {/* Header rojo */}
      <div className="relative bg-gradient-to-r from-rose-600 via-red-500 to-amber-500 px-8 py-6 text-center">
        <p className="text-sm font-bold uppercase tracking-[0.25em] text-white/80">
          Mascota perdida
        </p>
        <h2 className="mt-1 text-4xl font-black uppercase tracking-tight text-white">
          Se Busca
        </h2>
      </div>

      {/* Foto */}
      <div className="relative mx-8 mt-6 overflow-hidden rounded-2xl bg-gray-100">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={photoUrl}
          alt={petName}
          className="h-[280px] w-full object-cover"
        />
        <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-black/40 to-transparent" />
      </div>

      {/* Nombre y datos */}
      <div className="px-8 pt-5 pb-2 text-center">
        <h3 className="text-3xl font-black text-gray-950">{petName}</h3>
        <p className="mt-1 text-lg font-bold text-gray-600">
          {breed} · {species}
        </p>
        <p className="mt-1 text-base font-semibold text-gray-500">
          Color: {color}
        </p>
      </div>

      {/* Rasgos distintivos */}
      {distinctiveTraits.length > 0 ? (
        <div className="px-8 pb-2">
          <p className="text-center text-xs font-extrabold uppercase tracking-wider text-gray-400">
            Rasgos distintivos
          </p>
          <div className="mt-2 flex flex-wrap justify-center gap-2">
            {distinctiveTraits.map((trait) => (
              <span
                key={trait}
                className="rounded-full bg-amber-50 px-3 py-1 text-xs font-bold text-amber-800 ring-1 ring-amber-200"
              >
                {trait}
              </span>
            ))}
          </div>
        </div>
      ) : null}

      {/* Detalles de pérdida */}
      <div className="mx-8 my-4 grid grid-cols-2 gap-3">
        {lostZone ? (
          <div className="rounded-xl bg-rose-50 p-3 text-center ring-1 ring-rose-100">
            <p className="text-[10px] font-extrabold uppercase text-rose-500">
              Última vez visto
            </p>
            <p className="mt-1 text-sm font-bold text-gray-900">{lostZone}</p>
          </div>
        ) : null}
        {lostDate ? (
          <div className="rounded-xl bg-rose-50 p-3 text-center ring-1 ring-rose-100">
            <p className="text-[10px] font-extrabold uppercase text-rose-500">
              Fecha
            </p>
            <p className="mt-1 text-sm font-bold text-gray-900">{lostDate}</p>
          </div>
        ) : null}
      </div>

      {/* Recompensa */}
      {reward ? (
        <div className="mx-8 mb-4 rounded-xl bg-gradient-to-r from-amber-100 to-yellow-100 p-4 text-center ring-1 ring-amber-200">
          <p className="text-xs font-extrabold uppercase text-amber-600">
            Recompensa
          </p>
          <p className="mt-1 text-2xl font-black text-amber-800">
            ${reward.toLocaleString("es-MX")} MXN
          </p>
        </div>
      ) : null}

      {/* Mensaje */}
      {message ? (
        <div className="mx-8 mb-4 rounded-xl bg-gray-50 p-4">
          <p className="text-center text-sm font-semibold italic leading-6 text-gray-700">
            &ldquo;{message}&rdquo;
          </p>
        </div>
      ) : null}

      {/* Contacto + QR */}
      <div className="mx-8 mb-8 grid grid-cols-[1fr_auto] items-center gap-4 rounded-2xl bg-emerald-50 p-5 ring-1 ring-emerald-100">
        <div>
          <p className="text-xs font-extrabold uppercase text-emerald-600">
            Contacto urgente
          </p>
          <p className="mt-1 text-lg font-black text-gray-950">
            {contactPhone}
          </p>
          <p className="mt-1 text-xs font-bold text-emerald-700">
            Llama o envía WhatsApp
          </p>
        </div>
        <div className="grid place-items-center rounded-xl bg-white p-2 shadow ring-1 ring-gray-100">
          <QRCodeSVG
            value={profileUrl}
            size={72}
            bgColor="#ffffff"
            fgColor="#111827"
            level="M"
          />
        </div>
      </div>

      {/* Footer */}
      <div className="bg-gray-950 px-8 py-4 text-center">
        <p className="text-xs font-bold text-gray-400">
          PetCarnet · Pasaporte Digital para Mascotas
        </p>
        <p className="mt-1 text-[10px] text-gray-500">
          Escanea el QR para ver el perfil completo
        </p>
      </div>
    </div>
  );
}
