import { Component, computed, inject, input, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { CartaService } from '../../services/carta.service';
import { IdiomaService } from '../../services/idioma.service';
import { HorarioService } from '../../services/horario.service';
import { CestaService } from '../../services/cesta.service';
import { EmpresaService } from '../../services/empresa.service';
import { LocPipe } from '../../pipes/loc.pipe';
import { AvisoHorario } from '../../components/aviso-horario/aviso-horario';

@Component({
  selector: 'app-plato-detalle',
  imports: [RouterLink, LocPipe, AvisoHorario],
  templateUrl: './plato-detalle.html',
  styleUrl: './plato-detalle.scss',
})
export class PlatoDetalle {
  protected readonly carta = inject(CartaService);
  protected readonly idiomas = inject(IdiomaService);
  protected readonly horario = inject(HorarioService);
  private readonly cesta = inject(CestaService);
  protected readonly empresa = inject(EmpresaService);
  private readonly router = inject(Router);

  /** Código de producto recibido desde la ruta (`/plato/:id`). */
  readonly id = input.required<string>();

  protected readonly producto = computed(() =>
    this.carta.producto(Number(this.id())),
  );

  protected readonly nota = signal('');
  protected readonly cantidad = signal(1);

  protected readonly precioTotal = computed(
    () => (this.producto()?.precio ?? 0) * this.cantidad(),
  );

  cambiarCantidad(delta: number): void {
    this.cantidad.update((c) => Math.max(1, c + delta));
  }

  setNota(valor: string): void {
    this.nota.set(valor);
  }

  anadir(): void {
    const p = this.producto();
    if (!p) return;
    // Los extras llegarán con `getSubFamilias`; de momento, ninguno.
    this.cesta.agregar(p, [], this.nota(), this.cantidad());
    this.router.navigate(this.empresa.ruta('cesta'));
  }
}
