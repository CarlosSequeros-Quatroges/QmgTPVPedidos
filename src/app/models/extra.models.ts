import { TextoLocalizado } from './carta.models';

/** Un extra se marca para "añadir" (suma precio) o para "quitar" (sin coste). */
export type TipoExtra = 'anadir' | 'quitar';

/** Extra aplicable a un plato (p. ej. "extra queso", "sin cebolla"). */
export interface Extra {
  id: number;
  nombre: TextoLocalizado;
  tipo: TipoExtra;
  /** Delta de precio en € al añadir; para "quitar" normalmente 0. */
  precio: number;
}

/** Extra ya seleccionado dentro de una línea de la cesta (snapshot). */
export interface ExtraSeleccionado {
  extraId: number;
  nombre: TextoLocalizado;
  tipo: TipoExtra;
  precio: number;
}
