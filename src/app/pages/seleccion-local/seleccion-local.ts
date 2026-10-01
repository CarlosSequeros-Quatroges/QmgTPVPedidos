import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';

import { LocalService } from '../../services/local.service';
import { CartaService } from '../../services/carta.service';
import { HorarioService } from '../../services/horario.service';
import { IdiomaService } from '../../services/idioma.service';
import { EmpresaService } from '../../services/empresa.service';
import { SlotPipe } from '../../pipes/slot.pipe';
import { FotoProducto } from '../../components/foto-producto/foto-producto';
import { Carta, IMAGEN_CARTA_GENERICA, Local } from '../../models/local.models';
import { estaAbierto, franjasDeCarta } from '../../utils/horario.util';

/**
 * Pantalla de entrada: muestra cada local como una cabecera a ancho completo
 * y, dentro, sus cartas (según la hora del día) como tarjetas. Al elegir una
 * carta se fija el local + la carta y se entra a las familias.
 *
 * Si ya había una selección completa (local + carta) guardada, entra directo;
 * si el local tiene una sola carta, la autoselecciona.
 */
@Component({
  selector: 'app-seleccion-local',
  imports: [SlotPipe, FotoProducto],
  templateUrl: './seleccion-local.html',
  styleUrl: './seleccion-local.scss',
})
export class SeleccionLocal {
  protected readonly local = inject(LocalService);
  protected readonly carta = inject(CartaService);
  protected readonly horario = inject(HorarioService);
  protected readonly idiomas = inject(IdiomaService);
  private readonly empresa = inject(EmpresaService);
  private readonly router = inject(Router);

  protected readonly placeholderCarta = IMAGEN_CARTA_GENERICA;

  constructor() {
    // Se obliga a elegir local + carta, SALVO que solo haya un local con una
    // sola carta: en ese caso no hay nada que elegir y se entra directo.
    this.local.asegurarLocales().subscribe(() => {
      const visibles = this.local.localesVisibles();
      if (visibles.length !== 1) return;
      const cartas = this.local.cartasDeLocal(visibles[0]);
      if (cartas.length !== 1) return;
      this.local.seleccionar(visibles[0]);
      this.carta.seleccionarCarta(cartas[0].codcarta);
      this.router.navigate(this.empresa.ruta('carta'));
    });
  }

  /** Cartas que ofrece un local (según sus franjas horarias). */
  cartasDe(local: Local): Carta[] {
    return this.local.cartasDeLocal(local);
  }

  /**
   * Franjas horarias de una carta en un local ("HH:mm–HH:mm"), sin repetir y
   * en orden de aparición. Una carta suele tener la misma franja todos los días.
   */
  franjasDe(local: Local, codcarta: string): string[] {
    const rangos = new Set<string>();
    for (const franjas of Object.values(local.horario.dias)) {
      for (const f of franjas) {
        if (f.codcarta === codcarta) rangos.add(`${f.desde}–${f.hasta}`);
      }
    }
    return [...rangos];
  }

  /** ¿La carta está abierta ahora en este local (según su franja)? */
  abierta(local: Local, codcarta: string): boolean {
    return estaAbierto(franjasDeCarta(local.horario, codcarta), this.horario.ahora());
  }

  elegir(local: Local, carta: Carta): void {
    this.local.seleccionar(local);
    this.carta.seleccionarCarta(carta.codcarta);
    this.router.navigate(this.empresa.ruta('carta'));
  }
}
