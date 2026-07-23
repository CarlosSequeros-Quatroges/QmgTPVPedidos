import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';

import { EmpresaService, esEmpresaValida } from '../services/empresa.service';

/**
 * Valida el código de empresa de la ruta (`#/{empresa}/...`) y lo fija en
 * {@link EmpresaService}. Si falta o no son 3 dígitos, va a la página de error.
 */
export const empresaGuard: CanActivateFn = (route) => {
  const codigo = route.paramMap.get('empresa');
  const router = inject(Router);

  if (!esEmpresaValida(codigo)) {
    return router.parseUrl('/error');
  }

  inject(EmpresaService).fijar(codigo!);
  return true;
};
