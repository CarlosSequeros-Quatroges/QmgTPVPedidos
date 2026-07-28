import { Injectable, computed, effect, inject, signal } from '@angular/core';
import { Observable, catchError, forkJoin, of, tap, throwError } from 'rxjs';

import { PedidosApi } from '../api/pedidos-api';
import {
  Alergeno,
  AlergenoResuelto,
  Familia,
  Producto,
  ProductoResuelto,
  Subfamilia,
  normalizarFamilia,
  normalizarProducto,
  normalizarSubfamilia,
} from '../models/carta.models';
import { Carta } from '../models/local.models';
import { AlergenosService } from './alergenos.service';
import { LocalService } from './local.service';

/**
 * Carta de un local: familias y productos.
 *
 * - Los productos enlazan con la familia por `codfamilia` (= `codfam`).
 * - Solo se muestran los productos visibles (los extras, solo si se venden
 *   sueltos); se ocultan las familias que quedan sin productos visibles.
 * - Nombres/descripciones llegan en 4 slots de idioma; los alérgenos, por código.
 */
@Injectable({ providedIn: 'root' })
export class CartaService {
  private readonly api = inject(PedidosApi);
  private readonly alergenosSvc = inject(AlergenosService);
  private readonly local = inject(LocalService);

  private readonly _familias = signal<Familia[]>([]);
  private readonly _productos = signal<Producto[]>([]);
  private readonly _subfamilias = signal<Subfamilia[]>([]);
  private readonly _alergenos = signal<Alergeno[]>([]);
  private readonly _cargando = signal(false);
  private readonly _error = signal<string | null>(null);

  /** Carta (de las varias del local) elegida por el cliente (`codcarta`). */
  private readonly _codcarta = signal<string | null>(null);
  /** Local al que pertenece la selección de carta cargada. */
  private codtpvCarta: string | null = null;

  /** Clave codtpv-tmenu-codcarta de la carta ya cargada (evita recargar). */
  private cartaCargada: string | null = null;

  readonly cargando = this._cargando.asReadonly();
  readonly error = this._error.asReadonly();

  /** Cartas que ofrece el local activo. */
  readonly cartasLocal = computed<Carta[]>(() => {
    const l = this.local.localActivo();
    return l ? this.local.cartasDeLocal(l) : [];
  });

  /** El local ofrece varias cartas (hay que elegir una). */
  readonly tieneCartas = computed(() => this.cartasLocal().length > 0);

  /** Carta seleccionada, resuelta contra las cartas del local. */
  readonly cartaActiva = computed<Carta | undefined>(() => {
    const cod = this._codcarta();
    return cod == null
      ? undefined
      : this.cartasLocal().find((c) => c.codcarta === cod);
  });

  constructor() {
    // Al cambiar de local, se limpia la carta elegida (no se persiste).
    effect(() => {
      const codtpv = this.local.localActivo()?.codtpv ?? null;
      if (codtpv !== this.codtpvCarta) {
        this.codtpvCarta = codtpv;
        this._codcarta.set(null);
      }
    });
  }

  /** Selecciona una de las cartas del local (no se persiste). */
  seleccionarCarta(codcarta: string): void {
    // Fijamos el local de la carta antes de que reaccione el effect, para que
    // no la borre al detectar el cambio de local en la misma acción.
    this.codtpvCarta = this.local.localActivo()?.codtpv ?? this.codtpvCarta;
    this._codcarta.set(codcarta);
  }

  private readonly alergenosPorCodigo = computed(
    () =>
      new Map(
        this._alergenos().map(
          (a) => [a.codigo, this.alergenosSvc.resolver(a)] as const,
        ),
      ),
  );

  /** Familias indexadas por `codfamilia`. */
  private readonly familiasPorCod = computed(
    () => new Map(this._familias().map((f) => [f.codfamilia, f])),
  );

  /** Subfamilias indexadas por `codsub` (definen los extras de cada producto). */
  private readonly subfamiliasPorCod = computed(
    () => new Map(this._subfamilias().map((s) => [s.codsub, s])),
  );

  /** Todos los productos resueltos por código (incluye los que son solo extra). */
  private readonly productosPorCodigo = computed(() => {
    const familias = this.familiasPorCod();
    const alergenos = this.alergenosPorCodigo();
    const mapa = new Map<string, ProductoResuelto>();
    for (const p of this._productos()) {
      mapa.set(p.codigo, this.resolver(p, familias, alergenos));
    }
    return mapa;
  });

