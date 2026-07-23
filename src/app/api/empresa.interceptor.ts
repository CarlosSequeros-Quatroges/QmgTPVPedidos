import { inject } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';

import { API_BASE, PARAM_EMPRESA } from './api.config';
import { EmpresaService } from '../services/empresa.service';

/**
 * Añade el código de empresa (`codemp`) como query param a todas las llamadas
 * dirigidas a la API. Las peticiones a recursos locales (datos mock, imágenes)
 * quedan intactas.
 */
export const empresaInterceptor: HttpInterceptorFn = (req, next) => {
  const codigo = inject(EmpresaService).codigo();
  if (!codigo || !req.url.startsWith(API_BASE)) {
    return next(req);
  }
  return next(req.clone({ setParams: { [PARAM_EMPRESA]: codigo } }));
};
