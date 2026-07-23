import { Injectable, computed, signal } from '@angular/core';

/** El código de empresa son exactamente 3 dígitos (p. ej. "800"). */
export function esEmpresaValida(codigo: string | null | undefined): boolean {
  return !!codigo && /^\d{3}$/.test(codigo);
}

/**
 * Código de empresa (base de datos a la que conectar) que llega en la ruta:
 * `#/{empresa}/...`. Lo fija el guard y lo consume el interceptor para
 * añadirlo como `codemp` a las llamadas de la API.
 */
@Injectable({ providedIn: 'root' })
export class EmpresaService {
  private readonly _codigo = signal<string | null>(null);

  readonly codigo = this._codigo.asReadonly();
  readonly hayEmpresa = computed(() => esEmpresaValida(this._codigo()));

  fijar(codigo: string): void {
    this._codigo.set(codigo);
  }

  /**
   * Construye una ruta absoluta manteniendo el código de empresa.
   * `ruta('carta')` → `['/', '800', 'carta']`
   */
  ruta(...segmentos: (string | number)[]): (string | number)[] {
    return ['/', this._codigo() ?? '', ...segmentos];
  }
}
