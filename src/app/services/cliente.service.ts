import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, of } from 'rxjs';

import { PedidosApi } from '../api/pedidos-api';
import { ValidacionCargo } from '../models/cliente.models';

const KEY = 'pedidos.cliente';

/**
 * Guarda el código de cliente/habitación que el huésped recibe en recepción
 * (persistido en el dispositivo) y valida contra la API si se puede hacer el
 * cargo a la cuenta de habitación.
 */
@Injectable({ providedIn: 'root' })
export class ClienteService {
  private readonly api = inject(PedidosApi);

  private readonly _codigo = signal<string | null>(this.leer());

  readonly codigo = this._codigo.asReadonly();
  readonly tieneCodigo = computed(() => !!this._codigo());

  registrar(codigo: string): void {
    const limpio = codigo.trim();
    this._codigo.set(limpio || null);
    try {
      if (limpio) localStorage.setItem(KEY, limpio);
      else localStorage.removeItem(KEY);
    } catch {
      /* localStorage puede no estar disponible */
    }
  }

  borrar(): void {
    this._codigo.set(null);
    try {
      localStorage.removeItem(KEY);
    } catch {
      /* ignore */
    }
  }

  /** Valida si el importe cabe en el saldo de la cuenta de habitación. */
  validarCargo(importe: number): Observable<ValidacionCargo> {
    const codigo = this._codigo();
    if (!codigo) {
      return of({ permitido: false, motivo: 'codigo_invalido' });
    }
    return this.api.validarCargoHabitacion(codigo, importe);
  }

  private leer(): string | null {
    try {
      return localStorage.getItem(KEY);
    } catch {
      return null;
    }
  }
}
