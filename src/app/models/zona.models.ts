/**
 * Zonas y puntos de pedido (dónde se sirve/recoge el pedido), de
 * `getPuntosPedidos`. Los nombres llegan en 4 slots de idioma, como el resto
 * del contenido (se muestran con `SlotPipe`).
 *
 * El `codigo` del punto no es único (puede venir "000" repetido); el
 * identificador único del punto es su `id` numérico.
 */

/** Punto de pedido tal cual llega de la API (p. ej. una hamaca). */
export interface PuntoApi {
  id: number;
  codigo: string;
  nombre1: string;
  nombre2: string;
  nombre3: string;
  nombre4: string;
}

/** Punto de pedido normalizado. */
export interface Punto {
  id: number;
  codigo: string;
  /** Nombre en los 4 slots de idioma (índice 0 = slot 1). */
  nombres: string[];
}

/** Zona tal cual llega de la API (p. ej. PISCINA), con sus puntos. */
export interface ZonaApi {
  id: number;
  codigo: string;
  nombre1: string;
  nombre2: string;
  nombre3: string;
  nombre4: string;
  puntos: PuntoApi[];
}

/** Zona normalizada con sus puntos. */
export interface Zona {
  id: number;
  codigo: string;
  /** Nombre en los 4 slots de idioma (índice 0 = slot 1). */
  nombres: string[];
  puntos: Punto[];
}

function aSlots(n1: string, n2: string, n3: string, n4: string): string[] {
  return [n1, n2, n3, n4].map((s) => s ?? '');
}

export function normalizarPunto(p: PuntoApi): Punto {
  return {
    id: p.id,
    codigo: String(p.codigo ?? ''),
    nombres: aSlots(p.nombre1, p.nombre2, p.nombre3, p.nombre4),
  };
}

export function normalizarZona(z: ZonaApi): Zona {
  return {
    id: z.id,
    codigo: String(z.codigo ?? ''),
    nombres: aSlots(z.nombre1, z.nombre2, z.nombre3, z.nombre4),
    puntos: (z.puntos ?? []).map(normalizarPunto),
  };
}
