import { Observable } from 'rxjs';

import { Alergeno, Familia, Plato } from '../models/carta.models';
import { Extra } from '../models/extra.models';
import { Carga, Restaurante } from '../models/local.models';
import { ValidacionCargo } from '../models/cliente.models';
import { Pedido, PedidoConfirmado } from '../models/pedido.models';

/** Carta completa de un local: restaurante (nombre + horario) + contenido. */
export interface CartaLocal {
  restaurante: Restaurante;
  familias: Familia[];
  platos: Plato[];
  alergenos: Alergeno[];
  extras: Extra[];
}

/**
 * Contrato de la API de pedidos. Es una clase abstracta para usarla como token
 * de inyección: en desarrollo se provee `MockPedidosApi`; para producción bastará
 * con proveer una `HttpPedidosApi` contra la API real cambiando una sola línea
 * en `app.config.ts`. El resto de la app depende solo de esta abstracción.
 */
export abstract class PedidosApi {
  /** Puntos de venta disponibles (restaurantes/bares del hotel). */
  abstract getCargas(): Observable<Carga[]>;

  /** Carta de un local, identificado por el par codtpv + codmenu. */
  abstract getCarta(codtpv: string, codmenu: string): Observable<CartaLocal>;

  /** ¿Se puede cargar `importe` a la cuenta de habitación de `codigo`? */
  abstract validarCargoHabitacion(
    codigo: string,
    importe: number,
  ): Observable<ValidacionCargo>;

  /** Envía el pedido y devuelve la confirmación. */
  abstract crearPedido(pedido: Pedido): Observable<PedidoConfirmado>;
}
