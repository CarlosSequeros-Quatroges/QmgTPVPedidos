import { Injectable, computed, inject, signal } from '@angular/core';
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
import { AlergenosService } from './alergenos.service';

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

  private readonly _familias = signal<Familia[]>([]);
  private readonly _productos = signal<Producto[]>([]);
  private readonly _subfamilias = signal<Subfamilia[]>([]);
  private readonly _alergenos = signal<Alergeno[]>([]);
  private readonly _cargando = signal(false);
  private readonly _error = signal<string | null>(null);

  /** Clave codtpv-tmenu de la carta ya cargada (evita recargar). */
  private cartaCargada: string | null = null;

  readonly cargando = this._cargando.asReadonly();
  readonly error = this._error.asReadonly();

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
      const r = this.resolver(p, familias, alergenos);
      if (r) mapa.set(p.codigo, r);
    }
    return mapa;
  });

  /** Productos visibles, con familia y alérgenos resueltos. */
  readonly productos = computed<ProductoResuelto[]>(() => {
    const familias = this.familiasPorCod();
    const alergenos = this.alergenosPorCodigo();
    return this._productos()
      .filter((p) => p.visible)
      .map((p) => this.resolver(p, familias, alergenos))
      .filter((p): p is ProductoResuelto => p !== null);
  });

  /** Familias con al menos un producto visible, ordenadas por `codfamilia`. */
  readonly familias = computed(() => {
    const conProductos = new Set(this.productos().map((p) => p.codfamilia));
    return this._familias()
      .filter((f) => conProductos.has(f.codfamilia))
      .sort((a, b) => a.codfamilia - b.codfamilia);
  });

  /** Carga la carta del local. Reutiliza si ya está cargada. */
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
      .filter((p) => p.codfamilia === codfamilia)
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
  ): ProductoResuelto | null {
    const familia = familias.get(producto.codfamilia);
    if (!familia) return null;
    const { alergenos: codigos, ...resto } = producto;
    return {
      ...resto,
      familia,
      alergenos: codigos
        .map((c) => alergenos.get(c))
        .filter((a): a is AlergenoResuelto => a !== undefined),
    };
  }
}
