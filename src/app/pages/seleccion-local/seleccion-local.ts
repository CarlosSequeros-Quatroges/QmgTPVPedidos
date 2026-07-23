import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

import { LocalService } from '../../services/local.service';
import { IdiomaService } from '../../services/idioma.service';
import { EmpresaService } from '../../services/empresa.service';
import { Local, imagenLocal } from '../../models/local.models';

@Component({
  selector: 'app-seleccion-local',
  imports: [],
  templateUrl: './seleccion-local.html',
  styleUrl: './seleccion-local.scss',
})
export class SeleccionLocal {
  protected readonly local = inject(LocalService);
  protected readonly idiomas = inject(IdiomaService);
  private readonly empresa = inject(EmpresaService);
  private readonly router = inject(Router);

  /** Imagen del local (recurso público nombrado por codtpv). */
  protected readonly imagen = imagenLocal;

  constructor() {
    // Si hay un local válido (uno solo, o selección persistida), entrar directo.
    this.local.asegurarLocales().subscribe(() => {
      if (this.local.localActivo()) {
        this.router.navigate(this.empresa.ruta('carta'));
      }
    });
  }

  elegir(local: Local): void {
    this.local.seleccionar(local);
    this.router.navigate(this.empresa.ruta('carta'));
  }
}
