import { Injectable, signal } from '@angular/core';

import { PedidoConfirmado } from '../models/pedido.models';

/**
 * Guarda el último pedido confirmado para mostrarlo en la pantalla de
 * confirmación tras vaciar la cesta.
 */
@Injectable({ providedIn: 'root' })
export class PedidoService {
  private readonly _ultimo = signal<PedidoConfirmado | null>(null);
  readonly ultimo = this._ultimo.asReadonly();

  guardar(pedido: PedidoConfirmado): void {
    this._ultimo.set(pedido);
  }
}
