import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, catchError, of, tap, throwError } from 'rxjs';

import { CartaLocal, PedidosApi } from '../api/pedidos-api';
import { Alergeno, Familia, Plato, PlatoResuelto } from '../models/carta.models';
import { Extra } from '../models/extra.models';

/**
 * Carta de productos de un `codmenu`. Cruza en memoria platos con su familia,
 * alérgenos y extras, y lo expone con signals.
 *
 * Se cachea por `codmenu`: si dos locales comparten menú, se descarga una vez.
 */
@Injectable({ providedIn: 'root' })
export class CartaService {
  private readonly api = inject(PedidosApi);

  private readonly _familias = signal<Familia[]>([]);
  private readonly _platos = signal<Plato[]>([]);
  private readonly _alergenos = signal<Alergeno[]>([]);
  private readonly _extras = signal<Extra[]>([]);
  private readonly _cargando = signal(false);
  private readonly _error = signal<string | null>(null);

  /** codmenu de la carta ya cargada (evita recargar). */
  private menuCargado: number | null = null;

  readonly cargando = this._cargando.asReadonly();
  readonly error = this._error.asReadonly();
  readonly alergenos = this._alergenos.asReadonly();

  readonly familias = computed(() =>
    [...this._familias()].sort((a, b) => a.orden - b.orden),
  );

  private readonly familiasPorId = computed(
    () => new Map(this._familias().map((f) => [f.id, f])),
  );
  private readonly alergenosPorId = computed(
    () => new Map(this._alergenos().map((a) => [a.id, a])),
  );
  private readonly extrasPorId = computed(
    () => new Map(this._extras().map((e) => [e.id, e])),
  );

  /** Platos disponibles con familia, alérgenos y extras resueltos. */
  readonly platos = computed<PlatoResuelto[]>(() => {
    const familias = this.familiasPorId();
    const alergenos = this.alergenosPorId();
    const extras = this.extrasPorId();
    return this._platos()
      .filter((p) => p.disponible)
      .map((p) => this.resolver(p, familias, alergenos, extras))
      .filter((p): p is PlatoResuelto => p !== null);
  });

  /** Carga la carta del menú indicado. Reutiliza si ya está cargada. */
  cargarCarta(codmenu: number): Observable<CartaLocal | null> {
    if (this.menuCargado === codmenu && !this._error()) {
      return of(null);
    }
    this._cargando.set(true);
    this._error.set(null);
    return this.api.getCarta(codmenu).pipe(
      tap((c) => {
        this._familias.set(c.familias);
        this._platos.set(c.platos);
        this._alergenos.set(c.alergenos);
        this._extras.set(c.extras);
        this.menuCargado = codmenu;
        this._cargando.set(false);
      }),
      catchError((err) => {
        this._error.set('No se pudo cargar la carta.');
        this._cargando.set(false);
        console.error('Error cargando la carta', err);
        return throwError(() => err);
      }),
    );
  }

  familia(id: number): Familia | undefined {
    return this.familiasPorId().get(id);
  }

  platosDeFamilia(familiaId: number): PlatoResuelto[] {
    return this.platos().filter((p) => p.familia.id === familiaId);
  }

  plato(id: number): PlatoResuelto | undefined {
    return this.platos().find((p) => p.id === id);
  }

  private resolver(
    plato: Plato,
    familias: Map<number, Familia>,
    alergenos: Map<number, Alergeno>,
    extras: Map<number, Extra>,
  ): PlatoResuelto | null {
    const familia = familias.get(plato.familiaId);
    if (!familia) return null;
    const { familiaId, alergenos: ids, extras: extraIds, ...resto } = plato;
    return {
      ...resto,
      familia,
      alergenos: (ids ?? [])
        .map((i) => alergenos.get(i))
        .filter((a): a is Alergeno => a !== undefined),
      extras: (extraIds ?? [])
        .map((i) => extras.get(i))
        .filter((e): e is Extra => e !== undefined),
    };
  }
}
