/**
 * Modelos de dominio de la carta.
 * Reflejan la estructura de los JSON servidos por la API (familias, platos, alergenos).
 */
import { Extra } from './extra.models';

/** Idiomas soportados. */
export type Idioma = 'es' | 'en' | 'fr' | 'de';

/** Texto traducido a los idiomas soportados. */
export type TextoLocalizado = Record<Idioma, string>;

/** Categoría de platos (Entrantes, Pescados, …). */
export interface Familia {
  id: number;
  nombre: TextoLocalizado;
  orden: number;
  /** Ruta relativa a la imagen de la familia. */
  imagen: string;
}

/**
 * Alérgeno tal cual llega de la API (de la base de datos).
 * El `codigo` es el que se asocia a los platos; la `descripcion` viene en un
 * solo idioma, por eso la app aporta las traducciones.
 */
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

/** Plato tal cual llega del JSON: referencia familia y alérgenos por id. */
export interface Plato {
  id: number;
  familiaId: number;
  nombre: TextoLocalizado;
  descripcion: TextoLocalizado;
  precio: number;
  imagen: string;
  /** Códigos de los alérgenos presentes en el plato (los de la base de datos). */
  alergenos: number[];
  /** Ids de los extras aplicables al plato (añadir/quitar). */
  extras?: number[];
  disponible: boolean;
}

/**
 * Plato ya cruzado en memoria: familia, alérgenos y extras resueltos a objetos.
 * Es lo que consumen los componentes de presentación.
 */
export interface PlatoResuelto
  extends Omit<Plato, 'familiaId' | 'alergenos' | 'extras'> {
  familia: Familia;
  alergenos: AlergenoResuelto[];
  extras: Extra[];
}

/** Respuesta del endpoint ligero de versión de contenido. */
export interface Version {
  version: number;
  updated_at: string;
}
