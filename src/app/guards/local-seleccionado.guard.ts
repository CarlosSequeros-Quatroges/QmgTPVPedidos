import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs';

import { LocalService } from '../services/local.service';
import { CartaService } from '../services/carta.service';
import { EmpresaService } from '../services/empresa.service';

/**
 * Exige que haya un local seleccionado para entrar a la carta/cesta/checkout.
 * Asegura primero que los locales están cargados (para resolver la selección
 * persistida); si no hay local válido, va a la pantalla de selección.
 * De paso, dispara la carga de la carta del `tmenu` del local activo.
 */
export const localSeleccionadoGuard: CanActivateFn = () => {
  const local = inject(LocalService);
  const carta = inject(CartaService);
  const empresa = inject(EmpresaService);
  const router = inject(Router);

  return local.asegurarLocales().pipe(
    map(() => {
      const activo = local.localActivo();
      if (!activo) {
        return router.createUrlTree(empresa.ruta());
      }
      carta.cargarCarta(activo.codtpv, activo.tmenu).subscribe({
        error: () => {
          /* el estado de error se muestra vía CartaService.error() */
        },
      });
      return true;
    }),
  );
};
