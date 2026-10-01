import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { App } from './app/app';
import { cargarConfig } from './app/api/api.config';

/**
 * Captura el punto de pedido del QR (`?punto=ZONA-PPP`) ANTES del bootstrap: el
 * router de hash descarta la query en su primera navegación, así que se guarda
 * en `sessionStorage` para que el checkout lo recupere.
 */
try {
  const buscar = (qs: string) => new URLSearchParams(qs).get('punto');
  const iHash = location.hash.indexOf('?');
  const punto =
    buscar(location.search) ||
    (iHash >= 0 ? buscar(location.hash.slice(iHash)) : null);
  if (punto) sessionStorage.setItem('pedidos.punto', punto);
} catch {
  /* sessionStorage puede no estar disponible */
}

// La URL de la API se lee de `data/config.json` ANTES de arrancar Angular, para
// que interceptor y servicios usen ya el valor definitivo.
cargarConfig().then(() =>
  bootstrapApplication(App, appConfig).catch((err) => console.error(err)),
);
