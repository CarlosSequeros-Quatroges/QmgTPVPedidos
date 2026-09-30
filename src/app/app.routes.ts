import { Routes } from '@angular/router';

import { empresaGuard } from './guards/empresa.guard';
import { localSeleccionadoGuard } from './guards/local-seleccionado.guard';

export const routes: Routes = [
  // Ruta literal antes que :empresa, para que no la capture el parámetro.
  {
    path: 'error',
    title: 'Página no encontrada',
    loadComponent: () =>
      import('./pages/no-encontrado/no-encontrado').then((m) => m.NoEncontrado),
  },
  {
    // Código de empresa (base de datos): #/800/...
    path: ':empresa',
    canActivate: [empresaGuard],
    children: [
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
        loadComponent: () =>
          import('./pages/platos/platos').then((m) => m.Platos),
      },
      {
        path: 'plato/:id',
        title: 'Plato',
        canActivate: [localSeleccionadoGuard],
        loadComponent: () =>
          import('./pages/plato-detalle/plato-detalle').then(
            (m) => m.PlatoDetalle,
          ),
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
          import('./pages/confirmacion/confirmacion').then(
            (m) => m.Confirmacion,
          ),
      },
      {
        path: 'mis-pedidos',
        title: 'Mis pedidos',
        loadComponent: () =>
          import('./pages/mis-pedidos/mis-pedidos').then((m) => m.MisPedidos),
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
    ],
  },
  { path: '**', redirectTo: 'error' },
];
