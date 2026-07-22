import { Injectable, computed, effect, inject, signal } from '@angular/core';

import { LocalService } from './local.service';
import { LineaCesta } from '../models/cesta.models';
import { PlatoResuelto } from '../models/carta.models';
import { ExtraSeleccionado } from '../models/extra.models';
import { claveCarga } from '../models/local.models';

const PREFIJO = 'pedidos.cesta.';

/**
 * Cesta de la compra, persistida en localStorage **por local** (clave
 * codtpv-codmenu). Al cambiar de local, carga la cesta de ese local.
 */
@Injectable({ providedIn: 'root' })
export class CestaService {
  private readonly local = inject(LocalService);

  private readonly _lineas = signal<LineaCesta[]>([]);
  /** Clave del local cuya cesta está cargada ahora mismo. */
  private claveActual: string | null = null;

  readonly lineas = this._lineas.asReadonly();
  readonly total = computed(() =>
    this._lineas().reduce((s, l) => s + l.subtotal, 0),
  );
  readonly numArticulos = computed(() =>
    this._lineas().reduce((s, l) => s + l.cantidad, 0),
  );
  readonly vacia = computed(() => this._lineas().length === 0);

  constructor() {
    // Cargar la cesta del local activo cuando cambie la selección.
    effect(() => {
      const carga = this.local.cargaActiva();
      const clave = carga ? claveCarga(carga) : null;
      if (clave !== this.claveActual) {
        this.claveActual = clave;
        this._lineas.set(clave ? this.leer(clave) : []);
      }
    });
  }

  /** Añade una línea nueva (no fusiona: la nota suele hacerlas únicas). */
  agregar(
    plato: PlatoResuelto,
    extras: ExtraSeleccionado[],
    nota: string,
    cantidad: number,
  ): void {
    const precioUnitario =
      plato.precio + extras.reduce((s, e) => s + e.precio, 0);
    const linea: LineaCesta = {
      id: crypto.randomUUID(),
      platoId: plato.id,
      nombre: plato.nombre,
      precioBase: plato.precio,
      imagen: plato.imagen,
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
    if (!this.claveActual) return;
    try {
      localStorage.setItem(
        PREFIJO + this.claveActual,
        JSON.stringify(this._lineas()),
      );
    } catch {
      /* localStorage puede no estar disponible */
    }
  }

  private leer(clave: string): LineaCesta[] {
    try {
      const raw = localStorage.getItem(PREFIJO + clave);
      return raw ? (JSON.parse(raw) as LineaCesta[]) : [];
    } catch {
      return [];
    }
  }
}
