import { Component, inject } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { CestaService } from '../../services/cesta.service';
import { CartaService } from '../../services/carta.service';
import { IdiomaService } from '../../services/idioma.service';
import { HorarioService } from '../../services/horario.service';
import { EmpresaService } from '../../services/empresa.service';
import { SlotPipe } from '../../pipes/slot.pipe';
import { AvisoHorario } from '../../components/aviso-horario/aviso-horario';
import { FotoProducto } from '../../components/foto-producto/foto-producto';
import { LineaCesta } from '../../models/cesta.models';
import { ProductoResuelto } from '../../models/carta.models';
import { MarcaExtra } from '../../models/extra.models';

@Component({
  selector: 'app-cesta',
  imports: [RouterLink, SlotPipe, AvisoHorario, FotoProducto],
  templateUrl: './cesta.html',
  styleUrl: './cesta.scss',
})
export class Cesta {
  protected readonly cesta = inject(CestaService);
  protected readonly carta = inject(CartaService);
  protected readonly idiomas = inject(IdiomaService);
  protected readonly horario = inject(HorarioService);
  protected readonly empresa = inject(EmpresaService);
  private readonly router = inject(Router);

  /** Extras disponibles del producto de una línea (para poder modificarlos). */
  extrasDisponibles(linea: LineaCesta): ProductoResuelto[] {
    const producto = this.carta.producto(linea.codProducto);
    return producto ? this.carta.extrasDe(producto.codsub) : [];
  }

  /** Marca actual de un extra en la línea (con / sin / sin marcar). */
  marcaDe(linea: LineaCesta, codigo: string): MarcaExtra | undefined {
    return linea.extras.find((e) => e.codigo === codigo)?.marca;
  }

  /** Marca un extra en la línea; si ya tenía esa marca, lo desmarca. */
  toggleExtra(
    linea: LineaCesta,
    extra: ProductoResuelto,
    marca: MarcaExtra,
  ): void {
    const actual = this.marcaDe(linea, extra.codigo);
    this.cesta.setExtra(
      linea.id,
      { codigo: extra.codigo, nombres: extra.nombres, precio: extra.precio },
      actual === marca ? null : marca,
    );
  }

  irACheckout(): void {
    if (this.horario.pedidosAbiertos() && !this.cesta.vacia()) {
      this.router.navigate(this.empresa.ruta('checkout'));
    }
  }
}
