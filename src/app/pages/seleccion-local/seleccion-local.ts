import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

import { LocalService } from '../../services/local.service';
import { IdiomaService } from '../../services/idioma.service';
import { LocPipe } from '../../pipes/loc.pipe';
import { Carga } from '../../models/local.models';

@Component({
  selector: 'app-seleccion-local',
  imports: [LocPipe],
  templateUrl: './seleccion-local.html',
  styleUrl: './seleccion-local.scss',
})
export class SeleccionLocal {
  protected readonly local = inject(LocalService);
  protected readonly idiomas = inject(IdiomaService);
  private readonly router = inject(Router);

  constructor() {
    // Si hay un local válido (uno solo, o selección persistida), entrar directo.
    this.local.asegurarCargas().subscribe(() => {
      if (this.local.cargaActiva()) {
        this.router.navigateByUrl('/carta');
      }
    });
  }

  elegir(carga: Carga): void {
    this.local.seleccionar(carga);
    this.router.navigateByUrl('/carta');
  }
}
