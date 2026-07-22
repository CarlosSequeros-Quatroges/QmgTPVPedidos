import { Routes } from '@angular/router';

import { localSeleccionadoGuard } from './guards/local-seleccionado.guard';

export const routes: Routes = [
  {
    path: '',
    title: 'Elige un local',
    loadComponent: () =>
      import('./pages/seleccion-local/seleccion-local').then(
        (m) => m.SeleccionLocal,
      ),
  },
  {
    path: 'carta',
    title: 'Carta',
    canActivate: [localSeleccionadoGuard],
    loadComponent: () =>
      import('./pages/familias/familias').then((m) => m.Familias),
  },
  {
    path: 'familia/:id',
    title: 'Familia',
    canActivate: [localSeleccionadoGuard],
    loadComponent: () => import('./pages/platos/platos').then((m) => m.Platos),
  },
  {
    path: 'plato/:id',
    title: 'Plato',
    canActivate: [localSeleccionadoGuard],
    loadComponent: () =>
      import('./pages/plato-detalle/plato-detalle').then((m) => m.PlatoDetalle),
  },
  {
    path: 'cesta',
    title: 'Tu pedido',
    canActivate: [localSeleccionadoGuard],
    loadComponent: () => import('./pages/cesta/cesta').then((m) => m.Cesta),
  },
  {
    path: 'checkout',
    title: 'Finalizar pedido',
    canActivate: [localSeleccionadoGuard],
    loadComponent: () =>
      import('./pages/checkout/checkout').then((m) => m.Checkout),
  },
  {
    path: 'confirmacion/:id',
    title: 'Pedido confirmado',
    loadComponent: () =>
      import('./pages/confirmacion/confirmacion').then((m) => m.Confirmacion),
  },
  {
    path: 'mi-codigo',
    title: 'Mi código',
    loadComponent: () =>
      import('./pages/registro-codigo/registro-codigo').then(
        (m) => m.RegistroCodigo,
      ),
  },
  { path: '**', redirectTo: '' },
];
