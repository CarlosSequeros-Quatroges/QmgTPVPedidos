/**
 * Modelos de la carta. Reflejan lo que devuelve `getCarta`, más una versión
 * normalizada para la app.
 *
 * Los textos de familias y productos llegan en 4 slots (`nombre1..4`,
 * `descripcion1..4`). El idioma de cada slot lo define el orden del array
 * `idiomas` de `getLocales` (slot 1 = idiomas[0], etc.).
 */

/** Idiomas soportados por la interfaz de la app. */
export type Idioma = 'es' | 'en' | 'fr' | 'de';

/** Texto traducido a los idiomas soportados (interfaz y alérgenos). */
export type TextoLocalizado = Record<Idioma, string>;

/** Familia tal cual llega de la API. */
export interface FamiliaApi {
  codfamilia: number;
  nombre1: string;
  nombre2: string;
  nombre3: string;
  nombre4: string;
}

/** Familia normalizada: nombre por slot e imagen. */
export interface Familia {
  codfamilia: number;
  /** Nombre en los 4 slots de idioma (índice 0 = slot 1). */
  nombres: string[];
  /** Ruta de la imagen (`img/familias/familia-{codfamilia}.webp`). */
  imagen: string;
}

/** Producto tal cual llega de la API (campos en texto). */
export interface ProductoApi {
  /** Código de producto, con ceros a la izquierda (p. ej. "0015"). */
  codmenu: string;
  tmenu: string;
  /** Enlace a la familia: coincide con `FamiliaApi.codfamilia`. */
  codfam: string;
  /** Precio como texto, p. ej. "4.00". */
  euros: string;
  /** Códigos de alérgeno entre pipes, p. ej. "|1|3|7|". */
  alergenos: string;
  orden: number;
  pensiones: string;
  /** Subfamilia (determinará qué extras admite el producto). */
  codsub: string;
  /** "S" si el producto puede usarse como extra de otro. */
  es_extra: string;
  /** Solo aplica a los extras: "S" si además se vende suelto en su familia. */
  ver_extra: string;
  nombre1: string;
  nombre2: string;
  nombre3: string;
  nombre4: string;
  descripcion1: string;
  descripcion2: string;
  descripcion3: string;
  descripcion4: string;
}

/** Producto normalizado para uso interno. */
export interface Producto {
  /** Código de producto (el `codmenu` de la API, tal cual: "0015"). */
  codigo: string;
  /** Familia a la que pertenece (`codfamilia`). */
  codfamilia: number;
  /** Nombre en los 4 slots de idioma. */
  nombres: string[];
  /** Descripción en los 4 slots de idioma. */
  descripciones: string[];
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

/** Subfamilia tal cual llega de la API (gestiona los extras de un producto). */
export interface SubfamiliaApi {
  codsub: string;
  descripcion: string;
  /** Códigos de producto-extra concatenados entre pipes: "|0277|0278|". */
  extras: string;
}

/** Subfamilia normalizada: `extras` ya separado en array de códigos. */
export interface Subfamilia {
  codsub: string;
  descripcion: string;
  /** Códigos de producto disponibles como extra. */
  extras: string[];
}

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

// --- Rutas de imagen ---

export function imagenProducto(tmenu: string | number, codigo: string): string {
  return `img/platos/plato-${tmenu}-${codigo}.webp`;
}
export const IMAGEN_PRODUCTO_GENERICA = 'img/platos/plato-0-0.svg';

export function imagenFamilia(codfamilia: number): string {
  return `img/familias/familia-${codfamilia}.webp`;
}
export const IMAGEN_FAMILIA_GENERICA = 'img/familias/familia-0.svg';

// --- Normalización ---

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

/** Convierte "|0277|0278|" en ["0277", "0278"] (códigos de producto en texto). */
export function aCodigosExtra(extras: string): string[] {
  return (extras ?? '')
    .split('|')
    .map((s) => s.trim())
    .filter((s) => s.length > 0);
}

/** Normaliza una subfamilia de la API (separa los extras en array). */
export function normalizarSubfamilia(s: SubfamiliaApi): Subfamilia {
  return {
    codsub: s.codsub,
    descripcion: s.descripcion ?? '',
    extras: aCodigosExtra(s.extras),
  };
}

export function normalizarFamilia(f: FamiliaApi): Familia {
  return {
    codfamilia: Number(f.codfamilia),
    nombres: [f.nombre1, f.nombre2, f.nombre3, f.nombre4].map((s) => s ?? ''),
    imagen: imagenFamilia(Number(f.codfamilia)),
  };
}

export function normalizarProducto(p: ProductoApi): Producto {
  const esExtra = p.es_extra === 'S';
  return {
    codigo: p.codmenu,
    codfamilia: Number(p.codfam),
    nombres: [p.nombre1, p.nombre2, p.nombre3, p.nombre4].map((s) => s ?? ''),
    descripciones: [
      p.descripcion1,
      p.descripcion2,
      p.descripcion3,
      p.descripcion4,
    ].map((s) => s ?? ''),
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
