/**
 * Configuración de la app leída **en tiempo de ejecución** desde
 * `data/config.json` (recurso público editable en el servidor de cada cliente
 * sin recompilar).
 *
 * **Normalmente la app y la API están en el MISMO servidor** (mismo host:puerto),
 * así que la URL de la API se construye con el `origin` de la URL con la que se
 * accede + el `apiPath` del endpoint. Así el mismo build sirve para acceso por
 * LAN (`192.168.1.51:8082/…`) y por dominio público (`…quatrogesvpn.com/…`) sin
 * tocar nada y sin CORS (mismo origen).
 *
 * Para **desarrollo** (la app en `localhost:8080` pero la API en otro host) se
 * admite un `apiBase` con la URL completa, que tiene prioridad.
 */

/** Path del endpoint de la API (desde la raíz del host). */
const PATH_POR_DEFECTO = '/mgwres/rest/pedidos';

/** Ruta del fichero de configuración (relativa al `base href` /pedidos/). */
const RUTA_CONFIG = 'data/config.json';

/** Nombre del parámetro de empresa que espera la API. */
export const PARAM_EMPRESA = 'codemp';

/** Contenido admitido en `data/config.json`. */
interface Config {
  /** Path del endpoint (host:puerto se toma de la URL de acceso). Caso normal. */
  apiPath?: string;
  /** URL base COMPLETA de la API. Prioritaria; úsese solo en desarrollo. */
  apiBase?: string;
}

/** Quita barras finales. */
function sinBarraFinal(s: string): string {
  return s.replace(/\/+$/, '');
}

/** Construye la URL base con el `origin` actual + un path. */
function desdeOrigin(path: string): string {
  const p = path.startsWith('/') ? path : `/${path}`;
  return location.origin + sinBarraFinal(p);
}

let apiBaseActual = desdeOrigin(PATH_POR_DEFECTO);

/** URL base de la API en uso. */
export function apiBase(): string {
  return apiBaseActual;
}

/**
 * Lee `data/config.json` y fija la URL de la API. Se llama **antes de arrancar
 * Angular**, para que interceptor y servicios usen ya el valor definitivo.
 * Prioridad: `apiBase` completo (dev) > `origin` + `apiPath` > `origin` + path
 * por defecto. Si falta el fichero o falla, se usa `origin` + path por defecto.
 */
export async function cargarConfig(): Promise<void> {
  let cfg: Config = {};
  try {
    const r = await fetch(RUTA_CONFIG, { cache: 'no-cache' });
    if (r.ok) cfg = (await r.json()) as Config;
  } catch {
    /* sin conexión o fichero ausente: se usa el valor por defecto */
  }

  const base = cfg.apiBase?.trim();
  if (base) {
    apiBaseActual = sinBarraFinal(base);
  } else {
    apiBaseActual = desdeOrigin(cfg.apiPath?.trim() || PATH_POR_DEFECTO);
  }
}
