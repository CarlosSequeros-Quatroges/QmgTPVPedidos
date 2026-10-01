import { Component, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { PedidosApi } from '../../api/pedidos-api';
import { CestaService } from '../../services/cesta.service';
import { IdiomaService } from '../../services/idioma.service';
import { HorarioService } from '../../services/horario.service';
import { ClienteService } from '../../services/cliente.service';
import { LocalService } from '../../services/local.service';
import { EmpresaService } from '../../services/empresa.service';
import { PedidoService } from '../../services/pedido.service';
import { PuntosService } from '../../services/puntos.service';
import { AvisoHorario } from '../../components/aviso-horario/aviso-horario';
import { SlotPipe } from '../../pipes/slot.pipe';
import { FormaPago, Pedido } from '../../models/pedido.models';
import { ValidacionCargo } from '../../models/cliente.models';

@Component({
  selector: 'app-checkout',
  imports: [RouterLink, AvisoHorario, SlotPipe],
  templateUrl: './checkout.html',
  styleUrl: './checkout.scss',
})
export class Checkout {
  protected readonly cesta = inject(CestaService);
  protected readonly idiomas = inject(IdiomaService);
  protected readonly horario = inject(HorarioService);
  protected readonly cliente = inject(ClienteService);
  private readonly local = inject(LocalService);
  protected readonly empresa = inject(EmpresaService);
  protected readonly puntos = inject(PuntosService);
  private readonly api = inject(PedidosApi);
  private readonly pedidos = inject(PedidoService);
  private readonly router = inject(Router);

  protected readonly formaPago = signal<FormaPago | null>(null);
  protected readonly validacion = signal<ValidacionCargo | null>(null);
  protected readonly validando = signal(false);
  protected readonly enviando = signal(false);

  constructor() {
    // Carga zonas/puntos; si el QR trae ?punto=, queda fijado.
    this.puntos.cargar().subscribe();
  }

  protected readonly puedeConfirmar = computed(() => {
    const f = this.formaPago();
    if (!f || this.cesta.vacia() || !this.horario.pedidosAbiertos()) return false;
    if (!this.puntos.completo()) return false;
    if (f === 'habitacion') return this.validacion()?.permitido === true;
    return true;
  });

  /**
   * El cargo a habitación queda bloqueado si una comprobación de saldo falló
   * (saldo insuficiente o no se pudo recuperar): el botón se deshabilita y el
   * huésped debe elegir efectivo o tarjeta.
   */
  protected readonly cargoBloqueado = computed(() => {
    const v = this.validacion();
    return !!v && !v.permitido;
  });

  seleccionarPago(forma: FormaPago): void {
    if (forma === 'habitacion') {
      // Si ya se comprobó y no hay saldo, el botón está deshabilitado: nada que hacer.
      if (this.cargoBloqueado() || !this.cliente.tieneCodigo() || this.validando()) return;
      this.formaPago.set('habitacion');
      this.validar();
      return;
    }
    this.formaPago.set(forma);
  }

  validar(): void {
    this.validando.set(true);
    this.validacion.set(null);
    this.cliente.validarCargo(this.cesta.total()).subscribe((v) => {
      this.validacion.set(v);
      this.validando.set(false);
      // Si no hay saldo, se deselecciona para que elija efectivo/tarjeta.
      if (!v.permitido) this.formaPago.set(null);
    });
  }

  confirmar(): void {
    const forma = this.formaPago();
    const activo = this.local.localActivo();
    if (!forma || !activo || !this.puedeConfirmar() || this.enviando()) return;

    const pedido: Pedido = {
      codtpv: activo.codtpv,
      tmenu: activo.tmenu,
      codzona: this.puntos.codigoZona(),
      codpunto: this.puntos.codigoPunto(),
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
        this.router.navigate(this.empresa.ruta('confirmacion', confirmado.id));
      },
      error: () => this.enviando.set(false),
    });
  }
}
