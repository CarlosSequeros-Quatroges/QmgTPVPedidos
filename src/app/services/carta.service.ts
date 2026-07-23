import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, catchError, forkJoin, of, tap, throwError } from 'rxjs';

import { PedidosApi } from '../api/pedidos-api';
import {
  Alergeno,
  AlergenoResuelto,
  Familia,
  Plato,
  PlatoResuelto,
} from '../models/carta.models';
import { Extra } from '../models/extra.models';
import { AlergenosService } from './alergenos.service';

/**
 * Carta de productos de un `codmenu`. Cruza en memoria platos con su familia,
 * alérgenos y extras, y lo expone con signals.
 *
 * Se cachea por `codmenu`: si dos locales comparten menú, se descarga una vez.
 */
@Injectable({ providedIn: 'root' })
export class CartaService {
  private readonly api = inject(PedidosApi);
  private readonly alergenosSvc = inject(AlergenosService);

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
  /** Alérgenos resueltos (traducidos + icono) indexados por su código de BD. */
  private readonly alergenosPorCodigo = computed(
    () =>
      new Map(
        this._alergenos().map(
          (a) => [a.codigo, this.alergenosSvc.resolver(a)] as const,
        ),
      ),
  );
  private readonly extrasPorId = computed(
    () => new Map(this._extras().map((e) => [e.id, e])),
  );

  /** Platos disponibles con familia, alérgenos y extras resueltos. */
  readonly platos = computed<PlatoResuelto[]>(() => {
    const familias = this.familiasPorId();
    const alergenos = this.alergenosPorCodigo();
    const extras = this.extrasPorId();
    return this._platos()
      .filter((p) => p.disponible)
      .map((p) => this.resolver(p, familias, alergenos, extras))
      .filter((p): p is PlatoResuelto => p !== null);
  });

  /**
   * Carga la carta del menú indicado (y, la primera vez, el catálogo de
   * alérgenos de la empresa). Reutiliza si ya está cargada.
   */
  cargarCarta(codmenu: number): Observable<unknown> {
    if (this.menuCargado === codmenu && !this._error()) {
      return of(null);
    }
    this._cargando.set(true);
    this._error.set(null);
    return forkJoin({
      carta: this.api.getCarta(codmenu),
      // Los alérgenos son de empresa: se piden una sola vez.
      alergenos: this._alergenos().length
        ? of(this._alergenos())
        : this.api.getAlergenos(),
      // Tabla local de traducciones e iconos (también una sola vez).
      tabla: this.alergenosSvc.asegurarTabla(),
    }).pipe(
      tap(({ carta, alergenos }) => {
        this._familias.set(carta.familias);
        this._platos.set(carta.platos);
        this._extras.set(carta.extras);
        this._alergenos.set(alergenos);
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
    alergenos: Map<number, AlergenoResuelto>,
    extras: Map<number, Extra>,
  ): PlatoResuelto | null {
    const familia = familias.get(plato.familiaId);
    if (!familia) return null;
    const { familiaId, alergenos: codigos, extras: extraIds, ...resto } = plato;
    return {
      ...resto,
      familia,
      alergenos: (codigos ?? [])
        .map((c) => alergenos.get(c))
        .filter((a): a is AlergenoResuelto => a !== undefined),
      extras: (extraIds ?? [])
        .map((i) => extras.get(i))
        .filter((e): e is Extra => e !== undefined),
    };
  }
}
