import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, delay, forkJoin, map, of } from 'rxjs';

import { CartaLocal, PedidosApi } from './pedidos-api';
import { Alergeno } from '../models/carta.models';
import { Local } from '../models/local.models';
import { RespuestaLocales } from '../models/respuesta.models';
import { ValidacionCargo } from '../models/cliente.models';
import { Pedido, PedidoConfirmado } from '../models/pedido.models';

const DATA = 'data';

/** Estructura del JSON de carta por menú (`data/cartas/carta-{codmenu}.json`). */
type CartaArchivo = Omit<CartaLocal, 'alergenos'>;

/** Cuenta de habitación del mock (`data/cuentas.json`). */
interface CuentaHabitacion {
  codigo: string;
  saldo: number;
  huesped?: string;
}

/**
 * Implementación simulada de {@link PedidosApi} sobre JSON estáticos de
 * `public/data`. Se usa para los endpoints que todavía no están disponibles
 * en la API real, y para desarrollo sin backend.
 */
@Injectable({ providedIn: 'root' })
export class MockPedidosApi extends PedidosApi {
  private readonly http = inject(HttpClient);

  getLocales(): Observable<Local[]> {
    return this.http
      .get<RespuestaLocales>(`${DATA}/locales.json`)
      .pipe(delay(200), map((r) => r.locales));
  }

  getCarta(codmenu: number): Observable<CartaLocal> {
    return forkJoin({
      carta: this.http.get<CartaArchivo>(`${DATA}/cartas/carta-${codmenu}.json`),
      alergenos: this.http.get<Alergeno[]>(`${DATA}/alergenos.json`),
    }).pipe(
      delay(250),
      map(({ carta, alergenos }) => ({ ...carta, alergenos })),
    );
  }

  validarCargoHabitacion(
    codigo: string,
    importe: number,
  ): Observable<ValidacionCargo> {
    return this.http.get<CuentaHabitacion[]>(`${DATA}/cuentas.json`).pipe(
      delay(300),
      map((cuentas): ValidacionCargo => {
        const cuenta = cuentas.find((c) => c.codigo === codigo.trim());
        if (!cuenta) return { permitido: false, motivo: 'codigo_invalido' };
        if (cuenta.saldo < importe) {
          return {
            permitido: false,
            saldoDisponible: cuenta.saldo,
            motivo: 'sin_saldo',
          };
        }
        return { permitido: true, saldoDisponible: cuenta.saldo, motivo: 'ok' };
      }),
    );
  }

  crearPedido(pedido: Pedido): Observable<PedidoConfirmado> {
    const confirmado: PedidoConfirmado = {
      id: crypto.randomUUID(),
      estado: 'recibido',
      pedido,
    };
    return of(confirmado).pipe(delay(400));
  }
}
