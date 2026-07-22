import { Component, inject } from '@angular/core';

import { HorarioService } from '../../services/horario.service';
import { IdiomaService } from '../../services/idioma.service';

/**
 * Banner que avisa de que el local está fuera de horario de pedidos.
 * No renderiza nada cuando los pedidos están abiertos.
 */
@Component({
  selector: 'app-aviso-horario',
  imports: [],
  template: `
    @if (!horario.pedidosAbiertos()) {
      <div class="aviso">
        <span aria-hidden="true">⏰</span>
        <div>
          <strong>{{ idiomas.txt().fueraDeHorario }}</strong
          ><br />
          {{ idiomas.txt().puedesConsultar }}
          @if (horario.proximaApertura(); as ap) {
            {{ idiomas.txt().abrePedidos }} {{ formatoHora(ap) }}.
          }
        </div>
      </div>
    }
  `,
})
export class AvisoHorario {
  protected readonly horario = inject(HorarioService);
  protected readonly idiomas = inject(IdiomaService);

  protected formatoHora(fecha: Date): string {
    const idioma = this.idiomas.idioma();
    const mismoDia = fecha.toDateString() === new Date().toDateString();
    const opts: Intl.DateTimeFormatOptions = mismoDia
      ? { hour: '2-digit', minute: '2-digit' }
      : { weekday: 'long', hour: '2-digit', minute: '2-digit' };
    return new Intl.DateTimeFormat(idioma, opts).format(fecha);
  }
}
