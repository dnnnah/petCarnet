import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { OfflineStatusView } from "./OfflineStatus";
import { OfflineRouteNotice } from "./OfflineRouteNotice";
import type { ConnectivitySnapshot } from "@/lib/pwa/connectivityStore";
import {
  OFFLINE_BANNER_COPY,
  OFFLINE_RETURNED_COPY,
  OFFLINE_ROUTE_BLOCKED_COPY,
} from "@/lib/pwa/copy";

/**
 * Se renderiza con `renderToStaticMarkup` porque el proyecto no usa jsdom ni
 * Testing Library. Es suficiente para fijar el HTML, los roles de
 * accesibilidad y la ausencia de contenido: lo que importa aquí no son los
 * clics, sino que el servidor y el cliente produzcan el mismo marcado.
 */

function renderStatus(snapshot: ConnectivitySnapshot): string {
  return renderToStaticMarkup(createElement(OfflineStatusView, { snapshot }));
}

const SIN_CONEXION: ConnectivitySnapshot = { phase: "offline", recovered: false };
const RECUPERADA: ConnectivitySnapshot = { phase: "online", recovered: true };
const CONECTADO: ConnectivitySnapshot = { phase: "online", recovered: false };
const DESCONOCIDO: ConnectivitySnapshot = { phase: "unknown", recovered: false };

describe("OfflineStatusView", () => {
  it("no dibuja nada cuando el estado es desconocido", () => {
    // Este es el marcado del servidor y del primer render cliente. Si aquí se
    // pintara algo, la página cambiaría al hidratar y Next avisaría del fallo.
    expect(renderStatus(DESCONOCIDO)).toBe("");
  });

  it("no dibuja nada con conexión y sin haberla perdido nunca", () => {
    // En campo la señal suele funcionar, y un "todo bien" permanente solo roba
    // altura y distrae de lo importante: el carnet de la mascota.
    expect(renderStatus(CONECTADO)).toBe("");
  });

  it("avisa al quedarse sin conexión", () => {
    const html = renderStatus(SIN_CONEXION);
    expect(html).toContain(OFFLINE_BANNER_COPY.titulo);
    expect(html).toContain('data-pwa-status="offline"');
  });

  it("dice qué se puede seguir haciendo, no solo que falta algo", () => {
    // Un aviso que solo dice "sin conexión" deja a la persona sin saber si puede
    // trabajar o si debe esperar a que la señal vuelva.
    const html = renderStatus(SIN_CONEXION);
    expect(html).toContain(OFFLINE_BANNER_COPY.cuerpo);
    expect(html).toContain("este dispositivo");
  });

  it("ofrece una salida hacia la portada", () => {
    // Sin salida, el aviso solo informa de un problema que la persona no puede
    // resolver. La portada está precacheada, así que el enlace funciona.
    const html = renderStatus(SIN_CONEXION);
    expect(html).toContain('href="/"');
    expect(html).toContain(OFFLINE_BANNER_COPY.accion);
  });

  it("avisa brevemente de que volvió la conexión", () => {
    const html = renderStatus(RECUPERADA);
    expect(html).toContain(OFFLINE_RETURNED_COPY.titulo);
    expect(html).toContain('data-pwa-status="recovered"');
  });

  it("no ofrece ir a inicio cuando la señal ya volvió", () => {
    // Ofrecer un enlace a inicio con conexión añadiría un paso sin sentido en
    // el momento exacto en que la app ya volvió a funcionar sola.
    const html = renderStatus(RECUPERADA);
    expect(html).not.toContain('href="/"');
  });

  it("se anuncia como región viva cortés, sin robar el foco", () => {
    // `role="alert"` interrumpiría lo que se está leyendo. Perder la conexión en
    // mitad de una consulta no debería cortar a la persona.
    const html = renderStatus(SIN_CONEXION);
    expect(html).toContain('role="status"');
    expect(html).toContain('aria-live="polite"');
    expect(html).not.toContain('role="alert"');
  });

  it("usa tokens de color, no colores sueltos", () => {
    // El proyecto define su paleta como tokens: un color en hexadecimal aquí se
    // quedaría fuera del tema claro/oscuro y rompería el diseño.
    const html = renderStatus(SIN_CONEXION) + renderStatus(RECUPERADA);
    expect(html).not.toMatch(/#[0-9a-f]{3,8}/i);
  });

  it("no nombra ningún servidor, porque no hay ninguno", () => {
    const html = renderStatus(SIN_CONEXION) + renderStatus(RECUPERADA);
    expect(html.toLowerCase()).not.toContain("servidor");
  });
});

describe("OfflineRouteNotice", () => {
  const noop = () => undefined;

  function renderNotice(blockedPath: string | null): string {
    return renderToStaticMarkup(
      createElement(OfflineRouteNotice, { blockedPath, onDismiss: noop })
    );
  }

  it("no dibuja nada si no hay ruta bloqueada", () => {
    expect(renderNotice(null)).toBe("");
  });

  it("explica la ruta que no se puede abrir", () => {
    const html = renderNotice("/refugios");
    expect(html).toContain(OFFLINE_ROUTE_BLOCKED_COPY.titulo);
    expect(html).toContain(OFFLINE_ROUTE_BLOCKED_COPY.cuerpo);
  });

  it("da una salida real: volver a inicio", () => {
    // Sin esto el aviso deja a la persona atrapada en una pantalla que no puede
    // usar, sin ninguna acción posible.
    const html = renderNotice("/refugios");
    expect(html).toContain('href="/"');
    expect(html).toContain(OFFLINE_ROUTE_BLOCKED_COPY.accion);
  });

  it("permite quedarse donde está", () => {
    // Cerrar el aviso y seguir leyendo el carnet es tan válido como irse a
    // inicio; la UI no debe obligar a una de las dos salidas.
    const html = renderNotice("/refugios");
    expect(html).toContain("Seguir aquí");
  });

  it("se anuncia como región viva cortés", () => {
    // El aviso llega por una acción de la propia persona, así que no necesita
    // interrumpir con `role="alert"`.
    const html = renderNotice("/refugios");
    expect(html).toContain('role="status"');
    expect(html).not.toContain('role="alert"');
  });

  it("no culpa a quien lo usa y no promete sincronización", () => {
    const html = renderNotice("/refugios").toLowerCase();
    expect(html).not.toContain("sincroniz");
    expect(html).not.toContain("error");
    expect(html).toContain("en línea");
  });

  it("usa tokens de color", () => {
    expect(renderNotice("/refugios")).not.toMatch(/#[0-9a-f]{3,8}/i);
  });
});
