/**
 * Extras de un producto. Cada extra es a su vez un producto de la carta; llega
 * de la subfamilia (`producto.codsub` → subfamilia → códigos de producto-extra).
 * El huésped marca cada extra como **con** (lo quiere, suma su precio) o **sin**
 * (no lo quiere, no cobra), o no lo marca.
 */
export type MarcaExtra = 'con' | 'sin';

/** Extra ya seleccionado dentro de una línea de la cesta (snapshot). */
export interface ExtraSeleccionado {
  /** Código del producto-extra (`codmenu`). */
  codigo: string;
  /** Nombre del extra en los 4 slots de idioma. */
  nombres: string[];
  marca: MarcaExtra;
  /** Precio que suma: el del extra si es "con", 0 si es "sin". */
  precio: number;
}
