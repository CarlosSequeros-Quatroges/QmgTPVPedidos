/**
 * Configuración de la app leída **en tiempo de ejecución** desde
 * `data/config.json` (recurso público editable en el servidor de cada cliente
 * sin recompilar). Sigue la misma convención que otras apps (qMGAgencias):
 *
 * - `useServerEndpoint: "server"` → se usa `server_url` (URL completa). Úsese en
 *   **desarrollo**, donde la app (localhost) y la API están en hosts distintos.
 * - cualquier otro valor → la URL se construye con el **host de acceso**
 *   (`location.origin`) + `endpoint`. Es el caso normal: app y API en el MISMO
 *   servidor, así el mismo build sirve por LAN (`192.168.1.51:8082/…`) y por
 *   dominio público (`…quatrogesvpn.com/…`) sin tocar nada y sin CORS.
 */

/** Path del endpoint por defecto (desde la raíz del host). */
const ENDPOINT_POR_DEFECTO = '/mgwres/rest/pedidos';

/** Ruta del fichero de configuración (relativa al `base href` /pedidos/). */
const RUTA_CONFIG = 'data/config.json';

/** Nombre del parámetro de empresa que espera la API. */
export const PARAM_EMPRESA = 'codemp';

/** Contenido admitido en `data/config.json`. */
interface Config {
  /** Path del endpoint (host:puerto se toma de la URL de acceso). Caso normal. */
  endpoint?: string;
  /** URL base COMPLETA de la API (solo si `useServerEndpoint === "server"`). */
  server_url?: string;
  /** `"server"` = usar `server_url`; cualquier otro = `origin` + `endpoint`. */
  useServerEndpoint?: string;
  /**
   * Qué hacer cuando una imagen no existe/falla: `true` (por defecto) muestra
   * la imagen predeterminada; `false` oculta la imagen y deja solo el texto.
   */
  mostrarImagenPorDefecto?: boolean;
}

function sinBarraFinal(s: string): string {
  return s.replace(/\/+$/, '');
}

/** Calcula la URL base de la API a partir de la config. */
function construir(cfg: Config): string {
  if (cfg.useServerEndpoint?.toLowerCase() === 'server' && cfg.server_url?.trim()) {
    return sinBarraFinal(cfg.server_url.trim());
  }
  const endpoint = cfg.endpoint?.trim() || ENDPOINT_POR_DEFECTO;
  const path = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
  return location.origin + sinBarraFinal(path);
}

let apiBaseActual = construir({});
let mostrarImagenPorDefectoActual = true;

/** URL base de la API en uso. */
export function apiBase(): string {
  return apiBaseActual;
}

/**
 * Si no hay imagen (no existe o falla la descarga): `true` muestra la imagen
 * predeterminada; `false` oculta la imagen y deja solo el texto.
 */
export function mostrarImagenPorDefecto(): boolean {
  return mostrarImagenPorDefectoActual;
}

/**
 * Lee `data/config.json` y fija la URL de la API. Se llama **antes de arrancar
 * Angular**, para que interceptor y servicios usen ya el valor definitivo. Si
 * falta el fichero o falla, se usa `origin` + endpoint por defecto.
 */
export async function cargarConfig(): Promise<void> {
  let cfg: Config = {};
  try {
    const r = await fetch(RUTA_CONFIG, { cache: 'no-cache' });
    if (r.ok) cfg = (await r.json()) as Config;
  } catch {
    /* sin conexión o fichero ausente: se usa el valor por defecto */
  }
  apiBaseActual = construir(cfg);
  if (typeof cfg.mostrarImagenPorDefecto === 'boolean') {
    mostrarImagenPorDefectoActual = cfg.mostrarImagenPorDefecto;
  }
}
