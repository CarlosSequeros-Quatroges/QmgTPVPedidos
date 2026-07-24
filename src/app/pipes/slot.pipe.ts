import { Pipe, PipeTransform } from '@angular/core';

/**
 * Devuelve el texto del slot de idioma indicado de un array de textos
 * (`nombre1..4` / `descripcion1..4`). Si ese slot está vacío, cae al primer
 * texto no vacío disponible.
 *
 * Uso: `{{ producto.nombres | slot: idiomas.slot() }}`
 */
@Pipe({ name: 'slot' })
export class SlotPipe implements PipeTransform {
  transform(textos: string[] | undefined | null, indice: number): string {
    if (!textos?.length) return '';
    return textos[indice] || textos.find((t) => t) || '';
  }
}
