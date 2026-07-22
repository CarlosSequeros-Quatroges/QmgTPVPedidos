import { Injectable, computed, inject, signal } from '@angular/core';

import { CartaService } from './carta.service';
import { estaAbierto, proximaApertura } from '../utils/horario.util';

/**
 * Determina si el local acepta pedidos ahora mismo, según el horario que llega
 * con la carta. Refresca la hora cada 30 s para que la UI abra/cierre sola.
 * Nota: usa la hora local del dispositivo (la API real traerá la zona del hotel).
 */
@Injectable({ providedIn: 'root' })
export class HorarioService {
  private readonly carta = inject(CartaService);
  private readonly _ahora = signal(new Date());

  constructor() {
    setInterval(() => this._ahora.set(new Date()), 30_000);
  }

  readonly ahora = this._ahora.asReadonly();

  readonly pedidosAbiertos = computed(() => {
    const r = this.carta.restaurante();
    return r ? estaAbierto(r.horario, this._ahora()) : false;
  });

  readonly proximaApertura = computed(() => {
    const r = this.carta.restaurante();
    return r ? proximaApertura(r.horario, this._ahora()) : null;
  });
}
