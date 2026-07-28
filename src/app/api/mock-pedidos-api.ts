import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, delay, forkJoin, map, of } from 'rxjs';

import { CartaLocal, LocalesEmpresa, PedidosApi } from './pedidos-api';
import { Alergeno } from '../models/carta.models';
import { RespuestaLocales } from '../models/respuesta.models';
import { normalizarCarta } from '../models/local.models';
import { ValidacionCargo, ValidacionCliente } from '../models/cliente.models';
import { Pedido, PedidoConfirmado } from '../models/pedido.models';

const DATA = 'data';

/** Estructura del JSON de carta simulada (`data/cartas/carta-{tmenu}.json`). */
type CartaArchivo = CartaLocal;

/** Cuenta de habitación del mock (`data/cuentas.json`). */
interface CuentaHabitacion {
  codigo: string;
  habitacion: string;
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

  getLocales(): Observable<LocalesEmpresa> {
    return this.http.get<RespuestaLocales>(`${DATA}/locales.json`).pipe(
      delay(200),
      map((r) => ({
        locales: r.locales ?? [],
        idiomas: r.idiomas ?? [],
        cartas: (r.cartas ?? []).map(normalizarCarta),
      })),
    );
  }

  getCarta(codtpv: string, tmenu: number): Observable<CartaLocal> {
    return this.http
      .get<CartaArchivo>(`${DATA}/cartas/carta-${tmenu}.json`)
      .pipe(delay(250));
  }

  getAlergenos(): Observable<Alergeno[]> {
    // Simula el catálogo de la empresa a partir de la tabla local de textos.
    return this.http
      .get<{ codigo: number; nombre: { es: string } }[]>(
        `${DATA}/alergenos.json`,
      )
      .pipe(
        delay(150),
        map((filas) =>
          filas.map((f) => ({ codigo: f.codigo, descripcion: f.nombre.es })),
        ),
      );
  }

  validarCliente(codigo: string): Observable<ValidacionCliente> {
    return this.http.get<CuentaHabitacion[]>(`${DATA}/cuentas.json`).pipe(
      delay(300),
      map((cuentas): ValidacionCliente => {
        const cuenta = cuentas.find((c) => c.codigo === codigo.trim().toUpperCase());
        if (!cuenta) return { valido: false, motivo: 'codigo_invalido' };
        return {
          valido: true,
          motivo: 'ok',
          cliente: {
            codigo: cuenta.codigo,
            habitacion: cuenta.habitacion,
            nombre: cuenta.huesped,
          },
        };
      }),
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
