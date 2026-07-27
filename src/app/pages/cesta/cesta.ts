import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { CestaService } from '../../services/cesta.service';
import { IdiomaService } from '../../services/idioma.service';
import { HorarioService } from '../../services/horario.service';
import { EmpresaService } from '../../services/empresa.service';
import { SlotPipe } from '../../pipes/slot.pipe';
import { AvisoHorario } from '../../components/aviso-horario/aviso-horario';
import { FotoProducto } from '../../components/foto-producto/foto-producto';

@Component({
  selector: 'app-cesta',
  imports: [RouterLink, SlotPipe, AvisoHorario, FotoProducto],
  templateUrl: './cesta.html',
  styleUrl: './cesta.scss',
})
export class Cesta {
  protected readonly cesta = inject(CestaService);
  protected readonly idiomas = inject(IdiomaService);
  protected readonly horario = inject(HorarioService);
  protected readonly empresa = inject(EmpresaService);
  private readonly router = inject(Router);

  irACheckout(): void {
    if (this.horario.pedidosAbiertos() && !this.cesta.vacia()) {
      this.router.navigate(this.empresa.ruta('checkout'));
    }
  }
}
