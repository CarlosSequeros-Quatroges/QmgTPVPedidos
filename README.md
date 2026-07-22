# QmgTPVPedidos — Sistema de pedidos online (PWA)

Sistema de **pedidos online** para un hotel con varios puntos de venta (restaurantes/bares). El huésped elige el local, consulta la carta, monta su pedido con extras y nota para cocina, y paga en efectivo, tarjeta o **cargo a la cuenta de habitación**.

Parte de la base de [QmgTPVCarta](https://github.com/CarlosSequeros-Quatroges/QmgTPVCarta) (carta digital). Proyecto de **QUATROGES** para el *Mirador Atlántico*.

> **Estado:** primera fase con **datos simulados**. La capa de datos está abstraída (`PedidosApi`) para enchufar la API real cambiando una sola línea.

## Funcionalidad

- **Selección de local** ("cargas", identificadas por `codtpv` + `codmenu`): si hay varias se eligen con imagen + texto; si hay una, se entra directo.
- **Carta por local** con familias, platos, alérgenos y **extras** (marcar añadir/quitar) y **nota para cocina**.
- **Horario de pedidos** por local: la carta se consulta siempre, pero fuera de horario se avisa y se ocultan la cesta y los botones de añadir.
- **Cesta** persistida por local, con totales.
- **Checkout**: efectivo / tarjeta / **cargo a habitación** (si hay código de cliente registrado y saldo suficiente; validado por la API).
- **Multiidioma** es/en/fr/de (cambio en caliente) y **caché de imágenes vistas** para acelerar la navegación al volver.

## Stack

- **Angular 22** (standalone, signals, control flow `@if`/`@for`), SCSS, sin librerías externas.
- **PWA online-first** con `@angular/service-worker`: datos siempre de red (`freshness`); imágenes de artículos vistos en **cache-first lazy**.

## Arquitectura de datos

```
PedidosApi (abstracta)  ──►  MockPedidosApi (JSON de public/data)   ← fase actual
                             HttpPedidosApi (API real)              ← cambiar el provider en app.config.ts
```

Métodos: `getCargas()`, `getCarta(codtpv, codmenu)`, `validarCargoHabitacion(codigo, importe)`, `crearPedido(pedido)`.

## Desarrollo

```bash
npm install
npm start            # ng serve → http://localhost:4200
```

> El service worker solo se activa en el build de producción; el modo PWA (caché de imágenes) se prueba con `npm run preview`.

## Build y prueba en local

```bash
npm run build:pedidos  # ng build --base-href /pedidos/
npm run preview        # build + servidor estático → http://localhost:8080/pedidos/
```

`serve.mjs` sirve el build bajo `/pedidos/`, replicando el despliegue real.

## Despliegue

Bajo el endpoint **`/pedidos`** (host multi-app). `npm run build:pedidos` y subir `dist/QmgTPVPedidos/browser/` a la carpeta servida como `/pedidos`. **Routing por hash** (`…/pedidos/#/plato/301`): el servidor solo ve `/pedidos/`, sin reglas de reescritura SPA.

> En Windows, compila con `npm run build:pedidos` (o `MSYS_NO_PATHCONV=1`); pasar `--base-href /pedidos/` por Git Bash corrompe la ruta.

## Datos de ejemplo (`public/data/`)

- `cargas.json` — locales (Restaurante Mirador y Bar Piscina) con horario.
- `cartas/carta-{codtpv}-{codmenu}.json` — carta por local (restaurante + familias + platos + extras).
- `alergenos.json` — 14 alérgenos UE. `cuentas.json` — cuentas de habitación con saldo (p. ej. `HAB101` 50 €, `HAB102` 3,50 €).

## Estructura

```
src/app/
  api/            PedidosApi (abstracta) + MockPedidosApi
  models/         carta, local (codtpv/codmenu + horario), extra, cesta, pedido, cliente
  utils/          horario.util (estaAbierto / proximaApertura)
  services/       local, carta, horario, cesta, cliente, pedido, idioma, conectividad
  guards/         local-seleccionado
  pipes/          loc (textos localizados)
  components/     aviso-horario
  pages/          seleccion-local, familias, platos, plato-detalle, cesta, checkout, confirmacion, registro-codigo
```
