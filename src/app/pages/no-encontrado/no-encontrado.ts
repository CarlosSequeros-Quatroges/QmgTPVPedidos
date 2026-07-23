import { Component } from '@angular/core';

/**
 * Página mostrada cuando la URL no trae un código de empresa válido
 * (debe ser de 3 dígitos, p. ej. `#/800`).
 */
@Component({
  selector: 'app-no-encontrado',
  imports: [],
  template: `
    <div class="error">
      <div class="error__icono">🔍</div>
      <h1 class="error__titulo">Página no encontrada</h1>
      <p class="error__texto">
        La dirección no es válida. Escanea de nuevo el código QR de la zona de
        pedido para acceder a la carta.
      </p>
    </div>
  `,
  styles: `
    .error {
      max-width: 460px;
      margin: 2rem auto;
      background: var(--color-tarjeta);
      border-radius: var(--radio);
      box-shadow: var(--sombra);
      padding: 2.5rem 1.6rem;
      text-align: center;
    }
    .error__icono {
      font-size: 3rem;
      margin-bottom: 0.5rem;
    }
    .error__titulo {
      margin: 0 0 0.75rem;
      font-size: 1.5rem;
    }
    .error__texto {
      margin: 0;
      color: var(--color-texto-suave);
      line-height: 1.5;
    }
  `,
})
export class NoEncontrado {}
