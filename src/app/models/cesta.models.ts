import { ExtraSeleccionado } from './extra.models';

/**
 * Línea de la cesta. Guarda un snapshot del nombre y el precio del producto
 * para que se pinte igual aunque después cambie la carta.
 */
export interface LineaCesta {
  /** Identificador local único de la línea (crypto.randomUUID). */
  id: string;
  /** Código del producto (el `codmenu` de la API). */
  codProducto: number;
  nombre: string;
  imagen: string;
  precioBase: number;
  /** Extras añadidos (pendiente de `getSubFamilias`). */
  extras: ExtraSeleccionado[];
  /** Nota de texto para cocina. */
  nota: string;
  cantidad: number;
  /** precioBase + suma de extras. */
  precioUnitario: number;
  /** precioUnitario * cantidad. */
  subtotal: number;
}
