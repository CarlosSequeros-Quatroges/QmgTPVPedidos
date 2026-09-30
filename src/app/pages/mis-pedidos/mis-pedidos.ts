import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { PedidoService } from '../../services/pedido.service';
import { IdiomaService } from '../../services/idioma.service';
import { EmpresaService } from '../../services/empresa.service';
import { SlotPipe } from '../../pipes/slot.pipe';
import { FormaPago } from '../../models/pedido.models';

/**
 * Pedidos hechos desde este dispositivo (historial cacheado). Sirve de
 * comprobante para enseñar al camarero (nº de pedido = mesa, hora y detalle)
 * si el pedido no llega.
 */
@Component({
  selector: 'app-mis-pedidos',
  imports: [RouterLink, SlotPipe],
  templateUrl: './mis-pedidos.html',
  styleUrl: './mis-pedidos.scss',
})
export class MisPedidos {
  protected readonly pedidos = inject(PedidoService);
  protected readonly idiomas = inject(IdiomaService);
  protected readonly empresa = inject(EmpresaService);

  horaDe(iso: string): string {
    return new Date(iso).toLocaleString();
  }

  formaPagoTexto(forma: FormaPago): string {
    const t = this.idiomas.txt();
    return forma === 'efectivo'
      ? t.efectivo
      : forma === 'tarjeta'
        ? t.tarjeta
        : t.cargoHabitacion;
  }
}
