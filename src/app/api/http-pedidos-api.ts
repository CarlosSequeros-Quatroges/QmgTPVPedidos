import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, map, of } from 'rxjs';

import { apiBase } from './api.config';
import { CartaLocal, LocalesEmpresa, PedidosApi } from './pedidos-api';
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
  RespuestaGrabaPedido,
  RespuestaLocales,
  RespuestaCredito,
  RespuestaPuntos,
  RespuestaRegistroCliente,
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
 */
@Injectable({ providedIn: 'root' })
export class HttpPedidosApi extends PedidosApi {
  private readonly http = inject(HttpClient);
  private readonly empresa = inject(EmpresaService);
  private readonly idiomas = inject(IdiomaService);

  getLocales(): Observable<LocalesEmpresa> {
    return this.http.get<RespuestaLocales>(`${apiBase()}/getLocales`).pipe(
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
      .get<RespuestaCarta>(`${apiBase()}/getCarta`, {
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
      .get<RespuestaAlergenos>(`${apiBase()}/getAlergenos`)
      .pipe(map((r) => comprobar(r).alergenos ?? []));
  }

  getPuntosPedidos(): Observable<Zona[]> {
    return this.http
      .get<RespuestaPuntos>(`${apiBase()}/getPuntosPedidos`)
      .pipe(map((r) => (comprobar(r).zonas ?? []).map(normalizarZona)));
  }

  registrarCliente(
    habitacion: string,
    documento: string,
  ): Observable<ValidacionCliente> {
    return this.http
      .get<RespuestaRegistroCliente>(`${apiBase()}/registraCliente`, {
        params: { habitacion, documento },
      })
      .pipe(
        map((r) => {
          // errnum 1/2 = habitación no ocupada o documento no registrado.
          if (r.errnum !== 0 || !r.reserva) {
            return { valido: false, motivo: 'no_encontrado' as const };
          }
          return {
            valido: true,
            motivo: 'ok' as const,
            cliente: { codigo: r.reserva, habitacion },
          };
        }),
      );
  }

  validarCargoHabitacion(
    codigo: string,
    importe: number,
  ): Observable<ValidacionCargo> {
    // El código guardado es el nº de reserva en base64; la API lo quiere como
    // entero. Si no se puede decodificar, se trata como "no recuperable".
    let ref: string;
    try {
      ref = atob(codigo).trim();
    } catch {
      return of<ValidacionCargo>({ permitido: false, motivo: 'error' });
    }
    if (!ref) return of<ValidacionCargo>({ permitido: false, motivo: 'error' });

    return this.http
      .get<RespuestaCredito>(`${apiBase()}/recuperaCredito`, {
        params: { codigo: ref },
      })
      .pipe(
        map((r): ValidacionCargo => {
          const saldo = r.credito != null ? Number(r.credito) : NaN;
          if (r.errnum !== 0 || Number.isNaN(saldo)) {
            return { permitido: false, motivo: 'error' };
          }
          if (saldo < importe) {
            return { permitido: false, motivo: 'sin_saldo', saldoDisponible: saldo };
          }
          return { permitido: true, motivo: 'ok', saldoDisponible: saldo };
        }),
        catchError(() =>
          of<ValidacionCargo>({ permitido: false, motivo: 'error' }),
        ),
      );
  }

  crearPedido(pedido: Pedido): Observable<PedidoConfirmado> {
    // Comanda web (subconjunto del modelo del comandero).
    const comanda = construirComanda(
      pedido,
      this.empresa.codigo() ?? '',
      this.idiomas.slotDe('es'),
    );
    return this.http
      .post<RespuestaGrabaPedido>(`${apiBase()}/grabaLineas`, comanda)
      .pipe(
        map((r) => {
          const c = comprobar(r);
          return {
            id: String(c.codenl),
            estado: 'recibido' as const,
            pedido,
            mesa: c.mesa,
            codenl: c.codenl,
            nlineas: c.nlineas,
          };
        }),
      );
  }
}
