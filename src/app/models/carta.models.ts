/**
 * Modelos de la carta. Reflejan lo que devuelve `getCarta`, más una versión
 * normalizada para la app (precios numéricos, alérgenos como lista de códigos).
 */

/** Idiomas soportados por la interfaz. */
export type Idioma = 'es' | 'en' | 'fr' | 'de';

/** Texto traducido a los idiomas soportados (interfaz y alérgenos). */
export type TextoLocalizado = Record<Idioma, string>;

/** Familia tal cual llega de la API. Los productos enlazan por `pos`. */
export interface Familia {
  codigo: number;
  descripcion: string;
  pos: number;
}

/** Producto tal cual llega de la API (campos en texto). */
export interface ProductoApi {
  /** Coincide con `Familia.pos`, no con `Familia.codigo`. */
  familia: number;
  /** Código del producto (ojo: aquí `codmenu` es el producto, no el menú). */
  codmenu: number;
  tmenu: string;
  descripcion: string;
  /** Precio como texto, p. ej. "4.00". */
  euros: string;
  /** Códigos de alérgeno entre pipes, p. ej. "|1|3|7|". */
  alergenos: string;
  orden: number;
  pensiones: string;
  codfam: string;
  /** Subfamilia: determinará qué extras admite el producto. */
  codsub: string;
  /** "S" si el producto puede usarse como extra de otro. */
  es_extra: string;
  /**
   * Solo aplica a los extras: "S" si, además de servir como extra, se muestra
   * como producto en su familia.
   */
  ver_extra: string;
}

/** Producto normalizado para uso interno. */
export interface Producto {
  codigo: number;
  /** `pos` de la familia a la que pertenece. */
  familiaPos: number;
  nombre: string;
  precio: number;
  /** Códigos de alérgeno. */
  alergenos: number[];
  orden: number;
  codsub: string;
  esExtra: boolean;
  /** Ruta de la imagen (`img/platos/plato-{tmenu}-{codigo}.webp`). */
  imagen: string;
  /**
   * Se muestra en la carta al huésped: los productos normales siempre, y los
   * extras solo si además se venden sueltos (`ver_extra = "S"`).
   */
  visible: boolean;
}

/** Ruta de la imagen de un producto. */
export function imagenProducto(tmenu: string | number, codigo: number): string {
  return `img/platos/plato-${tmenu}-${codigo}.webp`;
}

/** Imagen genérica cuando el producto no tiene foto. */
export const IMAGEN_PRODUCTO_GENERICA = 'img/platos/plato-0-0.svg';

/** Alérgeno tal cual llega de la API (descripción en un solo idioma). */
export interface Alergeno {
  codigo: number;
  descripcion: string;
}

/** Alérgeno listo para mostrar: nombre traducido e icono resuelto. */
export interface AlergenoResuelto {
  codigo: number;
  nombre: TextoLocalizado;
  /** Ruta relativa al icono (`img/alergenos/aler{codigo}.svg`). */
  icono: string;
}

/** Producto con su familia y sus alérgenos ya resueltos. */
export interface ProductoResuelto extends Omit<Producto, 'alergenos'> {
  familia: Familia;
  alergenos: AlergenoResuelto[];
}

/** Convierte el precio en texto de la API a número. */
export function aPrecio(euros: string): number {
  const n = Number.parseFloat((euros ?? '').replace(',', '.'));
  return Number.isFinite(n) ? n : 0;
}

/** Convierte "|1|3|7|" en [1, 3, 7]. */
export function aCodigosAlergeno(alergenos: string): number[] {
  return (alergenos ?? '')
    .split('|')
    .map((s) => Number.parseInt(s, 10))
    .filter((n) => Number.isFinite(n));
}

/** Normaliza un producto de la API al modelo interno. */
export function normalizarProducto(p: ProductoApi): Producto {
  const esExtra = p.es_extra === 'S';
  return {
    codigo: p.codmenu,
    familiaPos: Number(p.familia),
    nombre: p.descripcion,
    precio: aPrecio(p.euros),
    alergenos: aCodigosAlergeno(p.alergenos),
    orden: p.orden ?? 0,
    codsub: p.codsub ?? '',
    esExtra,
    imagen: imagenProducto(p.tmenu, p.codmenu),
    // Los normales se muestran siempre; los extras, solo si se venden sueltos.
    visible: !esExtra || p.ver_extra === 'S',
  };
}
