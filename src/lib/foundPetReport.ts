export type LocationErrorKey = "denied" | "unavailable" | "timeout";

export function formatCoordinate(value: number): string {
  return Number.isFinite(value) ? value.toFixed(6) : "";
}

export function buildMapsLocationUrl(latitude: number, longitude: number): string {
  const lat = formatCoordinate(latitude);
  const lng = formatCoordinate(longitude);
  if (!lat || !lng) {
    return "";
  }
  return `https://www.google.com/maps?q=${lat},${lng}`;
}

export function getLocationErrorKey(code: number | null | undefined): LocationErrorKey {
  if (code === 1) return "denied";
  if (code === 3) return "timeout";
  return "unavailable";
}

export const LOCATION_ERROR_COPY: Record<LocationErrorKey, string> = {
  denied: "No diste permiso a la ubicación. Todavía puedes avisar con un mensaje.",
  unavailable: "No pudimos obtener tu ubicación. Puedes seguir sin compartirla.",
  timeout: "La ubicación tardó demasiado. Puedes seguir sin compartirla.",
};

export type FoundPetMessageOptions = {
  petName: string;
  lastZone?: string | null;
  locationUrl?: string | null;
};

export function buildFoundPetMessage({
  petName,
  lastZone,
  locationUrl,
}: FoundPetMessageOptions): string {
  const lines = [`¡Hola! Escaneé el QR de ${petName} y creo que lo encontré.`];
  if (lastZone && lastZone.trim() !== "") {
    lines.push(`Última vez visto cerca de: ${lastZone.trim()}`);
  }
  if (locationUrl && locationUrl.trim() !== "") {
    lines.push(`Mi ubicación actual: ${locationUrl.trim()}`);
  }
  return lines.join("\n");
}

export function buildWhatsAppHref(number: string, message: string): string {
  const digits = number.replace(/\D/g, "");
  if (!digits || message.trim() === "") {
    return "";
  }
  return `https://wa.me/${digits}?text=${encodeURIComponent(message.trim())}`;
}