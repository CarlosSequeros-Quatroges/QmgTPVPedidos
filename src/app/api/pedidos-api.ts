import { Observable } from 'rxjs';

import {
  Alergeno,
  FamiliaApi,
  ProductoApi,
  SubfamiliaApi,
} from '../models/carta.models';
import { Carta, Local } from '../models/local.models';
import { Zona } from '../models/zona.models';
import { ValidacionCargo, ValidacionCliente } from '../models/cliente.models';
import { Pedido, PedidoConfirmado } from '../models/pedido.models';

/** Carta de un local: familias, productos y subfamilias (extras). */
export interface CartaLocal {
  familias: FamiliaApi[];
  productos: ProductoApi[];
  /** Subfamilias que definen los extras admitidos por cada producto (codsub). */
  subfamilias: SubfamiliaApi[];
}

/** Respuesta de `getLocales`: locales, idiomas y catálogo de cartas. */
export interface LocalesEmpresa {
  locales: Local[];
  idiomas: string[];
  /** Catálogo de cartas de la empresa (los locales las usan por `codcarta`). */
  cartas: Carta[];
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
  /** Locales (puntos de venta) e idiomas de trabajo de la empresa. */
  abstract getLocales(): Observable<LocalesEmpresa>;

  /**
   * Carta del local: todas las familias y productos del menú `tmenu`. El
   * filtrado por carta lo hace el cliente con las familias que declara cada
   * carta en `getLocales`.
   */
  abstract getCarta(codtpv: string, tmenu: number): Observable<CartaLocal>;

  /**
   * Catálogo de alérgenos de la empresa (código + descripción en un idioma).
   * Los códigos son los que se asocian a los productos.
   */
  abstract getAlergenos(): Observable<Alergeno[]>;

  /**
   * Zonas y puntos de pedido de la empresa (dónde se sirve/recoge el pedido).
   */
  abstract getPuntosPedidos(): Observable<Zona[]>;

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
