import { Injectable, computed, inject, signal } from '@angular/core';

import { LocalService } from './local.service';
import { CartaService } from './carta.service';
import { HorarioPedidos } from '../models/local.models';
import {
  estaAbierto,
  franjasDeCarta,
  proximaApertura,
} from '../utils/horario.util';

/**
 * Determina si se pueden hacer pedidos ahora mismo, según el horario que llega
 * en `getLocales`. Si hay una carta seleccionada, el estado se calcula solo con
 * las franjas de esa carta (una carta está "abierta" en su franja horaria).
 * Refresca la hora cada 30 s para que la UI abra/cierre sola. Usa la hora local
 * del dispositivo.
 */
@Injectable({ providedIn: 'root' })
export class HorarioService {
  private readonly local = inject(LocalService);
  private readonly carta = inject(CartaService);
  private readonly _ahora = signal(new Date());

  constructor() {
    setInterval(() => this._ahora.set(new Date()), 30_000);
  }

  readonly ahora = this._ahora.asReadonly();

  /** Horario relevante: el de la carta elegida, o el del local si no hay carta. */
  private readonly horarioActivo = computed<HorarioPedidos | null>(() => {
    const l = this.local.localActivo();
    if (!l) return null;
    const cod = this.carta.cartaActiva()?.codcarta;
    return cod ? franjasDeCarta(l.horario, cod) : l.horario;
  });

  readonly pedidosAbiertos = computed(() => {
    const h = this.horarioActivo();
    return h ? estaAbierto(h, this._ahora()) : false;
  });

  readonly proximaApertura = computed(() => {
    const h = this.horarioActivo();
    return h ? proximaApertura(h, this._ahora()) : null;
  });
}
