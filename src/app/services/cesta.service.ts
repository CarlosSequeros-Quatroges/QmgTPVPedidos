import { Injectable, computed, effect, inject, signal } from '@angular/core';

import { LocalService } from './local.service';
import { LineaCesta } from '../models/cesta.models';
import { ProductoResuelto } from '../models/carta.models';
import { ExtraSeleccionado } from '../models/extra.models';

const KEY = 'pedidos.cesta';

/** Lo que se persiste: la cesta y el local al que pertenece. */
interface CestaGuardada {
  codtpv: string | null;
  lineas: LineaCesta[];
}

/**
 * Cesta **única**: hay una sola cesta en el dispositivo. Si el cliente cambia
 * de local, se vacía. Se guarda junto al `codtpv` al que pertenece para que
 * recargar la página en el mismo local no la borre.
 */
@Injectable({ providedIn: 'root' })
export class CestaService {
  private readonly local = inject(LocalService);

  private readonly _lineas = signal<LineaCesta[]>([]);
  /** Local al que pertenece la cesta cargada. */
  private codtpvCesta: string | null = null;

  readonly lineas = this._lineas.asReadonly();
  readonly total = computed(() =>
    this._lineas().reduce((s, l) => s + l.subtotal, 0),
  );
  readonly numArticulos = computed(() =>
    this._lineas().reduce((s, l) => s + l.cantidad, 0),
  );
  readonly vacia = computed(() => this._lineas().length === 0);

  constructor() {
    const guardada = this.leer();
    this.codtpvCesta = guardada?.codtpv ?? null;
    this._lineas.set(guardada?.lineas ?? []);

    // Al cambiar de local, la cesta se vacía.
    effect(() => {
      const activo = this.local.localActivo()?.codtpv ?? null;
      if (activo && activo !== this.codtpvCesta) {
        this.codtpvCesta = activo;
        this._lineas.set([]);
        this.persistir();
      }
    });
  }

  /** Añade una línea nueva (no fusiona: la nota suele hacerlas únicas). */
  agregar(
    producto: ProductoResuelto,
    extras: ExtraSeleccionado[],
    nota: string,
    cantidad: number,
  ): void {
    const precioUnitario =
      producto.precio + extras.reduce((s, e) => s + e.precio, 0);
    const linea: LineaCesta = {
      id: crypto.randomUUID(),
      codProducto: producto.codigo,
      nombre: producto.nombre,
      imagen: producto.imagen,
      precioBase: producto.precio,
      extras,
      nota: nota.trim(),
      cantidad,
      precioUnitario,
      subtotal: precioUnitario * cantidad,
    };
    this._lineas.update((ls) => [...ls, linea]);
    this.persistir();
  }

  editarCantidad(id: string, cantidad: number): void {
    if (cantidad <= 0) {
      this.eliminar(id);
      return;
    }
    this._lineas.update((ls) =>
      ls.map((l) =>
        l.id === id
          ? { ...l, cantidad, subtotal: l.precioUnitario * cantidad }
          : l,
      ),
    );
    this.persistir();
  }

  eliminar(id: string): void {
    this._lineas.update((ls) => ls.filter((l) => l.id !== id));
    this.persistir();
  }

  vaciar(): void {
    this._lineas.set([]);
    this.persistir();
  }

  private persistir(): void {
    try {
      const datos: CestaGuardada = {
        codtpv: this.codtpvCesta,
        lineas: this._lineas(),
      };
      localStorage.setItem(KEY, JSON.stringify(datos));
    } catch {
      /* localStorage puede no estar disponible */
    }
  }

  private leer(): CestaGuardada | null {
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? (JSON.parse(raw) as CestaGuardada) : null;
    } catch {
      return null;
    }
  }
}
