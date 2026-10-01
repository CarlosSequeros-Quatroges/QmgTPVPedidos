import { TextoLocalizado } from './carta.models';

/** Datos del huésped una vez registrado. */
export interface Cliente {
  /** Código de cliente = nº de reserva (lo devuelve la API en base64). */
  codigo: string;
  /** Número de habitación introducido en el registro. */
  habitacion: string;
  nombre?: string;
}

/** Resultado de registrar a un cliente (habitación + documento del check-in). */
export interface ValidacionCliente {
  valido: boolean;
  cliente?: Cliente;
  /**
   * `ok`: registrado; `datos_invalidos`: faltan habitación o documento;
   * `no_encontrado`: la reserva no existe (habitación no ocupada o el documento
   * no coincide con el check-in de esa habitación).
   */
  motivo?: 'ok' | 'datos_invalidos' | 'no_encontrado';
}

/**
 * Motivo del resultado de validar un cargo a cuenta de habitación.
 * `error`: no se pudo recuperar la información de saldo (fallo o sin respuesta).
 */
export type MotivoCargo = 'ok' | 'sin_saldo' | 'error' | 'codigo_invalido';

/** Respuesta de la API al validar si se puede cargar un importe a la habitación. */
export interface ValidacionCargo {
  permitido: boolean;
  /** Saldo disponible en la cuenta (si el código es válido). */
  saldoDisponible?: number;
  motivo?: MotivoCargo;
  /** Mensaje localizado listo para mostrar. */
  mensaje?: TextoLocalizado;
}
