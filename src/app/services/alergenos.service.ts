import { Injectable, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of, shareReplay, tap } from 'rxjs';

import {
  Alergeno,
  AlergenoResuelto,
  TextoLocalizado,
} from '../models/carta.models';

/** Entrada de la tabla local `public/data/alergenos.json`. */
interface TextoAlergeno {
  codigo: number;
  icono: string;
  nombre: TextoLocalizado;
}

const TABLA = 'data/alergenos.json';

/** Icono usado cuando el código no está en la tabla. */
export const ICONO_ALERGENO_GENERICO = 'img/alergenos/aler00.svg';

/**
 * Combina el catálogo de alérgenos que devuelve la API (qué alérgenos hay y
 * con qué código) con la tabla local `data/alergenos.json`, que aporta las
 * traducciones a los 4 idiomas y el icono.
 *
 * La tabla es un recurso público: se puede corregir o ampliar sin recompilar.
 * Si llega un código que no está en ella (alérgeno añadido a mano en gestión),
 * se muestra la descripción de la API con el icono genérico `aler00.svg`.
 */
@Injectable({ providedIn: 'root' })
export class AlergenosService {
  private readonly http = inject(HttpClient);

  private readonly _tabla = signal<Map<number, TextoAlergeno>>(new Map());
  private tabla$?: Observable<unknown>;

  /** Carga la tabla local una sola vez. */
  asegurarTabla(): Observable<unknown> {
    if (this._tabla().size) return of(null);
    if (!this.tabla$) {
      this.tabla$ = this.http.get<TextoAlergeno[]>(TABLA).pipe(
        tap((filas) =>
          this._tabla.set(new Map(filas.map((f) => [f.codigo, f]))),
        ),
        shareReplay(1),
      );
    }
    return this.tabla$;
  }

  /** Traduce y asigna icono a un alérgeno recibido de la API. */
  resolver(alergeno: Alergeno): AlergenoResuelto {
    const fila = this._tabla().get(alergeno.codigo);
    if (fila) {
      return {
        codigo: alergeno.codigo,
        nombre: fila.nombre,
        icono: fila.icono,
      };
    }
    // Código desconocido: se usa la descripción de la API en todos los idiomas.
    const desc = alergeno.descripcion;
    return {
      codigo: alergeno.codigo,
      nombre: { es: desc, en: desc, fr: desc, de: desc },
      icono: ICONO_ALERGENO_GENERICO,
    };
  }
}
