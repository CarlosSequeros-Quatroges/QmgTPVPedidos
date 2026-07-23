import { Local } from './local.models';
import { Alergeno } from './carta.models';

/**
 * Envoltorio común de las respuestas de la API.
 * `errnum === 0` indica OK; cualquier otro valor es error y se describe en
 * `errdesc` / `msg`.
 */
export interface RespuestaApi {
  errnum: number;
  errdesc: string;
  msg: string;
}

/** Respuesta de `getLocales`. */
export interface RespuestaLocales extends RespuestaApi {
  locales: Local[];
}

/** Respuesta del endpoint de alérgenos. */
export interface RespuestaAlergenos extends RespuestaApi {
  alergenos: Alergeno[];
}
