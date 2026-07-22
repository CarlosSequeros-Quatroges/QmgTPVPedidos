import { Injectable, signal } from '@angular/core';

/**
 * Expone el estado de conexión del dispositivo como signal.
 * Se apoya en `navigator.onLine` y en los eventos `online` / `offline`
 * del navegador para reflejar en tiempo real si hay red.
 */
@Injectable({ providedIn: 'root' })
export class ConectividadService {
  private readonly _enLinea = signal(
    typeof navigator !== 'undefined' ? navigator.onLine : true,
  );

  /** `true` si el navegador cree que hay conexión de red. */
  readonly enLinea = this._enLinea.asReadonly();

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => this._enLinea.set(true));
      window.addEventListener('offline', () => this._enLinea.set(false));
    }
  }
}
