import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, delay, map, of } from 'rxjs';

import { CartaLocal, LocalesEmpresa, PedidosApi } from './pedidos-api';
import { Alergeno } from '../models/carta.models';
import { Zona } from '../models/zona.models';
import { ValidacionCargo, ValidacionCliente } from '../models/cliente.models';
import { Pedido, PedidoConfirmado } from '../models/pedido.models';

const DATA = 'data';

/**
 * Implementación simulada de {@link PedidosApi} (desarrollo sin backend y
 * tests). En producción el provider activo es {@link HttpPedidosApi} (API real);
 * aquí la carta va vacía. El cargo a habitación es un **stub** a la espera del
 * método de registro real en el backend (ya no usa datos de prueba).
 */
@Injectable({ providedIn: 'root' })
export class MockPedidosApi extends PedidosApi {
  private readonly http = inject(HttpClient);

  getLocales(): Observable<LocalesEmpresa> {
    return of<LocalesEmpresa>({ locales: [], idiomas: [], cartas: [] }).pipe(
      delay(100),
    );
  }

  getCarta(): Observable<CartaLocal> {
    return of<CartaLocal>({ familias: [], productos: [], subfamilias: [] }).pipe(
      delay(100),
    );
  }

  getAlergenos(): Observable<Alergeno[]> {
    // Catálogo de alérgenos a partir de la tabla local de textos de la app.
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

  getPuntosPedidos(): Observable<Zona[]> {
    // Sin backend: dos zonas de ejemplo con un par de puntos.
    return of<Zona[]>([
      {
        id: 1,
        codigo: 'PIS',
        nombres: ['PISCINA', 'POOL', 'PISCINA', 'PISCINA'],
        puntos: [
          { id: 1, codigo: '001', nombres: ['Hamaca 1', 'Sunbed 1', 'Liege 1', 'Lettino 1'] },
          { id: 2, codigo: '002', nombres: ['Hamaca 2', 'Sunbed 2', 'Liege 2', 'Lettino 2'] },
        ],
      },
      {
        id: 2,
        codigo: 'SOL',
        nombres: ['SOLARIUM', 'SOLARIUM', 'SOLARIUM', 'SOLARIUM'],
        puntos: [
          { id: 3, codigo: '001', nombres: ['Hamaca 1', 'Sunbed 1', 'Liege 1', 'Lettino 1'] },
        ],
      },
    ]).pipe(delay(150));
  }

  /**
   * STUB de registro de cliente (solo para tests / desarrollo sin backend).
   * Acepta cualquier habitación + documento no vacíos y simula un nº de reserva.
   */
  registrarCliente(
    habitacion: string,
    documento: string,
  ): Observable<ValidacionCliente> {
    const hab = habitacion.trim();
    const doc = documento.trim();
    const res: ValidacionCliente =
      hab && doc
        ? { valido: true, motivo: 'ok', cliente: { codigo: btoa(hab), habitacion: hab } }
        : { valido: false, motivo: 'datos_invalidos' };
    return of(res).pipe(delay(200));
  }

  /** STUB de cargo a habitación (pendiente del método real en el backend). */
  validarCargoHabitacion(
    codigo: string,
    _importe: number,
  ): Observable<ValidacionCargo> {
    const res: ValidacionCargo = codigo.trim()
      ? { permitido: true, motivo: 'ok' }
      : { permitido: false, motivo: 'codigo_invalido' };
    return of(res).pipe(delay(200));
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
