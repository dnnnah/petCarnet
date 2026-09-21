"use client";

import {
  BadgeCheck,
  CalendarDays,
  Heart,
  MapPin,
  PawPrint,
  Phone,
  ScanLine,
  Syringe,
  Bug,
  ClipboardList,
  Stethoscope,
  MessageCircle,
  Ambulance,
  TriangleAlert,
} from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { CopyButton } from "@/components/ui/CopyButton";
import {
  carnetVaccineBadge,
  formatCarnetDate,
  formatCarnetPeso,
  labelsEspecieRaza,
  toCarnetViewModel,
} from "@/lib/mapping/carnet";
import { getPetAgeText } from "@/lib/dateFormat";
import type { PhysicalPetCard } from "@/types/carnet";

type CarnetDocumentProps = {
  card: PhysicalPetCard;
};

function DocLabel({ children }: { children: React.ReactNode }) {
  return (
    <dt className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-gray-400">
      {children}
    </dt>
  );
}

function DocValue({ children }: { children: React.ReactNode }) {
  return (
    <dd className="mt-1 text-sm font-bold leading-5 text-gray-900 break-words">
      {children}
    </dd>
  );
}

function DocRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="border-b border-gray-100 pb-3">
      <DocLabel>{label}</DocLabel>
      {value !== null && value !== undefined ? (
        <DocValue>{value}</DocValue>
      ) : (
        <DocValue>
          <span className="font-semibold text-gray-400">—</span>
        </DocValue>
      )}
    </div>
  );
}

function SectionHeading({
  icon,
  title,
  tone = "emerald",
}: {
  icon: React.ReactNode;
  title: string;
  tone?: "emerald" | "violet" | "teal" | "sky" | "gray";
}) {
  const tones: Record<string, string> = {
    emerald: "bg-emerald-600",
    violet: "bg-violet-600",
    teal: "bg-teal-600",
    sky: "bg-sky-600",
    gray: "bg-gray-500",
  };
  return (
    <div className="flex items-center gap-3">
      <span
        className={`grid h-9 w-9 shrink-0 place-items-center rounded-xl text-white ${tones[tone]}`}
      >
        {icon}
      </span>
      <h3 className="text-base font-black uppercase tracking-[0.14em] text-gray-900">
        {title}
      </h3>
    </div>
  );
}

