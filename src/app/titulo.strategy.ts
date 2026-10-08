import { Injectable, effect, inject, signal } from '@angular/core';
import { Title } from '@angular/platform-browser';
import { RouterStateSnapshot, TitleStrategy } from '@angular/router';

import { LocalService } from './services/local.service';

/**
 * Compone el título de la pestaña como `{título de la ruta} · {establecimiento}`.
 *
 * Hace falta una estrategia propia porque el router sobrescribe el `<title>` del
 * `index.html` con el de cada ruta, así que ahí no cabría el establecimiento.
 *
 * El título se recompone también cuando cambia el nombre del establecimiento:
 * llega con `getLocales`, normalmente **después** de la primera navegación.
 */
@Injectable({ providedIn: 'root' })
export class TituloConHotel extends TitleStrategy {
  private readonly title = inject(Title);
  private readonly local = inject(LocalService);

  /** Título de la ruta activa, a la espera de componerlo con el hotel. */
  private readonly ruta = signal('');

  constructor() {
    super();
    effect(() => {
      const ruta = this.ruta();
      const hotel = this.local.hotel();
      this.title.setTitle(ruta && hotel ? `${ruta} · ${hotel}` : ruta || hotel);
    });
  }

  override updateTitle(estado: RouterStateSnapshot): void {
    this.ruta.set(this.buildTitle(estado) ?? '');
  }
}
