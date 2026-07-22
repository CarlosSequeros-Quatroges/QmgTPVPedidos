import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { map } from 'rxjs';

import { LocalService } from '../services/local.service';
import { CartaService } from '../services/carta.service';

/**
 * Exige que haya un local seleccionado para entrar a la carta/cesta/checkout.
 * Asegura primero que las cargas están cargadas (para resolver la selección
 * persistida); si no hay local válido, redirige a la pantalla de selección.
 * De paso, dispara la carga de la carta del local activo.
 */
export const localSeleccionadoGuard: CanActivateFn = () => {
  const local = inject(LocalService);
  const carta = inject(CartaService);
  const router = inject(Router);

  return local.asegurarCargas().pipe(
    map(() => {
      const carga = local.cargaActiva();
      if (!carga) return router.parseUrl('/');
      carta.cargarCarta(carga.codtpv, carga.codmenu).subscribe({
        error: () => {
          /* el estado de error se muestra vía CartaService.error() */
        },
      });
      return true;
    }),
  );
};
