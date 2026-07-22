import { TextoLocalizado } from './carta.models';

/**
 * Franja horaria de pedidos "HH:mm"–"HH:mm".
 * Si `hasta` <= `desde` se interpreta que cruza la medianoche.
 */
export interface FranjaHoraria {
  desde: string;
  hasta: string;
}

/**
 * Horario de pedidos por día de la semana (0=domingo … 6=sábado, según Date.getDay()).
 * Cada día tiene 0..n franjas. Un día sin entrada = cerrado ese día.
 */
export interface HorarioPedidos {
  dias: Record<number, FranjaHoraria[]>;
  /** Informativo; el mock evalúa con la hora local del dispositivo. */
  zonaHoraria?: string;
}

/**
 * "Carga" = punto de venta (restaurante/bar del hotel).
 * Se identifica por el par codtpv + codmenu, que se usan para recuperar la
 * carta y para enviar el pedido al TPV/menú correctos.
 */
export interface Carga {
  codtpv: string;
  codmenu: string;
  nombre: TextoLocalizado;
  descripcion?: TextoLocalizado;
  /** Ruta relativa a la imagen del local. */
  imagen: string;
  horario: HorarioPedidos;
}

/** Datos del restaurante que acompañan a la carta (nombre + horario de pedidos). */
export interface Restaurante {
  codtpv: string;
  codmenu: string;
  nombre: TextoLocalizado;
  horario: HorarioPedidos;
}

/** Clave estable de un local. */
export function claveCarga(c: {
  codtpv: string;
  codmenu: string;
}): string {
  return `${c.codtpv}-${c.codmenu}`;
}
