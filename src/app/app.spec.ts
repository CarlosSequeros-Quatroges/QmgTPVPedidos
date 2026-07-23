import { TestBed } from '@angular/core/testing';
import { provideRouter } from '@angular/router';
import { provideHttpClient } from '@angular/common/http';

import { App } from './app';
import { PedidosApi } from './api/pedidos-api';
import { MockPedidosApi } from './api/mock-pedidos-api';
import { EmpresaService } from './services/empresa.service';

describe('App', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [App],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        { provide: PedidosApi, useClass: MockPedidosApi },
      ],
    }).compileComponents();
  });

  it('should create the app', () => {
    const fixture = TestBed.createComponent(App);
    expect(fixture.componentInstance).toBeTruthy();
  });

  it('should render the brand name', () => {
    // La cabecera solo se pinta con un código de empresa válido en la ruta.
    TestBed.inject(EmpresaService).fijar('800');
    const fixture = TestBed.createComponent(App);
    fixture.detectChanges();
    const compiled = fixture.nativeElement as HTMLElement;
    expect(compiled.querySelector('.brand__name')?.textContent).toContain(
      'Mirador Atlántico',
    );
  });
});
