import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, catchError, forkJoin, of, tap, throwError } from 'rxjs';

import { PedidosApi } from '../api/pedidos-api';
import {
  Alergeno,
  AlergenoResuelto,
  Familia,
  Producto,
  ProductoResuelto,
  normalizarProducto,
} from '../models/carta.models';
import { AlergenosService } from './alergenos.service';

/**
 * Carta de un local: familias y productos.
 *
 * Notas del contrato de la API:
 * - Los productos enlazan con la familia por `pos`, no por `codigo`.
 * - Solo se muestran los productos marcados como visibles (`ver_extra = "S"`),
 *   y se ocultan las familias que se queden sin productos visibles.
 * - Los alérgenos llegan como códigos y se resuelven contra el catálogo.
 */
@Injectable({ providedIn: 'root' })
export class CartaService {
  private readonly api = inject(PedidosApi);
  private readonly alergenosSvc = inject(AlergenosService);

  private readonly _familias = signal<Familia[]>([]);
  private readonly _productos = signal<Producto[]>([]);
  private readonly _alergenos = signal<Alergeno[]>([]);
  private readonly _cargando = signal(false);
  private readonly _error = signal<string | null>(null);

  /** Clave codtpv-codmenu de la carta ya cargada (evita recargar). */
  private cartaCargada: string | null = null;

  readonly cargando = this._cargando.asReadonly();
  readonly error = this._error.asReadonly();

  /** Alérgenos resueltos (traducidos + icono) indexados por su código. */
  private readonly alergenosPorCodigo = computed(
    () =>
      new Map(
        this._alergenos().map(
          (a) => [a.codigo, this.alergenosSvc.resolver(a)] as const,
        ),
      ),
  );

  /** Familias indexadas por su `pos` (que es por donde enlazan los productos). */
  private readonly familiasPorPos = computed(
    () => new Map(this._familias().map((f) => [f.pos, f])),
  );

  /** Productos visibles, con familia y alérgenos resueltos. */
  readonly productos = computed<ProductoResuelto[]>(() => {
    const familias = this.familiasPorPos();
    const alergenos = this.alergenosPorCodigo();
    return this._productos()
      .filter((p) => p.visible)
      .map((p) => this.resolver(p, familias, alergenos))
      .filter((p): p is ProductoResuelto => p !== null);
  });

  /** Familias con al menos un producto visible, en orden de `pos`. */
  readonly familias = computed(() => {
    const conProductos = new Set(this.productos().map((p) => p.familiaPos));
    return this._familias()
      .filter((f) => conProductos.has(f.pos))
      .sort((a, b) => a.pos - b.pos);
  });

  /** Carga la carta del local. Reutiliza si ya está cargada. */
  cargarCarta(codtpv: string, codmenu: number): Observable<unknown> {
    const clave = `${codtpv}-${codmenu}`;
    if (this.cartaCargada === clave && !this._error()) {
      return of(null);
    }
    this._cargando.set(true);
    this._error.set(null);
    return forkJoin({
      carta: this.api.getCarta(codtpv, codmenu),
      // Los alérgenos son de empresa: se piden una sola vez.
      alergenos: this._alergenos().length
        ? of(this._alergenos())
        : this.api.getAlergenos(),
      // Tabla local de traducciones e iconos (también una sola vez).
      tabla: this.alergenosSvc.asegurarTabla(),
    }).pipe(
      tap(({ carta, alergenos }) => {
        this._familias.set(carta.familias);
        this._productos.set(carta.productos.map(normalizarProducto));
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

  /** Familia por su `pos`. */
  familia(pos: number): Familia | undefined {
    return this.familiasPorPos().get(pos);
  }

  /** Productos visibles de una familia, ordenados. */
  productosDeFamilia(pos: number): ProductoResuelto[] {
    return this.productos()
      .filter((p) => p.familiaPos === pos)
      .sort((a, b) => a.orden - b.orden || a.nombre.localeCompare(b.nombre));
  }

  /** Producto visible por su código. */
  producto(codigo: number): ProductoResuelto | undefined {
    return this.productos().find((p) => p.codigo === codigo);
  }

  private resolver(
    producto: Producto,
    familias: Map<number, Familia>,
    alergenos: Map<number, AlergenoResuelto>,
  ): ProductoResuelto | null {
    const familia = familias.get(producto.familiaPos);
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
