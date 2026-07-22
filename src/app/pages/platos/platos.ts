import { Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';

import { CartaService } from '../../services/carta.service';
import { IdiomaService } from '../../services/idioma.service';
import { LocPipe } from '../../pipes/loc.pipe';

@Component({
  selector: 'app-platos',
  imports: [RouterLink, LocPipe],
  templateUrl: './platos.html',
  styleUrl: './platos.scss',
})
export class Platos {
  protected readonly carta = inject(CartaService);
  protected readonly idiomas = inject(IdiomaService);

  /** Id de familia recibido desde la ruta (`/familia/:id`). */
  readonly id = input.required<string>();

  private readonly familiaId = computed(() => Number(this.id()));

  protected readonly familia = computed(() =>
    this.carta.familia(this.familiaId()),
  );

  protected readonly platos = computed(() =>
    this.carta.platosDeFamilia(this.familiaId()),
  );
}