function EstadoBand({ card, className }: { card: PhysicalPetCard; className?: string }) {
  const vm = toCarnetViewModel(card);
  const StatusIcon = vm.statusMeta.icon;

  if (card.estado.perdido && !card.estado.esTerminal) {
    return (
      <div
        className={`border-y border-rose-200 bg-rose-50 px-6 py-5 sm:px-8 ${className ?? ""}`}
        role="status"
      >
        <div className="flex flex-wrap items-start gap-4">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-rose-600 text-white shadow-[0_10px_22px_rgba(225,29,72,0.28)]">
            <TriangleAlert size={24} aria-hidden="true" />
          </span>
          <div className="min-w-0 flex-1">
            <p className="inline-flex items-center gap-2 rounded-full bg-rose-600 px-3.5 py-1.5 text-sm font-black uppercase tracking-[0.14em] text-white">
              <StatusIcon size={14} aria-hidden="true" /> Perdido
            </p>
            {card.emergencia.mensaje ? (
              <p className="mt-3 text-base font-extrabold leading-6 text-rose-950">
                {card.emergencia.mensaje}
              </p>
            ) : (
              <p className="mt-3 text-base font-extrabold leading-6 text-rose-950">
                Se reportó perdido: por favor ayuda a que vuelva a casa.
              </p>
            )}
            <dl className="mt-3 flex flex-wrap gap-x-6 gap-y-2 text-sm font-bold text-rose-900">
              {card.emergencia.zonaPerdida ? (
                <div className="flex items-center gap-1.5">
                  <MapPin size={15} aria-hidden="true" />
                  {card.emergencia.zonaPerdida}
                </div>
              ) : null}
              {card.emergencia.fechaPerdida ? (
                <div className="flex items-center gap-1.5">
                  <CalendarDays size={15} aria-hidden="true" />
                  {formatCarnetDate(card.emergencia.fechaPerdida)}
                </div>
              ) : null}
              {card.emergencia.recompensa !== null && card.emergencia.recompensa > 0 ? (
                <div className="flex items-center gap-1.5">
                  <span aria-hidden="true">🏆</span>
                  Recompensa: ${card.emergencia.recompensa.toLocaleString("es-MX")}
                </div>
              ) : null}
            </dl>
          </div>
        </div>

        {card.emergencia.instrucciones.length > 0 ? (
          <div className="mt-4 border-t border-rose-200 pt-4">
            <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-rose-700">
              Cómo ayudar
            </p>
            <ul className="mt-2 flex flex-col gap-2">
              {card.emergencia.instrucciones.map((instruccion) => (
                <li key={instruccion} className="flex items-start gap-2 text-sm font-bold text-rose-900">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-rose-500" aria-hidden="true" />
                  {instruccion}
                </li>
              ))}
            </ul>
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div
      className={`flex flex-wrap items-center gap-3 border-b border-gray-100 px-6 py-4 sm:px-8 ${className ?? ""}`}
    >
      <span
        className={`inline-flex items-center gap-2 rounded-full px-3.5 py-1.5 text-sm font-black ring-1 ${
          card.estado.esTerminal
            ? "bg-gray-100 text-gray-600 ring-gray-200"
            : card.estado.status === "en_adopcion" || card.estado.status === "adoptado" || card.estado.status === "rescatado"
              ? "bg-violet-50 text-violet-700 ring-violet-200"
              : "bg-emerald-50 text-emerald-700 ring-emerald-200"
        }`}
      >
        <StatusIcon size={15} aria-hidden="true" />
        {vm.statusMeta.label}
      </span>
      <p className="text-sm font-bold text-gray-500">{vm.statusMeta.description}</p>
    </div>
  );
}

function IdentityBlock({ card }: { card: PhysicalPetCard }) {
  const age = card.mascota.fechaNacimiento
    ? getPetAgeText(card.mascota.fechaNacimiento)
    : null;
  const specieRaza = labelsEspecieRaza(card.mascota.especie, card.mascota.raza);

  return (
    <section aria-label="Identidad de la mascota">
      <div className="flex items-start gap-5">
        {card.mascota.fotoUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={card.mascota.fotoUrl}
            alt={`Fotografía de ${card.mascota.nombre ?? "la mascota"}`}
            className="h-28 w-28 shrink-0 rounded-2xl object-cover shadow-[0_12px_26px_rgba(17,24,39,0.14)] ring-1 ring-gray-200"
          />
        ) : (
          <span className="grid h-28 w-28 shrink-0 place-items-center rounded-2xl bg-gray-100 text-gray-400 ring-1 ring-gray-200">
            <PawPrint size={40} aria-hidden="true" />
          </span>
        )}
        <div className="min-w-0">
          <h2 className="text-3xl font-black leading-tight text-gray-950">
            {card.mascota.nombre ?? "Nombre no registrado"}
          </h2>
          {specieRaza ? (
            <p className="mt-1 text-base font-bold text-gray-600">{specieRaza}</p>
          ) : null}
          <div className="mt-3 flex flex-wrap gap-2">
            {card.mascota.verificado ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-extrabold text-emerald-700 ring-1 ring-emerald-200">
                <BadgeCheck size={13} aria-hidden="true" /> Verificado
              </span>
            ) : null}
            {card.mascota.esterilizado ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-slate-50 px-3 py-1 text-xs font-extrabold text-slate-600 ring-1 ring-slate-200">
                <Heart size={13} aria-hidden="true" /> Esterilizado
              </span>
            ) : null}
            {card.identificacion.microchip ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-sky-50 px-3 py-1 text-xs font-extrabold text-sky-700 ring-1 ring-sky-200">
                Chip: {card.identificacion.microchip}
              </span>
            ) : null}
          </div>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-2 gap-x-6 gap-y-4 sm:grid-cols-3">
        <DocRow label="Genero" value={card.mascota.genero ?? "No registrado"} />
        <DocRow label="Talla" value={card.mascota.talla ?? "No registrada"} />
        <DocRow label="Peso" value={formatCarnetPeso(card.mascota.pesoKg)} />
        <DocRow
          label="Nacimiento"
          value={
            card.mascota.fechaNacimiento
              ? formatCarnetDate(card.mascota.fechaNacimiento)
              : "No registrada"
          }
        />
        <DocRow label="Edad" value={age} />
        <DocRow label="ID PetCarnet" value={card.identificacion.codigoPublico || "Sin código"} />
      </div>

      {card.mascota.rasgosDistintivos.length > 0 ? (
        <div className="mt-4 border-b border-gray-100 pb-3">
          <DocLabel>Rasgos distintivos</DocLabel>
          <ul className="mt-1 space-y-1">
            {card.mascota.rasgosDistintivos.map((rasgo) => (
              <li key={rasgo} className="flex items-start gap-2 text-sm font-bold text-gray-900">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-400" aria-hidden="true" />
                {rasgo}
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}

function QrBlock({ card }: { card: PhysicalPetCard }) {
  const petName = card.mascota.nombre ?? "la mascota";

  if (!card.qr.disponible || !card.qr.url) {
    return (
      <section className="rounded-3xl border border-dashed border-gray-300 bg-gray-50 p-6 text-center">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-gray-200 text-gray-500">
          <ScanLine size={26} aria-hidden="true" />
        </span>
        <h3 className="mt-4 text-base font-black text-gray-900">QR no disponible</h3>
        <p className="mt-1 text-sm font-semibold text-gray-500">
          Este perfil aún no tiene un identificador público asignado.
        </p>
      </section>
    );
  }

  return (
    <section aria-label="Código QR del perfil público" className="rounded-3xl border border-gray-200 bg-white p-5 shadow-[0_14px_34px_rgba(17,24,39,0.06)]">
      <div className="relative mx-auto w-fit max-w-full">
        <div className="grid place-items-center rounded-2xl bg-white p-3 ring-1 ring-gray-200">
          <QRCodeSVG
            value={card.qr.url}
            size={1024}
            marginSize={4}
            level="M"
            bgColor="#ffffff"
            fgColor="#111827"
            role="img"
            aria-label={`Código QR del perfil público de ${petName}`}
            title={`Código QR del perfil público de ${petName}`}
            style={{ width: "clamp(168px, 52vw, 216px)", height: "auto" }}
          />
        </div>
        {/* Esquinas de zona de escaneo (referencia visual de uso físico) */}
        <span className="pointer-events-none absolute -left-2 -top-2 h-7 w-7 border-l-4 border-t-4 rounded-tl-xl border-emerald-600" aria-hidden="true" />
        <span className="pointer-events-none absolute -right-2 -top-2 h-7 w-7 border-r-4 border-t-4 rounded-tr-xl border-emerald-600" aria-hidden="true" />
        <span className="pointer-events-none absolute -bottom-2 -left-2 h-7 w-7 border-b-4 border-l-4 rounded-bl-xl border-emerald-600" aria-hidden="true" />
        <span className="pointer-events-none absolute -bottom-2 -right-2 h-7 w-7 border-b-4 border-r-4 rounded-br-xl border-emerald-600" aria-hidden="true" />
      </div>

      <div className="mt-4 text-center">
        <p className="text-sm font-black text-gray-900">Escanea la tarjeta para ver el perfil</p>
        <p className="mx-auto mt-1 max-w-xs text-xs font-bold leading-5 text-gray-500">
          Si encuentras a {petName}, el QR lleva a su ficha pública para ayudar.
        </p>
      </div>

      <div className="mt-4 overflow-hidden">
        <p className="break-all rounded-xl bg-gray-50 px-3 py-2 text-center text-xs font-bold text-gray-600 ring-1 ring-gray-100">
          {card.qr.url}
        </p>
        <span className="sr-only">{`Perfil público de ${petName}: ${card.qr.url}`}</span>
        <div className="mt-2 flex justify-center">
          <CopyButton value={card.qr.url} label="Copiar URL del perfil" />
        </div>
      </div>
    </section>
  );
}

function ContactBlock({ card }: { card: PhysicalPetCard }) {
  const phoneHref = card.contacto.telefono ? `tel:${card.contacto.telefono.replace(/\s/g, "")}` : null;
  const hasAny =
    card.contacto.nombrePublico ||
    card.contacto.telefono ||
    card.contacto.telefonoSecundario ||
    card.contacto.email ||
    card.contacto.zonaHabitual ||
    card.contacto.zonaSegura;

  return (
    <section aria-label="Contacto público">
      <SectionHeading icon={<Phone size={17} aria-hidden="true" />} title="Contacto" />
      <div className="mt-4 space-y-4">
        {card.contacto.nombrePublico ? (
          <DocRow label="Contacto publico" value={card.contacto.nombrePublico} />
        ) : null}
        {card.contacto.telefono ? (
          <DocRow label="Telefono" value={<a className="underline decoration-emerald-300 underline-offset-2 hover:text-emerald-800" href={phoneHref ?? undefined}>{card.contacto.telefono}</a>} />
        ) : (
          <DocRow label="Telefono" value={<span className="font-semibold text-gray-400">No registrado</span>} />
        )}
        {card.contacto.telefonoSecundario ? (
          <DocRow label="Telefono alternativo" value={card.contacto.telefonoSecundario} />
        ) : null}
        {card.contacto.email ? <DocRow label="Correo" value={card.contacto.email} /> : null}
        {card.contacto.zonaHabitual ? <DocRow label="Zona habitual" value={card.contacto.zonaHabitual} /> : null}
        {card.contacto.zonaSegura ? <DocRow label="Zona segura" value={card.contacto.zonaSegura} /> : null}

        {(phoneHref || card.contacto.whatsappUrl) ? (
          <div className="flex flex-wrap gap-3 pt-1">
            {card.contacto.whatsappUrl ? (
              <a
                href={card.contacto.whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-12 items-center gap-2 rounded-full bg-emerald-600 px-5 text-sm font-extrabold text-white shadow-[0_12px_26px_rgba(16,185,129,0.26)] transition hover:-translate-y-0.5 hover:bg-emerald-700"
              >
                <MessageCircle size={17} aria-hidden="true" />
                Contactar por WhatsApp
              </a>
            ) : null}
            {phoneHref ? (
              <a
                href={phoneHref}
                className="inline-flex min-h-12 items-center gap-2 rounded-full bg-gray-950 px-5 text-sm font-extrabold text-white transition hover:-translate-y-0.5 hover:bg-gray-800"
              >
                <Phone size={17} aria-hidden="true" />
                Llamar
              </a>
            ) : null}
          </div>
        ) : hasAny ? null : null}
      </div>
    </section>
  );
}

function ChipsBlock({ title, items, tone }: { title: string; items: ReadonlyArray<string>; tone: "rose" | "amber" | "sky" }) {
  const tones = {
    rose: "bg-rose-50 text-rose-700 ring-rose-200",
    amber: "bg-amber-50 text-amber-800 ring-amber-200",
    sky: "bg-sky-50 text-sky-700 ring-sky-200",
  };
  if (items.length === 0) return null;
  return (
    <div>
      <p className="text-[11px] font-extrabold uppercase tracking-[0.16em] text-gray-400">{title}</p>
      <div className="mt-2 flex flex-wrap gap-2">
        {items.map((item) => (
          <span key={item} className={`inline-flex rounded-full px-3 py-1 text-xs font-extrabold ring-1 ${tones[tone]}`}>
            {item}
          </span>
        ))}
      </div>
    </div>
  );
}

function SaludBlock({ card }: { card: PhysicalPetCard }) {
  return (
    <section aria-label="Salud y vacunación">
      <SectionHeading icon={<Stethoscope size={17} aria-hidden="true" />} title="Salud y vacunación" />
      <div className="mt-4 space-y-5">
        <div className="space-y-3">
          <ChipsBlock title="Alergias" items={card.salud.alergias} tone="rose" />
          <ChipsBlock title="Condiciones medicas" items={card.salud.condicionesMedicas} tone="amber" />
          <ChipsBlock title="Medicamentos actuales" items={card.salud.medicamentosActuales} tone="sky" />
        </div>

        <div className="border-t border-gray-100 pt-4">
          <div className="flex items-center gap-2">
            <Syringe size={16} className="text-emerald-600" aria-hidden="true" />
            <p className="text-sm font-black uppercase tracking-[0.14em] text-gray-900">Vacunas</p>
            {card.salud.vacunas.length > 0 ? (
              <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-extrabold text-emerald-700 ring-1 ring-emerald-200">
                {card.salud.vacunas.length}
              </span>
            ) : null}
          </div>
          {card.salud.vacunas.length > 0 ? (
            <ul className="mt-3 space-y-1.5">
              {card.salud.vacunas.map((vacuna) => {
                const badge = carnetVaccineBadge(vacuna.estatus);
                const tones: Record<string, string> = {
                  emerald: "bg-emerald-50 text-emerald-700 ring-emerald-200",
                  amber: "bg-amber-50 text-amber-800 ring-amber-200",
                  rose: "bg-rose-50 text-rose-700 ring-rose-200",
                  gray: "bg-gray-50 text-gray-500 ring-gray-200",
                };
                return (
                  <li key={vacuna.nombre} className="flex flex-wrap items-baseline justify-between gap-2 border-b border-gray-100 pb-1.5">
                    <span className="text-sm font-bold text-gray-900">{vacuna.nombre}</span>
                    <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-extrabold uppercase tracking-wide ring-1 ${tones[badge.tone]}`}>
                      {badge.label}
                    </span>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="mt-2 text-sm font-semibold italic text-gray-400">Sin vacunas registradas</p>
          )}
        </div>

        <div className="border-t border-gray-100 pt-4">
          <div className="flex items-center gap-2">
            <Bug size={16} className="text-teal-600" aria-hidden="true" />
            <p className="text-sm font-black uppercase tracking-[0.14em] text-gray-900">Desparasitación</p>
            {card.salud.desparasitaciones.length > 0 ? (
              <span className="rounded-full bg-teal-50 px-2.5 py-0.5 text-xs font-extrabold text-teal-700 ring-1 ring-teal-200">
                {card.salud.desparasitaciones.length}
              </span>
            ) : null}
          </div>
          {card.salud.desparasitaciones.length > 0 ? (
            <ul className="mt-3 space-y-1.5">
              {card.salud.desparasitaciones.map((item) => (
                <li key={item.producto} className="flex flex-wrap items-baseline justify-between gap-2 border-b border-gray-100 pb-1.5">
                  <span className="text-sm font-bold text-gray-900">{item.producto}</span>
                  <span className="text-xs font-semibold text-gray-500">
                    {formatCarnetDate(item.fecha) ?? "Sin fecha"}
                    {item.proximaFecha ? ` · próxima ${formatCarnetDate(item.proximaFecha)}` : ""}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-2 text-sm font-semibold italic text-gray-400">Sin desparasitaciones registradas</p>
          )}
        </div>

        {card.salud.historialMedico.length > 0 ? (
          <div className="border-t border-gray-100 pt-4">
            <div className="flex items-center gap-2">
              <ClipboardList size={16} className="text-sky-600" aria-hidden="true" />
              <p className="text-sm font-black uppercase tracking-[0.14em] text-gray-900">Historial médico</p>
              <span className="rounded-full bg-sky-50 px-2.5 py-0.5 text-xs font-extrabold text-sky-700 ring-1 ring-sky-200">
                {card.salud.historialMedico.length}
              </span>
            </div>
            <ul className="mt-3 space-y-2">
              {card.salud.historialMedico.slice(0, 4).map((consulta) => (
                <li key={consulta.motivo} className="border-b border-gray-100 pb-1.5">
                  <p className="text-sm font-bold text-gray-900">
                    {formatCarnetDate(consulta.fecha) ?? "Fecha no registrada"} · {consulta.motivo}
                  </p>
                  {consulta.diagnostico ? (
                    <p className="mt-0.5 text-xs font-semibold text-gray-500">
                      Diagnóstico: {consulta.diagnostico}
                    </p>
                  ) : null}
                </li>
              ))}
            </ul>
          </div>
        ) : (
          <div className="border-t border-gray-100 pt-4">
            <div className="flex items-center gap-2">
              <ClipboardList size={16} className="text-sky-600" aria-hidden="true" />
              <p className="text-sm font-black uppercase tracking-[0.14em] text-gray-900">Historial médico</p>
            </div>
            <p className="mt-2 text-sm font-semibold italic text-gray-400">Sin historial médico registrado</p>
          </div>
        )}

        {card.salud.veterinario ? (
          <div className="border-t border-gray-100 pt-4">
            <div className="flex items-center gap-2">
              <Stethoscope size={16} className="text-gray-500" aria-hidden="true" />
              <p className="text-sm font-black uppercase tracking-[0.14em] text-gray-900">Veterinario</p>
            </div>
            <dl className="mt-3 space-y-1.5">
              <DocRow label="Contacto" value={card.salud.veterinario.nombre || "—"} />
              <DocRow label="Clinica" value={card.salud.veterinario.clinica || "—"} />
              <DocRow label="Telefono" value={card.salud.veterinario.telefono || "—"} />
            </dl>
          </div>
        ) : null}
      </div>
    </section>
  );
}

function AmbulanciaBand({ card }: { card: PhysicalPetCard }) {
  const hasPhone = card.contacto.telefono !== null;
  const hasWhatsapp = card.contacto.whatsappUrl !== null;
  const phoneHref = card.contacto.telefono ? `tel:${card.contacto.telefono.replace(/\s/g, "")}` : null;

  if (!hasPhone && !hasWhatsapp) {
    return (
      <div className="rounded-2xl bg-gray-50 p-4 ring-1 ring-gray-200">
        <p className="flex items-center gap-2 text-sm font-extrabold text-gray-600">
          <Ambulance size={16} aria-hidden="true" /> Contacto de emergencia no registrado
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl bg-rose-50 p-4 ring-1 ring-rose-200">
      <p className="flex items-center gap-2 text-sm font-black uppercase tracking-[0.14em] text-rose-800">
        <Ambulance size={16} aria-hidden="true" /> Contacto de emergencia · {card.mascota.nombre ?? "la mascota"}
      </p>
      <div className="mt-2 flex flex-wrap gap-3">
        {card.contacto.whatsappUrl ? (
          <a
            href={card.contacto.whatsappUrl}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-11 items-center gap-2 rounded-full bg-emerald-600 px-4 py-2 text-sm font-extrabold text-white transition hover:bg-emerald-700 print:hidden"
          >
            <MessageCircle size={16} aria-hidden="true" /> WhatsApp
          </a>
        ) : null}
        {phoneHref ? (
          <a
            href={phoneHref}
            className="inline-flex min-h-11 items-center gap-2 rounded-full bg-gray-950 px-4 py-2 text-sm font-extrabold text-white transition hover:bg-gray-800 print:hidden"
          >
            <Phone size={16} aria-hidden="true" /> Llamar
          </a>
        ) : null}
      </div>
    </div>
  );
}

/**
 * CarnetDocument: representación visual del `PhysicalPetCard` como un
 * documento/ficha física. Es un componente de presentación puro (sin efectos
 * ni lógica de negocio) que recibe únicamente el modelo del Core y se
 * mantiene estable como referencia para futuras salidas imprimibles
 * (PNG / SVG / PDF). El QR se renderiza con `qrcode.react` desde
 * `card.qr.url`; nunca se reconstruye la URL en componentes.
 */
export function CarnetDocument({ card }: CarnetDocumentProps) {
  const vm = toCarnetViewModel(card);
  const horizontal = vm.orientacion === "horizontal";

  return (
    <article
      id="carnet-print"
      aria-label={`Carnet físico de ${card.mascota.nombre ?? "la mascota"} (${vm.formatoLabel})`}
      className="print-panel mx-auto w-full max-w-3xl overflow-hidden rounded-[1.75rem] bg-white text-gray-900 shadow-[0_28px_70px_rgba(17,24,39,0.16)] ring-1 ring-gray-200"
    >
      {/* Letra del documento */}
      <header className="flex flex-wrap items-center justify-between gap-3 border-b-4 border-emerald-500 px-6 py-5 sm:px-8">
        <div>
          <p className="text-[11px] font-black uppercase tracking-[0.26em] text-emerald-700">PetCarnet</p>
          <p className="text-sm font-black text-gray-900">Carnet Digital para Mascotas</p>
        </div>
        <div className="flex items-center gap-2">
          {card.mascota.especie ? (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 text-xs font-extrabold text-gray-600">
              <PawPrint size={13} aria-hidden="true" /> {card.mascota.especie}
            </span>
          ) : null}
          {vm.generadoEn ? (
            <span className="hidden rounded-full border border-gray-200 px-3 py-1 text-xs font-extrabold text-gray-500 sm:inline">
              {vm.generadoEn}
            </span>
          ) : null}
        </div>
      </header>

      <EstadoBand card={card} />

      <div className={`gap-x-10 gap-y-9 p-6 sm:p-8 ${horizontal ? "sm:grid sm:grid-cols-2" : "space-y-9"}`}>
        <div className={horizontal ? "space-y-9" : ""}>
          <IdentityBlock card={card} />
          <QrBlock card={card} />
        </div>

        <div className={`space-y-9 ${horizontal ? "mt-9 sm:mt-0" : ""}`}>
          <ContactBlock card={card} />
          <AmbulanciaBand card={card} />
        </div>

        <div className={horizontal ? "sm:col-span-2" : ""}>
          <SaludBlock card={card} />
        </div>
      </div>

      <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-200 bg-gray-50 px-6 py-4 sm:px-8">
        <p className="text-xs font-extrabold text-gray-500">
          {card.identificacion.codigoPublico
            ? `ID PetCarnet · ${card.identificacion.codigoPublico}`
            : "ID PetCarnet · Sin código"}
        </p>
        <p className="text-xs font-bold text-gray-400">
          Documento informativo · QR mínimo de impresión {card.print.qrMinimoMm} mm · {vm.formatoLabel.toLowerCase()}
        </p>
      </footer>
    </article>
  );
}