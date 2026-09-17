export function toE164Digits(value: string): string {
  const digits = value.replace(/\D/g, "");

  if (digits.length === 10) {
    return `52${digits}`;
  }

  if (
    (digits.length === 12 && digits.startsWith("52")) ||
    (digits.length === 13 && digits.startsWith("521"))
  ) {
    return digits;
  }

  return digits;
}

export function buildWhatsAppHref(number: string, message: string): string {
  const digits = toE164Digits(number);
  if (!digits || message.trim() === "") {
    return "";
  }
  return `https://wa.me/${digits}?text=${encodeURIComponent(message.trim())}`;
}
