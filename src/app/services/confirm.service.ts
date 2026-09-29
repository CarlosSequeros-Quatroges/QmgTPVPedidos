import { Injectable, signal } from '@angular/core';

/** Petición de confirmación en curso (la pinta el componente raíz). */
export interface PeticionConfirmacion {
  mensaje: string;
  confirmar: string;
  cancelar: string;
  resolver: (aceptado: boolean) => void;
}

/**
 * Confirmación modal sencilla basada en promesa. Un componente pide
 * `confirmar(...)` y espera el booleano; el diálogo se pinta en el componente
 * raíz (`App`) leyendo `peticion()`, y sus botones llaman a `responder()`.
 */
@Injectable({ providedIn: 'root' })
export class ConfirmService {
  private readonly _peticion = signal<PeticionConfirmacion | null>(null);
  readonly peticion = this._peticion.asReadonly();

  confirmar(opts: {
    mensaje: string;
    confirmar: string;
    cancelar: string;
  }): Promise<boolean> {
    return new Promise((resolver) => {
      this._peticion.set({ ...opts, resolver });
    });
  }

  responder(aceptado: boolean): void {
    const p = this._peticion();
    if (!p) return;
    this._peticion.set(null);
    p.resolver(aceptado);
  }
}
