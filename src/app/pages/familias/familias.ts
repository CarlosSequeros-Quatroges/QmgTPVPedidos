import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { CartaService } from '../../services/carta.service';
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
  protected readonly idiomas = inject(IdiomaService);
  protected readonly empresa = inject(EmpresaService);

  protected readonly placeholderFamilia = IMAGEN_FAMILIA_GENERICA;
}
