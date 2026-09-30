import { Injectable, computed, signal } from '@angular/core';

import { PedidoConfirmado } from '../models/pedido.models';

const KEY = 'pedidos.historial';
/** Máximo de pedidos guardados en el dispositivo. */
const MAX = 50;

/**
 * Historial de pedidos confirmados, **persistido en el dispositivo**
 * (`localStorage`), del más reciente al más antiguo. Se usa para la pantalla de
 * confirmación (sobrevive a recargas) y para consultar los pedidos hechos desde
 * este dispositivo.
 */
@Injectable({ providedIn: 'root' })
export class PedidoService {
  private readonly _historial = signal<PedidoConfirmado[]>(this.leer());

  readonly historial = this._historial.asReadonly();
  /** Último pedido confirmado. */
  readonly ultimo = computed<PedidoConfirmado | null>(
    () => this._historial()[0] ?? null,
  );

  guardar(pedido: PedidoConfirmado): void {
    this._historial.update((h) => [pedido, ...h].slice(0, MAX));
    this.persistir();
  }

  /** Busca un pedido por su `id` (robusto a recargas de la confirmación). */
  porId(id: string): PedidoConfirmado | null {
    return this._historial().find((p) => p.id === id) ?? null;
  }

  private persistir(): void {
    try {
      localStorage.setItem(KEY, JSON.stringify(this._historial()));
    } catch {
      /* localStorage puede no estar disponible */
    }
  }

  private leer(): PedidoConfirmado[] {
    try {
      const raw = localStorage.getItem(KEY);
      return raw ? (JSON.parse(raw) as PedidoConfirmado[]) : [];
    } catch {
      return [];
    }
  }
}
