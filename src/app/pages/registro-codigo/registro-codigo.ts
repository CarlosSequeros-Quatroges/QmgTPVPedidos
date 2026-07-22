import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { ClienteService } from '../../services/cliente.service';
import { IdiomaService } from '../../services/idioma.service';

@Component({
  selector: 'app-registro-codigo',
  imports: [RouterLink],
  templateUrl: './registro-codigo.html',
  styleUrl: './registro-codigo.scss',
})
export class RegistroCodigo {
  protected readonly cliente = inject(ClienteService);
  protected readonly idiomas = inject(IdiomaService);

  protected readonly entrada = signal(this.cliente.codigo() ?? '');

  setEntrada(valor: string): void {
    this.entrada.set(valor);
  }

  guardar(): void {
    this.cliente.registrar(this.entrada());
  }

  borrar(): void {
    this.cliente.borrar();
    this.entrada.set('');
  }
}
