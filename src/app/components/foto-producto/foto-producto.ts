import { Component, computed, input, linkedSignal } from '@angular/core';

import { IMAGEN_PRODUCTO_GENERICA } from '../../models/carta.models';
import { mostrarImagenPorDefecto } from '../../api/api.config';

/**
 * Muestra una foto (producto o familia). Si la imagen no existe o falla al
 * cargar, el comportamiento depende de la config `mostrarImagenPorDefecto`:
 * `true` cae al placeholder; `false` oculta el hueco y deja solo el texto.
 * Al cambiar el `src` el estado de error se reinicia. La imagen se cachea sola
 * al verla (service worker).
 */
@Component({
  selector: 'app-foto-producto',
  imports: [],
  host: {
    '[class.foto-oculta]': 'oculta()',
  },
  template: `
    <img
      class="foto"
      [src]="fallo() && mostrarDefecto ? placeholder() : src()"
      [alt]="alt()"
      (error)="fallo.set(true)"
      loading="lazy"
    />
  `,
  styles: `
    :host { display: block; width: 100%; height: 100%; }
    :host(.foto-oculta) { display: none; }
    .foto { width: 100%; height: 100%; object-fit: cover; display: block; }
  `,
})
export class FotoProducto {
  readonly src = input.required<string>();
  readonly alt = input('');
  readonly placeholder = input(IMAGEN_PRODUCTO_GENERICA);

  /** Config: mostrar imagen predeterminada cuando no hay imagen. */
  protected readonly mostrarDefecto = mostrarImagenPorDefecto();

  /** Se reinicia a `false` cada vez que cambia el `src`. */
  protected readonly fallo = linkedSignal(() => {
    this.src();
    return false;
  });

  /** Imagen fallida y config pide ocultar: se colapsa el hueco (solo texto). */
  protected readonly oculta = computed(() => this.fallo() && !this.mostrarDefecto);
}
