/* PetCarnet — Service Worker (FASE 7)
 *
 * Estrategia conservadora y segura para uso en campo:
 *   1. Navegaciones (documentos HTML): network-first, fallback a la copia
 *      cachead localmente y, en último caso, al shell raíz ("/").
 *   2. Assets estáticos con hash/medios públicos (/_next/static, /pets,
 *      /docs, /_next/image, /icon.svg, /manifest.webmanifest):
 *      stale-while-revalidate.
 *   3. Todo lo demás: se ignora. No se cachean respuestas de datos API ni
 *      estados potencialmente inconsistentes.
 *
 * REGLAS:
 *   - Sólo GET y sólo mismo-origen.
 *   - Nunca se cachea una respuesta que no sea `ok`. Los errores de red
 *     nunca se materializan en caché.
 *   - El shell completo no se precachea de forma fija: el instalador guarda
 *     los recursos raíz de forma tolerante (sin abortar en 404 parciales) y
 *     el resto se llena conforme el usuario visita, para respetar el
 *     alcance de la app (páginas SSG, sin backend).
 *
 * Al desplegar una versión nueva, incrementa VERSION para invalidar las
 * cachés antiguas del navegador.
 */

const VERSION = "v1";
const CACHE_NAME = `petcarnet-${VERSION}`;

const SHELL_URLS = ["/", "/manifest.webmanifest", "/icon.svg"];

const STATIC_PREFIXES = new Set(["/_next/static/", "/pets/", "/docs/"]);

const CACHEABLE_URLS = [
  ...SHELL_URLS,
  "/_next/static/",
  "/pets/",
  "/docs/",
  "/favicon.ico",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => precacheTolerant(cache, SHELL_URLS))
      .then(() => self.skipWaiting()),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) =>
        Promise.all(
          keys
            .filter((key) => key !== CACHE_NAME)
            .map((key) => caches.delete(key)),
        ),
      )
      .then(() => self.clients.claim()),
  );
});

self.addEventListener("fetch", (event) => {
  const { request } = event;

  if (request.method !== "GET") {
    return;
  }

  let url;
  try {
    url = new URL(request.url);
  } catch {
    return;
  }

  if (url.origin !== self.location.origin) {
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(networkFirst(request));
    return;
  }

  if (isCacheableStatic(url)) {
    event.respondWith(staleWhileRevalidate(request));
  }
});

async function precacheTolerant(cache, urls) {
  await Promise.all(
    urls.map(async (entry) => {
      try {
        const response = await fetch(entry, { cache: "no-cache" });
        if (response.ok) {
          await cache.put(entry, response);
        }
      } catch {
        /* El recurso no está disponible en instalación; no abortar. */
      }
    }),
  );
}

function isCacheableStatic(url) {
  if (url.pathname === "/_next/image") {
    return true;
  }
  if (CACHEABLE_URLS.includes(url.pathname)) {
    return true;
  }
  for (const prefix of STATIC_PREFIXES) {
    if (url.pathname.startsWith(prefix)) {
      return true;
    }
  }
  return false;
}

async function networkFirst(request) {
  const cache = await caches.open(CACHE_NAME);

  try {
    const response = await fetch(request);
    if (response.ok) {
      await cache.put(request, response.clone());
      return response;
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) {
      return cached;
    }
    const shell = await caches.match("/");
    if (shell) {
      return shell;
    }
    return new Response("Sin conexión y sin copia local", {
      status: 503,
      statusText: "Service Unavailable",
      headers: { "Content-Type": "text/plain; charset=utf-8" },
    });
  }
}

async function staleWhileRevalidate(request) {
  const cached = await caches.match(request);
  if (cached) {
    void revalidateInBackground(request);
    return cached;
  }

  return revalidateInBackground(request);
}

async function revalidateInBackground(request) {
  const cache = await caches.open(CACHE_NAME);
  try {
    const response = await fetch(request);
    if (response.ok) {
      await cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    if (error instanceof Error && error.name === "TypeError") {
      return new Response("", { status: 503 });
    }
    throw error;
  }
}