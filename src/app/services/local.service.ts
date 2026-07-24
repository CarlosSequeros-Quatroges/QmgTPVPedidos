import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, map, of, shareReplay, tap } from 'rxjs';

import { PedidosApi } from '../api/pedidos-api';
import { Local } from '../models/local.models';
import { IdiomaService } from './idioma.service';

const KEY = 'pedidos.local';

/**
 * Locales disponibles y cuál está seleccionado.
 * La identidad del local es `codtpv` (único); `codmenu` solo indica qué carta
 * de productos usa. La selección se persiste para recuperarla al volver.
 */
@Injectable({ providedIn: 'root' })
export class LocalService {
  private readonly api = inject(PedidosApi);
  private readonly idiomas = inject(IdiomaService);

  private readonly _locales = signal<Local[]>([]);
  private readonly _codtpv = signal<string | null>(this.leer());
  private readonly _cargando = signal(true);
  private readonly _error = signal<string | null>(null);

  private locales$?: Observable<Local[]>;

  readonly locales = this._locales.asReadonly();
  readonly cargando = this._cargando.asReadonly();
  readonly error = this._error.asReadonly();
  readonly codtpv = this._codtpv.asReadonly();

  /** Local seleccionado, resuelto contra la lista de locales. */
  readonly localActivo = computed(() => {
    const cod = this._codtpv();
    return cod ? this._locales().find((l) => l.codtpv === cod) : undefined;
  });

  /**
   * Carga la lista de locales una sola vez (memoizada). Si solo hay uno, lo
   * autoselecciona. Se usa desde el guard para decidir el flujo de arranque.
   */
  asegurarLocales(): Observable<Local[]> {
    if (this._locales().length) return of(this._locales());
    if (!this.locales$) {
      this.locales$ = this.api.getLocales().pipe(
        tap({
          next: ({ locales, idiomas }) => {
            this._locales.set(locales);
            this.idiomas.configurar(idiomas);
            this._cargando.set(false);
            if (locales.length === 1 && !this._codtpv()) {
              this.seleccionar(locales[0]);
            }
          },
          error: (err) => {
            this._error.set('No se pudieron cargar los locales.');
            this._cargando.set(false);
            console.error('Error cargando locales', err);
          },
        }),
        map((r) => r.locales),
        shareReplay(1),
      );
    }
    return this.locales$;
  }

  seleccionar(local: Local): void {
    this._codtpv.set(local.codtpv);
    try {
      localStorage.setItem(KEY, local.codtpv);
    } catch {
      /* localStorage puede no estar disponible */
    }
  }

  limpiar(): void {
    this._codtpv.set(null);
    try {
      localStorage.removeItem(KEY);
    } catch {
      /* ignore */
    }
  }

  private leer(): string | null {
    try {
      return localStorage.getItem(KEY);
    } catch {
      return null;
    }
  }
}
