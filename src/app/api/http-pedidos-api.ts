import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';

import { API_BASE } from './api.config';
import { CartaLocal, LocalesEmpresa, PedidosApi } from './pedidos-api';
import { MockPedidosApi } from './mock-pedidos-api';
import { Alergeno } from '../models/carta.models';
import { normalizarCarta } from '../models/local.models';
import { Zona, normalizarZona } from '../models/zona.models';
import { construirComanda } from '../models/comanda.models';
import { EmpresaService } from '../services/empresa.service';
import { IdiomaService } from '../services/idioma.service';
import {
  RespuestaAlergenos,
  RespuestaApi,
  RespuestaCarta,
  RespuestaLocales,
  RespuestaPuntos,
} from '../models/respuesta.models';
import { ValidacionCargo, ValidacionCliente } from '../models/cliente.models';
import { Pedido, PedidoConfirmado } from '../models/pedido.models';

/** Lanza un error si la respuesta no viene con errnum 0. */
function comprobar<T extends RespuestaApi>(r: T): T {
  if (r.errnum !== 0) {
    throw new Error(r.errdesc || r.msg || `Error de la API (${r.errnum})`);
  }
  return r;
}

/**
 * Implementación contra la **API real**.
 *
 * El código de empresa (`codemp`) lo añade el interceptor a partir del que
 * viene en la ruta, así que aquí no aparece.
 *
 * Los endpoints que todavía no están disponibles se delegan en
 * {@link MockPedidosApi}; se irán sustituyendo conforme se publiquen.
 */
@Injectable({ providedIn: 'root' })
export class HttpPedidosApi extends PedidosApi {
  private readonly http = inject(HttpClient);
  private readonly mock = inject(MockPedidosApi);
  private readonly empresa = inject(EmpresaService);
  private readonly idiomas = inject(IdiomaService);

  getLocales(): Observable<LocalesEmpresa> {
    return this.http.get<RespuestaLocales>(`${API_BASE}/getLocales`).pipe(
      map((r) => {
        const c = comprobar(r);
        return {
          locales: c.locales ?? [],
          idiomas: c.idiomas ?? [],
          cartas: (c.cartas ?? []).map(normalizarCarta),
        };
      }),
    );
  }

  getCarta(codtpv: string, tmenu: number): Observable<CartaLocal> {
    return this.http
      .get<RespuestaCarta>(`${API_BASE}/getCarta`, {
        params: { codtpv, tmenu },
      })
      .pipe(
        map((r) => {
          const c = comprobar(r);
          return {
            familias: c.familias ?? [],
            productos: c.productos ?? [],
            subfamilias: c.subfamilias ?? [],
          };
        }),
      );
  }

  getAlergenos(): Observable<Alergeno[]> {
    return this.http
      .get<RespuestaAlergenos>(`${API_BASE}/getAlergenos`)
      .pipe(map((r) => comprobar(r).alergenos ?? []));
  }

  getPuntosPedidos(): Observable<Zona[]> {
    return this.http
      .get<RespuestaPuntos>(`${API_BASE}/getPuntosPedidos`)
      .pipe(map((r) => (comprobar(r).zonas ?? []).map(normalizarZona)));
  }

  // --- Pendientes de API real: por ahora, datos simulados ---

  validarCliente(codigo: string): Observable<ValidacionCliente> {
    return this.mock.validarCliente(codigo);
  }

  validarCargoHabitacion(
    codigo: string,
    importe: number,
  ): Observable<ValidacionCargo> {
    return this.mock.validarCargoHabitacion(codigo, importe);
  }

  crearPedido(pedido: Pedido): Observable<PedidoConfirmado> {
    // Comanda web (subconjunto del modelo del comandero) lista para enviar.
    const comanda = construirComanda(
      pedido,
      this.empresa.codigo() ?? '',
      this.idiomas.slotDe('es'),
    );
    // TODO: endpoint real pendiente. Cuando exista:
    //   return this.http.post<RespuestaPedido>(`${API_BASE}/crearPedido`, comanda)
    //     .pipe(map((r) => ...));
    console.log('[crearPedido] comanda a enviar:\n' + JSON.stringify(comanda, null, 2));
    return this.mock.crearPedido(pedido);
  }
}
