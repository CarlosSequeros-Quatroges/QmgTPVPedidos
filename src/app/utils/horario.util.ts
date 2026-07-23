import { FranjaHoraria, HorarioPedidos } from '../models/local.models';

/** Convierte "HH:mm" a minutos desde medianoche. */
function aMinutos(hhmm: string): number {
  const [h, m] = hhmm.split(':').map(Number);
  return (h || 0) * 60 + (m || 0);
}

/** ¿Una franja cruza la medianoche? (hasta <= desde) */
function cruzaMedianoche(f: FranjaHoraria): boolean {
  return aMinutos(f.hasta) <= aMinutos(f.desde);
}

/**
 * Día de la semana en la numeración de la API: **0 = lunes … 6 = domingo**.
 * `Date.getDay()` usa 0 = domingo, de ahí el desplazamiento.
 */
export function diaSemana(fecha: Date): number {
  return (fecha.getDay() + 6) % 7;
}

/**
 * Indica si el local acepta pedidos en el instante `ahora`.
 * Contempla franjas que cruzan la medianoche: una franja del día anterior
 * puede seguir abierta en las primeras horas de hoy.
 */
export function estaAbierto(horario: HorarioPedidos, ahora: Date): boolean {
  const dia = diaSemana(ahora);
  const min = ahora.getHours() * 60 + ahora.getMinutes();

  // Franjas de hoy.
  for (const f of horario.dias?.[dia] ?? []) {
    const desde = aMinutos(f.desde);
    const hasta = aMinutos(f.hasta);
    if (cruzaMedianoche(f)) {
      if (min >= desde) return true; // desde .. medianoche
    } else if (min >= desde && min < hasta) {
      return true;
    }
  }

  // Franjas de ayer que cruzan la medianoche y siguen abiertas hoy.
  const ayer = (dia + 6) % 7;
  for (const f of horario.dias?.[ayer] ?? []) {
    if (cruzaMedianoche(f) && min < aMinutos(f.hasta)) return true;
  }

  return false;
}

/**
 * Próxima apertura a partir de `ahora`, buscando en los próximos 7 días.
 * Devuelve la fecha de apertura o `null` si el local no tiene franjas.
 */
export function proximaApertura(
  horario: HorarioPedidos,
  ahora: Date,
): Date | null {
  const hoy = diaSemana(ahora);
  for (let offset = 0; offset <= 7; offset++) {
    const dia = (hoy + offset) % 7;
    const franjas = [...(horario.dias?.[dia] ?? [])].sort(
      (a, b) => aMinutos(a.desde) - aMinutos(b.desde),
    );
    const base = new Date(
      ahora.getFullYear(),
      ahora.getMonth(),
      ahora.getDate() + offset,
    );
    for (const f of franjas) {
      const apertura = new Date(base.getTime() + aMinutos(f.desde) * 60000);
      if (apertura > ahora) return apertura;
    }
  }
  return null;
}
