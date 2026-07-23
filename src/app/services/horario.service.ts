import { Injectable, computed, inject, signal } from '@angular/core';

import { LocalService } from './local.service';
import { estaAbierto, proximaApertura } from '../utils/horario.util';

/**
 * Determina si el local activo acepta pedidos ahora mismo, según el horario que
 * llega en `getLocales`. Refresca la hora cada 30 s para que la UI abra/cierre
 * sola. Usa la hora local del dispositivo.
 */
@Injectable({ providedIn: 'root' })
export class HorarioService {
  private readonly local = inject(LocalService);
  private readonly _ahora = signal(new Date());

  constructor() {
    setInterval(() => this._ahora.set(new Date()), 30_000);
  }

  readonly ahora = this._ahora.asReadonly();

  readonly pedidosAbiertos = computed(() => {
    const l = this.local.localActivo();
    return l ? estaAbierto(l.horario, this._ahora()) : false;
  });

  readonly proximaApertura = computed(() => {
    const l = this.local.localActivo();
    return l ? proximaApertura(l.horario, this._ahora()) : null;
  });
}
