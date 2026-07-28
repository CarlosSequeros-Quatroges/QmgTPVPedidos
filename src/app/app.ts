import { Component, inject } from '@angular/core';
import { Router, RouterLink, RouterOutlet } from '@angular/router';

import { ConectividadService } from './services/conectividad.service';
import { IdiomaService } from './services/idioma.service';
import { LocalService } from './services/local.service';
import { CartaService } from './services/carta.service';
import { HorarioService } from './services/horario.service';
import { CestaService } from './services/cesta.service';
import { ClienteService } from './services/cliente.service';
import { EmpresaService } from './services/empresa.service';
import { ActualizacionService } from './services/actualizacion.service';
import { SlotPipe } from './pipes/slot.pipe';
import { BUILD_TIMESTAMP } from './build-info';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, RouterLink, SlotPipe],
  templateUrl: './app.html',
  styleUrl: './app.scss',
})
export class App {
  private readonly router = inject(Router);
  protected readonly conectividad = inject(ConectividadService);
  protected readonly idiomas = inject(IdiomaService);
  protected readonly local = inject(LocalService);
  protected readonly carta = inject(CartaService);
  protected readonly horario = inject(HorarioService);
  protected readonly cesta = inject(CestaService);
  protected readonly cliente = inject(ClienteService);
  protected readonly empresa = inject(EmpresaService);

  /** Marca de tiempo de la compilación (YYMMDDHHMMSS). */
  protected readonly build = BUILD_TIMESTAMP;

  constructor() {
    // Auto-actualiza la app cuando se publica un build nuevo.
    inject(ActualizacionService).iniciar();
  }

  /** Vuelve a la selección de local (limpiando la actual para poder cambiar). */
  cambiarLocal(): void {
    this.local.limpiar();
    this.router.navigate(this.empresa.ruta());
  }
}
