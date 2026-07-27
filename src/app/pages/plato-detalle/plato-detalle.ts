import { Component, computed, inject, input, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { CartaService } from '../../services/carta.service';
import { IdiomaService } from '../../services/idioma.service';
import { HorarioService } from '../../services/horario.service';
import { CestaService } from '../../services/cesta.service';
import { EmpresaService } from '../../services/empresa.service';
import { LocPipe } from '../../pipes/loc.pipe';
import { SlotPipe } from '../../pipes/slot.pipe';
import { AvisoHorario } from '../../components/aviso-horario/aviso-horario';
import { FotoProducto } from '../../components/foto-producto/foto-producto';
import { ExtraSeleccionado, MarcaExtra } from '../../models/extra.models';

@Component({
  selector: 'app-plato-detalle',
  imports: [RouterLink, LocPipe, SlotPipe, AvisoHorario, FotoProducto],
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

  protected readonly producto = computed(() => this.carta.producto(this.id()));

  /** Extras disponibles para el producto (según su subfamilia). */
  protected readonly extras = computed(() =>
    this.carta.extrasDe(this.producto()?.codsub ?? ''),
  );

  /** Marca elegida por extra: 'con' | 'sin' | (sin entrada = no marcado). */
  protected readonly marcas = signal<Record<string, MarcaExtra>>({});

  protected readonly nota = signal('');
  protected readonly cantidad = signal(1);

  /** Suma de los extras marcados "con". */
  private readonly precioExtras = computed(() => {
    const marcas = this.marcas();
    return this.extras()
      .filter((e) => marcas[e.codigo] === 'con')
      .reduce((s, e) => s + e.precio, 0);
  });

  protected readonly precioUnitario = computed(
    () => (this.producto()?.precio ?? 0) + this.precioExtras(),
  );

  protected readonly precioTotal = computed(
    () => this.precioUnitario() * this.cantidad(),
  );

  marca(codigo: string): MarcaExtra | undefined {
    return this.marcas()[codigo];
  }

  /** Marca un extra; si ya tenía esa marca, lo desmarca (vuelve a "nada"). */
  marcarExtra(codigo: string, marca: MarcaExtra): void {
    this.marcas.update((prev) => {
      const next = { ...prev };
      if (next[codigo] === marca) delete next[codigo];
      else next[codigo] = marca;
      return next;
    });
  }

  cambiarCantidad(delta: number): void {
    this.cantidad.update((c) => Math.max(1, c + delta));
  }

  setNota(valor: string): void {
    this.nota.set(valor);
  }

  anadir(): void {
    const p = this.producto();
    if (!p) return;
    const marcas = this.marcas();
    const extras: ExtraSeleccionado[] = this.extras()
      .filter((e) => marcas[e.codigo])
      .map((e) => ({
        codigo: e.codigo,
        nombres: e.nombres,
        marca: marcas[e.codigo],
        precio: marcas[e.codigo] === 'con' ? e.precio : 0,
      }));
    this.cesta.agregar(p, extras, this.nota(), this.cantidad());
    this.router.navigate(this.empresa.ruta('cesta'));
  }
}
