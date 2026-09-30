import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, of, tap } from 'rxjs';

import { PedidosApi } from '../api/pedidos-api';
import { Zona } from '../models/zona.models';

/**
 * Zonas y puntos de pedido (dónde se sirve). El punto puede venir **fijado por
 * la URL** del QR (`?punto=ZONA-PPP`, p. ej. `PIS-001`): si resuelve contra el
 * catálogo, queda fijado; si no, el cliente elige zona → punto en el checkout.
 *
 * El identificador que se manda en el pedido es el `codigo` de zona (≤4) + el
 * `codigo` de punto (3 dígitos). El `id` numérico es único pero no se usa para
 * el QR.
 */
@Injectable({ providedIn: 'root' })
export class PuntosService {
  private readonly api = inject(PedidosApi);

  private readonly _zonas = signal<Zona[]>([]);
  // Se identifica por `id` (único), no por `codigo` (que puede repetirse).
  private readonly _idZona = signal<number | null>(null);
  private readonly _idPunto = signal<number | null>(null);
  /** El punto vino fijado por la URL del QR: no se puede cambiar. */
  private readonly _fijado = signal(false);

  /** `?punto=` capturado al arrancar (antes de que la navegación lo pierda). */
  private readonly puntoUrl = this.leerPuntoUrl();
  private cargado = false;

  readonly zonas = this._zonas.asReadonly();
  readonly fijado = this._fijado.asReadonly();

  readonly zonaActiva = computed(() =>
    this._zonas().find((z) => z.id === this._idZona()),
  );
  readonly puntosZona = computed(() => this.zonaActiva()?.puntos ?? []);
  readonly puntoActivo = computed(() =>
    this.puntosZona().find((p) => p.id === this._idPunto()),
  );
  /** Hay una selección completa (zona + punto). */
  readonly completo = computed(() => !!this.puntoActivo());

  /** Carga el catálogo (una vez) e intenta fijar el punto de la URL. */
  cargar(): Observable<Zona[]> {
    if (this.cargado) return of(this._zonas());
    return this.api.getPuntosPedidos().pipe(
      tap((zonas) => {
        this._zonas.set(zonas);
        this.cargado = true;
        this.aplicarUrl();
      }),
    );
  }

  /**
   * Libera el punto fijado por la URL para poder elegir a mano (los desplegables
   * arrancan con la selección actual). No borra la selección.
   */
  cambiar(): void {
    this._fijado.set(false);
  }

  /** Recibe el `id` de zona (como string, desde el `<select>`). */
  seleccionarZona(id: string): void {
    this._idZona.set(id ? Number(id) : null);
    this._idPunto.set(null);
  }

  /** Recibe el `id` de punto (como string, desde el `<select>`). */
  seleccionarPunto(id: string): void {
    this._idPunto.set(id ? Number(id) : null);
  }

  /** Códigos elegidos para el pedido (o `undefined` si no hay). */
  codigoZona(): string | undefined {
    return this.zonaActiva()?.codigo;
  }
  codigoPunto(): string | undefined {
    return this.puntoActivo()?.codigo;
  }

  /** Resuelve `?punto=ZONA-PPP` contra el catálogo ya cargado. */
  private aplicarUrl(): void {
    if (!this.puntoUrl) return;
    const sep = this.puntoUrl.indexOf('-');
    if (sep < 0) return;
    const codZona = this.puntoUrl.slice(0, sep);
    const codPunto = this.puntoUrl.slice(sep + 1);
    const zona = this._zonas().find((z) => z.codigo === codZona);
    const punto = zona?.puntos.find((p) => p.codigo === codPunto);
    if (zona && punto) {
      this._idZona.set(zona.id);
      this._idPunto.set(punto.id);
      this._fijado.set(true);
    }
  }

  /**
   * `?punto=` capturado en `main.ts` (sessionStorage) antes de que el router
   * descartara la query; con fallback a leerlo directamente de la URL.
   */
  private leerPuntoUrl(): string | null {
    try {
      const guardado = sessionStorage.getItem('pedidos.punto');
      if (guardado) return guardado;
    } catch {
      /* sessionStorage puede no estar disponible */
    }
    if (typeof location === 'undefined') return null;
    const buscar = (qs: string) => new URLSearchParams(qs).get('punto');
    const enSearch = buscar(location.search);
    if (enSearch) return enSearch;
    const i = location.hash.indexOf('?');
    return i >= 0 ? buscar(location.hash.slice(i)) : null;
  }
}
