import { Injectable, inject } from '@angular/core';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { filter } from 'rxjs';

/**
 * Mantiene la app actualizada con el último build publicado.
 *
 * Cuando el service worker detecta una versión nueva, la activa y recarga la
 * página automáticamente; además comprueba periódicamente si hay build nuevo
 * (para pestañas que ya estaban abiertas). Así no hace falta forzar recarga /
 * desregistrar el SW a mano tras cada despliegue.
 */
@Injectable({ providedIn: 'root' })
export class ActualizacionService {
  private readonly sw = inject(SwUpdate);

  /** Cada cuánto se comprueba si hay una versión nueva. */
  private readonly INTERVALO_MS = 60_000;

  iniciar(): void {
    // En desarrollo el SW está deshabilitado: no hay nada que hacer.
    if (!this.sw.isEnabled) return;

    // Al quedar lista una versión nueva, activarla y recargar.
    this.sw.versionUpdates
      .pipe(filter((e): e is VersionReadyEvent => e.type === 'VERSION_READY'))
      .subscribe(() => {
        this.sw.activateUpdate().then(() => document.location.reload());
      });

    // Comprobación periódica (para pestañas ya abiertas cuando se despliega).
    setInterval(() => {
      this.sw.checkForUpdate().catch(() => {
        /* sin conexión o fallo puntual: se reintenta en el siguiente ciclo */
      });
    }, this.INTERVALO_MS);
  }
}
