import { Idioma } from './carta.models';
import { LineaCesta } from './cesta.models';

/** Forma de pago elegida al finalizar. */
export type FormaPago = 'efectivo' | 'tarjeta' | 'habitacion';

/**
 * Pedido que se envía a la API: se hace **desde** `codtpv` con productos del
 * menú `tmenu`, y se entrega en el punto de pedido `codpunto`.
 */
export interface Pedido {
  codtpv: string;
  tmenu: number;
  /** Zona de entrega (`codigo` de zona, ≤4 caracteres). */
  codzona?: string;
  /** Punto de entrega dentro de la zona (`codigo` de punto, 3 dígitos). */
  codpunto?: string;
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
  /** Nº de mesa asignado por el backend (≥ 1000). */
  mesa?: string;
  /** Código de cabecera del pedido. */
  codenl?: number;
  /** Nº de líneas grabadas. */
  nlineas?: number;
}
