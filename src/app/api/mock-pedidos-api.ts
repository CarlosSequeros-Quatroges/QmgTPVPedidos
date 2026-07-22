import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, delay, forkJoin, map, of } from 'rxjs';

import { CartaLocal, PedidosApi } from './pedidos-api';
import { Alergeno } from '../models/carta.models';
import { Carga } from '../models/local.models';
import { ValidacionCargo } from '../models/cliente.models';
import { Pedido, PedidoConfirmado } from '../models/pedido.models';

const DATA = 'data';

/** Estructura del JSON de carta por local (`data/cartas/carta-{codtpv}-{codmenu}.json`). */
type CartaArchivo = Omit<CartaLocal, 'alergenos'>;

/** Cuenta de habitación del mock (`data/cuentas.json`). */
interface CuentaHabitacion {
  codigo: string;
  saldo: number;
  huesped?: string;
}

/**
 * Implementación simulada de {@link PedidosApi} que lee JSON estáticos de
 * `public/data`. Añade una pequeña latencia para imitar la red real.
 * Para pasar a la API real, se crea `HttpPedidosApi` y se cambia el provider.
 */
@Injectable()
export class MockPedidosApi extends PedidosApi {
  private readonly http = inject(HttpClient);

  getCargas(): Observable<Carga[]> {
    return this.http.get<Carga[]>(`${DATA}/cargas.json`).pipe(delay(200));
  }

  getCarta(codtpv: string, codmenu: string): Observable<CartaLocal> {
    return forkJoin({
      carta: this.http.get<CartaArchivo>(
        `${DATA}/cartas/carta-${codtpv}-${codmenu}.json`,
      ),
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
        if (!cuenta) {
          return { permitido: false, motivo: 'codigo_invalido' };
        }
        if (cuenta.saldo < importe) {
          return {
            permitido: false,
            saldoDisponible: cuenta.saldo,
            motivo: 'sin_saldo',
          };
        }
        return {
          permitido: true,
          saldoDisponible: cuenta.saldo,
          motivo: 'ok',
        };
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
