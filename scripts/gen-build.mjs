/**
 * Genera `src/app/build-info.ts` con la marca de tiempo de la compilación
 * (formato YYMMDDHHMMSS, hora local). Se ejecuta antes de cada build/serve.
 * El fichero está en .gitignore: se regenera, no se versiona.
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
console.log(`build-info.ts generado: ${ts}`);
