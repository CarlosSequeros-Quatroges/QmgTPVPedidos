import { Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';

import { CartaService } from '../../services/carta.service';
import { IdiomaService } from '../../services/idioma.service';
import { EmpresaService } from '../../services/empresa.service';
import { AvisoHorario } from '../../components/aviso-horario/aviso-horario';

@Component({
  selector: 'app-familias',
  imports: [RouterLink, AvisoHorario],
  templateUrl: './familias.html',
  styleUrl: './familias.scss',
})
export class Familias {
  protected readonly carta = inject(CartaService);
  protected readonly idiomas = inject(IdiomaService);
  protected readonly empresa = inject(EmpresaService);
}
