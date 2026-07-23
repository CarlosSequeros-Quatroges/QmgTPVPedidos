import { Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { PedidoService } from '../../services/pedido.service';
import { IdiomaService } from '../../services/idioma.service';
import { EmpresaService } from '../../services/empresa.service';
import { FormaPago } from '../../models/pedido.models';

@Component({
  selector: 'app-confirmacion',
  imports: [RouterLink],
  templateUrl: './confirmacion.html',
  styleUrl: './confirmacion.scss',
})
export class Confirmacion {
  private readonly pedidos = inject(PedidoService);
  protected readonly idiomas = inject(IdiomaService);
  protected readonly empresa = inject(EmpresaService);

  /** Id del pedido recibido desde la ruta (`/confirmacion/:id`). */
  readonly id = input.required<string>();

  protected readonly confirmado = computed(() => {
    const ultimo = this.pedidos.ultimo();
    return ultimo && ultimo.id === this.id() ? ultimo : null;
  });

  /** Nº corto legible para mostrar. */
  protected readonly numeroCorto = computed(() =>
    this.id().slice(0, 8).toUpperCase(),
  );

  protected formaPagoTexto(forma: FormaPago): string {
    const t = this.idiomas.txt();
    return forma === 'efectivo'
      ? t.efectivo
      : forma === 'tarjeta'
        ? t.tarjeta
        : t.cargoHabitacion;
  }
}
