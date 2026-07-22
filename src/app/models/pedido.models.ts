import { Idioma } from './carta.models';
import { LineaCesta } from './cesta.models';

/** Forma de pago elegida al finalizar. */
export type FormaPago = 'efectivo' | 'tarjeta' | 'habitacion';

/** Pedido que se envía a la API. El par codtpv/codmenu lo enruta al TPV/menú. */
export interface Pedido {
  codtpv: string;
  codmenu: string;
  lineas: LineaCesta[];
  total: number;
  formaPago: FormaPago;
  /** Presente solo si formaPago === 'habitacion'. */
  codigoCliente?: string;
  idioma: Idioma;
  /** ISO 8601. */
  creadoEn: string;
}

/** Respuesta de la API al crear un pedido. */
export interface PedidoConfirmado {
  id: string;
  estado: 'recibido';
  pedido: Pedido;
}
