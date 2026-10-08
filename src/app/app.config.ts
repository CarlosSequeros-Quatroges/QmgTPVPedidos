import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
  isDevMode,
} from '@angular/core';
import {
  provideRouter,
  withComponentInputBinding,
  withHashLocation,
  TitleStrategy,
} from '@angular/router';
import {
  provideHttpClient,
  withFetch,
  withInterceptors,
} from '@angular/common/http';

import { routes } from './app.routes';
import { provideServiceWorker } from '@angular/service-worker';

import { PedidosApi } from './api/pedidos-api';
import { HttpPedidosApi } from './api/http-pedidos-api';
import { TituloConHotel } from './titulo.strategy';
import { empresaInterceptor } from './api/empresa.interceptor';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes, withComponentInputBinding(), withHashLocation()),
    // El interceptor añade `codemp` (empresa de la ruta) a las llamadas de la API.
    provideHttpClient(withFetch(), withInterceptors([empresaInterceptor])),
    // Título de pestaña: "{ruta} · {establecimiento}".
    { provide: TitleStrategy, useClass: TituloConHotel },
    // API real; los endpoints aún no publicados caen en MockPedidosApi.
    { provide: PedidosApi, useExisting: HttpPedidosApi },
    provideServiceWorker('ngsw-worker.js', {
      enabled: !isDevMode(),
      registrationStrategy: 'registerWhenStable:30000',
    }),
  ],
};
