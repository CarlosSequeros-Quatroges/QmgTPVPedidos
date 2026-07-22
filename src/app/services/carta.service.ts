import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, catchError, of, tap, throwError } from 'rxjs';

import { CartaLocal, PedidosApi } from '../api/pedidos-api';
import { Alergeno, Familia, Plato, PlatoResuelto } from '../models/carta.models';
import { Extra } from '../models/extra.models';
import { Restaurante } from '../models/local.models';

/**
 * Carga la carta de un local (vía {@link PedidosApi}), cruza en memoria platos
 * con su familia, alérgenos y extras, y lo expone con signals.
 */
@Injectable({ providedIn: 'root' })
export class CartaService {
  private readonly api = inject(PedidosApi);

  private readonly _restaurante = signal<Restaurante | null>(null);
  private readonly _familias = signal<Familia[]>([]);
  private readonly _platos = signal<Plato[]>([]);
  private readonly _alergenos = signal<Alergeno[]>([]);
  private readonly _extras = signal<Extra[]>([]);
  private readonly _cargando = signal(false);
  private readonly _error = signal<string | null>(null);

  /** Clave codtpv-codmenu de la carta ya cargada (evita recargar). */
  private claveCargada: string | null = null;

  readonly restaurante = this._restaurante.asReadonly();
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

  /** Carga la carta del local codtpv/codmenu. Reutiliza si ya está cargada. */
  cargarCarta(codtpv: string, codmenu: string): Observable<CartaLocal | null> {
    const clave = `${codtpv}-${codmenu}`;
    if (this.claveCargada === clave && !this._error()) {
      return of(null);
    }
    this._cargando.set(true);
    this._error.set(null);
    return this.api.getCarta(codtpv, codmenu).pipe(
      tap((c) => {
        this._restaurante.set(c.restaurante);
        this._familias.set(c.familias);
        this._platos.set(c.platos);
        this._alergenos.set(c.alergenos);
        this._extras.set(c.extras);
        this.claveCargada = clave;
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
