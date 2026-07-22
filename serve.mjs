/**
 * Servidor estático mínimo (sin dependencias) para probar el build de producción
 * con el Service Worker activo — algo que `ng serve` no hace.
 *
 *   npm run preview        (compila en producción y sirve)
 *
 * Sirve la app bajo el prefijo /pedidos (igual que el despliegue real), de modo que
 * el Service Worker queda con ámbito /pedidos/ y cachea el casco de la app y las
 * imágenes vistas. Abre http://localhost:8080 → redirige a /pedidos/.
 * Los datos van online (freshness); las imágenes de artículos vistos quedan en caché.
 */
import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { join, extname, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(
  fileURLToPath(new URL('.', import.meta.url)),
  'dist',
  'QmgTPVPedidos',
  'browser',
);
const PORT = Number(process.env.PORT) || 8080;
/** Prefijo de despliegue (endpoint de esta webapp). Debe coincidir con --base-href. */
const BASE = '/pedidos';

const TIPOS = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.webmanifest': 'application/manifest+json; charset=utf-8',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.txt': 'text/plain; charset=utf-8',
};

/** Ficheros del Service Worker: nunca deben quedar cacheados por el navegador. */
const SIN_CACHE = new Set(['ngsw-worker.js', 'ngsw.json', 'index.html', 'safety-worker.js']);

async function enviar(res, ruta, status = 200) {
  const datos = await readFile(ruta);
  const ext = extname(ruta).toLowerCase();
  const nombre = ruta.split(/[\\/]/).pop();
  res.writeHead(status, {
    'Content-Type': TIPOS[ext] ?? 'application/octet-stream',
    'Cache-Control': SIN_CACHE.has(nombre) ? 'no-cache, no-store, must-revalidate' : 'no-cache',
  });
  res.end(datos);
}

const servidor = createServer(async (req, res) => {
  try {
    const url = decodeURIComponent((req.url ?? '/').split('?')[0]);

    // Todo cuelga de /carta. Cualquier otra cosa se redirige al endpoint.
    if (url === '/' || url === BASE) {
      res.writeHead(302, { Location: `${BASE}/` }).end();
      return;
    }
    if (!url.startsWith(`${BASE}/`)) {
      res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
      res.end('404 No encontrado (esta app se sirve en /carta/)');
      return;
    }

    const rel = url.slice(BASE.length); // '/carta/data/x' -> '/data/x'
    // normalize evita traversal (../) fuera de ROOT
    let ruta = normalize(join(ROOT, rel));
    if (!ruta.startsWith(ROOT)) {
      res.writeHead(403).end('Forbidden');
      return;
    }

    // ¿Es un fichero existente?
    try {
      const info = await stat(ruta);
      if (info.isDirectory()) ruta = join(ruta, 'index.html');
      await enviar(res, ruta);
      return;
    } catch {
      /* no existe: sigue al fallback */
    }

    // Fallback SPA: rutas sin extensión → index.html (lo resuelve el router Angular)
    if (!extname(rel)) {
      await enviar(res, join(ROOT, 'index.html'));
      return;
    }

    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('404 No encontrado');
  } catch (err) {
    res.writeHead(500).end('Error del servidor');
    console.error(err);
  }
});

servidor.listen(PORT, () => {
  console.log(`\n  Carta (producción) sirviéndose en:  http://localhost:${PORT}${BASE}/\n`);
  console.log('  Prueba offline: cárgala una vez, activa Offline en DevTools › Network y recarga.\n');
});
