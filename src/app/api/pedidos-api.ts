import { Observable } from 'rxjs';

import { Alergeno, Familia, ProductoApi } from '../models/carta.models';
import { Local } from '../models/local.models';
import { ValidacionCargo, ValidacionCliente } from '../models/cliente.models';
import { Pedido, PedidoConfirmado } from '../models/pedido.models';

/** Carta de un local: familias y productos, tal cual los devuelve la API. */
export interface CartaLocal {
  familias: Familia[];
  productos: ProductoApi[];
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

  /** Carta del local: familias y productos del menú. */
  abstract getCarta(codtpv: string, codmenu: number): Observable<CartaLocal>;

  /**
   * Catálogo de alérgenos de la empresa (código + descripción en un idioma).
   * Los códigos son los que se asocian a los productos.
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
