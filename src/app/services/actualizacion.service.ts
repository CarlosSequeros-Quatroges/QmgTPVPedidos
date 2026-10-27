import { Injectable, inject } from '@angular/core';
import { SwUpdate, VersionReadyEvent } from '@angular/service-worker';
import { filter } from 'rxjs';

import { BUILD_TIMESTAMP } from '../build-info';

/** Contenido de `version.json` (lo genera `scripts/gen-build.mjs`). */
interface VersionPublicada {
  build: string;
}

/**
 * Mantiene la app actualizada con el último build publicado, por dos vías:
 *
 * 1. **Service worker**: cuando detecta una versión nueva, la activa y recarga.
 * 2. **`version.json`**: sondea un fichero suelto (generado en cada build) y lo
 *    compara con la versión compilada dentro de la app. Esta vía es la red de
 *    seguridad: no depende del SW ni de que el navegador suelte el `index.html`
 *    cacheado (a veces ni con F5), que era el problema a resolver.
 *
 * `version.json` se pide con `?t=` y `no-store`, y además no está en ningún
 * `assetGroup` del SW, así que siempre se resuelve contra la red.
 */
@Injectable({ providedIn: 'root' })
export class ActualizacionService {
  private readonly sw = inject(SwUpdate);

  /** Cada cuánto se comprueba si hay una versión nueva. */
  private readonly INTERVALO_MS = 60_000;
  /** Ruta del fichero de versión (relativa al `base href` /pedidos/). */
  private readonly RUTA_VERSION = 'version.json';
  /** Clave en sessionStorage para no recargar en bucle por la misma versión. */
  private readonly CLAVE_RECARGA = 'pedidos.versionRecargada';

  private vigilando = false;

  iniciar(): void {
    if (this.vigilando) return;
    this.vigilando = true;

    // Vía service worker (cuando está habilitado; en desarrollo no lo está).
    if (this.sw.isEnabled) {
      this.sw.versionUpdates
        .pipe(filter((e): e is VersionReadyEvent => e.type === 'VERSION_READY'))
        .subscribe(() => this.sw.activateUpdate().then(() => location.reload()));

      setInterval(() => {
        this.sw.checkForUpdate().catch(() => {
          /* sin conexión o fallo puntual: se reintenta en el siguiente ciclo */
        });
      }, this.INTERVALO_MS);
    }

    // Vía version.json (independiente del SW y del caché del navegador).
    this.comprobarVersion();
    setInterval(() => this.comprobarVersion(), this.INTERVALO_MS);

    // Al volver la pestaña a primer plano se comprueba en el acto: el navegador
    // ralentiza los timers en segundo plano.
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') this.comprobarVersion();
    });
  }

  private async comprobarVersion(): Promise<void> {
    let publicada: string | undefined;
    try {
      const r = await fetch(`${this.RUTA_VERSION}?t=${Date.now()}`, {
        cache: 'no-store',
      });
      if (!r.ok) return;
      publicada = ((await r.json()) as VersionPublicada)?.build;
    } catch {
      return; // sin conexión o fallo puntual: se reintenta en el siguiente ciclo
    }

    if (!publicada || publicada === BUILD_TIMESTAMP) return;

    // Una sola recarga por versión detectada: si tras recargar el navegador
    // sigue sirviendo la anterior, se evita un bucle de recargas.
    if (this.yaIntentado(publicada)) {
      console.warn(
        'Hay un build nuevo en el servidor, pero el navegador sigue cargando el anterior.',
        { publicada, enEjecucion: BUILD_TIMESTAMP },
      );
      return;
    }
    this.marcarIntento(publicada);

    // Se vacían las cachés del SW y se desregistra antes de recargar, para que
    // la recarga baje el index.html y los assets nuevos y no los cacheados.
    await this.limpiarCaches();
    console.log('Versión nueva detectada, recargando:', publicada);
    location.reload();
  }

  /** Desregistra el service worker y borra sus cachés (best-effort). */
  private async limpiarCaches(): Promise<void> {
    try {
      if ('serviceWorker' in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations();
        await Promise.all(regs.map((reg) => reg.unregister()));
      }
      if ('caches' in window) {
        const claves = await caches.keys();
        await Promise.all(claves.map((k) => caches.delete(k)));
      }
    } catch {
      /* si falla, una recarga normal aún puede bastar */
    }
  }

  private yaIntentado(version: string): boolean {
    try {
      return sessionStorage.getItem(this.CLAVE_RECARGA) === version;
    } catch {
      return true; // sin sessionStorage, mejor no arriesgar un bucle
    }
  }

  private marcarIntento(version: string): void {
    try {
      sessionStorage.setItem(this.CLAVE_RECARGA, version);
    } catch {
      /* sin sessionStorage ya se devolvió true en yaIntentado */
    }
  }
}
