import { Component, computed, inject, signal } from '@angular/core';
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

  protected readonly habitacion = signal(this.cliente.habitacion() ?? '');
  protected readonly documento = signal('');
  protected readonly validando = signal(false);
  protected readonly error = signal(false);

  setHabitacion(valor: string): void {
    this.habitacion.set(valor);
    this.error.set(false);
  }

  setDocumento(valor: string): void {
    this.documento.set(valor);
    this.error.set(false);
  }

  protected readonly puedeEnviar = computed(
    () => !!this.habitacion().trim() && !!this.documento().trim(),
  );

  /** Registra al cliente contra la API; si la reserva existe guarda el código. */
  guardar(): void {
    if (this.validando() || !this.puedeEnviar()) return;
    this.validando.set(true);
    this.error.set(false);
    this.cliente.registrar(this.habitacion(), this.documento()).subscribe({
      next: (v) => {
        this.validando.set(false);
        this.error.set(!v.valido);
        if (v.valido) this.documento.set('');
      },
      error: () => {
        this.validando.set(false);
        this.error.set(true);
      },
    });
  }

  borrar(): void {
    this.cliente.borrar();
    this.habitacion.set('');
    this.documento.set('');
    this.error.set(false);
  }
}
