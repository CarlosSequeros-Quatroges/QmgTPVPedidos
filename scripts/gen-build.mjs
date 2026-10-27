/**
 * Genera, con la marca de tiempo de la compilación (formato YYMMDDHHMMSS, hora
 * local), dos ficheros que se regeneran en cada build/serve (no se versionan):
 *
 * - `src/app/build-info.ts`: la versión que queda **compilada dentro** de la app.
 * - `public/version.json`: la misma versión en un fichero suelto que se publica
 *   junto a la app. La app lo consulta periódicamente y, si no coincide con la
 *   que lleva compilada, es que se ha desplegado un build nuevo y recarga. Así
 *   no depende de que el navegador/SW suelte el `index.html` cacheado.
 */
import { writeFileSync } from 'node:fs';

const d = new Date();
const p = (n) => String(n).padStart(2, '0');
const ts =
  p(d.getFullYear() % 100) +
  p(d.getMonth() + 1) +
  p(d.getDate()) +
  p(d.getHours()) +
  p(d.getMinutes()) +
  p(d.getSeconds());

const destino = new URL('../src/app/build-info.ts', import.meta.url);
const contenido =
  `// Generado automáticamente en cada build (scripts/gen-build.mjs). NO editar.\n` +
  `export const BUILD_TIMESTAMP = '${ts}';\n`;

writeFileSync(destino, contenido);

// La misma versión en un fichero suelto que el build copia a dist (public/).
const versionJson = new URL('../public/version.json', import.meta.url);
writeFileSync(versionJson, JSON.stringify({ build: ts }, null, 2) + '\n');

console.log(`build-info.ts y version.json generados: ${ts}`);
