/**
 * Configuración de la app leída **en tiempo de ejecución** desde
 * `data/config.json`, un recurso público que se puede editar en el servidor de
 * cada cliente sin recompilar ni volver a desplegar la aplicación.
 */

/** URL de la API que se usa si no hay config o no se puede leer. */
const API_BASE_POR_DEFECTO = 'http://192.168.1.51:8082/mgwres/rest/pedidos';

/** Ruta del fichero de configuración (relativa al `base href` /pedidos/). */
const RUTA_CONFIG = 'data/config.json';

/** Nombre del parámetro de empresa que espera la API. */
export const PARAM_EMPRESA = 'codemp';

/** Contenido admitido en `data/config.json`. */
interface Config {
  /** URL base de la API (sin barra final). */
  apiBase?: string;
}

let apiBaseActual = API_BASE_POR_DEFECTO;

/** URL base de la API en uso. */
export function apiBase(): string {
  return apiBaseActual;
}

/**
 * Lee `data/config.json` y fija la URL de la API.
 *
 * Se llama **antes de arrancar Angular**, de modo que el interceptor y los
 * servicios ya trabajan con el valor definitivo. Si el fichero falta, está mal
 * formado o no hay conexión, se conserva el valor por defecto.
 */
export async function cargarConfig(): Promise<void> {
  try {
    const r = await fetch(RUTA_CONFIG, { cache: 'no-cache' });
    if (!r.ok) return;
    const cfg = (await r.json()) as Config;
    const url = cfg.apiBase?.trim();
    if (url) apiBaseActual = url.replace(/\/+$/, '');
  } catch {
    /* sin conexión o fichero ausente: se usa el valor por defecto */
  }
}
