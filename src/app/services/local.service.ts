import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, of, shareReplay, tap } from 'rxjs';

import { PedidosApi } from '../api/pedidos-api';
import { Carga } from '../models/local.models';

const KEY = 'pedidos.carga';

interface Seleccion {
  codtpv: string;
  codmenu: string;
}

/**
 * Gestiona los locales (cargas) disponibles y cuál está seleccionado.
 * La selección se identifica por el par codtpv+codmenu y se persiste en
 * localStorage para recuperar el local al volver.
 */
@Injectable({ providedIn: 'root' })
export class LocalService {
  private readonly api = inject(PedidosApi);

  private readonly _cargas = signal<Carga[]>([]);
  private readonly _seleccion = signal<Seleccion | null>(this.leer());
  private readonly _cargando = signal(true);
  private readonly _error = signal<string | null>(null);

  private cargas$?: Observable<Carga[]>;

  readonly cargas = this._cargas.asReadonly();
  readonly cargando = this._cargando.asReadonly();
  readonly error = this._error.asReadonly();
  readonly seleccion = this._seleccion.asReadonly();

  /** Local seleccionado resuelto al objeto Carga (si existe entre las cargas). */
  readonly cargaActiva = computed(() => {
    const s = this._seleccion();
    if (!s) return undefined;
    return this._cargas().find(
      (c) => c.codtpv === s.codtpv && c.codmenu === s.codmenu,
    );
  });

  readonly haySeleccion = computed(() => !!this.cargaActiva());

  /**
   * Carga la lista de locales una sola vez (memoizada). Si solo hay uno, lo
   * autoselecciona. Úsalo desde el guard para decidir el flujo de arranque.
   */
  asegurarCargas(): Observable<Carga[]> {
    if (this._cargas().length) return of(this._cargas());
    if (!this.cargas$) {
      this.cargas$ = this.api.getCargas().pipe(
        tap({
          next: (cargas) => {
            this._cargas.set(cargas);
            this._cargando.set(false);
            if (cargas.length === 1 && !this._seleccion()) {
              this.seleccionar(cargas[0]);
            }
          },
          error: () => {
            this._error.set('No se pudieron cargar los locales.');
            this._cargando.set(false);
          },
        }),
        shareReplay(1),
      );
    }
    return this.cargas$;
  }

  seleccionar(carga: Carga): void {
    const sel: Seleccion = { codtpv: carga.codtpv, codmenu: carga.codmenu };
    this._seleccion.set(sel);
    try {
      localStorage.setItem(KEY, JSON.stringify(sel));
    } catch {
      /* localStorage puede no estar disponible */
    }
  }

  limpiar(): void {
    this._seleccion.set(null);
    try {
      localStorage.removeItem(KEY);
    } catch {
      /* ignore */
    }
  }

  private leer(): Seleccion | null {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return null;
      const s = JSON.parse(raw) as Seleccion;
      return s?.codtpv && s?.codmenu ? s : null;
    } catch {
      return null;
    }
  }
}
