import { Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { CartaService } from '../../services/carta.service';
import { IdiomaService } from '../../services/idioma.service';
import { EmpresaService } from '../../services/empresa.service';
import { LocPipe } from '../../pipes/loc.pipe';
import { SlotPipe } from '../../pipes/slot.pipe';
import { FotoProducto } from '../../components/foto-producto/foto-producto';

@Component({
  selector: 'app-platos',
  imports: [RouterLink, LocPipe, SlotPipe, FotoProducto],
  templateUrl: './platos.html',
  styleUrl: './platos.scss',
})
export class Platos {
  protected readonly carta = inject(CartaService);
  protected readonly idiomas = inject(IdiomaService);
  protected readonly empresa = inject(EmpresaService);

  /** `codfamilia` recibido desde la ruta (`/familia/:id`). */
  readonly id = input.required<string>();

  private readonly codfamilia = computed(() => Number(this.id()));

  protected readonly familia = computed(() =>
    this.carta.familia(this.codfamilia()),
  );

  protected readonly productos = computed(() =>
    this.carta.productosDeFamilia(this.codfamilia()),
  );
}
