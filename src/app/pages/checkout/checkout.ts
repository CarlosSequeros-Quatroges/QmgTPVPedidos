import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { PedidosApi } from '../../api/pedidos-api';
import { CestaService } from '../../services/cesta.service';
import { IdiomaService } from '../../services/idioma.service';
import { HorarioService } from '../../services/horario.service';
import { ClienteService } from '../../services/cliente.service';
import { LocalService } from '../../services/local.service';
import { PedidoService } from '../../services/pedido.service';
import { AvisoHorario } from '../../components/aviso-horario/aviso-horario';
import { FormaPago, Pedido } from '../../models/pedido.models';
import { ValidacionCargo } from '../../models/cliente.models';

@Component({
  selector: 'app-checkout',
  imports: [RouterLink, AvisoHorario],
  templateUrl: './checkout.html',
  styleUrl: './checkout.scss',
})
export class Checkout {
  protected readonly cesta = inject(CestaService);
  protected readonly idiomas = inject(IdiomaService);
  protected readonly horario = inject(HorarioService);
  protected readonly cliente = inject(ClienteService);
  private readonly local = inject(LocalService);
  private readonly api = inject(PedidosApi);
  private readonly pedidos = inject(PedidoService);
  private readonly router = inject(Router);

  protected readonly formaPago = signal<FormaPago | null>(null);
  protected readonly validacion = signal<ValidacionCargo | null>(null);
  protected readonly validando = signal(false);
  protected readonly enviando = signal(false);

  protected readonly puedeConfirmar = computed(() => {
    const f = this.formaPago();
    if (!f || this.cesta.vacia() || !this.horario.pedidosAbiertos()) return false;
    if (f === 'habitacion') return this.validacion()?.permitido === true;
    return true;
  });

  seleccionarPago(forma: FormaPago): void {
    this.formaPago.set(forma);
    this.validacion.set(null);
    if (forma === 'habitacion' && this.cliente.tieneCodigo()) {
      this.validar();
    }
  }

  validar(): void {
    this.validando.set(true);
    this.cliente.validarCargo(this.cesta.total()).subscribe((v) => {
      this.validacion.set(v);
      this.validando.set(false);
    });
  }

  confirmar(): void {
    const forma = this.formaPago();
    const carga = this.local.cargaActiva();
    if (!forma || !carga || !this.puedeConfirmar() || this.enviando()) return;

    const pedido: Pedido = {
      codtpv: carga.codtpv,
      codmenu: carga.codmenu,
      lineas: this.cesta.lineas(),
      total: this.cesta.total(),
      formaPago: forma,
      codigoCliente:
        forma === 'habitacion' ? (this.cliente.codigo() ?? undefined) : undefined,
      idioma: this.idiomas.idioma(),
      creadoEn: new Date().toISOString(),
    };

    this.enviando.set(true);
    this.api.crearPedido(pedido).subscribe({
      next: (confirmado) => {
        this.pedidos.guardar(confirmado);
        this.cesta.vaciar();
        this.router.navigateByUrl(`/confirmacion/${confirmado.id}`);
      },
      error: () => this.enviando.set(false),
    });
  }
}
