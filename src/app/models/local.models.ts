import { aCodigosFamilia } from './carta.models';

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
  /**
   * Carta que se aplica en esta franja (`codcarta`, string). Un local ofrece
   * varias cartas según la hora; sus cartas son las referidas por sus franjas.
   */
  codcarta?: string;
}

/**
 * Horario de pedidos por día de la semana, tal cual lo envía la API:
 * clave 0 = lunes … 6 = domingo. Un día sin franjas = cerrado ese día.
 */
export interface HorarioPedidos {
  dias: Record<number, FranjaHoraria[]>;
}

/**
 * Carta tal cual llega de la API. `getLocales` trae un catálogo de cartas a
 * nivel raíz (compartido por todos los locales); cada local usa las que
 * referencian sus franjas por `codcarta`.
 */
export interface CartaApi {
  codcarta: string;
  /** Familias que incluye la carta, multivalor entre pipes: "|1|3|". */
  familias: string;
  /** Descripción en los 4 slots de idioma. */
  nombre1: string;
  nombre2: string;
  nombre3: string;
  nombre4: string;
}

/** Carta normalizada: nombre por slot, familias e imagen. */
export interface Carta {
  codcarta: string;
  /** Nombre en los 4 slots de idioma (índice 0 = slot 1). */
  nombres: string[];
  /** Familias (`codfamilia`) que incluye la carta, en orden. */
  codfamilias: number[];
  /** Ruta de la imagen (`img/cartas/carta-{codcarta}.webp`). */
  imagen: string;
}

/**
 * Local (punto de venta) devuelto por `getLocales`.
 * `codtpv` es la identidad única del local; `tmenu` indica qué carta de
 * productos usa (varios locales pueden compartir el mismo `tmenu`).
 *
 * Un local puede ofrecer **varias cartas** según la hora del día: son las
 * cartas referidas por los `codcarta` de sus franjas horarias.
 */
export interface Local {
  codtpv: string;
  nombre: string;
  tmenu: number;
  horario: HorarioPedidos;
}

/**
 * Ruta de la imagen del local. No viene de la API: es un recurso público
 * servido junto a la aplicación, nombrado por `codtpv`.
 */
export function imagenLocal(codtpv: string): string {
  return `img/locales/${codtpv}.svg`;
}

/** Ruta de la imagen de una carta (recurso público, nombrado por `codcarta`). */
export function imagenCarta(codcarta: string): string {
  return `img/cartas/carta-${codcarta}.webp`;
}
export const IMAGEN_CARTA_GENERICA = 'img/cartas/carta-0.svg';

/** Normaliza una carta de la API (nombres a slots, familias e imagen). */
export function normalizarCarta(c: CartaApi): Carta {
  return {
    codcarta: String(c.codcarta),
    nombres: [c.nombre1, c.nombre2, c.nombre3, c.nombre4].map((s) => s ?? ''),
    codfamilias: aCodigosFamilia(c.familias),
    imagen: imagenCarta(String(c.codcarta)),
  };
}

/**
 * Códigos de carta (`codcarta`) que ofrece un local, deducidos de sus franjas
 * horarias, en orden de primera aparición y sin repetir.
 */
export function codcartasDeLocal(local: Local): string[] {
  const vistos = new Set<string>();
  for (const franjas of Object.values(local.horario.dias)) {
    for (const f of franjas) {
      if (f.codcarta != null) vistos.add(f.codcarta);
    }
  }
  return [...vistos];
}
