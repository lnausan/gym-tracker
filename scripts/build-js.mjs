/**
 * Compila app.jsx → app.compiled.js (sin Babel en el navegador; arranque más rápido).
 */
import * as esbuild from 'esbuild';
import { fileURLToPath } from 'url';
import path from 'path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');

await esbuild.build({
  entryPoints: [path.join(root, 'app.jsx')],
  bundle: true,
  outfile: path.join(root, 'app.compiled.js'),
  format: 'iife',
  minify: true,
  jsx: 'transform',
  jsxFactory: 'React.createElement',
  jsxFragment: 'React.Fragment',
  // Visible en ⚙️ Rutina para saber qué versión tiene cargada el teléfono.
  define: { __BUILD_ID__: JSON.stringify(new Date().toISOString().slice(0, 16).replace('T', ' ')) },
});

console.log('Built app.compiled.js');
