import { Pipe, PipeTransform } from '@angular/core';

import { Idioma, TextoLocalizado } from '../models/carta.models';

/**
 * Resuelve un texto localizado al idioma indicado.
 *
 * Se pasa el idioma como argumento (`{{ texto | loc: idioma() }}`) para que el
 * pipe, siendo puro, se recalcule cuando cambia el signal de idioma.
 */
@Pipe({ name: 'loc' })
export class LocPipe implements PipeTransform {
  transform(valor: TextoLocalizado | undefined | null, idioma: Idioma): string {
    if (!valor) return '';
    return valor[idioma] ?? valor.es ?? '';
  }
}
