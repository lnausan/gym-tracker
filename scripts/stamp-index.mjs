/**
 * Agrega ?v=<hash> a app.compiled.js/css en index.html. Sin esto iOS (sobre todo
 * la app agregada a inicio) sigue usando el bundle viejo en caché después de un deploy.
 */
import { readFileSync, writeFileSync } from 'fs';
import { createHash } from 'crypto';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const indexPath = path.join(root, 'index.html');

let html = readFileSync(indexPath, 'utf8');
for (const file of ['app.compiled.js', 'app.compiled.css']) {
  const hash = createHash('sha1').update(readFileSync(path.join(root, file))).digest('hex').slice(0, 10);
  const escaped = file.replace(/\./g, '\\.');
  html = html.replace(new RegExp(`${escaped}(\\?v=[0-9a-f]+)?"`, 'g'), `${file}?v=${hash}"`);
}
writeFileSync(indexPath, html);
console.log('Stamped index.html');
