import { CartaApi, Local } from './local.models';
import { ZonaApi } from './zona.models';
import {
  Alergeno,
  FamiliaApi,
  ProductoApi,
  SubfamiliaApi,
} from './carta.models';

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
  /** Idiomas de trabajo de la empresa, en orden (códigos ISO 639-1). */
  idiomas: string[];
  /** Catálogo de cartas de la empresa (crudo). */
  cartas: CartaApi[];
}

/** Respuesta del endpoint de alérgenos. */
export interface RespuestaAlergenos extends RespuestaApi {
  alergenos: Alergeno[];
}

/** Respuesta de `getCarta`. */
export interface RespuestaCarta extends RespuestaApi {
  familias: FamiliaApi[];
  productos: ProductoApi[];
  subfamilias: SubfamiliaApi[];
}

/** Respuesta de `getPuntosPedidos`: zonas con sus puntos. */
export interface RespuestaPuntos extends RespuestaApi {
  zonas: ZonaApi[];
}

/** Respuesta de `registraCliente`. */
export interface RespuestaRegistroCliente extends RespuestaApi {
  /**
   * Nº de reserva en base64 (solo cuando `errnum === 0`). Es el dato que se
   * guarda como código de cliente registrado. `errnum` 1/2 → habitación no
   * ocupada o documento no registrado en esa habitación.
   */
  reserva?: string;
}

/** Respuesta de `recuperaCredito`: crédito disponible para cargo a habitación. */
export interface RespuestaCredito extends RespuestaApi {
  /** Nº de reserva consultado. */
  nreserva?: number;
  /**
   * Crédito disponible como cadena decimal con punto (p. ej. "0.00",
   * "125.50"). Puede ser 0. Ausente si no se pudo recuperar.
   */
  credito?: string;
}

/** Respuesta de `grabaLineas` (crear pedido). */
export interface RespuestaGrabaPedido extends RespuestaApi {
  /** Nº de mesa asignado al pedido web (≥ 1000). */
  mesa: string;
  /** Código de cabecera del pedido (`cabecera_mesas.codigo`). */
  codenl: number;
  /** Nº de líneas grabadas. */
  nlineas: number;
}
