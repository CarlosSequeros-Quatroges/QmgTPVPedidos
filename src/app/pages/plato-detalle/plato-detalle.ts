import { Component, computed, inject, input, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { CartaService } from '../../services/carta.service';
import { IdiomaService } from '../../services/idioma.service';
import { HorarioService } from '../../services/horario.service';
import { CestaService } from '../../services/cesta.service';
import { EmpresaService } from '../../services/empresa.service';
import { LocPipe } from '../../pipes/loc.pipe';
import { AvisoHorario } from '../../components/aviso-horario/aviso-horario';
import { ExtraSeleccionado } from '../../models/extra.models';

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

  /** Id de plato recibido desde la ruta (`/plato/:id`). */
  readonly id = input.required<string>();

  protected readonly plato = computed(() =>
    this.carta.plato(Number(this.id())),
  );

  /** Ids de extras marcados. */
  protected readonly seleccion = signal<ReadonlySet<number>>(new Set());
  protected readonly nota = signal('');
  protected readonly cantidad = signal(1);

  protected readonly extrasAnadir = computed(
    () => this.plato()?.extras.filter((e) => e.tipo === 'anadir') ?? [],
  );
  protected readonly extrasQuitar = computed(
    () => this.plato()?.extras.filter((e) => e.tipo === 'quitar') ?? [],
  );

  protected readonly precioUnitario = computed(() => {
    const p = this.plato();
    if (!p) return 0;
    const sel = this.seleccion();
    const extras = p.extras
      .filter((e) => sel.has(e.id))
      .reduce((s, e) => s + e.precio, 0);
    return p.precio + extras;
  });

  protected readonly precioTotal = computed(
    () => this.precioUnitario() * this.cantidad(),
  );

  estaSeleccionado(id: number): boolean {
    return this.seleccion().has(id);
  }

  toggleExtra(id: number): void {
    this.seleccion.update((s) => {
      const n = new Set(s);
      if (n.has(id)) n.delete(id);
      else n.add(id);
      return n;
    });
  }

  cambiarCantidad(delta: number): void {
    this.cantidad.update((c) => Math.max(1, c + delta));
  }

  setNota(valor: string): void {
    this.nota.set(valor);
  }

  anadir(): void {
    const p = this.plato();
    if (!p) return;
    const sel = this.seleccion();
    const extras: ExtraSeleccionado[] = p.extras
      .filter((e) => sel.has(e.id))
      .map((e) => ({
        extraId: e.id,
        nombre: e.nombre,
        tipo: e.tipo,
        precio: e.precio,
      }));
    this.cesta.agregar(p, extras, this.nota(), this.cantidad());
    this.router.navigate(this.empresa.ruta('cesta'));
  }
}
