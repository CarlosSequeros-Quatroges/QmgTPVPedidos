import { Component, inject, signal } from '@angular/core';
import { RouterLink } from '@angular/router';

import { ClienteService } from '../../services/cliente.service';
import { IdiomaService } from '../../services/idioma.service';
import { EmpresaService } from '../../services/empresa.service';

@Component({
  selector: 'app-registro-codigo',
  imports: [RouterLink],
  templateUrl: './registro-codigo.html',
  styleUrl: './registro-codigo.scss',
})
export class RegistroCodigo {
  protected readonly cliente = inject(ClienteService);
  protected readonly idiomas = inject(IdiomaService);
  protected readonly empresa = inject(EmpresaService);

  protected readonly entrada = signal(this.cliente.codigo() ?? '');
  protected readonly validando = signal(false);
  protected readonly error = signal(false);

  setEntrada(valor: string): void {
    this.entrada.set(valor);
    this.error.set(false);
  }

  /** Valida el código contra la API; si es correcto guarda código y habitación. */
  guardar(): void {
    if (this.validando() || !this.entrada().trim()) return;
    this.validando.set(true);
    this.error.set(false);
    this.cliente.registrar(this.entrada()).subscribe({
      next: (v) => {
        this.validando.set(false);
        this.error.set(!v.valido);
      },
      error: () => {
        this.validando.set(false);
        this.error.set(true);
      },
    });
  }

  borrar(): void {
    this.cliente.borrar();
    this.entrada.set('');
    this.error.set(false);
  }
}
