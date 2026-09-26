/**
 * Escala semántica de color.
 *
 * Regla del sistema: el color nunca decora, comunica. Cada tono tiene un
 * significado fijo y siempre viaja acompañado de icono + texto, nunca color solo.
 *
 * Antes el proyecto usaba nombres de paleta ("mint", "rose", "purple"…). Esos
 * nombres se conservan como alias en `LEGACY_TONE_ALIAS` para no romper imports,
 * pero todo código nuevo debe usar el nombre semántico.
 */

export type ToneName =
  | "brand"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "adoption"
  | "settled"
  | "rescue"
  | "muted";

export type ToneClasses = {
  /** Texto sobre superficie normal. */
  text: string;
  /** Fondo tenue + texto: chips, píldoras, badges. */
  soft: string;
  /** Fondo fuerte + texto inverso: acción primaria de esa familia. */
  solid: string;
  /** Borde del tono. */
  rule: string;
  /** Franja / acento de encabezado. */
  accent: string;
  /** Fondo de un panel grande de estado, sin texto ni anillo. */
  panel: string;
};

export const TONE_CLASSES: Record<ToneName, ToneClasses> = {
  brand: {
    text: "text-brand",
    soft: "bg-brand-soft text-brand-ink ring-brand-rule",
    solid: "bg-brand text-on-solid hover:bg-brand-hover",
    rule: "border-brand-rule",
    accent: "bg-brand",
    panel: "bg-brand-soft",
  },
  success: {
    text: "text-success",
    soft: "bg-success-soft text-success ring-success-rule",
    solid: "bg-success text-on-solid hover:brightness-110",
    rule: "border-success-rule",
    accent: "bg-success",
    panel: "bg-success-soft",
  },
  warning: {
    text: "text-warning",
    soft: "bg-warning-soft text-warning ring-warning-rule",
    solid: "bg-warning text-on-solid hover:brightness-110",
    rule: "border-warning-rule",
    accent: "bg-warning",
    panel: "bg-warning-soft",
  },
  danger: {
    text: "text-danger",
    soft: "bg-danger-soft text-danger ring-danger-rule",
    solid: "bg-danger text-on-solid hover:brightness-110",
    rule: "border-danger-rule",
    accent: "bg-danger",
    panel: "bg-danger-soft",
  },
  info: {
    text: "text-info",
    soft: "bg-info-soft text-info ring-info-rule",
    solid: "bg-info text-on-solid hover:brightness-110",
    rule: "border-info-rule",
    accent: "bg-info",
    panel: "bg-info-soft",
  },
  adoption: {
    text: "text-adoption",
    soft: "bg-adoption-soft text-adoption ring-adoption-rule",
    solid: "bg-adoption text-on-solid hover:brightness-110",
    rule: "border-adoption-rule",
    accent: "bg-adoption",
    panel: "bg-adoption-soft",
  },
  settled: {
    text: "text-settled",
    soft: "bg-settled-soft text-settled ring-settled-rule",
    solid: "bg-settled text-on-solid hover:brightness-110",
    rule: "border-settled-rule",
    accent: "bg-settled",
    panel: "bg-settled-soft",
  },
  rescue: {
    text: "text-rescue",
    soft: "bg-rescue-soft text-rescue ring-rescue-rule",
    solid: "bg-rescue text-on-solid hover:brightness-110",
    rule: "border-rescue-rule",
    accent: "bg-rescue",
    panel: "bg-rescue-soft",
  },
  muted: {
    text: "text-ink-2",
    soft: "bg-muted-soft text-ink-2 ring-muted-rule",
    solid: "bg-ink-2 text-on-solid hover:brightness-110",
    rule: "border-rule",
    accent: "bg-ink-3",
    panel: "bg-muted-soft",
  },
};

/** Alias de la paleta anterior → nombre semántico. */
const LEGACY_TONE_ALIAS: Record<string, ToneName> = {
  mint: "success",
  emerald: "success",
  green: "success",
  teal: "rescue",
  rose: "danger",
  red: "danger",
  pink: "danger",
  yellow: "warning",
  amber: "warning",
  orange: "adoption",
  purple: "adoption",
  violet: "adoption",
  indigo: "settled",
  blue: "info",
  sky: "info",
  gray: "muted",
  grey: "muted",
  stone: "muted",
  slate: "muted",
};

export function resolveTone(tone: string): ToneClasses {
  const name = (LEGACY_TONE_ALIAS[tone] ?? tone) as ToneName;
  return TONE_CLASSES[name] ?? TONE_CLASSES.muted;
}

export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}
