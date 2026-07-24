import { Component, input, linkedSignal } from '@angular/core';

import { IMAGEN_PRODUCTO_GENERICA } from '../../models/carta.models';

/**
 * Muestra una foto (producto o familia) y, si la imagen no existe o falla al
 * cargar, cae al placeholder indicado. Al cambiar el `src` el estado de error
 * se reinicia. La imagen se cachea sola al verla (service worker).
 */
@Component({
  selector: 'app-foto-producto',
  imports: [],
  template: `
    <img
      class="foto"
      [src]="fallo() ? placeholder() : src()"
      [alt]="alt()"
      (error)="fallo.set(true)"
      loading="lazy"
    />
  `,
  styles: `
    :host { display: block; width: 100%; height: 100%; }
    .foto { width: 100%; height: 100%; object-fit: cover; display: block; }
  `,
})
export class FotoProducto {
  readonly src = input.required<string>();
  readonly alt = input('');
  readonly placeholder = input(IMAGEN_PRODUCTO_GENERICA);

  /** Se reinicia a `false` cada vez que cambia el `src`. */
  protected readonly fallo = linkedSignal(() => {
    this.src();
    return false;
  });
}
