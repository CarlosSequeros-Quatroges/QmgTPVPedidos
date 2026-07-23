/** Servicio que se presta en una franja: Desayuno, Almuerzo o Cena. */
export type TipoServicio = 'D' | 'A' | 'C';

/**
 * Franja horaria de pedidos, en formato "HH:mm".
 * Si `hasta` <= `desde`, la franja salta al día siguiente (cruza medianoche).
 */
export interface FranjaHoraria {
  desde: string;
  hasta: string;
  tipo: TipoServicio;
}

/**
 * Horario de pedidos por día de la semana, tal cual lo envía la API:
 * clave 0 = lunes … 6 = domingo. Un día sin franjas = cerrado ese día.
 */
export interface HorarioPedidos {
  dias: Record<number, FranjaHoraria[]>;
}

/**
 * Local (punto de venta) devuelto por `getLocales`.
 * `codtpv` es la identidad única del local; `codmenu` indica qué carta de
 * productos usa (varios locales pueden compartir el mismo `codmenu`).
 */
export interface Local {
  codtpv: string;
  nombre: string;
  codmenu: number;
  horario: HorarioPedidos;
}

/**
 * Ruta de la imagen del local. No viene de la API: es un recurso público
 * servido junto a la aplicación, nombrado por `codtpv`.
 */
export function imagenLocal(codtpv: string): string {
  return `img/locales/${codtpv}.svg`;
}
