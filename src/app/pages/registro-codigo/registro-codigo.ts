import { Component, DestroyRef, computed, inject, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';

import { ClienteService } from '../../services/cliente.service';
import { IdiomaService } from '../../services/idioma.service';
import { EmpresaService } from '../../services/empresa.service';

/** Tras un registro correcto, se vuelve a la carta pasado este tiempo. */
const CIERRE_MS = 2000;

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
  private readonly router = inject(Router);

  protected readonly habitacion = signal(this.cliente.habitacion() ?? '');
  protected readonly documento = signal('');
  protected readonly validando = signal(false);
  protected readonly error = signal(false);
  /** Registro recién completado: se muestra el aviso y se cierra solo. */
  protected readonly guardado = signal(false);

  private cierre?: ReturnType<typeof setTimeout>;

  constructor() {
    inject(DestroyRef).onDestroy(() => clearTimeout(this.cierre));
  }

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
        if (v.valido) {
          this.documento.set('');
          this.guardado.set(true);
          // Registro correcto: se vuelve a la carta pasados 2 s.
          this.cierre = setTimeout(
            () => this.router.navigate(this.empresa.ruta('carta')),
            CIERRE_MS,
          );
        }
      },
      error: () => {
        this.validando.set(false);
        this.error.set(true);
      },
    });
  }

  borrar(): void {
    clearTimeout(this.cierre);
    this.guardado.set(false);
    this.cliente.borrar();
    this.habitacion.set('');
    this.documento.set('');
    this.error.set(false);
  }
}
