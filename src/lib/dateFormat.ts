const MEXICO_TIME_ZONE = "America/Mexico_City";

function parseDateOnly(date: string) {
  const normalizedDate = date.trim();
  const isoMatch = normalizedDate.match(/^(\d{4})-(\d{1,2})-(\d{1,2})$/);
  const mexicanMatch = normalizedDate.match(/^(\d{1,2})[\/,](\d{1,2})[\/,](\d{4})$/);
  const match = isoMatch ?? mexicanMatch;

  if (!match) {
    return null;
  }

  const [, first, second, third] = match;
  const yearText = isoMatch ? first : third;
  const monthText = second;
  const dayText = isoMatch ? third : first;
  const year = Number(yearText);
  const month = Number(monthText);
  const day = Number(dayText);

  if (!year || month < 1 || month > 12 || day < 1 || day > 31) {
    return null;
  }

  return new Date(Date.UTC(year, month - 1, day, 12));
}

export function formatMexicanDate(date: string, month: "short" | "long" = "long") {
  const parsed = parseDateOnly(date);

  if (!parsed) {
    return null;
  }

  return new Intl.DateTimeFormat("es-MX", {
    day: "numeric",
    month,
    year: "numeric",
    timeZone: MEXICO_TIME_ZONE,
  }).format(parsed);
}

export function formatOptionalMexicanDate(date: string | null, month: "short" | "long" = "long") {
  if (!date) {
    return null;
  }

  return formatMexicanDate(date, month);
}

export function getPetAgeText(birthDate: string, fallback?: string) {
  const parsed = parseDateOnly(birthDate);

  if (!parsed) {
    return fallback ?? "Edad no disponible";
  }

  const today = new Date();
  let years = today.getFullYear() - parsed.getUTCFullYear();
  let months = today.getMonth() - parsed.getUTCMonth();

  if (today.getDate() < parsed.getUTCDate()) {
    months -= 1;
  }

  if (months < 0) {
    years -= 1;
    months += 12;
  }

  if (years <= 0) {
    return months === 1 ? "1 mes" : `${Math.max(months, 0)} meses`;
  }

  if (years === 1) {
    return months > 0 ? `1 año ${months} ${months === 1 ? "mes" : "meses"}` : "1 año";
  }

  return months > 0 ? `${years} años ${months} ${months === 1 ? "mes" : "meses"}` : `${years} años`;
}
