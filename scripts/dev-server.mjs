import http from 'http';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..'); // proyecto (donde está index.html)

const port = process.env.PORT ? Number(process.env.PORT) : 3000;

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'text/javascript; charset=utf-8',
  '.mjs': 'text/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.svg': 'image/svg+xml; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.gif': 'image/gif',
  '.webp': 'image/webp',
  '.ico': 'image/x-icon',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf',
  '.map': 'application/json; charset=utf-8',
};

function sendFile(res, filePath, statusCode = 200) {
  const ext = path.extname(filePath).toLowerCase();
  const contentType = mimeTypes[ext] || 'application/octet-stream';
  res.writeHead(statusCode, { 'Content-Type': contentType });
  fs.createReadStream(filePath).pipe(res);
}

function safeJoinRoot(relPath) {
  // Normalizamos: `relPath` suele venir con "/" al inicio (ej: "/index.html").
  // Si es absoluto, `path.resolve(rootDir, "/algo")` ignora rootDir, y rompe el guard.
  const normalized = relPath.replace(/^\/+/, '');
  const fullPath = path.resolve(rootDir, normalized);
  // Evita path traversal: el resolved debe seguir dentro de rootDir
  if (!fullPath.startsWith(rootDir)) return null;
  return fullPath;
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url || '/', `http://${req.headers.host}`);
  let pathname = decodeURIComponent(url.pathname);

  if (pathname === '/') pathname = '/index.html';
  if (pathname.endsWith('/')) pathname += 'index.html';

  const filePath = safeJoinRoot(pathname);
  if (!filePath) {
    res.writeHead(403, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Forbidden');
    return;
  }

  fs.stat(filePath, (err, stats) => {
    if (!err && stats.isFile()) {
      sendFile(res, filePath, 200);
      return;
    }

    // Fallback para SPA: cualquier ruta inexistente vuelve a index.html
    const indexPath = path.join(rootDir, 'index.html');
    if (fs.existsSync(indexPath)) {
      sendFile(res, indexPath, 200);
      return;
    }

    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' });
    res.end('Not found');
  });
});

server.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Static server running: http://localhost:${port}`);
});

