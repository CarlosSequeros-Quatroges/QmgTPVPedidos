import { TextoLocalizado } from './carta.models';

/** Motivo del resultado de validar un cargo a cuenta de habitación. */
export type MotivoCargo = 'ok' | 'sin_saldo' | 'codigo_invalido';

/** Respuesta de la API al validar si se puede cargar un importe a la habitación. */
export interface ValidacionCargo {
  permitido: boolean;
  /** Saldo disponible en la cuenta (si el código es válido). */
  saldoDisponible?: number;
  motivo?: MotivoCargo;
  /** Mensaje localizado listo para mostrar. */
  mensaje?: TextoLocalizado;
}
