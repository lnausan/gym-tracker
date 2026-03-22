/**
 * Genera app.compiled.css desde src/input.css (Tailwind + estilos base).
 */
import { execSync } from 'child_process';
import path from 'path';
import { fileURLToPath } from 'url';

const root = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');

execSync(
  'npx tailwindcss -i ./src/input.css -o ./app.compiled.css --minify',
  { cwd: root, stdio: 'inherit', env: process.env }
);
console.log('Built app.compiled.css');
