import { TextoLocalizado } from './carta.models';
import { ExtraSeleccionado } from './extra.models';

/**
 * Línea de la cesta. Guarda un snapshot de nombre/precio/imagen del plato para
 * que se pinte igual aunque después cambie la carta.
 */
export interface LineaCesta {
  /** Identificador local único de la línea (crypto.randomUUID). */
  id: string;
  platoId: number;
  nombre: TextoLocalizado;
  precioBase: number;
  imagen: string;
  extras: ExtraSeleccionado[];
  /** Nota de texto para cocina. */
  nota: string;
  cantidad: number;
  /** precioBase + suma de extras "añadir". */
  precioUnitario: number;
  /** precioUnitario * cantidad. */
  subtotal: number;
}
