import { Observable } from 'rxjs';

import { Alergeno, Familia, Plato } from '../models/carta.models';
import { Extra } from '../models/extra.models';
import { Local } from '../models/local.models';
import { ValidacionCargo, ValidacionCliente } from '../models/cliente.models';
import { Pedido, PedidoConfirmado } from '../models/pedido.models';

/** Carta de productos de un `codmenu` (familias, platos y extras). */
export interface CartaLocal {
  familias: Familia[];
  platos: Plato[];
  extras: Extra[];
}

/**
 * Contrato de la API de pedidos. Clase abstracta para usarla como token de
 * inyección: se provee `HttpPedidosApi` (API real) o `MockPedidosApi` (datos
 * simulados) sin que el resto de la app se entere.
 *
 * El código de empresa (`codemp`) no se pasa en estos métodos: lo añade el
 * interceptor a partir del que viene en la ruta.
 */
export abstract class PedidosApi {
  /** Locales (puntos de venta) disponibles. */
  abstract getLocales(): Observable<Local[]>;

  /** Carta de productos de un menú. Varios locales pueden compartir `codmenu`. */
  abstract getCarta(codmenu: number): Observable<CartaLocal>;

  /**
   * Catálogo de alérgenos de la empresa (código + descripción en un idioma).
   * Los códigos son los que se asocian a los platos.
   */
  abstract getAlergenos(): Observable<Alergeno[]>;

  /**
   * Valida el código de cliente que el huésped recibe en recepción y devuelve
   * sus datos, incluida la **habitación** asociada.
   */
  abstract validarCliente(codigo: string): Observable<ValidacionCliente>;

  /** ¿Se puede cargar `importe` a la cuenta de habitación de `codigo`? */
  abstract validarCargoHabitacion(
    codigo: string,
    importe: number,
  ): Observable<ValidacionCargo>;

  /** Envía el pedido y devuelve la confirmación. */
  abstract crearPedido(pedido: Pedido): Observable<PedidoConfirmado>;
}
