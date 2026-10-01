import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, map, of, shareReplay, tap } from 'rxjs';

import { PedidosApi } from '../api/pedidos-api';
import { Carta, Local, codcartasDeLocal } from '../models/local.models';
import { IdiomaService } from './idioma.service';

/**
 * Locales disponibles y cuál está seleccionado.
 * La identidad del local es `codtpv` (único); `tmenu` solo indica qué carta
 * de productos usa. La selección **no se persiste**: al abrir la app siempre se
 * obliga a elegir local + carta.
 */
@Injectable({ providedIn: 'root' })
export class LocalService {
  private readonly api = inject(PedidosApi);
  private readonly idiomas = inject(IdiomaService);

  private readonly _locales = signal<Local[]>([]);
  /** Catálogo de cartas de la empresa (indexadas luego por `codcarta`). */
  private readonly _cartas = signal<Carta[]>([]);
  private readonly _codtpv = signal<string | null>(null);
  private readonly _cargando = signal(true);
  private readonly _error = signal<string | null>(null);

  private locales$?: Observable<Local[]>;

  readonly locales = this._locales.asReadonly();
  readonly cartas = this._cartas.asReadonly();
  readonly cargando = this._cargando.asReadonly();
  readonly error = this._error.asReadonly();
  readonly codtpv = this._codtpv.asReadonly();

  /** Cartas indexadas por `codcarta`. */
  private readonly cartasPorCod = computed(
    () => new Map(this._cartas().map((c) => [c.codcarta, c])),
  );

  /** Local seleccionado, resuelto contra la lista de locales. */
  readonly localActivo = computed(() => {
    const cod = this._codtpv();
    return cod ? this._locales().find((l) => l.codtpv === cod) : undefined;
  });

  /**
   * Cartas que ofrece un local (según los `codcarta` de sus franjas).
   * Se descartan las que el local referencia pero no están definidas en el
   * catálogo de la empresa (franja con `codcarta` sin carta asociada).
   */
  cartasDeLocal(local: Local): Carta[] {
    const porCod = this.cartasPorCod();
    return codcartasDeLocal(local)
      .map((cod) => porCod.get(cod))
      .filter((c): c is Carta => c !== undefined);
  }

  /**
   * Locales que se pueden mostrar: los que tienen al menos una carta definida.
   * Un local cuyas franjas apuntan a cartas inexistentes no tendría nada desde
   * lo que pedir, así que no se lista.
   */
  readonly localesVisibles = computed(() =>
    this._locales().filter((l) => this.cartasDeLocal(l).length > 0),
  );

  /**
   * Carga la lista de locales una sola vez (memoizada). Si solo hay uno, lo
   * autoselecciona. Se usa desde el guard para decidir el flujo de arranque.
   */
  asegurarLocales(): Observable<Local[]> {
    if (this._locales().length) return of(this._locales());
    if (!this.locales$) {
      this.locales$ = this.api.getLocales().pipe(
        tap({
          next: ({ locales, idiomas, cartas }) => {
            this._locales.set(locales);
            this._cartas.set(cartas);
            this.idiomas.configurar(idiomas);
            this._cargando.set(false);
            // Si solo hay un local mostrable, se autoselecciona.
            const visibles = this.localesVisibles();
            if (visibles.length === 1 && !this._codtpv()) {
              this.seleccionar(visibles[0]);
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
  }

  limpiar(): void {
    this._codtpv.set(null);
  }
}
