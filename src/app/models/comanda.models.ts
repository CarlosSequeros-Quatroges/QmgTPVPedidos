import { FormaPago, Pedido } from './pedido.models';

/**
 * Comanda que espera el backend para grabar un pedido de la web (subconjunto
 * del modelo del comandero Android). Solo lo necesario: empresa, tpv, zona/punto
 * y líneas; de cada línea/extra, únicamente los campos usados.
 *
 * Precios como texto con punto y 2 decimales ("2.00"). `descripcion` en español
 * (para cocina), sea cual sea el idioma del huésped.
 */

/** Extra de una línea: nota (`N`) o producto extra (`E`). */
export interface ComandaExtra {
  codmenu: string;
  descripcion: string;
  /** 0 = nota; 1 = CON; 2 = SIN. */
  estadoextra: number;
  nota: string;
  peuros: string;
  tipo: 'N' | 'E';
}

export interface ComandaLinea {
  cantidad: number;
  codmenu: string;
  codtpv: string;
  descripcion: string;
  /** Precio por unidad del producto base (sin extras). */
  peuros: string;
  /** Precio por el total de unidades (peuros × cantidad). */
  teuros: string;
  tmenu: number;
  extras: ComandaExtra[];
}

export interface Comanda {
  codigoEmpresa: string;
  tpv: string;
  /** Zona de entrega (`codigo` de zona). */
  codzona?: string;
  /** Punto de entrega (`codigo` de punto). */
  codpunto?: string;
  /** Forma de pago elegida: `E` efectivo, `T` tarjeta, `R` cargo a habitación. */
  formapago: string;
  lineas: ComandaLinea[];
}

/** Precio a texto con punto y 2 decimales. */
function precio(n: number): string {
  return (n ?? 0).toFixed(2);
}

/** Forma de pago interna → código que espera el backend. */
function codigoFormaPago(forma: FormaPago): string {
  switch (forma) {
    case 'efectivo':
      return 'E';
    case 'tarjeta':
      return 'T';
    case 'habitacion':
      return 'R';
  }
}

/**
 * Construye la comanda web a partir del pedido interno.
 * `slotEs` = índice del slot de idioma español (para `descripcion`).
 */
export function construirComanda(
  pedido: Pedido,
  codigoEmpresa: string,
  slotEs: number,
): Comanda {
  const nombre = (nombres: string[]) => nombres[slotEs] ?? nombres[0] ?? '';

  return {
    codigoEmpresa,
    tpv: pedido.codtpv,
    codzona: pedido.codzona,
    codpunto: pedido.codpunto,
    formapago: codigoFormaPago(pedido.formaPago),
    lineas: pedido.lineas.map((l) => {
      const extras: ComandaExtra[] = [];

      // La nota de la línea va como un extra tipo "N".
      if (l.nota?.trim()) {
        extras.push({
          codmenu: '',
          descripcion: '',
          estadoextra: 0,
          nota: l.nota.trim(),
          peuros: '',
          tipo: 'N',
        });
      }

      // Cada extra con/sin va como tipo "E" (los "sin" con peuros 0.00).
      for (const e of l.extras) {
        extras.push({
          codmenu: e.codigo,
          descripcion: nombre(e.nombres),
          estadoextra: e.marca === 'con' ? 1 : 2,
          nota: '',
          peuros: precio(e.precio),
          tipo: 'E',
        });
      }

      return {
        cantidad: l.cantidad,
        codmenu: l.codProducto,
        codtpv: pedido.codtpv,
        descripcion: nombre(l.nombres),
        peuros: precio(l.precioBase),
        teuros: precio(l.precioBase * l.cantidad),
        tmenu: pedido.tmenu,
        extras,
      };
    }),
  };
}
