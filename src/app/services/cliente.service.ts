import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, of, tap } from 'rxjs';

import { PedidosApi } from '../api/pedidos-api';
import { ValidacionCargo, ValidacionCliente } from '../models/cliente.models';

const KEY = 'pedidos.cliente';

/** Lo que se persiste en el dispositivo. */
interface ClienteGuardado {
  codigo: string;
  habitacion: string;
  nombre?: string;
}

/**
 * Registro del huésped: introduce su nº de habitación y el documento del
 * check-in; la API comprueba la reserva y devuelve el **código de cliente**
 * (nº de reserva). Código y habitación se guardan en el dispositivo.
 */
@Injectable({ providedIn: 'root' })
export class ClienteService {
  private readonly api = inject(PedidosApi);

  private readonly _cliente = signal<ClienteGuardado | null>(this.leer());

  readonly cliente = this._cliente.asReadonly();
  readonly codigo = computed(() => this._cliente()?.codigo ?? null);
  readonly habitacion = computed(() => this._cliente()?.habitacion ?? null);
  readonly tieneCodigo = computed(() => !!this._cliente());

  /**
   * Registra al huésped (habitación + documento del check-in) contra la API y,
   * si la reserva existe, guarda el código de cliente y la habitación. Devuelve
   * la validación para que la UI muestre el resultado.
   */
  registrar(
    habitacion: string,
    documento: string,
  ): Observable<ValidacionCliente> {
    const hab = habitacion.trim();
    const doc = documento.trim().toUpperCase();
    if (!hab || !doc) {
      return of({ valido: false, motivo: 'datos_invalidos' as const });
    }
    return this.api.registrarCliente(hab, doc).pipe(
      tap((v) => {
        if (v.valido && v.cliente) {
          this.guardar({
            codigo: v.cliente.codigo,
            habitacion: v.cliente.habitacion,
            nombre: v.cliente.nombre,
          });
        }
      }),
    );
  }

  borrar(): void {
    this._cliente.set(null);
    try {
      localStorage.removeItem(KEY);
    } catch {
      /* ignore */
    }
  }

  /** Valida si el importe cabe en el saldo de la cuenta de habitación. */
  validarCargo(importe: number): Observable<ValidacionCargo> {
    const codigo = this.codigo();
    if (!codigo) {
      return of({ permitido: false, motivo: 'codigo_invalido' as const });
    }
    return this.api.validarCargoHabitacion(codigo, importe);
  }

  private guardar(datos: ClienteGuardado): void {
    this._cliente.set(datos);
    try {
      localStorage.setItem(KEY, JSON.stringify(datos));
    } catch {
      /* localStorage puede no estar disponible */
    }
  }

  private leer(): ClienteGuardado | null {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return null;
      const d = JSON.parse(raw) as ClienteGuardado;
      return d?.codigo && d?.habitacion ? d : null;
    } catch {
      return null;
    }
  }
}
