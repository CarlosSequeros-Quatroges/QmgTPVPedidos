import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { CartaService } from '../../services/carta.service';
import { LocalService } from '../../services/local.service';
import { IdiomaService } from '../../services/idioma.service';
import { EmpresaService } from '../../services/empresa.service';
import { AvisoHorario } from '../../components/aviso-horario/aviso-horario';
import { FotoProducto } from '../../components/foto-producto/foto-producto';
import { SlotPipe } from '../../pipes/slot.pipe';
import { IMAGEN_FAMILIA_GENERICA } from '../../models/carta.models';

@Component({
  selector: 'app-familias',
  imports: [RouterLink, AvisoHorario, FotoProducto, SlotPipe],
  templateUrl: './familias.html',
  styleUrl: './familias.scss',
})
export class Familias {
  protected readonly carta = inject(CartaService);
  protected readonly local = inject(LocalService);
  protected readonly idiomas = inject(IdiomaService);
  protected readonly empresa = inject(EmpresaService);
  private readonly router = inject(Router);

  protected readonly placeholderFamilia = IMAGEN_FAMILIA_GENERICA;

  /** Vuelve a la selección de local/carta, limpiando la actual para reelegir. */
  verTodasLasCartas(): void {
    this.local.limpiar();
    this.router.navigate(this.empresa.ruta());
  }
}
