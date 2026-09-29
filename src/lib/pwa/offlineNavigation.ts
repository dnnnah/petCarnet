/**
 * Navegación sin conexión (FASE 7B).
 *
 * La PWA no tiene backend: lo que funciona sin conexión es exactamente lo que
 * el service worker tiene en caché, nada más. Este módulo traduce ese hecho en
 * funciones puras y testeables, sin tocar el navegador, y la capa de UI las
 * consume sin reimplementar nada.
 *
 * Principio: mientras hay conexión el navegador no tiene por qué intervenir.
 * La intercepción solo ocurre sin conexión, y solo sobre enlaces internos del
 * propio producto.
 */

export type OfflineNavDecision = "allow" | "block" | "ignore";

export type LinkPrecheckInput = {
  connectivity: "online" | "offline" | "unknown";
  /** Clic con modificador o botón no principal: es "abrir en otra pestaña". */
  modifiedActivation: boolean;
  /** El destino pertenece al propio producto. */
  internal: boolean;
  /** Solo cambia el fragmento: la misma página ya está en pantalla. */
  sameDocument: boolean;
};

/**
 * Primera pasada, sin coste: decide si un clic merece siquiera consultar la
 * caché. Devuelve `inspect` solo cuando la navegación depende de la red y el
 * destino es del producto; en cualquier otro caso devuelve `ignore` y el
 * navegador sigue con su comportamiento normal.
 */
export function resolveLinkPrecheck({
  connectivity,
  modifiedActivation,
  internal,
  sameDocument,
}: LinkPrecheckInput): "inspect" | "ignore" {
  if (modifiedActivation) return "ignore";
  if (!internal) return "ignore";
  if (sameDocument) return "ignore";
  if (connectivity !== "offline") return "ignore";
  return "inspect";
}

export type OfflineNavInput = {
  /** Estado de red del dispositivo (`useOnlineStatus`). */
  connectivity: "online" | "offline" | "unknown";
  /** El service worker tiene el documento de esa ruta en caché. */
  cached: boolean;
};

/**
 * Segunda pasada, ya con la respuesta de la caché.
 *
 * - `allow` → hay copia local: se navega.
 * - `block` → sin copia local: se detiene y la UI explica por qué.
 *
 * `unknown` (SSR y primer render cliente) nunca bloquea: convertir una
 * suposición sobre la red en una pantalla de error sería Peor que la duda.
 */
export function resolveOfflineNavigation({
  connectivity,
  cached,
}: OfflineNavInput): OfflineNavDecision {
  if (connectivity !== "offline") return "allow";
  return cached ? "allow" : "block";
}

export type InternalTarget = {
  /** El destino pertenece al mismo origen que la aplicación. */
  internal: boolean;
  /** Ruta normalizada del destino (`/perfil/lucca`). */
  pathname: string;
  /** Solo cambia el fragmento respecto a la URL actual. */
  sameDocument: boolean;
};

/**
 * Resuelve un `href` de enlace contra la URL actual. Tolera `href` relativos,
 * con fragmento y con query string, y nunca lanza con entradas inválidas.
 *
 * Se usa `new URL(href, base)` en vez de validación con regex porque es lo que
 * el navegador hará igualmente: cualquier diferencia de interpretación entre
 * esta función y el navegador sería un agujero por el que se colaría una
 * navegación no vigilada.
 */
export function resolveInternalTarget(
  href: string | null | undefined,
  currentUrl: string
): InternalTarget | null {
  if (typeof href !== "string" || href === "") {
    return null;
  }

  let base: URL;
  let target: URL;
  try {
    base = new URL(currentUrl);
    target = new URL(href, base);
  } catch {
    return null;
  }

  const sameDocument =
    target.origin === base.origin &&
    target.pathname === base.pathname &&
    target.search === base.search;

  return {
    internal: target.origin === base.origin,
    pathname: target.pathname,
    sameDocument,
  };
}

/** Normaliza un `pathname` a la forma con la que se consulta la caché. */
export function toCacheKey(pathname: string): string {
  if (pathname === "" || pathname === "/") return "/";

  const trimmed = pathname.replace(/\/+$/, "");
  return trimmed === "" ? "/" : trimmed;
}

/**
 * Rutas principales del producto. No decide nada: documenta qué secciones la
 * experiencia de campo espera encontrar disponibles sin conexión **si fueron
 * abiertas antes**. La disponibilidad real siempre la responde la caché.
 */
export const PRIMARY_ROUTES = [
  "/",
  "/adopciones",
  "/login",
  "/perfil",
  "/refugios",
] as const;