  /**
   * Productos visibles, con familia y alérgenos resueltos.
   *
   * Un producto sin familia (`codfam` vacío) no se muestra en la carta: se
   * excluye aquí para que no aparezca ni por listado ni por enlace directo. Los
   * extras se resuelven aparte (`productosPorCodigo`, sobre todos los productos).
   */
  readonly productos = computed<ProductoResuelto[]>(() => {
    const familias = this.familiasPorCod();
    const alergenos = this.alergenosPorCodigo();
    return this._productos()
      .filter((p) => p.visible && p.codfamilias.length > 0)
      .map((p) => this.resolver(p, familias, alergenos));
  });

  /**
   * Familias a mostrar, con al menos un producto visible.
   *
   * Si hay una carta seleccionada, se restringe a las familias que declara la
   * carta (`codfamilias` de `getLocales`), respetando su orden. Si no, se
   * muestran todas las del menú ordenadas por `codfamilia`.
   */
  readonly familias = computed(() => {
    const conProductos = new Set(
      this.productos().flatMap((p) => p.codfamilias),
    );
    const carta = this.cartaActiva();
    if (carta) {
      const porCod = this.familiasPorCod();
      return carta.codfamilias
        .filter((c) => conProductos.has(c))
        .map((c) => porCod.get(c))
        .filter((f): f is Familia => f !== undefined);
    }
    return this._familias()
      .filter((f) => conProductos.has(f.codfamilia))
      .sort((a, b) => a.codfamilia - b.codfamilia);
  });

  /** Carga la carta (menú completo del `tmenu`) del local. Reutiliza si ya está. */
  cargarCarta(codtpv: string, tmenu: number): Observable<unknown> {
    const clave = `${codtpv}-${tmenu}`;
    if (this.cartaCargada === clave && !this._error()) {
      return of(null);
    }
    this._cargando.set(true);
    this._error.set(null);
    return forkJoin({
      carta: this.api.getCarta(codtpv, tmenu),
      alergenos: this._alergenos().length
        ? of(this._alergenos())
        : this.api.getAlergenos(),
      tabla: this.alergenosSvc.asegurarTabla(),
    }).pipe(
      tap(({ carta, alergenos }) => {
        this._familias.set(carta.familias.map(normalizarFamilia));
        this._productos.set(carta.productos.map(normalizarProducto));
        this._subfamilias.set(
          (carta.subfamilias ?? []).map(normalizarSubfamilia),
        );
        this._alergenos.set(alergenos);
        this.cartaCargada = clave;
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

  familia(codfamilia: number): Familia | undefined {
    return this.familiasPorCod().get(codfamilia);
  }

  /** Productos visibles de una familia, ordenados. */
  productosDeFamilia(codfamilia: number): ProductoResuelto[] {
    return this.productos()
      .filter((p) => p.codfamilias.includes(codfamilia))
      .sort((a, b) => a.orden - b.orden);
  }

  /** Producto visible por su código. */
  producto(codigo: string): ProductoResuelto | undefined {
    return this.productos().find((p) => p.codigo === codigo);
  }

  /**
   * Productos disponibles como extra para un producto, según su subfamilia
   * (`producto.codsub` → subfamilia → códigos de producto-extra).
   */
  extrasDe(codsub: string): ProductoResuelto[] {
    if (!codsub) return [];
    const sub = this.subfamiliasPorCod().get(codsub);
    if (!sub) return [];
    const porCodigo = this.productosPorCodigo();
    return sub.extras
      .map((c) => porCodigo.get(c))
      .filter((p): p is ProductoResuelto => p !== undefined);
  }

  private resolver(
    producto: Producto,
    familias: Map<number, Familia>,
    alergenos: Map<number, AlergenoResuelto>,
  ): ProductoResuelto {
    const { alergenos: codigos, ...resto } = producto;
    return {
      ...resto,
      familias: producto.codfamilias
        .map((c) => familias.get(c))
        .filter((f): f is Familia => f !== undefined),
      alergenos: codigos
        .map((c) => alergenos.get(c))
        .filter((a): a is AlergenoResuelto => a !== undefined),
    };
  }
}
